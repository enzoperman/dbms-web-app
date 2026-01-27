const express = require("express");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/roles");

const router = express.Router();

const subjectSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  units: z.number().int().positive(),
  section: z.string().optional()
});

const requestSchema = z.object({
  type: z.enum(["OVERLOAD", "OVERRIDE", "MANUAL_TAGGING"]),
  reason: z.string().optional(),
  subjects: z.array(subjectSchema).min(1)
});

router.get("/", auth, async (req, res) => {
  const where = req.user.role === "STUDENT" ? { requestedById: req.user.id } : {};
  const requests = await prisma.request.findMany({
    where,
    include: { subjects: true, requestedBy: true }
  });
  res.json({ requests });
});

router.post("/", auth, authorizeRoles(["STUDENT"]), async (req, res) => {
  const data = requestSchema.parse(req.body);
  const request = await prisma.request.create({
    data: {
      type: data.type,
      reason: data.reason,
      requestedById: req.user.id,
      subjects: { create: data.subjects }
    },
    include: { subjects: true }
  });
  res.status(201).json({ request });
});

router.get("/:id", auth, async (req, res) => {
  const request = await prisma.request.findUnique({
    where: { id: req.params.id },
    include: { subjects: true, statusHistory: true, requestedBy: true }
  });
  if (!request) return res.status(404).json({ message: "Not found" });
  if (req.user.role === "STUDENT" && request.requestedById !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  res.json({ request });
});

router.put("/:id/status", auth, authorizeRoles(["STAFF", "CHAIR", "ADMIN"]), async (req, res) => {
  const schema = z.object({
    status: z.enum(["PENDING", "REVIEWED", "APPROVED", "REJECTED"]),
    remark: z.string().optional()
  });
  const data = schema.parse(req.body);
  const request = await prisma.request.update({
    where: { id: req.params.id },
    data: { status: data.status }
  });
  await prisma.statusHistory.create({
    data: {
      requestId: request.id,
      status: data.status,
      remark: data.remark,
      changedById: req.user.id
    }
  });
  res.json({ request });
});

module.exports = router;
