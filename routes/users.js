import express from "express";
import {
  users,
  myRequests,
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

/*
  Update user's current location
*/
router.put("/:id/location", (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return res.status(400).json({
      error: "موقع غير صالح",
    });
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({
      error: "إحداثيات الموقع غير صحيحة",
    });
  }

  const user = users.find(
    (u) => u.id === id
  );

  if (!user) {
    return res.status(404).json({
      error: "المستخدم غير موجود",
    });
  }

  user.lat = latitude;
  user.lng = longitude;
  user.locationEnabled = true;

  /*
    لو المستخدم متبرع، نحدث موقعه
    في قائمة المتبرعين أيضًا.
  */
  const donor = users
    .map((u) => u)
    .find((u) => u.id === id);

  // تحديث آمن لبيانات المتبرع
  // يتم عمله من خلال import ديناميكي
  // لتجنب تغيير باقي منطق الملف.
  import("../data/store.js").then(
    ({ donors }) => {
      const donorRecord = donors.find(
        (d) => d.userId === id
      );

      if (donorRecord) {
        donorRecord.lat = latitude;
        donorRecord.lng = longitude;
        donorRecord.distanceKm = 0;
      }
    }
  );

  const {
    password: _pw,
    ...safeUser
  } = user;

  res.json(safeUser);
});

router.get("/me/requests", (req, res) => {
  res.json(myRequests);
});

export default router;
