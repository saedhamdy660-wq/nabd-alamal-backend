import express from "express";
import {
  medicines,
  pharmacies,
  saveStore,
} from "../data/store.js";

const router = express.Router();

// GET all available medicine listings (optionally filter by search term / category)
router.get("/", (req, res) => {
  const { q, category } = req.query;
  let result = medicines;

  if (q) {
    result = result.filter((m) =>
      m.name.includes(q)
    );
  }

  if (
    category &&
    category !== "الجميع"
  ) {
    result = result.filter(
      (m) => m.category === category
    );
  }

  res.json(result);
});

// GET a single medicine's detail (matches the "تفاصيل الدواء" screen)
router.get("/:id", (req, res) => {
  const medicine = medicines.find(
    (m) => m.id === req.params.id
  );

  if (!medicine) {
    return res.status(404).json({
      error: "Medicine not found",
    });
  }

  res.json(medicine);
});

// POST list a surplus medicine you own (donor side)
router.post("/", (req, res) => {
  const {
    name,
    category,
    quantity,
    expiry,
    donor,
    distanceKm,
    pickupLocation,
  } = req.body;

  const newMedicine = {
    id: "m" + (medicines.length + 1),
    name,
    category,
    quantity,
    expiry,
    donor,
    distanceKm,
    pickupLocation,
  };

  medicines.push(newMedicine);

  // حفظ الدواء الجديد في db.json
  saveStore();

  res.status(201).json(newMedicine);
});

// POST request to pick up a medicine (creates a hand-off order at the partner pharmacy)
router.post("/:id/request", (req, res) => {
  const medicine = medicines.find(
    (m) => m.id === req.params.id
  );

  if (!medicine) {
    return res.status(404).json({
      error: "Medicine not found",
    });
  }

  res.status(201).json({
    message:
      "تم إرسال طلبك، سيتم تسليم الدواء عبر الصيدلية الشريكة بعد فحصه والتأكد من صلاحيته.",
    medicine,
  });
});

// GET nearby partner pharmacies
router.get("/partners/pharmacies", (req, res) => {
  res.json(pharmacies);
});

export default router;
