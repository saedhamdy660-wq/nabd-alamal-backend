import express from "express";
import { notifications } from "../data/store.js";

const router = express.Router();

router.get("/", (req, res) => {
  const userId =
    req.query.userId;

  // لو مفيش مستخدم محدد
  // لا نعرض الإشعارات الخاصة بالمستخدمين
  if (!userId) {
    return res.json([]);
  }

  const userNotifications =
    notifications.filter(
      (notification) =>
        notification.recipientId ===
        userId
    );

  res.json(
    userNotifications
  );
});

export default router;
