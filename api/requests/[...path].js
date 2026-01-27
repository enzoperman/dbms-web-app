const { z } = require("zod");
const prisma = require("../_lib/prisma");
const { getUserFromRequest } = require("../_lib/auth");
const { setCors } = require("../_lib/cors");

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

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const path = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean);
  const [id, action] = path;

  if (req.method === "GET" && !id) {
    const where = user.role === "STUDENT" ? { requestedById: user.id } : {};
    const requests = await prisma.request.findMany({
      where,
      include: { subjects: true, requestedBy: true }
    });
    return res.json({ requests });
  }

  if (req.method === "POST" && !id) {
    if (user.role !== "STUDENT") return res.status(403).json({ message: "Forbidden" });
    const data = requestSchema.parse(req.body);
    const request = await prisma.request.create({
      data: {
        type: data.type,
        reason: data.reason,
        requestedById: user.id,
        subjects: { create: data.subjects }
      },
      include: { subjects: true }
    });
    return res.status(201).json({ request });
  }

  if (req.method === "GET" && id) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: { subjects: true, statusHistory: true, requestedBy: true }
    });
    if (!request) return res.status(404).json({ message: "Not found" });
    if (user.role === "STUDENT" && request.requestedById !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.json({ request });
  }

  if (req.method === "PUT" && id && action === "status") {
    if (!["STAFF", "CHAIR", "ADMIN"].includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const schema = z.object({
      status: z.enum(["PENDING", "REVIEWED", "APPROVED", "REJECTED"]),
      remark: z.string().optional()
    });
    const data = schema.parse(req.body);
    const request = await prisma.request.update({
      where: { id },
      data: { status: data.status }
    });
    await prisma.statusHistory.create({
      data: {
        requestId: request.id,
        status: data.status,
        remark: data.remark,
        changedById: user.id
      }
    });
    return res.json({ request });
  }

  return res.status(404).json({ message: "Not found" });
};
