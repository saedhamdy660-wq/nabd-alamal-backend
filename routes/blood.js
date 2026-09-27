import express from "express";

import {
  bloodRequests,
  donors,
  hospitals,
  bloodCenters,
  bloodDonationAppointments,
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
// Find blood center by ID
// =========================

function findBloodCenter(centerId) {
  if (!centerId) {
    return null;
  }

  if (!Array.isArray(bloodCenters)) {
    return null;
  }

  return bloodCenters.find(
    (center) =>
      center.id === centerId
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

    type:
      request.requestType ===
      "blood-bank"
        ? "بنك دم"
        : "دم",

    title:
      request.requestType ===
      "blood-bank"
        ? `طلب دم من بنك الدم (${request.bloodType})`
        : `طلب تبرع بالدم (${request.bloodType})`,

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

    centerId:
      request.centerId ||
      null,

    centerName:
      request.centerName ||
      null,

    bloodComponent:
      request.bloodComponent ||
      null,

    units:
      request.units ||
      null,

    urgency:
      request.urgency ||
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

  myRequest.centerId =
    request.centerId ||
    myRequest.centerId ||
    null;

  myRequest.centerName =
    request.centerName ||
    myRequest.centerName ||
    null;

  myRequest.bloodComponent =
    request.bloodComponent ||
    myRequest.bloodComponent ||
    null;

  myRequest.units =
    request.units ??
    myRequest.units ??
    null;

  myRequest.urgency =
    request.urgency ||
    myRequest.urgency ||
    null;

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
          // الطلبات المباشرة لها
          // endpoint خاص بها
          if (
            request.requestType ===
            "direct-donation"
          ) {
            return false;
          }

          // طلبات بنك الدم لها
          // endpoint خاص بها
          if (
            request.requestType ===
            "blood-bank"
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

router.post(
  "/donation-requests",
  (req, res) => {
    const {
      requesterId,
      donorId,
      hospitalId,
    } = req.body;

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

    const requester =
      findUser(
        requesterId
      );

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

    if (
      donor.userId ===
      requester.id
    ) {
      return res.status(400).json({
        error:
          "لا يمكنك إرسال طلب لنفسك",
      });
    }

    if (
      donor.available === false
    ) {
      return res.status(409).json({
        error:
          "هذا المتبرع مرتبط حاليًا بطلب تبرع آخر",
      });
    }

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

    createMyRequest(
      newRequest
    );

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

      if (respondingDonor) {
        respondingDonor.available =
          false;
      }
    }

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

    updateMyRequest(
      request
    );

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

    updateMyRequest(
      request
    );

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

      request.status =
        "مكتمل";

      request.completedAt =
        now.toISOString();

      updateMyRequest(
        request
      );

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

    if (userId) {
      filtered =
        filtered.filter(
          (donor) =>
            donor.userId !==
            userId
        );
    }

    filtered =
      filtered.filter(
        (donor) =>
          donor.available !== false
      );

    if (bloodType) {
      filtered =
        filtered.filter(
          (donor) =>
            donor.bloodType ===
            bloodType
        );
    }

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

// ============================================================
// Blood Centers / Blood Banks
// ============================================================

// =========================
// GET nearby blood centers
// =========================

router.get(
  "/centers/nearby",
  (req, res) => {
    if (!Array.isArray(bloodCenters)) {
      return res.json([]);
    }

    const {
      lat,
      lng,
    } = req.query;

    let centers =
      [...bloodCenters];

    const userLat =
      Number(lat);

    const userLng =
      Number(lng);

    if (
      Number.isFinite(userLat) &&
      Number.isFinite(userLng)
    ) {
      centers =
        centers.map(
          (center) => {
            const centerLat =
              Number(
                center.lat
              );

            const centerLng =
              Number(
                center.lng
              );

            if (
              !Number.isFinite(
                centerLat
              ) ||
              !Number.isFinite(
                centerLng
              )
            ) {
              return {
                ...center,
                distanceKm:
                  null,
              };
            }

            const distance =
              calculateDistance(
                userLat,
                userLng,
                centerLat,
                centerLng
              );

            return {
              ...center,
              distanceKm:
                Math.round(
                  distance * 10
                ) / 10,
            };
          }
        );

      centers.sort(
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
    }

    res.json(
      centers
    );
  }
);

// =========================
// GET all blood centers
// =========================

router.get(
  "/centers",
  (req, res) => {
    if (!Array.isArray(bloodCenters)) {
      return res.json([]);
    }

    res.json(
      bloodCenters
    );
  }
);

// ============================================================
// Blood Donation Appointments
// ============================================================

// =========================
// Create appointment
// =========================

router.post(
  "/centers/:id/appointments",
  (req, res) => {
    const {
      userId,
      appointmentDate,
      appointmentTime,
      donationType,
    } = req.body;

    if (
      !userId ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return res.status(400).json({
        error:
          "userId, appointmentDate and appointmentTime are required",
      });
    }

    const user =
      findUser(userId);

    if (!user) {
      return res.status(404).json({
        error:
          "المستخدم غير موجود",
      });
    }

    const center =
      findBloodCenter(
        req.params.id
      );

    if (!center) {
      return res.status(404).json({
        error:
          "مركز الدم غير موجود",
      });
    }

    const normalizedDonationType =
      donationType ||
      "whole_blood";

    const allowedDonationTypes = [
      "whole_blood",
      "platelets",
      "plasma",
    ];

    if (
      !allowedDonationTypes.includes(
        normalizedDonationType
      )
    ) {
      return res.status(400).json({
        error:
          "نوع التبرع غير صحيح",
      });
    }

    const appointmentDateTime =
      new Date(
        `${appointmentDate}T${appointmentTime}`
      );

    if (
      Number.isNaN(
        appointmentDateTime.getTime()
      )
    ) {
      return res.status(400).json({
        error:
          "التاريخ أو الوقت غير صحيح",
      });
    }

    if (
      appointmentDateTime <=
      new Date()
    ) {
      return res.status(400).json({
        error:
          "لا يمكن حجز موعد في الماضي",
      });
    }

    const existingAppointment =
      bloodDonationAppointments.find(
        (appointment) =>
          appointment.centerId ===
            center.id &&
          appointment.appointmentDate ===
            appointmentDate &&
          appointment.appointmentTime ===
            appointmentTime &&
          appointment.status !==
            "cancelled"
      );

    if (existingAppointment) {
      return res.status(409).json({
        error:
          "هذا الموعد محجوز بالفعل، اختر موعدًا آخر",
      });
    }

    const userExistingAppointment =
      bloodDonationAppointments.find(
        (appointment) =>
          appointment.userId ===
            userId &&
          appointment.centerId ===
            center.id &&
          appointment.appointmentDate ===
            appointmentDate &&
          appointment.appointmentTime ===
            appointmentTime &&
          appointment.status !==
            "cancelled"
      );

    if (userExistingAppointment) {
      return res.status(409).json({
        error:
          "لديك حجز بالفعل في هذا الموعد",
        appointment:
          userExistingAppointment,
      });
    }

    const now =
      getNow();

    const appointment = {
      id:
        generateId("ba"),

      userId,

      userName:
        user.name ||
        user.fullName ||
        null,

      centerId:
        center.id,

      centerName:
        center.name,

      centerType:
        center.type ||
        null,

      governorate:
        center.governorate ||
        null,

      city:
        center.city ||
        null,

      address:
        center.address ||
        null,

      phone:
        center.phone ||
        null,

      appointmentDate,

      appointmentTime,

      donationType:
        normalizedDonationType,

      status:
        "pending",

      createdAt:
        now.toISOString(),

      updatedAt:
        now.toISOString(),
    };

    bloodDonationAppointments.push(
      appointment
    );

    addNotification({
      recipientId:
        userId,

      kind:
        "blood_center_appointment",

      title:
        "تم حجز موعد التبرع",

      body:
        `تم حجز موعدك في ${center.name} بتاريخ ${appointmentDate} الساعة ${appointmentTime}`,

      type:
        "success",

      status:
        "pending",

      appointmentId:
        appointment.id,

      centerId:
        center.id,

      centerName:
        center.name,

      appointmentDate,

      appointmentTime,

      donationType:
        normalizedDonationType,
    });

    saveStore();

    res.status(201).json({
      appointment,
    });
  }
);

// =========================
// Get user's appointments
// =========================

router.get(
  "/appointments",
  (req, res) => {
    const {
      userId,
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        error:
          "userId is required",
      });
    }

    const appointments =
      bloodDonationAppointments
        .filter(
          (appointment) =>
            appointment.userId ===
            userId
        )
        .sort(
          (a, b) => {
            const dateA =
              new Date(
                `${a.appointmentDate}T${a.appointmentTime}`
              ).getTime();

            const dateB =
              new Date(
                `${b.appointmentDate}T${b.appointmentTime}`
              ).getTime();

            return (
              dateB - dateA
            );
          }
        );

    res.json(
      appointments
    );
  }
);

// =========================
// Get one appointment
// =========================

router.get(
  "/appointments/:id",
  (req, res) => {
    const {
      userId,
    } = req.query;

    const appointment =
      bloodDonationAppointments.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!appointment) {
      return res.status(404).json({
        error:
          "الموعد غير موجود",
      });
    }

    if (
      userId &&
      appointment.userId !==
        userId
    ) {
      return res.status(403).json({
        error:
          "غير مسموح لك بعرض هذا الموعد",
      });
    }

    res.json(
      appointment
    );
  }
);

// =========================
// Cancel appointment
// =========================

router.post(
  "/appointments/:id/cancel",
  (req, res) => {
    const {
      userId,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        error:
          "userId is required",
      });
    }

    const appointment =
      bloodDonationAppointments.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!appointment) {
      return res.status(404).json({
        error:
          "الموعد غير موجود",
      });
    }

    if (
      appointment.userId !==
      userId
    ) {
      return res.status(403).json({
        error:
          "غير مسموح لك بإلغاء هذا الموعد",
      });
    }

    if (
      appointment.status ===
      "cancelled"
    ) {
      return res.status(409).json({
        error:
          "تم إلغاء هذا الموعد بالفعل",
      });
    }

    if (
      appointment.status ===
      "completed"
    ) {
      return res.status(409).json({
        error:
          "لا يمكن إلغاء موعد مكتمل",
      });
    }

    appointment.status =
      "cancelled";

    appointment.cancelledAt =
      new Date().toISOString();

    appointment.updatedAt =
      new Date().toISOString();

    addNotification({
      recipientId:
        userId,

      kind:
        "blood_center_appointment_cancelled",

      title:
        "تم إلغاء موعد التبرع",

      body:
        `تم إلغاء موعدك في ${appointment.centerName} بتاريخ ${appointment.appointmentDate} الساعة ${appointment.appointmentTime}`,

      type:
        "info",

      status:
        "cancelled",

      appointmentId:
        appointment.id,

      centerId:
        appointment.centerId,

      centerName:
        appointment.centerName,

      appointmentDate:
        appointment.appointmentDate,

      appointmentTime:
        appointment.appointmentTime,
    });

    saveStore();

    res.json({
      appointment,
    });
  }
);

// ============================================================
// Blood Bank Requests
// ============================================================
//
// ده نظام مختلف عن:
// 1. طلبات التبرع العامة
// 2. التبرع المباشر لمتبرع
//
// هنا المستخدم بيطلب دم من بنك دم/مركز دم.

// =========================
// Create Blood Bank Request
// =========================
//
// POST
// /blood/centers/:id/blood-requests
//
// Body:
//
// {
//   userId,
//   bloodType,
//   bloodComponent,
//   units,
//   urgency,
//   hospitalId
// }

router.post(
  "/centers/:id/blood-requests",
  (req, res) => {
    const {
      userId,
      bloodType,
      bloodComponent,
      units,
      urgency,
      hospitalId,
    } = req.body;

    if (
      !userId ||
      !bloodType ||
      !hospitalId
    ) {
      return res.status(400).json({
        error:
          "userId, bloodType and hospitalId are required",
      });
    }

    const user =
      findUser(userId);

    if (!user) {
      return res.status(404).json({
        error:
          "المستخدم غير موجود",
      });
    }

    const center =
      findBloodCenter(
        req.params.id
      );

    if (!center) {
      return res.status(404).json({
        error:
          "مركز الدم غير موجود",
      });
    }

    const hospital =
      findHospital(
        hospitalId
      );

    if (!hospital) {
      return res.status(404).json({
        error:
          "المستشفى المختارة غير موجودة",
      });
    }

    const allowedBloodComponents = [
      "whole_blood",
      "red_cells",
      "platelets",
      "plasma",
    ];

    const normalizedComponent =
      bloodComponent ||
      "whole_blood";

    if (
      !allowedBloodComponents.includes(
        normalizedComponent
      )
    ) {
      return res.status(400).json({
        error:
          "نوع مكون الدم غير صحيح",
      });
    }

    const normalizedUnits =
      Number(units);

    if (
      !Number.isInteger(
        normalizedUnits
      ) ||
      normalizedUnits < 1
    ) {
      return res.status(400).json({
        error:
          "عدد الوحدات يجب أن يكون رقمًا صحيحًا أكبر من صفر",
      });
    }

    const allowedUrgencies = [
      "عادية",
      "عاجلة",
      "طوارئ",
    ];

    const normalizedUrgency =
      urgency ||
      "عاجلة";

    if (
      !allowedUrgencies.includes(
        normalizedUrgency
      )
    ) {
      return res.status(400).json({
        error:
          "درجة الاستعجال غير صحيحة",
      });
    }

    // منع وجود طلب مفتوح لنفس المستخدم
    // لنفس المركز ونفس الفصيلة والمكون
    const existingRequest =
      bloodRequests.find(
        (request) =>
          request.requestType ===
            "blood-bank" &&
          request.requesterId ===
            userId &&
          request.centerId ===
            center.id &&
          request.bloodType ===
            bloodType &&
          request.bloodComponent ===
            normalizedComponent &&
          (
            request.status ===
              "قيد المراجعة" ||
            request.status ===
              "قيد التجهيز"
          )
      );

    if (existingRequest) {
      return res.status(409).json({
        error:
          "لديك بالفعل طلب مفتوح لنفس الفصيلة والمكون في هذا المركز",

        request:
          existingRequest,
      });
    }

    const now =
      getNow();

    const requestId =
      generateId("br");

    const newRequest = {
      id:
        requestId,

      requestType:
        "blood-bank",

      requesterId:
        userId,

      userId,

      requesterName:
        user.name ||
        user.fullName ||
        null,

      centerId:
        center.id,

      centerName:
        center.name,

      centerType:
        center.type ||
        null,

      bloodType,

      bloodComponent:
        normalizedComponent,

      units:
        normalizedUnits,

      urgency:
        normalizedUrgency,

      hospitalId:
        hospital.id,

      hospital:
        hospital.name ||
        hospital.title ||
        hospital.hospitalName ||
        "المستشفى المحدد",

      locationType:
        "hospital",

      lat:
        Number.isFinite(
          Number(hospital.lat)
        )
          ? Number(hospital.lat)
          : null,

      lng:
        Number.isFinite(
          Number(hospital.lng)
        )
          ? Number(hospital.lng)
          : null,

      address:
        hospital.address ||
        null,

      status:
        "قيد المراجعة",

      createdAt:
        now.toISOString(),

      updatedAt:
        now.toISOString(),

      timeline: [
        {
          label:
            "تم إرسال طلب الدم إلى بنك الدم",

          time:
            getTime(now),

          done: true,
        },
      ],
    };

    bloodRequests.push(
      newRequest
    );

    createMyRequest(
      newRequest
    );

    addNotification({
      recipientId:
        userId,

      kind:
        "blood_bank_request",

      title:
        "تم إرسال طلب الدم",

      body:
        `تم إرسال طلبك إلى ${center.name} لفصيلة ${bloodType} بعدد ${normalizedUnits} وحدة`,

      type:
        "success",

      status:
        "pending",

      requestId,

      centerId:
        center.id,

      centerName:
        center.name,

      bloodType,

      bloodComponent:
        normalizedComponent,

      units:
        normalizedUnits,

      urgency:
        normalizedUrgency,
    });

    saveStore();

    res.status(201).json({
      request:
        newRequest,
    });
  }
);

// =========================
// Get user's Blood Bank Requests
// =========================
//
// GET
// /blood/blood-bank-requests?userId=USER_ID

router.get(
  "/blood-bank-requests",
  (req, res) => {
    const {
      userId,
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        error:
          "userId is required",
      });
    }

    const requests =
      bloodRequests
        .filter(
          (request) =>
            request.requestType ===
              "blood-bank" &&
            request.requesterId ===
              userId
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );

    res.json(
      requests
    );
  }
);

// =========================
// Get Blood Bank Requests
// for specific center
// =========================
//
// GET
// /blood/centers/:id/blood-requests

router.get(
  "/centers/:id/blood-requests",
  (req, res) => {
    const center =
      findBloodCenter(
        req.params.id
      );

    if (!center) {
      return res.status(404).json({
        error:
          "مركز الدم غير موجود",
      });
    }

    const requests =
      bloodRequests
        .filter(
          (request) =>
            request.requestType ===
              "blood-bank" &&
            request.centerId ===
              center.id
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );

    res.json(
      requests
    );
  }
);

// =========================
// Get one Blood Bank Request
// =========================
//
// GET
// /blood/blood-bank-requests/:id?userId=USER_ID

router.get(
  "/blood-bank-requests/:id",
  (req, res) => {
    const {
      userId,
    } = req.query;

    const request =
      bloodRequests.find(
        (item) =>
          item.id ===
            req.params.id &&
          item.requestType ===
            "blood-bank"
      );

    if (!request) {
      return res.status(404).json({
        error:
          "طلب بنك الدم غير موجود",
      });
    }

    if (
      userId &&
      request.requesterId !==
        userId
    ) {
      return res.status(403).json({
        error:
          "غير مسموح لك بعرض هذا الطلب",
      });
    }

    res.json(
      request
    );
  }
);

// =========================
// Cancel Blood Bank Request
// =========================
//
// POST
// /blood/blood-bank-requests/:id/cancel
//
// Body:
// {
//   userId
// }

router.post(
  "/blood-bank-requests/:id/cancel",
  (req, res) => {
    const {
      userId,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        error:
          "userId is required",
      });
    }

    const request =
      bloodRequests.find(
        (item) =>
          item.id ===
            req.params.id &&
          item.requestType ===
            "blood-bank"
      );

    if (!request) {
      return res.status(404).json({
        error:
          "طلب بنك الدم غير موجود",
      });
    }

    if (
      request.requesterId !==
      userId
    ) {
      return res.status(403).json({
        error:
          "غير مسموح لك بإلغاء هذا الطلب",
      });
    }

    if (
      request.status ===
        "تم الإلغاء" ||
      request.status ===
        "مكتمل"
    ) {
      return res.status(409).json({
        error:
          "لا يمكن إلغاء هذا الطلب",
      });
    }

    const now =
      getNow();

    request.status =
      "تم الإلغاء";

    request.cancelledAt =
      now.toISOString();

    request.updatedAt =
      now.toISOString();

    addTimeline(
      request,
      "تم إلغاء طلب الدم",
      now
    );

    updateMyRequest(
      request
    );

    addNotification({
      recipientId:
        userId,

      kind:
        "blood_bank_request_cancelled",

      title:
        "تم إلغاء طلب الدم",

      body:
        `تم إلغاء طلب الدم المرسل إلى ${request.centerName}`,

      type:
        "info",

      status:
        "cancelled",

      requestId:
        request.id,

      centerId:
        request.centerId,

      centerName:
        request.centerName,
    });

    saveStore();

    res.json({
      request,
    });
  }
);

// =========================
// GET one Blood Center
// =========================

router.get(
  "/centers/:id",
  (req, res) => {
    if (!Array.isArray(bloodCenters)) {
      return res.status(404).json({
        error:
          "Blood center not found",
      });
    }

    const center =
      bloodCenters.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!center) {
      return res.status(404).json({
        error:
          "Blood center not found",
      });
    }

    res.json(
      center
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
