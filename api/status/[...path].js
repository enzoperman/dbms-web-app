const prisma = require("../_lib/prisma");
const { getUserFromRequest } = require("../_lib/auth");
const { setCors } = require("../_lib/cors");

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const path = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean);
  const [requestId, action] = path;

  if (req.method === "GET" && action === "history") {
    const history = await prisma.statusHistory.findMany({
      where: { requestId },
      orderBy: { createdAt: "desc" }
    });
    return res.json({ history });
  }

  return res.status(404).json({ message: "Not found" });
};
