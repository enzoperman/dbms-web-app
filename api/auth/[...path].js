const { z } = require("zod");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../_lib/prisma");
const { getUserFromRequest } = require("../_lib/auth");
const { setCors } = require("../_lib/cors");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "STAFF", "CHAIR", "STUDENT"]).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const path = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean);
  const action = path[0] || "";

  if (req.method === "POST" && action === "register") {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ message: "Email already exists" });
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { email: data.email, password: hashed, role: data.role || "STUDENT" }
    });
    return res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
  }

  if (req.method === "POST" && action === "login") {
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

    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  }

  if (req.method === "GET" && action === "me") {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, role: true, createdAt: true }
    });
    return res.json({ user: dbUser });
  }

  if (req.method === "PUT" && action === "change-password") {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const schema = z.object({ currentPassword: z.string().min(6), newPassword: z.string().min(6) });
    const data = schema.parse(req.body);
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const match = await bcrypt.compare(data.currentPassword, dbUser.password);
    if (!match) return res.status(400).json({ message: "Invalid current password" });
    const hashed = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    return res.json({ message: "Password updated" });
  }

  return res.status(404).json({ message: "Not found" });
};
