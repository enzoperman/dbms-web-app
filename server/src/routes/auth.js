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
  role: z.enum(["ADMIN", "STAFF", "CHAIR", "STUDENT"]).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }
  const hashed = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashed,
      role: data.role || "STUDENT"
    }
  });
  return res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
});

router.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const match = await bcrypt.compare(data.password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role }
  });
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
