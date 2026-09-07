import express from "express";
import { bloodRequests, donors, hospitals } from "../data/store.js";

const router = express.Router();

// GET all active blood/plasma requests
router.get("/requests", (req, res) => {
  res.json(bloodRequests);
});

// GET one request (for tracking screen)
router.get("/requests/:id", (req, res) => {
  const request = bloodRequests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  res.json(request);
});

// POST create a new emergency blood request (hospital side)
router.post("/requests", (req, res) => {
  const { bloodType, urgency, hospital, lat, lng } = req.body;
  const newRequest = {
    id: "b" + (bloodRequests.length + 1),
    bloodType,
    urgency: urgency || "عاجلة",
    hospital,
    distanceKm: 0,
    lat,
    lng,
    status: "قيد التنفيذ",
    timeline: [{ label: "تم إرسال التنبيه للمتبرعين", time: new Date().toLocaleTimeString("ar-EG"), done: true }],
  };
  bloodRequests.push(newRequest);
  // In production: trigger a real-time push notification here to nearby matching donors
  res.status(201).json(newRequest);
});

// GET a single donor's detail (for the "تفاصيل المتبرع" screen)
router.get("/donors/:id", (req, res) => {
  const donor = donors.find((d) => d.id === req.params.id);
  if (!donor) return res.status(404).json({ error: "Donor not found" });
  res.json(donor);
});

// GET donors near a given lat/lng that match a blood type
router.get("/donors/nearby", (req, res) => {
  const { bloodType } = req.query;
  const filtered = bloodType ? donors.filter((d) => d.bloodType === bloodType) : donors;
  res.json(filtered.sort((a, b) => a.distanceKm - b.distanceKm));
});

// POST a donor responds "I can donate" to a request
router.post("/requests/:id/respond", (req, res) => {
  const request = bloodRequests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  request.timeline.push({ label: "تم قبول الطلب من متبرع", time: new Date().toLocaleTimeString("ar-EG"), done: true });
  res.json(request);
});

// GET nearby hospitals / blood banks
router.get("/hospitals", (req, res) => {
  res.json(hospitals);
});

export default router;
