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
  password: z.string().min(6)
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

module.exports = router;
