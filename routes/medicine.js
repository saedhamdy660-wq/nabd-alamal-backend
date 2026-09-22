import express from "express";

import {
  medicines,
  pharmacies,
  myRequests,
  users,
  saveStore,
} from "../data/store.js";

const router = express.Router();

// =========================
// Helpers
// =========================

function generateId(prefix = "mr") {
  return (
    prefix +
    Date.now() +
    Math.floor(
      Math.random() * 1000
    )
  );
}

function getDate(date = new Date()) {
  return date
    .toISOString()
    .slice(0, 10);
}

function getTime(date = new Date()) {
  return date.toLocaleTimeString(
    "ar-EG"
  );
}

// =========================
// GET all available medicines
// =========================

router.get("/", (req, res) => {
  const {
    q,
    category,
  } = req.query;

  let result = [
    ...medicines,
  ];

  // Search
  if (q) {
    const search =
      q
        .trim()
        .toLowerCase();

    result =
      result.filter(
        (medicine) =>
          String(
            medicine.name || ""
          )
            .toLowerCase()
            .includes(search)
      );
  }

  // Category filter
  if (
    category &&
    category !== "الجميع"
  ) {
    result =
      result.filter(
        (medicine) =>
          medicine.category ===
          category
      );
  }

  res.json(
    result
  );
});

// =========================
// GET nearby partner pharmacies
// =========================
//
// لازم يكون قبل /:id
// عشان Express ما يعتبرش
// "partners" هو medicine id.

router.get(
  "/partners/pharmacies",
  (req, res) => {
    res.json(
      pharmacies
    );
  }
);

// =========================
// GET single medicine
// =========================

router.get(
  "/:id",
  (req, res) => {
    const medicine =
      medicines.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!medicine) {
      return res.status(404).json({
        error:
          "Medicine not found",
      });
    }

    res.json(
      medicine
    );
  }
);

// =========================
// POST list surplus medicine
// =========================

router.post(
  "/",
  (req, res) => {
    const {
      name,
      category,
      quantity,
      expiry,
      donor,
      donorId,
      distanceKm,
      pickupLocation,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        error:
          "اسم الدواء مطلوب",
      });
    }

    const newMedicine = {
      id:
        "m" +
        (
          medicines.length + 1
        ),

      name,

      category:
        category || "",

      quantity:
        quantity || 0,

      expiry:
        expiry || "",

      donor:
        donor || "",

      donorId:
        donorId || null,

      distanceKm:
        distanceKm ?? null,

      pickupLocation:
        pickupLocation || "",

      createdAt:
        new Date().toISOString(),
    };

    medicines.push(
      newMedicine
    );

    // حفظ الدواء الجديد
    saveStore();

    res.status(201).json(
      newMedicine
    );
  }
);

// =========================
// POST request medicine
// =========================

router.post(
  "/:id/request",
  (req, res) => {
    const medicine =
      medicines.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!medicine) {
      return res.status(404).json({
        error:
          "Medicine not found",
      });
    }

    const {
      userId,
      pharmacyId,
      pharmacyName,
    } = req.body;

    // =========================
    // لازم يكون فيه مستخدم
    // =========================

    if (!userId) {
      return res.status(400).json({
        error:
          "userId is required",
      });
    }

    const user =
      users.find(
        (item) =>
          item.id ===
          userId
      );

    if (!user) {
      return res.status(404).json({
        error:
          "المستخدم غير موجود",
      });
    }

    // =========================
    // منع تكرار الطلب
    // =========================

    const existingRequest =
      myRequests.find(
        (item) =>
          item.userId ===
            userId &&
          item.type ===
            "دواء" &&
          item.medicineId ===
            medicine.id &&
          (
            item.status ===
              "قيد المراجعة" ||
            item.status ===
              "جاري التجهيز" ||
            item.status ===
              "في انتظار الاستلام"
          )
      );

    if (existingRequest) {
      return res.status(409).json({
        error:
          "لديك بالفعل طلب قائم لهذا الدواء",

        request:
          existingRequest,
      });
    }

    const now =
      new Date();

    const requestId =
      generateId(
        "mr"
      );

    // =========================
    // إنشاء طلب الدواء
    // =========================

    const medicineRequest = {
      id:
        requestId,

      userId:
        userId,

      type:
        "دواء",

      requestType:
        "medicine",

      title:
        medicine.name,

      medicineId:
        medicine.id,

      medicineName:
        medicine.name,

      category:
        medicine.category,

      quantity:
        medicine.quantity,

      expiry:
        medicine.expiry,

      donor:
        medicine.donor,

      donorId:
        medicine.donorId ||
        null,

      pickupLocation:
        medicine.pickupLocation ||
        null,

      pharmacyId:
        pharmacyId ||
        null,

      pharmacyName:
        pharmacyName ||
        null,

      status:
        "قيد المراجعة",

      date:
        getDate(now),

      createdAt:
        now.toISOString(),

      timeline: [
        {
          label:
            "تم إرسال طلب الدواء",

          time:
            getTime(now),

          done:
            true,
        },
      ],
    };

    // =========================
    // حفظ الطلب للمستخدم
    // =========================

    myRequests.push(
      medicineRequest
    );

    // حفظ في db.json
    saveStore();

    res.status(201).json({
      message:
        "تم إرسال طلبك، سيتم تسليم الدواء عبر الصيدلية الشريكة بعد فحصه والتأكد من صلاحيته.",

      request:
        medicineRequest,

      medicine,
    });
  }
);

export default router;
