const express = require("express");
const prisma = require("../utils/prisma");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/roles");

const router = express.Router();

router.get("/", auth, authorizeRoles(["STAFF", "CHAIR", "ADMIN"]), async (req, res) => {
  const students = await prisma.studentProfile.findMany({
    include: { user: { select: { id: true, email: true, role: true } } }
  });
  res.json({ students });
});

module.exports = router;
