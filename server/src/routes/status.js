const express = require("express");
const prisma = require("../utils/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/:requestId/history", auth, async (req, res) => {
  const history = await prisma.statusHistory.findMany({
    where: { requestId: req.params.requestId },
    orderBy: { createdAt: "desc" }
  });
  res.json({ history });
});

module.exports = router;
