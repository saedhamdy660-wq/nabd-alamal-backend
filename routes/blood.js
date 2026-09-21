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
      error:
        "bloodType and hospital are required",
    });
  }

  const newRequest = {
    id: "b" + (bloodRequests.length + 1),

    bloodType,

    urgency:
      urgency || "عاجلة",

    hospital,

    distanceKm: 0,

    lat: lat || 0,

    lng: lng || 0,

    status: "قيد التنفيذ",

    timeline: [
      {
        label:
          "تم إرسال التنبيه للمتبرعين",

        time:
          new Date().toLocaleTimeString(
            "ar-EG"
          ),

        done: true,
      },
    ],
  };

  bloodRequests.push(newRequest);

  saveStore();

  res.status(201).json(newRequest);
});

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
    } = req.body;

    if (!requesterId || !donorId) {
      return res.status(400).json({
        error:
          "requesterId and donorId are required",
      });
    }

    const requester = users.find(
      (user) =>
        user.id === requesterId
    );

    const donor = donors.find(
      (item) =>
        item.id === donorId
    );

    if (!requester) {
      return res.status(404).json({
        error: "المستخدم غير موجود",
      });
    }

    if (!donor) {
      return res.status(404).json({
        error: "المتبرع غير موجود",
      });
    }

    if (
      donor.userId === requester.id
    ) {
      return res.status(400).json({
        error:
          "لا يمكنك إرسال طلب لنفسك",
      });
    }

    // منع إرسال طلب لمتبرع مشغول حاليًا
    if (donor.available === false) {
      return res.status(409).json({
        error:
          "هذا المتبرع مرتبط حاليًا بطلب تبرع آخر",
      });
    }

    // منع تكرار نفس الطلب أثناء الانتظار
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

    const requestId =
      "dr" + Date.now();

    const now =
      new Date();

    const newRequest = {
      id: requestId,

      requestType:
        "direct-donation",

      requesterId:
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

      timeline: [
        {
          label:
            "تم إرسال التنبيه للمتبرعين",

          time:
            now.toLocaleTimeString(
              "ar-EG"
            ),

          done: true,
        },
      ],
    };

    bloodRequests.push(
      newRequest
    );

    // تسجيل الطلب في طلبات المستخدم
    myRequests.push({
      id: requestId,

      title:
        `طلب تبرع بالدم (${donor.bloodType})`,

      type: "دم",

      date:
        now
          .toISOString()
          .slice(0, 10),

      status:
        "قيد الانتظار",
    });

    // =========================
    // إشعار للمتبرع
    // =========================

    const notification = {
      id:
        "n" + Date.now(),

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

      time:
        "الآن",

      type:
        "urgent",

      status:
        "pending",
    };

    notifications.unshift(
      notification
    );

    saveStore();

    res.status(201).json({
      request:
        newRequest,

      notification,
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
      donorUserId || donorId;

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
      new Date();

    const respondingDonor =
      donors.find(
        (donor) =>
          donor.userId ===
          respondingDonorUserId
      );

    if (
      action === "accept"
    ) {
      request.status =
        "تم القبول";

      request.timeline.push({
        label:
          "تم قبول الطلب من المتبرع",

        time:
          now.toLocaleTimeString(
            "ar-EG"
          ),

        done: true,
      });

      // المتبرع أصبح مشغولًا
      if (respondingDonor) {
        respondingDonor.available =
          false;
      }
    } else {
      request.status =
        "تم الرفض";

      request.timeline.push({
        label:
          "تم رفض الطلب من المتبرع",

        time:
          now.toLocaleTimeString(
            "ar-EG"
          ),

        done: true,
      });

      // المتبرع يظل متاحًا
      if (respondingDonor) {
        respondingDonor.available =
          true;
      }
    }

    // تحديث طلب المستخدم
    const myRequest =
      myRequests.find(
        (item) =>
          item.id ===
          request.id
      );

    if (myRequest) {
      myRequest.status =
        action === "accept"
          ? "تم القبول"
          : "تم الرفض";
    }

    // تحديث إشعار المتبرع
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

    // إشعار صاحب الطلب
    const requesterNotification = {
      id:
        "n" + Date.now(),

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

      time:
        "الآن",

      type:
        action === "accept"
          ? "success"
          : "info",

      status:
        action === "accept"
          ? "accepted"
          : "rejected",
    };

    notifications.unshift(
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
      new Date();

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

    request.timeline.push({
      label:
        stageLabel,

      time:
        now.toLocaleTimeString(
          "ar-EG"
        ),

      done: true,
    });

    // تحديث طلب المستخدم
    const myRequest =
      myRequests.find(
        (item) =>
          item.id ===
          request.id
      );

    if (myRequest) {
      myRequest.status =
        stage === "completed"
          ? "مكتمل"
          : newStatus;
    }

    // =========================
    // عند انتهاء التبرع
    // =========================

    if (
      stage === "completed"
    ) {
      const donor =
        donors.find(
          (item) =>
            item.userId ===
            donorId
        );

      if (donor) {
        donor.available =
          true;
      }

      notifications.unshift({
        id:
          "n" + Date.now(),

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

        time:
          "الآن",

        type:
          "success",

        status:
          "completed",
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

    // Exclude current user
    if (userId) {
      filtered =
        filtered.filter(
          (donor) =>
            donor.userId !==
            userId
        );
    }

    // Exclude donors who are currently busy
    filtered =
      filtered.filter(
        (donor) =>
          donor.available !== false
      );

    // Filter by blood type
    if (bloodType) {
      filtered =
        filtered.filter(
          (donor) =>
            donor.bloodType ===
            bloodType
        );
    }

    // Calculate distance
    if (lat && lng) {
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

    // Sort nearest first
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

    res.json(filtered);
  }
);

// =========================
// GET one donor
// =========================

router.get(
  "/donors/:id",
  (req, res) => {
    const donor =
      donors.find(
        (d) =>
          d.id ===
          req.params.id
      );

    if (!donor) {
      return res.status(404).json({
        error:
          "Donor not found",
      });
    }

    res.json(donor);
  }
);

// =========================
// Old donor response
// =========================

router.post(
  "/requests/:id/respond",
  (req, res) => {
    const request =
      bloodRequests.find(
        (r) =>
          r.id ===
          req.params.id
      );

    if (!request) {
      return res.status(404).json({
        error:
          "Request not found",
      });
    }

    request.timeline.push({
      label:
        "تم قبول الطلب من متبرع",

      time:
        new Date().toLocaleTimeString(
          "ar-EG"
        ),

      done: true,
    });

    saveStore();

    res.json(request);
  }
);

// =========================
// Nearby hospitals
// =========================

router.get(
  "/hospitals",
  (req, res) => {
    res.json(hospitals);
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
