import express from "express";

import {
  medicalJoinRequests,
  hospitals,
  pharmacies,
  bloodCenters,
  bloodRequests,
  myRequests,
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

function generateEntityId(type) {
  const prefixMap = {
    hospital: "h",
    pharmacy: "p",
    blood_center: "bc",
  };

  const prefix =
    prefixMap[type] || "medical";

  return (
    prefix +
    Date.now() +
    Math.floor(
      Math.random() * 1000
    )
  );
}

// ============================================================
// Find medical entity
// ============================================================

function findMedicalEntity(
  medicalEntityId
) {
  if (!medicalEntityId) {
    return null;
  }

  const hospital =
    hospitals.find(
      (item) =>
        item.id === medicalEntityId
    );

  if (hospital) {
    return {
      entity: hospital,
      type: "hospital",
    };
  }

  const pharmacy =
    pharmacies.find(
      (item) =>
        item.id === medicalEntityId
    );

  if (pharmacy) {
    return {
      entity: pharmacy,
      type: "pharmacy",
    };
  }

  const bloodCenter =
    bloodCenters.find(
      (item) =>
        item.id === medicalEntityId
    );

  if (bloodCenter) {
    return {
      entity: bloodCenter,
      type: "blood_center",
    };
  }

  return null;
}

// ============================================================
// Get entity type label
// ============================================================

function getEntityTypeLabel(type) {
  if (type === "hospital") {
    return "مستشفى";
  }

  if (type === "pharmacy") {
    return "صيدلية";
  }

  if (type === "blood_center") {
    return "مركز دم";
  }

  return "جهة طبية";
}

// ============================================================
// Add request timeline
// ============================================================

function addRequestTimeline(
  request,
  status
) {
  if (!request) {
    return;
  }

  if (!Array.isArray(request.timeline)) {
    request.timeline = [];
  }

  request.timeline.push({
    label:
      `تم تحديث حالة الطلب إلى: ${status}`,

    time:
      new Date().toLocaleTimeString(
        "ar-EG"
      ),

    done: true,
  });

  request.updatedAt =
    new Date().toISOString();
}

// ============================================================
// Update matching request in myRequests
// ============================================================

function syncMyRequest(
  request
) {
  if (!request?.id) {
    return;
  }

  const matchingRequest =
    myRequests.find(
      (item) =>
        item.id === request.id
    );

  if (!matchingRequest) {
    return;
  }

  matchingRequest.status =
    request.status;

  matchingRequest.updatedAt =
    request.updatedAt ||
    new Date().toISOString();

  if (
    Array.isArray(
      request.timeline
    )
  ) {
    matchingRequest.timeline = [
      ...request.timeline,
    ];
  }
}

// ============================================================
// Get requests belonging to medical entity
// ============================================================

function getMedicalEntityRequests(
  medicalEntityId,
  entityType
) {
  // ==========================================================
  // Hospital
  // ==========================================================

  if (
    entityType ===
    "hospital"
  ) {
    return bloodRequests.filter(
      (request) =>
        request.hospitalId ===
        medicalEntityId
    );
  }

  // ==========================================================
  // Pharmacy
  // ==========================================================

  if (
    entityType ===
    "pharmacy"
  ) {
    return myRequests.filter(
      (request) =>
        request.requestType ===
          "medicine" &&
        request.pharmacyId ===
          medicalEntityId
    );
  }

  // ==========================================================
  // Blood Center
  // ==========================================================

  if (
    entityType ===
    "blood_center"
  ) {
    return bloodRequests.filter(
      (request) =>
        request.requestType ===
          "blood-bank" &&
        request.centerId ===
          medicalEntityId
    );
  }

  return [];
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
    // منع وجود طلب معلق بنفس البريد
    // ========================================================

    const existingPendingRequest =
      medicalJoinRequests.find(
        (item) =>
          item.email ===
            cleanEmail &&
          item.status ===
            "pending"
      );

    if (
      existingPendingRequest
    ) {
      return res.status(409).json({
        error:
          "يوجد بالفعل طلب انضمام قيد المراجعة بهذا البريد الإلكتروني",

        request:
          existingPendingRequest,
      });
    }

    // ========================================================
    // منع تسجيل جهة معتمدة بنفس البريد
    // ========================================================

    const allApprovedEntities = [
      ...hospitals,
      ...pharmacies,
      ...bloodCenters,
    ];

    const existingApprovedEntity =
      allApprovedEntities.find(
        (item) =>
          item.email &&
          String(item.email)
            .trim()
            .toLowerCase() ===
            cleanEmail
      );

    if (
      existingApprovedEntity
    ) {
      return res.status(409).json({
        error:
          "هذه الجهة مسجلة ومعتمدة بالفعل",

        entity:
          existingApprovedEntity,
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

    medicalJoinRequests.push(
      request
    );

    saveStore();

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

    if (status) {
      result =
        result.filter(
          (item) =>
            item.status ===
            status
        );
    }

    if (type) {
      result =
        result.filter(
          (item) =>
            item.type ===
            type
        );
    }

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
// عرض طلب محدد
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

// ============================================================
// POST /api/medical/join-requests/:id/approve
// الموافقة على طلب جهة طبية
// ============================================================

router.post(
  "/join-requests/:id/approve",
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

    if (
      request.status !==
      "pending"
    ) {
      return res.status(400).json({
        error:
          "لا يمكن مراجعة هذا الطلب مرة أخرى",

        request,
      });
    }

    const entityLists = {
      hospital:
        hospitals,

      pharmacy:
        pharmacies,

      blood_center:
        bloodCenters,
    };

    const targetList =
      entityLists[
        request.type
      ];

    if (!targetList) {
      return res.status(400).json({
        error:
          "نوع الجهة الطبية غير صحيح",
      });
    }

    const alreadyExists =
      targetList.find(
        (item) =>
          (
            item.email &&
            request.email &&
            String(
              item.email
            )
              .trim()
              .toLowerCase() ===
            String(
              request.email
            )
              .trim()
              .toLowerCase()
          ) ||
          (
            item.name &&
            String(
              item.name
            )
              .trim()
              .toLowerCase() ===
            String(
              request.name
            )
              .trim()
              .toLowerCase()
          )
      );

    if (
      alreadyExists
    ) {
      return res.status(409).json({
        error:
          "هذه الجهة موجودة بالفعل في القائمة الرسمية",

        entity:
          alreadyExists,
      });
    }

    const entity = {
      id:
        generateEntityId(
          request.type
        ),

      name:
        request.name,

      email:
        request.email,

      phone:
        request.phone,

      licenseNumber:
        request.licenseNumber,

      address:
        request.address,

      governorate:
        request.governorate,

      city:
        request.city,

      verified:
        true,

      createdAt:
        new Date().toISOString(),

      joinRequestId:
        request.id,
    };

    targetList.push(
      entity
    );

    request.status =
      "approved";

    request.updatedAt =
      new Date().toISOString();

    request.reviewedAt =
      new Date().toISOString();

    request.entityId =
      entity.id;

    saveStore();

    res.json({
      message:
        "تمت الموافقة على الجهة وإضافتها إلى القائمة الرسمية",

      request,

      entity,
    });
  }
);

// ============================================================
// POST /api/medical/join-requests/:id/reject
// رفض طلب جهة طبية
// ============================================================

router.post(
  "/join-requests/:id/reject",
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

    if (
      request.status !==
      "pending"
    ) {
      return res.status(400).json({
        error:
          "لا يمكن مراجعة هذا الطلب مرة أخرى",

        request,
      });
    }

    const rejectionReason =
      req.body.rejectionReason
        ? String(
            req.body
              .rejectionReason
          ).trim()
        : "";

    request.status =
      "rejected";

    request.rejectionReason =
      rejectionReason;

    request.updatedAt =
      new Date().toISOString();

    request.reviewedAt =
      new Date().toISOString();

    saveStore();

    res.json({
      message:
        "تم رفض طلب الانضمام",

      request,
    });
  }
);

// ============================================================
// GET /api/medical/entities
// الجهات الطبية الرسمية المعتمدة
// ============================================================

router.get(
  "/entities",
  (req, res) => {
    res.json({
      hospitals,
      pharmacies,
      bloodCenters,
    });
  }
);

// ============================================================
// GET /api/medical/entities/hospitals
// ============================================================

router.get(
  "/entities/hospitals",
  (req, res) => {
    res.json(
      hospitals
    );
  }
);

// ============================================================
// GET /api/medical/entities/pharmacies
// ============================================================

router.get(
  "/entities/pharmacies",
  (req, res) => {
    res.json(
      pharmacies
    );
  }
);

// ============================================================
// GET /api/medical/entities/blood-centers
// ============================================================

router.get(
  "/entities/blood-centers",
  (req, res) => {
    res.json(
      bloodCenters
    );
  }
);

// ============================================================
// GET /api/medical/:entityType/:entityId/requests
//
// عرض الطلبات الخاصة بالجهة الطبية
//
// hospital:
//     طلبات الدم المرتبطة بالمستشفى
//
// pharmacy:
//     طلبات الأدوية المرتبطة بالصيدلية
//
// blood_center:
//     طلبات بنك الدم المرتبطة بمركز الدم
// ============================================================

router.get(
  "/:entityType/:entityId/requests",
  (req, res) => {
    const {
      entityType,
      entityId,
    } = req.params;

    const allowedTypes = [
      "hospital",
      "pharmacy",
      "blood_center",
    ];

    if (
      !allowedTypes.includes(
        entityType
      )
    ) {
      return res.status(400).json({
        error:
          "نوع الجهة الطبية غير صحيح",
      });
    }

    const medicalEntity =
      findMedicalEntity(
        entityId
      );

    if (!medicalEntity) {
      return res.status(404).json({
        error:
          "الجهة الطبية غير موجودة",
      });
    }

    if (
      medicalEntity.type !==
      entityType
    ) {
      return res.status(400).json({
        error:
          "نوع الجهة لا يتطابق مع الجهة المطلوبة",
      });
    }

    const requests =
      getMedicalEntityRequests(
        entityId,
        entityType
      );

    const sortedRequests = [
      ...requests,
    ].sort(
      (a, b) =>
        new Date(
          b.createdAt ||
            b.date ||
            0
        ).getTime() -
        new Date(
          a.createdAt ||
            a.date ||
            0
        ).getTime()
    );

    res.json({
      entity: {
        id:
          medicalEntity.entity.id,

        name:
          medicalEntity.entity.name,

        type:
          entityType,

        typeLabel:
          getEntityTypeLabel(
            entityType
          ),
      },

      requests:
        sortedRequests,

      total:
        sortedRequests.length,
    });
  }
);

// ============================================================
// GET /api/medical/:entityType/:entityId/requests/:requestId
//
// عرض طلب واحد للجهة الطبية
// ============================================================

router.get(
  "/:entityType/:entityId/requests/:requestId",
  (req, res) => {
    const {
      entityType,
      entityId,
      requestId,
    } = req.params;

    const allowedTypes = [
      "hospital",
      "pharmacy",
      "blood_center",
    ];

    if (
      !allowedTypes.includes(
        entityType
      )
    ) {
      return res.status(400).json({
        error:
          "نوع الجهة الطبية غير صحيح",
      });
    }

    const medicalEntity =
      findMedicalEntity(
        entityId
      );

    if (!medicalEntity) {
      return res.status(404).json({
        error:
          "الجهة الطبية غير موجودة",
      });
    }

    if (
      medicalEntity.type !==
      entityType
    ) {
      return res.status(400).json({
        error:
          "نوع الجهة لا يتطابق مع الجهة المطلوبة",
      });
    }

    const requests =
      getMedicalEntityRequests(
        entityId,
        entityType
      );

    const request =
      requests.find(
        (item) =>
          item.id ===
          requestId
      );

    if (!request) {
      return res.status(404).json({
        error:
          "الطلب غير موجود أو لا يتبع هذه الجهة الطبية",
      });
    }

    res.json(
      request
    );
  }
);

// ============================================================
// POST /api/medical/:entityType/:entityId/requests/:requestId/status
//
// تحديث حالة الطلب من الجهة الطبية
//
// Body:
// {
//   "status": "مكتمل"
// }
// ============================================================

router.post(
  "/:entityType/:entityId/requests/:requestId/status",
  (req, res) => {
    const {
      entityType,
      entityId,
      requestId,
    } = req.params;

    const {
      status,
    } = req.body;

    const allowedTypes = [
      "hospital",
      "pharmacy",
      "blood_center",
    ];

    if (
      !allowedTypes.includes(
        entityType
      )
    ) {
      return res.status(400).json({
        error:
          "نوع الجهة الطبية غير صحيح",
      });
    }

    if (!status) {
      return res.status(400).json({
        error:
          "حالة الطلب مطلوبة",
      });
    }

    const medicalEntity =
      findMedicalEntity(
        entityId
      );

    if (!medicalEntity) {
      return res.status(404).json({
        error:
          "الجهة الطبية غير موجودة",
      });
    }

    if (
      medicalEntity.type !==
      entityType
    ) {
      return res.status(400).json({
        error:
          "نوع الجهة لا يتطابق مع الجهة المطلوبة",
      });
    }

    const requests =
      getMedicalEntityRequests(
        entityId,
        entityType
      );

    const request =
      requests.find(
        (item) =>
          item.id ===
          requestId
      );

    if (!request) {
      return res.status(404).json({
        error:
          "الطلب غير موجود أو لا يتبع هذه الجهة الطبية",
      });
    }

    // ========================================================
    // الحالات المسموح بها لكل نوع
    // ========================================================

    const allowedStatuses = {
      hospital: [
        "قيد الانتظار",
        "قيد التنفيذ",
        "جاري التنفيذ",
        "تم القبول",
        "المتبرع في طريقه إلى المستشفى",
        "وصل إلى المستشفى",
        "تم التبرع",
        "مكتمل",
        "تم الرفض",
        "تم الإلغاء",
      ],

      pharmacy: [
        "قيد المراجعة",
        "جاري التجهيز",
        "في انتظار الاستلام",
        "مكتمل",
        "تم الرفض",
        "تم الإلغاء",
      ],

      blood_center: [
        "قيد المراجعة",
        "قيد التجهيز",
        "مكتمل",
        "تم الرفض",
        "تم الإلغاء",
      ],
    };

    if (
      !allowedStatuses[
        entityType
      ].includes(status)
    ) {
      return res.status(400).json({
        error:
          "حالة الطلب غير مسموح بها لهذا النوع من الجهات الطبية",

        allowedStatuses:
          allowedStatuses[
            entityType
          ],
      });
    }

    // ========================================================
    // تحديث الحالة
    // ========================================================

    request.status =
      status;

    addRequestTimeline(
      request,
      status
    );

    // ========================================================
    // مزامنة طلب المستخدم
    // ========================================================

    syncMyRequest(
      request
    );

    saveStore();

    res.json({
      message:
        "تم تحديث حالة الطلب بنجاح",

      request,
    });
  }
);

export default router;
