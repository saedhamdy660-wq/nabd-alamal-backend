import express from "express";

import {
  medicalJoinRequests,
  saveStore,
} from "../data/store.js";

const router = express.Router();

// ============================================================
// Helpers
// ============================================================

function generateId(prefix = "mj") {
  return (
    prefix +
    Date.now() +
    Math.floor(
      Math.random() * 1000
    )
  );
}

// ============================================================
// POST /api/medical/join-requests
// إرسال طلب انضمام لجهة طبية
// ============================================================

router.post(
  "/join-requests",
  (req, res) => {
    const {
      type,
      name,
      email,
      phone,
      licenseNumber,
      address,
      governorate,
      city,
    } = req.body;

    // ========================================================
    // التحقق من نوع الجهة
    // ========================================================

    const allowedTypes = [
      "hospital",
      "pharmacy",
      "blood_center",
    ];

    if (
      !type ||
      !allowedTypes.includes(type)
    ) {
      return res.status(400).json({
        error:
          "نوع الجهة الطبية غير صحيح",
      });
    }

    // ========================================================
    // البيانات الأساسية
    // ========================================================

    if (
      !name ||
      !email ||
      !phone ||
      !licenseNumber
    ) {
      return res.status(400).json({
        error:
          "اسم الجهة والبريد الإلكتروني ورقم الهاتف ورقم الترخيص مطلوبة",
      });
    }

    // ========================================================
    // تنظيف البيانات
    // ========================================================

    const cleanName =
      String(name).trim();

    const cleanEmail =
      String(email)
        .trim()
        .toLowerCase();

    const cleanPhone =
      String(phone).trim();

    const cleanLicenseNumber =
      String(
        licenseNumber
      ).trim();

    // ========================================================
    // منع وجود طلب آخر لنفس البريد
    // ========================================================

    const existingRequest =
      medicalJoinRequests.find(
        (item) =>
          item.email ===
            cleanEmail &&
          item.status ===
            "pending"
      );

    if (existingRequest) {
      return res.status(409).json({
        error:
          "يوجد بالفعل طلب انضمام قيد المراجعة بهذا البريد الإلكتروني",
        request:
          existingRequest,
      });
    }

    // ========================================================
    // إنشاء طلب الانضمام
    // ========================================================

    const now =
      new Date();

    const request = {
      id: generateId(),

      type,

      name:
        cleanName,

      email:
        cleanEmail,

      phone:
        cleanPhone,

      licenseNumber:
        cleanLicenseNumber,

      address:
        address
          ? String(address).trim()
          : "",

      governorate:
        governorate
          ? String(
              governorate
            ).trim()
          : "",

      city:
        city
          ? String(city).trim()
          : "",

      status:
        "pending",

      createdAt:
        now.toISOString(),

      updatedAt:
        now.toISOString(),
    };

    // ========================================================
    // حفظ الطلب
    // ========================================================

    medicalJoinRequests.push(
      request
    );

    saveStore();

    // ========================================================
    // Response
    // ========================================================

    res.status(201).json({
      message:
        "تم إرسال طلب الانضمام بنجاح، وسيتم مراجعته من إدارة المنصة",

      request,
    });
  }
);

// ============================================================
// GET /api/medical/join-requests
// عرض طلبات انضمام الجهات الطبية
// ============================================================

router.get(
  "/join-requests",
  (req, res) => {
    const {
      status,
      type,
    } = req.query;

    let result = [
      ...medicalJoinRequests,
    ];

    // فلترة بالحالة
    if (status) {
      result =
        result.filter(
          (item) =>
            item.status ===
            status
        );
    }

    // فلترة بنوع الجهة
    if (type) {
      result =
        result.filter(
          (item) =>
            item.type ===
            type
        );
    }

    // الأحدث أولًا
    result.sort(
      (a, b) =>
        new Date(
          b.createdAt
        ) -
        new Date(
          a.createdAt
        )
    );

    res.json(
      result
    );
  }
);

// ============================================================
// GET /api/medical/join-requests/:id
// عرض طلب انضمام محدد
// ============================================================

router.get(
  "/join-requests/:id",
  (req, res) => {
    const request =
      medicalJoinRequests.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!request) {
      return res.status(404).json({
        error:
          "طلب الانضمام غير موجود",
      });
    }

    res.json(
      request
    );
  }
);

export default router;
