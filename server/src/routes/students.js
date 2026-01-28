const express = require("express");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/roles");

const router = express.Router();

router.get("/me", auth, authorizeRoles(["STUDENT"]), async (req, res) => {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
    include: {
      user: { select: { id: true, email: true, role: true, createdAt: true } }
    }
  });

  if (!profile) return res.status(404).json({ message: "Profile not found" });

  const requests = await prisma.request.findMany({
    where: { requestedById: profile.user.id },
    select: { status: true }
  });

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  res.json({
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    name: name || "Student",
    studentNumber: profile.studentNo,
    email: profile.user.email,
    phone: profile.phone,
    createdAt: profile.user.createdAt,
    _count: { requests: requests.length },
    requests
  });
});

router.patch("/me", auth, authorizeRoles(["STUDENT"]), async (req, res) => {
  const schema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().min(6).optional(),
    email: z.string().email().optional()
  });
  const data = schema.parse(req.body);

  const profile = await prisma.studentProfile.update({
    where: { userId: req.user.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone
    },
    include: { user: true }
  });

  if (data.email) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { email: data.email }
    });
  }

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  res.json({
    id: profile.id,
    name: name || "Student",
    studentNumber: profile.studentNo,
    email: data.email || profile.user.email,
    phone: profile.phone
  });
});

router.get("/", auth, authorizeRoles(["STAFF", "CHAIR", "ADMIN"]), async (req, res) => {
  const students = await prisma.studentProfile.findMany({
    include: {
      user: { select: { id: true, email: true } }
    }
  });

  const formatted = await Promise.all(
    students.map(async (profile) => {
      const requests = await prisma.request.findMany({
        where: { requestedById: profile.user.id },
        select: { status: true }
      });
      const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
      return {
        id: profile.id,
        name: name || "Student",
        studentNumber: profile.studentNo,
        email: profile.user.email,
        phone: profile.phone,
        _count: { requests: requests.length },
        requests
      };
    })
  );

  res.json(formatted);
});

module.exports = router;
