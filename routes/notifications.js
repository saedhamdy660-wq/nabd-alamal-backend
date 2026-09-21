import express from "express";
import { notifications } from "../data/store.js";

const router = express.Router();

router.get("/", (req, res) => {
  const userId =
    req.query.userId;

  if (!userId) {
    return res.json(
      notifications
    );
  }

  const userNotifications =
    notifications.filter(
      (notification) =>
        !notification.recipientId ||
        notification.recipientId ===
          userId
    );

  res.json(
    userNotifications
  );
});

export default router;
