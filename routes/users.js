import express from "express";

import {
  users,
  myRequests,
  donors,
  saveStore,
} from "../data/store.js";

const router = express.Router();

// ============================================================
// GET current user
// ============================================================

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

    const { password: _pw, ...safeUser } =
      found;

    return res.json(safeUser);
  }

  const found = users[0];

  if (!found) {
    return res.status(404).json({
      error: "المستخدم غير موجود",
    });
  }

  const { password: _pw, ...safeUser } =
    found;

  res.json(safeUser);
});

// ============================================================
// GET current user's requests
// ============================================================

router.get("/me/requests", (req, res) => {
  const email = req.query.email;
  const userId = req.query.userId;

  let currentUser = null;

  // البحث عن المستخدم عن طريق userId
  if (userId) {
    currentUser = users.find(
      (u) => u.id === userId
    );
  }

  // لو مفيش userId نبحث عن طريق email
  if (!currentUser && email) {
    currentUser = users.find(
      (u) =>
        u.email.toLowerCase() ===
        email.trim().toLowerCase()
    );
  }

  // لو لم يتم تحديد المستخدم
  if (!currentUser) {
    return res.status(400).json({
      error:
        "يجب إرسال userId أو email لتحديد المستخدم",
    });
  }

  // ==========================================================
  // إرجاع الطلبات الخاصة بالمستخدم الحالي فقط
  // ==========================================================

  const userRequests =
    myRequests.filter(
      (request) =>
        request.requesterId ===
        currentUser.id
    );

  res.json(userRequests);
});

// ============================================================
// تحديث موقع المستخدم
// ============================================================

router.put("/:id/location", (req, res) => {
  const { lat, lng } = req.body;

  const user = users.find(
    (u) => u.id === req.params.id
  );

  if (!user) {
    return res.status(404).json({
      error: "المستخدم غير موجود",
    });
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return res.status(400).json({
      error: "إحداثيات الموقع غير صحيحة",
    });
  }

  // تحديث موقع المستخدم
  user.lat = latitude;
  user.lng = longitude;
  user.locationEnabled = true;

  // لو المستخدم متبرع، حدث موقعه داخل donors أيضًا
  const donor = donors.find(
    (d) => d.userId === user.id
  );

  if (donor) {
    donor.lat = latitude;
    donor.lng = longitude;
  }

  // حفظ التغييرات
  saveStore();

  const { password: _pw, ...safeUser } =
    user;

  res.json(safeUser);
});

export default router;
