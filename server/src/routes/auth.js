const express = require("express");
const { z } = require("zod");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "STAFF", "CHAIR", "STUDENT"]).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  studentNo: z.string().min(1).optional(),
  phone: z.string().min(6).optional(),
  section: z.string().optional(),
  yearLevel: z.number().int().optional(),
  course: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  expectedRole: z.enum(["STUDENT", "STAFF", "CHAIR"]).optional()
});

router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const role = data.role || "STUDENT";
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        role
      }
    });

    if (role === "STUDENT") {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentNo: data.studentNo || null,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          phone: data.phone || null,
          section: data.section || null,
          yearLevel: data.yearLevel || null,
          course: data.course || null
        }
      });
    }
    return res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    
    // Specific Error: User not found
    if (!user) {
      return res.status(404).json({ message: "Account does not exist. Please sign up." });
    }

    const match = await bcrypt.compare(data.password, user.password);
    
    // Specific Error: Invalid password
    if (!match) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    // Validate selected role matches user's actual role
    if (data.expectedRole) {
      const isStudent = user.role === "STUDENT";
      const isStaffOrChair = user.role === "STAFF" || user.role === "CHAIR" || user.role === "ADMIN";
      
      if (data.expectedRole === "STUDENT" && !isStudent) {
        return res.status(403).json({ 
          message: "This account is not registered as a Student. Please select the correct role.",
          code: "ROLE_MISMATCH"
        });
      }
      
      if (data.expectedRole === "STAFF" && user.role !== "STAFF") {
        return res.status(403).json({ 
          message: "This account is not registered as Staff. Please select the correct role.",
          code: "ROLE_MISMATCH"
        });
      }
      
      if (data.expectedRole === "CHAIR" && user.role !== "CHAIR") {
        return res.status(403).json({ 
          message: "This account is not registered as Department Chair. Please select the correct role.",
          code: "ROLE_MISMATCH"
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, role: true, createdAt: true }
  });
  return res.json({ user });
});

router.put("/change-password", auth, async (req, res) => {
  const schema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6)
  });
  const data = schema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const match = await bcrypt.compare(data.currentPassword, user.password);
  if (!match) return res.status(400).json({ message: "Invalid current password" });
  const hashed = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return res.json({ message: "Password updated" });
});

// Get all users (CHAIR only) - for User Management
router.get("/users", auth, async (req, res) => {
  try {
    // Only CHAIR can access this
    if (req.user.role !== "CHAIR") {
      return res.status(403).json({ message: "Access denied. Chair only." });
    }

    const users = await prisma.user.findMany({
      where: {
        role: { in: ["STAFF", "CHAIR"] }
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Try to get names from staffProfile if exists, otherwise just return user data
    const usersWithNames = await Promise.all(
      users.map(async (user) => {
        // Check if there's a staff profile (we might need to create this model later)
        return {
          ...user,
          firstName: null,
          lastName: null
        };
      })
    );

    return res.json({ users: usersWithNames });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Create Staff/Chair account (CHAIR only)
router.post("/create-staff", auth, async (req, res) => {
  try {
    // Only CHAIR can create staff accounts
    if (req.user.role !== "CHAIR") {
      return res.status(403).json({ message: "Access denied. Chair only." });
    }

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["STAFF", "CHAIR"]),
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional()
    });

    const data = schema.parse(req.body);

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        role: data.role
      }
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete user (CHAIR only)
router.delete("/users/:id", auth, async (req, res) => {
  try {
    // Only CHAIR can delete users
    if (req.user.role !== "CHAIR") {
      return res.status(403).json({ message: "Access denied. Chair only." });
    }

    const userId = req.params.id;

    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow deleting STAFF and CHAIR (not students)
    if (user.role === "STUDENT") {
      return res.status(400).json({ message: "Cannot delete student accounts from here" });
    }

    // Check if user has any status history entries (as changedBy)
    const statusHistoryCount = await prisma.statusHistory.count({
      where: { changedById: userId }
    });

    if (statusHistoryCount > 0) {
      // Delete the status history entries first, or reassign them
      await prisma.statusHistory.deleteMany({
        where: { changedById: userId }
      });
    }

    await prisma.user.delete({ where: { id: userId } });

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    
    // Handle foreign key constraint errors
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: "Cannot delete this user because they have associated records. Please reassign or delete their records first." 
      });
    }
    
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
