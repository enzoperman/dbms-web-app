const prisma = require("../_lib/prisma");
const { getUserFromRequest } = require("../_lib/auth");
const { setCors } = require("../_lib/cors");

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (!["STAFF", "CHAIR", "ADMIN"].includes(user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const students = await prisma.studentProfile.findMany({
    include: { user: { select: { id: true, email: true, role: true } } }
  });
  return res.json({ students });
};
