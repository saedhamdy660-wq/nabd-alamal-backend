import express from "express";
import { OAuth2Client } from "google-auth-library";
import { users } from "../data/store.js";

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// POST /api/auth/register — create a new account
router.post("/register", (req, res) => {
  const { name, email, password, bloodType } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبون",
    });
  }

  if (users.find((u) => u.email === email)) {
    return res.status(409).json({
      error: "يوجد حساب بهذا البريد الإلكتروني بالفعل",
    });
  }

  const newUser = {
    id: "u" + (users.length + 1),
    name,
    email,
    password, // NOTE: demo only — hash this with bcrypt in a real app
    bloodType: bloodType || "",
    lat: 30.0444,
    lng: 31.2357,
  };

  users.push(newUser);

  const { password: _pw, ...safeUser } = newUser;

  res.status(201).json(safeUser);
});

// POST /api/auth/login — check email + password match
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const found = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!found) {
    return res.status(401).json({
      error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    });
  }

  const { password: _pw, ...safeUser } = found;

  res.json(safeUser);
});

// POST /api/auth/google — login with Google
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        error: "لم يتم إرسال بيانات Google",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is not configured");

      return res.status(500).json({
        error: "إعدادات تسجيل الدخول بواسطة Google غير مكتملة",
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
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
        error: "لم يتم التحقق من البريد الإلكتروني بواسطة Google",
      });
    }

    // Check if the user already exists
    let found = users.find((u) => u.email === email);

    // If the user doesn't exist, create a new account
    if (!found) {
      const newUser = {
        id: "u" + (users.length + 1),
        name: name || email.split("@")[0],
        email,
        password: "",
        bloodType: "",
        lat: 30.0444,
        lng: 31.2357,
        googleId,
        avatar: picture || "",
      };

      users.push(newUser);
      found = newUser;
    } else {
      // Save Google ID/avatar if this is an existing account
      found.googleId = found.googleId || googleId;

      if (picture) {
        found.avatar = picture;
      }
    }

    // Never send the password to the frontend
    const { password: _pw, ...safeUser } = found;

    res.json(safeUser);
  } catch (error) {
    console.error("Google login error:", error);

    res.status(401).json({
      error: "فشل تسجيل الدخول بواسطة Google",
    });
  }
});

export default router;
