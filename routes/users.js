import express from "express";
import { users, myRequests } from "../data/store.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// =========================
// Get current user
// =========================
router.get("/me", authenticateToken, (req, res) => {
  const found = users.find(
    (u) => u.id === req.auth.userId
  );

  if (!found) {
    return res.status(404).json({
      error: "المستخدم غير موجود",
    });
  }

  const { password: _pw, ...safeUser } = found;

  res.json(safeUser);
});

// =========================
// Get current user's requests
// =========================
router.get(
  "/me/requests",
  authenticateToken,
  (req, res) => {
    const found = users.find(
      (u) => u.id === req.auth.userId
    );

    if (!found) {
      return res.status(404).json({
        error: "المستخدم غير موجود",
      });
    }

    res.json(myRequests);
  }
);

export default router;
