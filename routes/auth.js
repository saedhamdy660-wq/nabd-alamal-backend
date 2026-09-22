import express from "express";
import { OAuth2Client } from "google-auth-library";

import {
  users,
  donors,
  saveStore,
} from "../data/store.js";

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ============================================================
// Helpers
// ============================================================

function generateUserId() {
  let id;

  do {
    id =
      "u" +
      Date.now() +
      Math.floor(
        Math.random() * 10000
      );
  } while (
    users.some(
      (user) => user.id === id
    )
  );

  return id;
}

function generateDonorId() {
  let id;

  do {
    id =
      "d" +
      Date.now() +
      Math.floor(
        Math.random() * 10000
      );
  } while (
    donors.some(
      (donor) => donor.id === id
    )
  );

  return id;
}

// ============================================================
// Register
// ============================================================

router.post("/register", (req, res) => {
  const {
    name,
    email,
    phone,
    nationalId,
    password,
    accountType,
    bloodType,
    lastDonation,
    chronicDisease,
    lat,
    lng,
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error:
        "الاسم والبريد الإلكتروني وكلمة المرور مطلوبون",
    });
  }

  const cleanEmail =
    email.trim().toLowerCase();

  // منع تكرار البريد الإلكتروني
  if (
    users.find(
      (u) =>
        u.email.toLowerCase() ===
        cleanEmail
    )
  ) {
    return res.status(409).json({
      error:
        "يوجد حساب بهذا البريد الإلكتروني بالفعل",
    });
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  const newUser = {
    id: generateUserId(),

    name: name.trim(),

    email: cleanEmail,

    phone: phone || "",

    nationalId:
      nationalId || "",

    password,

    accountType:
      accountType || "user",

    bloodType:
      accountType === "donor"
        ? bloodType || ""
        : "",

    lastDonation:
      accountType === "donor"
        ? lastDonation || ""
        : "",

    chronicDisease:
      accountType === "donor"
        ? Boolean(chronicDisease)
        : false,

    lat: Number.isFinite(latitude)
      ? latitude
      : 30.0444,

    lng: Number.isFinite(longitude)
      ? longitude
      : 31.2357,

    locationEnabled:
      Number.isFinite(latitude) &&
      Number.isFinite(longitude),

    phoneVerified: false,

    identityVerified: false,

    verificationStatus:
      "pending",
  };

  users.push(newUser);

  // ==========================================================
  // إنشاء متبرع حقيقي لو الحساب متبرع
  // ==========================================================

  if (accountType === "donor") {
    donors.push({
      id: generateDonorId(),

      userId: newUser.id,

      name: newUser.name,

      bloodType:
        newUser.bloodType,

      distanceKm: 0,

      lat: newUser.lat,

      lng: newUser.lng,

      donationsCount: 0,

      lastDonation:
        newUser.lastDonation,

      verified: false,
    });
  }

  // حفظ المستخدم والمتبرع
  saveStore();

  // عدم إرسال كلمة المرور للـ Frontend
  const {
    password: _pw,
    ...safeUser
  } = newUser;

  res.status(201).json(
    safeUser
  );
});

// ============================================================
// Login
// ============================================================

router.post("/login", (req, res) => {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error:
        "البريد الإلكتروني وكلمة المرور مطلوبان",
    });
  }

  const cleanEmail =
    email.trim().toLowerCase();

  const found = users.find(
    (u) =>
      u.email.toLowerCase() ===
        cleanEmail &&
      u.password === password
  );

  if (!found) {
    return res.status(401).json({
      error:
        "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    });
  }

  const {
    password: _pw,
    ...safeUser
  } = found;

  res.json(
    safeUser
  );
});

// ============================================================
// Google Login
// ============================================================

router.post(
  "/google",
  async (req, res) => {
    try {
      const {
        credential,
      } = req.body;

      if (!credential) {
        return res.status(400).json({
          error:
            "لم يتم إرسال بيانات Google",
        });
      }

      if (!process.env.GOOGLE_CLIENT_ID) {
        console.error(
          "GOOGLE_CLIENT_ID is not configured"
        );

        return res.status(500).json({
          error:
            "إعدادات تسجيل الدخول بواسطة Google غير مكتملة",
        });
      }

      const ticket =
        await googleClient.verifyIdToken(
          {
            idToken: credential,

            audience:
              process.env.GOOGLE_CLIENT_ID,
          }
        );

      const payload =
        ticket.getPayload();

      if (!payload) {
        return res.status(401).json({
          error:
            "بيانات Google غير صالحة",
        });
      }

      const {
        sub: googleId,
        email,
        name,
        picture,
        email_verified,
      } = payload;

      if (
        !email ||
        !email_verified
      ) {
        return res.status(401).json({
          error:
            "لم يتم التحقق من البريد الإلكتروني بواسطة Google",
        });
      }

      const cleanEmail =
        email.trim().toLowerCase();

      let found = users.find(
        (u) =>
          u.email.toLowerCase() ===
          cleanEmail
      );

      // ========================================================
      // إنشاء مستخدم Google جديد
      // ========================================================

      if (!found) {
        const newUser = {
          id:
            generateUserId(),

          name:
            name ||
            cleanEmail.split(
              "@"
            )[0],

          email:
            cleanEmail,

          phone: "",

          nationalId: "",

          password: "",

          accountType:
            "user",

          bloodType: "",

          lastDonation: "",

          chronicDisease:
            false,

          lat: 30.0444,

          lng: 31.2357,

          locationEnabled:
            false,

          googleId,

          avatar:
            picture || "",

          phoneVerified:
            false,

          identityVerified:
            false,

          verificationStatus:
            "pending",
        };

        users.push(
          newUser
        );

        found =
          newUser;

        // حفظ مستخدم Google الجديد
        saveStore();
      }

      // ========================================================
      // تحديث بيانات Google للمستخدم الموجود
      // ========================================================

      else {
        let changed =
          false;

        if (
          !found.googleId
        ) {
          found.googleId =
            googleId;

          changed =
            true;
        }

        if (
          picture &&
          found.avatar !==
            picture
        ) {
          found.avatar =
            picture;

          changed =
            true;
        }

        if (changed) {
          saveStore();
        }
      }

      // عدم إرسال كلمة المرور
      const {
        password: _pw,
        ...safeUser
      } = found;

      res.json(
        safeUser
      );
    } catch (error) {
      console.error(
        "Google login error:",
        error
      );

      res.status(401).json({
        error:
          "فشل تسجيل الدخول بواسطة Google",
      });
    }
  }
);

export default router;
