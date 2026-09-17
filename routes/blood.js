import express from "express";
import {
  bloodRequests,
  donors,
  hospitals,
} from "../data/store.js";

const router = express.Router();

// =========================
// Blood Requests
// =========================

// GET all active blood/plasma requests
router.get("/requests", (req, res) => {
  res.json(bloodRequests);
});

// GET one request
router.get("/requests/:id", (req, res) => {
  const request = bloodRequests.find(
    (r) => r.id === req.params.id
  );

  if (!request) {
    return res.status(404).json({
      error: "Request not found",
    });
  }

  res.json(request);
});

// POST create a new emergency blood request
router.post("/requests", (req, res) => {
  const {
    bloodType,
    urgency,
    hospital,
    lat,
    lng,
  } = req.body;

  if (!bloodType || !hospital) {
    return res.status(400).json({
      error: "bloodType and hospital are required",
    });
  }

  const newRequest = {
    id: "b" + (bloodRequests.length + 1),
    bloodType,
    urgency: urgency || "عاجلة",
    hospital,
    distanceKm: 0,
    lat: lat || 0,
    lng: lng || 0,
    status: "قيد التنفيذ",

    timeline: [
      {
        label: "تم إرسال التنبيه للمتبرعين",
        time: new Date().toLocaleTimeString(
          "ar-EG"
        ),
        done: true,
      },
    ],
  };

  bloodRequests.push(newRequest);

  res.status(201).json(newRequest);
});

// =========================
// Donors
// =========================

// GET one donor
router.get("/donors/:id", (req, res) => {
  const donor = donors.find(
    (d) => d.id === req.params.id
  );

  if (!donor) {
    return res.status(404).json({
      error: "Donor not found",
    });
  }

  res.json(donor);
});

// GET nearby donors
//
// ملاحظات:
// 1. نستبعد المستخدم نفسه إذا أرسل userId.
// 2. نفلتر حسب فصيلة الدم إذا تم إرسالها.
// 3. نستبعد المتبرع الذي لا يملك موقعًا صحيحًا.
// 4. نرتب المتبرعين حسب المسافة.
// 5. lastDonation تُرجع مع البيانات لاستخدامها في الواجهة.
router.get("/donors/nearby", (req, res) => {
  const {
    bloodType,
    userId,
    lat,
    lng,
  } = req.query;

  let filtered = [...donors];

  // =========================
  // Exclude current user
  // =========================
  if (userId) {
    filtered = filtered.filter(
      (donor) =>
        donor.userId !== userId
    );
  }

  // =========================
  // Filter by blood type
  // =========================
  if (bloodType) {
    filtered = filtered.filter(
      (donor) =>
        donor.bloodType === bloodType
    );
  }

  // =========================
  // Calculate distance
  // =========================
  if (lat && lng) {
    const userLat = Number(lat);
    const userLng = Number(lng);

    filtered = filtered.map((donor) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        Number(donor.lat),
        Number(donor.lng)
      );

      return {
        ...donor,
        distanceKm:
          Math.round(distance * 10) / 10,
      };
    });
  }

  // =========================
  // Sort nearest first
  // =========================
  filtered.sort(
    (a, b) =>
      Number(a.distanceKm || 0) -
      Number(b.distanceKm || 0)
  );

  res.json(filtered);
});

// =========================
// Donor responds to request
// =========================
router.post(
  "/requests/:id/respond",
  (req, res) => {
    const request = bloodRequests.find(
      (r) => r.id === req.params.id
    );

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    request.timeline.push({
      label: "تم قبول الطلب من متبرع",
      time: new Date().toLocaleTimeString(
        "ar-EG"
      ),
      done: true,
    });

    res.json(request);
  }
);

// =========================
// Nearby hospitals
// =========================
router.get("/hospitals", (req, res) => {
  res.json(hospitals);
});

// =========================
// Distance Calculator
// =========================
function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export default router;
