import express from "express";
import { users } from "../data/store.js";

const router = express.Router();

// POST /api/auth/register — create a new account
router.post("/register", (req, res) => {
  const { name, email, password, bloodType } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبون" });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: "يوجد حساب بهذا البريد الإلكتروني بالفعل" });
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
  const found = users.find((u) => u.email === email && u.password === password);

  if (!found) {
    return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }

  const { password: _pw, ...safeUser } = found;
  res.json(safeUser);
});

export default router;
