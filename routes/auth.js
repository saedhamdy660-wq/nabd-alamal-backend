import express from "express";
import { OAuth2Client } from "google-auth-library";
import { users, donors } from "../data/store.js";

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// =========================
// Register
// =========================
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

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبون",
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  if (users.find((u) => u.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({
      error: "يوجد حساب بهذا البريد الإلكتروني بالفعل",
    });
  }

  const newUser = {
    id: "u" + (users.length + 1),
    name: name.trim(),
    email: cleanEmail,
    phone: phone || "",
    nationalId: nationalId || "",
    password,
    accountType: accountType || "user",

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

    lat: 30.0444,
    lng: 31.2357,

    phoneVerified: false,
    identityVerified: false,
    verificationStatus: "pending",
  };

  users.push(newUser);

  // =========================
  // Add user to donors list
  // =========================
  if (accountType === "donor") {
    donors.push({
      id: "d" + (donors.length + 1),
      userId: newUser.id,
      name: newUser.name,
      bloodType: newUser.bloodType,
      distanceKm: 0,
      lat: newUser.lat,
      lng: newUser.lng,
      donationsCount: 0,
      lastDonation: newUser.lastDonation,
      verified: false,
    });
  }

  const { password: _pw, ...safeUser } = newUser;

  res.status(201).json(safeUser);
});

// =========================
// Login
// =========================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "البريد الإلكتروني وكلمة المرور مطلوبان",
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  const found = users.find(
    (u) =>
      u.email.toLowerCase() === cleanEmail &&
      u.password === password
  );

  if (!found) {
    return res.status(401).json({
      error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    });
  }

  const { password: _pw, ...safeUser } = found;

  res.json(safeUser);
});

// =========================
// Google Login
// =========================
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

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

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

    const payload = ticket.getPayload();

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

    const cleanEmail = email.trim().toLowerCase();

    let found = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!found) {
      const newUser = {
        id: "u" + (users.length + 1),
        name:
          name ||
          cleanEmail.split("@")[0],
        email: cleanEmail,
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
      found.googleId =
        found.googleId || googleId;

      if (picture) {
        found.avatar = picture;
      }
    }

    const { password: _pw, ...safeUser } = found;

    res.json(safeUser);
  } catch (error) {
    console.error(
      "Google login error:",
      error
    );

    res.status(401).json({
      error: "فشل تسجيل الدخول بواسطة Google",
    });
  }
});

export default router;
