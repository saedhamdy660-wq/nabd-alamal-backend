import express from "express";
import { OAuth2Client } from "google-auth-library";
import { users } from "../data/store.js";

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ============================================================
// POST /api/auth/register
// إنشاء حساب جديد
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
  } = req.body;

  // ----------------------------------------------------------
  // التحقق من البيانات الأساسية
  // ----------------------------------------------------------

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبون",
    });
  }

  // ----------------------------------------------------------
  // التأكد أن البريد غير مستخدم
  // ----------------------------------------------------------

  if (users.find((u) => u.email === email)) {
    return res.status(409).json({
      error: "يوجد حساب بهذا البريد الإلكتروني بالفعل",
    });
  }

  // ----------------------------------------------------------
  // إنشاء المستخدم
  // ----------------------------------------------------------

  const newUser = {
    id: "u" + (users.length + 1),

    name: name.trim(),
    email: email.trim(),

    phone: phone || "",
    nationalId: nationalId || "",

    password,

    accountType: accountType || "user",

    // بيانات المتبرع
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

    // الموقع الافتراضي حاليًا
    lat: 30.0444,
    lng: 31.2357,

    // بيانات التحقق
    phoneVerified: false,
    identityVerified: false,
    verificationStatus: "pending",
  };

  // ----------------------------------------------------------
  // إضافة المستخدم إلى قاعدة البيانات المؤقتة
  // ----------------------------------------------------------

  users.push(newUser);

  // ----------------------------------------------------------
  // عدم إرسال كلمة المرور للـ Frontend
  // ----------------------------------------------------------

  const {
    password: _pw,
    ...safeUser
  } = newUser;

  res.status(201).json(safeUser);
});

// ============================================================
// POST /api/auth/login
// تسجيل الدخول
// ============================================================

router.post("/login", (req, res) => {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "البريد الإلكتروني وكلمة المرور مطلوبان",
    });
  }

  const found = users.find(
    (u) =>
      u.email === email &&
      u.password === password
  );

  if (!found) {
    return res.status(401).json({
      error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    });
  }

  // ----------------------------------------------------------
  // عدم إرسال كلمة المرور
  // ----------------------------------------------------------

  const {
    password: _pw,
    ...safeUser
  } = found;

  res.json(safeUser);
});

// ============================================================
// POST /api/auth/google
// تسجيل الدخول بواسطة Google
// ============================================================

router.post("/google", async (req, res) => {
  try {
    const {
      credential,
    } = req.body;

    if (!credential) {
      return res.status(400).json({
        error: "لم يتم إرسال بيانات Google",
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

    // --------------------------------------------------------
    // التحقق من Google ID Token
    // --------------------------------------------------------

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        error: "بيانات Google غير صالحة",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified,
    } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        error:
          "لم يتم التحقق من البريد الإلكتروني بواسطة Google",
      });
    }

    // --------------------------------------------------------
    // البحث عن المستخدم
    // --------------------------------------------------------

    let found = users.find(
      (u) => u.email === email
    );

    // --------------------------------------------------------
    // إنشاء حساب جديد إذا لم يكن موجودًا
    // --------------------------------------------------------

    if (!found) {
      const newUser = {
        id:
          "u" +
          (users.length + 1),

        name:
          name ||
          email.split("@")[0],

        email,

        phone: "",
        nationalId: "",

        password: "",

        accountType: "user",

        bloodType: "",
        lastDonation: "",
        chronicDisease: false,

        lat: 30.0444,
        lng: 31.2357,

        googleId,
        avatar: picture || "",

        phoneVerified: false,
        identityVerified: false,
        verificationStatus: "pending",
      };

      users.push(newUser);

      found = newUser;
    } else {
      // ------------------------------------------------------
      // تحديث بيانات Google للحساب الموجود
      // ------------------------------------------------------

      found.googleId =
        found.googleId || googleId;

      if (picture) {
        found.avatar = picture;
      }
    }

    // --------------------------------------------------------
    // عدم إرسال كلمة المرور
    // --------------------------------------------------------

    const {
      password: _pw,
      ...safeUser
    } = found;

    res.json(safeUser);

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
});

export default router;
