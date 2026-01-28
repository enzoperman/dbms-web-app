const express = require("express");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/roles");

const router = express.Router();

const subjectSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  schedule: z.string().optional(),
  section: z.string().optional()
});

const requestSchema = z.object({
  requestType: z.enum(["OVERLOAD", "OVERRIDE", "MANUAL_TAGGING"]),
  semester: z.string().min(1),
  reason: z.string().optional(),
  subjects: z.array(subjectSchema).min(1)
});

const formatRequest = (request) => {
  const name = [
    request.requestedBy?.studentProfile?.firstName,
    request.requestedBy?.studentProfile?.lastName
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: request.id,
    requestType: request.type,
    semester: request.semester,
    status: request.status,
    remarks: request.remarks,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    subjects: request.subjects?.map((s) => ({
      code: s.code,
      title: s.title,
      schedule: s.schedule,
      section: s.section,
      units: s.units
    })),
    student: request.requestedBy
      ? {
          name: name || "Student",
          studentNumber: request.requestedBy.studentProfile?.studentNo || null,
          email: request.requestedBy.email,
          phone: request.requestedBy.studentProfile?.phone || null
        }
      : null
  };
};

router.get("/", auth, async (req, res) => {
  const where = req.user.role === "STUDENT" ? { requestedById: req.user.id } : {};
  const requests = await prisma.request.findMany({
    where,
    include: {
      subjects: true,
      requestedBy: { include: { studentProfile: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(requests.map(formatRequest));
});

router.get("/all", auth, authorizeRoles(["STAFF", "CHAIR", "ADMIN"]), async (req, res) => {
  const requests = await prisma.request.findMany({
    include: {
      subjects: true,
      requestedBy: { include: { studentProfile: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(requests.map(formatRequest));
});

router.post("/", auth, authorizeRoles(["STUDENT"]), async (req, res) => {
  const data = requestSchema.parse(req.body);
  const request = await prisma.request.create({
    data: {
      type: data.requestType,
      semester: data.semester,
      reason: data.reason,
      status: "FOR_EVALUATION",
      requestedById: req.user.id,
      subjects: {
        create: data.subjects.map((s) => ({
          code: s.code,
          title: s.title,
          schedule: s.schedule,
          section: s.section
        }))
      },
      statusHistory: {
        create: {
          status: "FOR_EVALUATION",
          remark: "Submitted for evaluation",
          changedById: req.user.id
        }
      }
    },
    include: { subjects: true, requestedBy: { include: { studentProfile: true } } }
  });
  res.status(201).json(formatRequest(request));
});

router.get("/:id", auth, async (req, res) => {
  const request = await prisma.request.findUnique({
    where: { id: req.params.id },
    include: {
      subjects: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
      requestedBy: { include: { studentProfile: true } }
    }
  });
  if (!request) return res.status(404).json({ message: "Not found" });
  if (req.user.role === "STUDENT" && request.requestedById !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  res.json({ ...formatRequest(request), statusHistory: request.statusHistory });
});

const updateStatusHandler = async (req, res) => {
  const schema = z.object({
    status: z.enum([
      "FOR_EVALUATION",
      "PENDING",
      "DISCREPANCY",
      "APPROVED",
      "REJECTED"
    ]),
    remarks: z.string().optional()
  });
  const data = schema.parse(req.body);

  if (["APPROVED", "REJECTED"].includes(data.status) && !["CHAIR", "ADMIN"].includes(req.user.role)) {
    return res.status(403).json({ message: "Chairperson only" });
  }

  const request = await prisma.request.update({
    where: { id: req.params.id },
    data: { status: data.status, remarks: data.remarks }
  });
  await prisma.statusHistory.create({
    data: {
      requestId: request.id,
      status: data.status,
      remark: data.remarks,
      changedById: req.user.id
    }
  });
  res.json(formatRequest(request));
};

router.patch("/:id/status", auth, authorizeRoles(["STAFF", "CHAIR", "ADMIN"]), updateStatusHandler);

router.put("/:id/status", auth, authorizeRoles(["STAFF", "CHAIR", "ADMIN"]), updateStatusHandler);

module.exports = router;
