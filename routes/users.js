import express from "express";
import { users, myRequests } from "../data/store.js";

const router = express.Router();

// =========================
// Get current user
// =========================
router.get("/me", (req, res) => {
  const email = req.query.email;

  if (email) {
    const found = users.find(
      (u) =>
        u.email.toLowerCase() ===
        email.trim().toLowerCase()
    );

    if (!found) {
      return res.status(404).json({
        error: "المستخدم غير موجود",
      });
    }

    const { password: _pw, ...safeUser } = found;

    return res.json(safeUser);
  }

  // Fallback للحساب التجريبي القديم
  const found = users[0];

  if (!found) {
    return res.status(404).json({
      error: "المستخدم غير موجود",
    });
  }

  const { password: _pw, ...safeUser } = found;

  res.json(safeUser);
});

// =========================
// Get user requests
// =========================
router.get("/me/requests", (req, res) => {
  res.json(myRequests);
});

export default router;
