import express from "express";
import {
  users,
  myRequests,
  donors,
} from "../data/store.js";

const router = express.Router();

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

router.get("/me/requests", (req, res) => {
  res.json(myRequests);
});

/*
  تحديث موقع المستخدم
*/
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

  const { password: _pw, ...safeUser } =
    user;

  res.json(safeUser);
});

export default router;
