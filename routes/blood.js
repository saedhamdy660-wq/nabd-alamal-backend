import express from "express";

import {
  bloodRequests,
  donors,
  hospitals,
  users,
  myRequests,
  notifications,
  saveStore,
} from "../data/store.js";

const router = express.Router();

// =========================
// Helpers
// =========================

function getNow() {
  return new Date();
}

function getTime(date = new Date()) {
  return date.toLocaleTimeString("ar-EG");
}

function getDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function generateId(prefix) {
  return `${prefix}${Date.now()}${Math.floor(
    Math.random() * 1000
  )}`;
}

function addNotification(notification) {
  notifications.unshift({
    id: generateId("n"),
    time: "الآن",
    ...notification,
  });
}

function addTimeline(
  request,
  label,
  date = new Date()
) {
  if (!Array.isArray(request.timeline)) {
    request.timeline = [];
  }

  request.timeline.push({
    label,
    time: getTime(date),
    done: true,
  });
}

function findUser(userId) {
  return users.find(
    (user) => user.id === userId
  );
}

function findDonor(donorId) {
  return donors.find(
    (donor) => donor.id === donorId
  );
}

function findDonorByUserId(userId) {
  return donors.find(
    (donor) => donor.userId === userId
  );
}

// =========================
// Find hospital by ID
// =========================
//
// المستشفى يتم اختيارها من صاحب الطلب.
// لا نستخدم موقع المستخدم لاختيار المستشفى.

function findHospital(hospitalId) {
  if (!hospitalId) {
    return null;
  }

  if (!Array.isArray(hospitals)) {
    return null;
  }

  return hospitals.find(
    (hospital) =>
      hospital.id === hospitalId
  );
}

// =========================
// Attach selected hospital
// =========================

function attachSelectedHospital(
  request,
  hospital
) {
  if (!request || !hospital) {
    return false;
  }

  request.hospitalId =
    hospital.id || null;

  request.hospital =
    hospital.name ||
    hospital.title ||
    hospital.hospitalName ||
    "المستشفى المحدد";

  request.lat =
    Number.isFinite(
      Number(hospital.lat)
    )
      ? Number(hospital.lat)
      : null;

  request.lng =
    Number.isFinite(
      Number(hospital.lng)
    )
      ? Number(hospital.lng)
      : null;

  request.locationType =
    "hospital";

  request.locationName =
    request.hospital;

  if (hospital.address) {
    request.address =
      hospital.address;
  }

  return true;
}

// =========================
// Update user's request
// =========================

function createMyRequest(request) {
  if (!request?.requesterId) {
    return;
  }

  const existingIndex =
    myRequests.findIndex(
      (item) =>
        item.id === request.id &&
        item.userId ===
          request.requesterId
    );

  const requestData = {
    id: request.id,

    userId:
      request.requesterId,

    type: "دم",

    title:
      `طلب تبرع بالدم (${request.bloodType})`,

    requestType:
      request.requestType ||
      "blood",

    bloodType:
      request.bloodType,

    donorId:
      request.donorId ||
      null,

    donorUserId:
      request.donorUserId ||
      null,

    donorName:
      request.donorName ||
      null,

    hospital:
      request.hospital ||
      null,

    hospitalId:
      request.hospitalId ||
      null,

    locationType:
      request.locationType ||
      "hospital",

    lat:
      request.lat ??
      null,

    lng:
      request.lng ??
      null,

    address:
      request.address ||
      null,

    status:
      request.status,

    date:
      request.createdAt
        ? getDate(
            new Date(
              request.createdAt
            )
          )
        : getDate(),

    createdAt:
      request.createdAt ||
      new Date().toISOString(),

    timeline:
      Array.isArray(
        request.timeline
      )
        ? [...request.timeline]
        : [],
  };

  if (existingIndex === -1) {
    myRequests.push(
      requestData
    );
  } else {
    myRequests[
      existingIndex
    ] = {
      ...myRequests[
        existingIndex
      ],
      ...requestData,
    };
  }
}

function updateMyRequest(request) {
  if (!request?.requesterId) {
    return;
  }

  const myRequest =
    myRequests.find(
      (item) =>
        item.id === request.id &&
        item.userId ===
          request.requesterId
    );

  if (!myRequest) {
    createMyRequest(request);
    return;
  }

  myRequest.status =
    request.status;

  myRequest.hospital =
    request.hospital ||
    myRequest.hospital;

  myRequest.hospitalId =
    request.hospitalId ||
    myRequest.hospitalId;

  myRequest.locationType =
    request.locationType ||
    myRequest.locationType ||
    "hospital";

  myRequest.lat =
    request.lat ??
    myRequest.lat ??
    null;

  myRequest.lng =
    request.lng ??
    myRequest.lng ??
    null;

  myRequest.address =
    request.address ||
    myRequest.address ||
    null;

  myRequest.timeline =
    Array.isArray(
      request.timeline
    )
      ? [...request.timeline]
      : myRequest.timeline;

  myRequest.updatedAt =
    new Date().toISOString();
}

// =========================
// Blood Requests
// =========================

// GET all active public blood requests
router.get(
  "/requests",
  (req, res) => {
    const activeRequests =
      bloodRequests.filter(
        (request) => {
          // طلبات التبرع المباشر لها
          // endpoint خاص بها
          if (
            request.requestType ===
            "direct-donation"
          ) {
            return false;
          }

          return (
            request.status !==
              "مكتمل" &&
            request.status !==
              "تم الرفض"
          );
        }
      );

    res.json(
      activeRequests
    );
  }
);

// GET one request
router.get(
  "/requests/:id",
  (req, res) => {
    const request =
      bloodRequests.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!request) {
      return res.status(404).json({
        error:
          "Request not found",
      });
    }

    res.json(request);
  }
);

// =========================
// Create Emergency Request
// =========================

router.post(
  "/requests",
  (req, res) => {
    const {
      bloodType,
      urgency,
      hospital,
      hospitalId,
      requesterId,
      userId,
      lat,
      lng,
    } = req.body;

    const ownerId =
      requesterId ||
      userId ||
      null;

    if (!bloodType || !hospital) {
      return res.status(400).json({
        error:
          "bloodType and hospital are required",
      });
    }

    let requester = null;

    if (ownerId) {
      requester =
        findUser(ownerId);

      if (!requester) {
        return res.status(404).json({
          error:
            "المستخدم غير موجود",
        });
      }
    }

    const now =
      getNow();

    const newRequest = {
      id: generateId("b"),

      requestType:
        "blood",

      requesterId:
        ownerId,

      userId:
        ownerId,

      requesterName:
        requester?.name ||
        null,

      bloodType,

      urgency:
        urgency ||
        "عاجلة",

      hospital,

      hospitalId:
        hospitalId ||
        null,

      locationType:
        "hospital",

      distanceKm:
        0,

      lat:
        Number.isFinite(
          Number(lat)
        )
          ? Number(lat)
          : 0,

      lng:
        Number.isFinite(
          Number(lng)
        )
          ? Number(lng)
          : 0,

      status:
        "قيد التنفيذ",

      createdAt:
        now.toISOString(),

      timeline: [
        {
          label:
            "تم إرسال التنبيه للمتبرعين",

          time:
            getTime(now),

          done: true,
        },
      ],
    };

    bloodRequests.push(
      newRequest
    );

    // لو الطلب مرتبط بمستخدم
    // نحفظه في طلباته فقط
    if (ownerId) {
      createMyRequest(
        newRequest
      );
    }

    saveStore();

    res.status(201).json(
      newRequest
    );
  }
);

// =========================
// Direct Donation Requests
// =========================

// المستخدم يرسل طلب تبرع مباشر لمتبرع معين
router.post(
  "/donation-requests",
  (req, res) => {
    const {
      requesterId,
      donorId,
      hospitalId,
    } = req.body;

    // =========================
    // التحقق من البيانات
    // =========================

    if (
      !requesterId ||
      !donorId ||
      !hospitalId
    ) {
      return res.status(400).json({
        error:
          "requesterId, donorId and hospitalId are required",
      });
    }

    // =========================
    // البحث عن المستخدم
    // =========================

    const requester =
      findUser(
        requesterId
      );

    // =========================
    // البحث عن المتبرع
    // =========================

    const donor =
      findDonor(
        donorId
      );

    if (!requester) {
      return res.status(404).json({
        error:
          "المستخدم غير موجود",
      });
    }

    if (!donor) {
      return res.status(404).json({
        error:
          "المتبرع غير موجود",
      });
    }

    // =========================
    // البحث عن المستشفى المختارة
    // =========================

    const selectedHospital =
      findHospital(
        hospitalId
      );

    if (!selectedHospital) {
      return res.status(404).json({
        error:
          "المستشفى المختارة غير موجودة",
      });
    }

    // =========================
    // منع إرسال طلب للنفس
    // =========================

    if (
      donor.userId ===
      requester.id
    ) {
      return res.status(400).json({
        error:
          "لا يمكنك إرسال طلب لنفسك",
      });
    }

    // =========================
    // منع إرسال طلب لمتبرع مشغول
    // =========================

    if (
      donor.available === false
    ) {
      return res.status(409).json({
        error:
          "هذا المتبرع مرتبط حاليًا بطلب تبرع آخر",
      });
    }

    // =========================
    // منع تكرار نفس الطلب
    // =========================

    const alreadyPending =
      bloodRequests.find(
        (item) =>
          item.requestType ===
            "direct-donation" &&
          item.requesterId ===
            requester.id &&
          item.donorId ===
            donor.id &&
          item.status ===
            "قيد الانتظار"
      );

    if (alreadyPending) {
      return res.status(409).json({
        error:
          "يوجد طلب تبرع قيد الانتظار بالفعل",

        request:
          alreadyPending,
      });
    }

    const now =
      getNow();

    const requestId =
      generateId("dr");

    const newRequest = {
      id:
        requestId,

      requestType:
        "direct-donation",

      requesterId:
        requester.id,

      userId:
        requester.id,

      requesterName:
        requester.name,

      donorId:
        donor.id,

      donorUserId:
        donor.userId,

      donorName:
        donor.name,

      bloodType:
        donor.bloodType,

      urgency:
        "عاجلة",

      status:
        "قيد الانتظار",

      createdAt:
        now.toISOString(),

      locationType:
        "hospital",

      timeline: [
        {
          label:
            "تم إرسال طلب التبرع إلى المتبرع",

          time:
            getTime(now),

          done: true,
        },
      ],
    };

    // =========================
    // حفظ المستشفى التي اختارها
    // صاحب الطلب
    // =========================

    const hospitalAttached =
      attachSelectedHospital(
        newRequest,
        selectedHospital
      );

    if (!hospitalAttached) {
      return res.status(500).json({
        error:
          "تعذر حفظ بيانات المستشفى",
      });
    }

    bloodRequests.push(
      newRequest
    );

    // =========================
    // تسجيل الطلب لصاحب الطلب
    // =========================

    createMyRequest(
      newRequest
    );

    // =========================
    // إشعار المتبرع
    // =========================

    const donorNotification = {
      recipientId:
        donor.userId,

      senderId:
        requester.id,

      requestId,

      donorId:
        donor.id,

      kind:
        "donation_request",

      title:
        "طلب تبرع بالدم",

      body:
        `${requester.name} يحتاج إلى دم من فصيلة ${donor.bloodType}`,

      type:
        "urgent",

      status:
        "pending",

      hospital:
        newRequest.hospital,

      hospitalId:
        newRequest.hospitalId,

      lat:
        newRequest.lat,

      lng:
        newRequest.lng,

      address:
        newRequest.address ||
        null,
    };

    addNotification(
      donorNotification
    );

    saveStore();

    res.status(201).json({
      request:
        newRequest,

      notification:
        donorNotification,
    });
  }
);

// =========================
// Donor accepts / rejects
// =========================

router.post(
  "/donation-requests/:id/respond",
  (req, res) => {
    const {
      donorId,
      donorUserId,
      action,
    } = req.body;

    const respondingDonorUserId =
      donorUserId ||
      donorId;

    const request =
      bloodRequests.find(
        (item) =>
          item.id ===
            req.params.id &&
          item.requestType ===
            "direct-donation"
      );

    if (!request) {
      return res.status(404).json({
        error:
          "طلب التبرع غير موجود",
      });
    }

    if (
      request.donorUserId !==
      respondingDonorUserId
    ) {
      return res.status(403).json({
        error:
          "غير مسموح لك بالرد على هذا الطلب",
      });
    }

    if (
      action !== "accept" &&
      action !== "reject"
    ) {
      return res.status(400).json({
        error:
          "action must be accept or reject",
      });
    }

    if (
      request.status !==
      "قيد الانتظار"
    ) {
      return res.status(409).json({
        error:
          "تم الرد على هذا الطلب من قبل",

        request,
      });
    }

    const now =
      getNow();

    const respondingDonor =
      findDonorByUserId(
        respondingDonorUserId
      );

    // =========================
    // ACCEPT
    // =========================

    if (
      action === "accept"
    ) {
      request.status =
        "تم القبول";

      request.acceptedAt =
        now.toISOString();

      addTimeline(
        request,
        "تم قبول الطلب من المتبرع",
        now
      );

      // المتبرع أصبح مشغولًا
      if (respondingDonor) {
        respondingDonor.available =
          false;
      }
    }

    // =========================
    // REJECT
    // =========================

    if (
      action === "reject"
    ) {
      request.status =
        "تم الرفض";

      request.rejectedAt =
        now.toISOString();

      addTimeline(
        request,
        "تم رفض الطلب من المتبرع",
        now
      );

      if (respondingDonor) {
        respondingDonor.available =
          true;
      }
    }

    // =========================
    // تحديث طلب صاحب الطلب
    // =========================

    updateMyRequest(
      request
    );

    // =========================
    // تحديث إشعار المتبرع
    // =========================

    const donorNotification =
      notifications.find(
        (item) =>
          item.requestId ===
            request.id &&
          item.recipientId ===
            request.donorUserId
      );

    if (donorNotification) {
      donorNotification.status =
        action === "accept"
          ? "accepted"
          : "rejected";

      donorNotification.actionedAt =
        now.toISOString();
    }

    // =========================
    // إشعار صاحب الطلب
    // =========================

    const requesterNotification = {
      recipientId:
        request.requesterId,

      senderId:
        request.donorUserId,

      requestId:
        request.id,

      donorId:
        request.donorId,

      kind:
        "donation_response",

      title:
        action === "accept"
          ? "تم قبول طلب التبرع"
          : "تم رفض طلب التبرع",

      body:
        action === "accept"
          ? `وافق ${request.donorName} على التبرع لك بفصيلة ${request.bloodType}`
          : `للأسف، رفض ${request.donorName} طلب التبرع`,

      type:
        action === "accept"
          ? "success"
          : "info",

      status:
        action === "accept"
          ? "accepted"
          : "rejected",

      hospital:
        request.hospital,

      hospitalId:
        request.hospitalId,

      lat:
        request.lat,

      lng:
        request.lng,

      address:
        request.address ||
        null,
    };

    addNotification(
      requesterNotification
    );

    saveStore();

    res.json({
      request,

      notification:
        requesterNotification,
    });
  }
);

// =========================
// Donation Progress
// =========================

router.post(
  "/donation-requests/:id/progress",
  (req, res) => {
    const {
      donorId,
      stage,
    } = req.body;

    const request =
      bloodRequests.find(
        (item) =>
          item.id ===
            req.params.id &&
          item.requestType ===
            "direct-donation"
      );

    if (!request) {
      return res.status(404).json({
        error:
          "طلب التبرع غير موجود",
      });
    }

    if (
      request.donorUserId !==
      donorId
    ) {
      return res.status(403).json({
        error:
          "غير مسموح لك بتحديث هذا الطلب",
      });
    }

    const now =
      getNow();

    let newStatus = "";
    let stageLabel = "";

    // =========================
    // المتبرع في الطريق
    // =========================

    if (
      stage === "on_way"
    ) {
      if (
        request.status !==
        "تم القبول"
      ) {
        return res.status(409).json({
          error:
            "يجب قبول الطلب أولاً",
        });
      }

      newStatus =
        "المتبرع في طريقه إلى المستشفى";

      stageLabel =
        "المتبرع في طريقه إلى المستشفى";
    }

    // =========================
    // تم الوصول
    // =========================

    if (
      stage === "arrived"
    ) {
      if (
        request.status !==
        "المتبرع في طريقه إلى المستشفى"
      ) {
        return res.status(409).json({
          error:
            "يجب أن يبدأ المتبرع التوجه للمستشفى أولاً",
        });
      }

      newStatus =
        "تم الوصول إلى المستشفى";

      stageLabel =
        "تم الوصول إلى المستشفى";
    }

    // =========================
    // تم التبرع
    // =========================

    if (
      stage === "completed"
    ) {
      if (
        request.status !==
        "تم الوصول إلى المستشفى"
      ) {
        return res.status(409).json({
          error:
            "يجب تسجيل الوصول إلى المستشفى أولاً",
        });
      }

      newStatus =
        "تم التبرع بنجاح";

      stageLabel =
        "تم التبرع بنجاح";
    }

    if (
      !newStatus ||
      !stageLabel
    ) {
      return res.status(400).json({
        error:
          "مرحلة التبرع غير صحيحة",
      });
    }

    request.status =
      newStatus;

    addTimeline(
      request,
      stageLabel,
      now
    );

    if (
      stage === "completed"
    ) {
      request.donationCompletedAt =
        now.toISOString();
    }

    // =========================
    // تحديث طلب المستخدم
    // =========================

    updateMyRequest(
      request
    );

    // =========================
    // إشعارات مراحل التبرع
    // =========================

    if (
      stage === "on_way"
    ) {
      addNotification({
        recipientId:
          request.requesterId,

        senderId:
          request.donorUserId,

        requestId:
          request.id,

        donorId:
          request.donorId,

        kind:
          "donor_on_way",

        title:
          "المتبرع في الطريق",

        body:
          `${request.donorName} بدأ التوجه إلى المستشفى للتبرع لك`,

        type:
          "info",

        status:
          "on_way",

        hospital:
          request.hospital,

        hospitalId:
          request.hospitalId,

        lat:
          request.lat,

        lng:
          request.lng,

        address:
          request.address ||
          null,
      });
    }

    if (
      stage === "arrived"
    ) {
      addNotification({
        recipientId:
          request.requesterId,

        senderId:
          request.donorUserId,

        requestId:
          request.id,

        donorId:
          request.donorId,

        kind:
          "donor_arrived",

        title:
          "وصل المتبرع للمستشفى",

        body:
          `${request.donorName} وصل إلى ${request.hospital}`,

        type:
          "info",

        status:
          "arrived",

        hospital:
          request.hospital,

        hospitalId:
          request.hospitalId,

        lat:
          request.lat,

        lng:
          request.lng,

        address:
          request.address ||
          null,
      });
    }

    // =========================
    // انتهاء التبرع
    // =========================

    if (
      stage === "completed"
    ) {
      const donor =
        findDonorByUserId(
          donorId
        );

      if (donor) {
        donor.available =
          true;

        donor.donationsCount =
          Number(
            donor.donationsCount || 0
          ) + 1;

        donor.lastDonation =
          getDate(now);
      }

      // الحالة النهائية للطلب
      request.status =
        "مكتمل";

      request.completedAt =
        now.toISOString();

      addTimeline(
        request,
        "تم إكمال طلب التبرع بنجاح",
        now
      );

      // تحديث طلب المستخدم مرة أخيرة
      updateMyRequest(
        request
      );

      // إشعار صاحب الطلب
      addNotification({
        recipientId:
          request.requesterId,

        senderId:
          request.donorUserId,

        requestId:
          request.id,

        donorId:
          request.donorId,

        kind:
          "donation_completed",

        title:
          "تم التبرع بنجاح",

        body:
          `تمت عملية التبرع بنجاح بواسطة ${request.donorName}`,

        type:
          "success",

        status:
          "completed",

        hospital:
          request.hospital,

        hospitalId:
          request.hospitalId,

        lat:
          request.lat,

        lng:
          request.lng,

        address:
          request.address ||
          null,
      });

      // إشعار للمتبرع أيضًا
      addNotification({
        recipientId:
          request.donorUserId,

        senderId:
          request.requesterId,

        requestId:
          request.id,

        donorId:
          request.donorId,

        kind:
          "donation_completed",

        title:
          "اكتمل التبرع",

        body:
          `تم تسجيل اكتمال عملية التبرع بنجاح في ${request.hospital}`,

        type:
          "success",

        status:
          "completed",

        hospital:
          request.hospital,

        hospitalId:
          request.hospitalId,

        lat:
          request.lat,

        lng:
          request.lng,

        address:
          request.address ||
          null,
      });
    }

    saveStore();

    res.json({
      request,
    });
  }
);

// =========================
// Donors
// =========================

// IMPORTANT:
// /donors/nearby MUST come before /donors/:id

router.get(
  "/donors/nearby",
  (req, res) => {
    const {
      bloodType,
      userId,
      lat,
      lng,
    } = req.query;

    let filtered =
      [...donors];

    // استبعاد المستخدم الحالي
    if (userId) {
      filtered =
        filtered.filter(
          (donor) =>
            donor.userId !==
            userId
        );
    }

    // استبعاد المتبرعين المشغولين
    filtered =
      filtered.filter(
        (donor) =>
          donor.available !== false
      );

    // فلترة فصيلة الدم
    if (bloodType) {
      filtered =
        filtered.filter(
          (donor) =>
            donor.bloodType ===
            bloodType
        );
    }

    // حساب المسافة
    if (
      lat !== undefined &&
      lng !== undefined
    ) {
      const userLat =
        Number(lat);

      const userLng =
        Number(lng);

      if (
        Number.isFinite(
          userLat
        ) &&
        Number.isFinite(
          userLng
        )
      ) {
        filtered =
          filtered.map(
            (donor) => {
              const donorLat =
                Number(
                  donor.lat
                );

              const donorLng =
                Number(
                  donor.lng
                );

              if (
                !Number.isFinite(
                  donorLat
                ) ||
                !Number.isFinite(
                  donorLng
                )
              ) {
                return {
                  ...donor,

                  distanceKm:
                    null,
                };
              }

              const distance =
                calculateDistance(
                  userLat,
                  userLng,
                  donorLat,
                  donorLng
                );

              return {
                ...donor,

                distanceKm:
                  Math.round(
                    distance * 10
                  ) / 10,
              };
            }
          );
      }
    }

    // ترتيب الأقرب
    filtered.sort(
      (a, b) => {
        const distanceA =
          Number.isFinite(
            Number(
              a.distanceKm
            )
          )
            ? Number(
                a.distanceKm
              )
            : Infinity;

        const distanceB =
          Number.isFinite(
            Number(
              b.distanceKm
            )
          )
            ? Number(
                b.distanceKm
              )
            : Infinity;

        return (
          distanceA -
          distanceB
        );
      }
    );

    res.json(
      filtered
    );
  }
);

// =========================
// GET one donor
// =========================

router.get(
  "/donors/:id",
  (req, res) => {
    const donor =
      findDonor(
        req.params.id
      );

    if (!donor) {
      return res.status(404).json({
        error:
          "Donor not found",
      });
    }

    res.json(
      donor
    );
  }
);

// =========================
// Old donor response
// =========================
//
// Legacy endpoint.
// موجود للتوافق مع الصفحة الحالية.
// لا يغير بيانات الطلبات الخاصة
// بالتبرع المباشر.

router.post(
  "/requests/:id/respond",
  (req, res) => {
    const request =
      bloodRequests.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!request) {
      return res.status(404).json({
        error:
          "Request not found",
      });
    }

    const now =
      getNow();

    addTimeline(
      request,
      "تم قبول الطلب من متبرع",
      now
    );

    request.status =
      "تم القبول";

    if (
      request.requesterId
    ) {
      updateMyRequest(
        request
      );
    }

    saveStore();

    res.json(
      request
    );
  }
);

// =========================
// Hospitals
// =========================

router.get(
  "/hospitals",
  (req, res) => {
    res.json(
      hospitals
    );
  }
);

// =========================
// Distance Calculator
// =========================

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const earthRadiusKm =
    6371;

  const dLat =
    toRadians(
      lat2 - lat1
    );

  const dLon =
    toRadians(
      lon2 - lon1
    );

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(
      toRadians(lat1)
    ) *
      Math.cos(
        toRadians(lat2)
      ) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return (
    earthRadiusKm * c
  );
}

function toRadians(
  degrees
) {
  return (
    (degrees * Math.PI) /
    180
  );
}

export default router;
