import express from "express";
import { users, myRequests } from "../data/store.js";

const router = express.Router();

// ============================================================
// GET /api/users/me
// جلب بيانات المستخدم الحالي
//
// حاليًا بنستخدم email من الـ query:
// /api/users/me?email=ahmed@gmail.com
//
// لاحقًا لما نعمل JWT Authentication هنستبدل الطريقة دي
// بالتوكن.
// ============================================================

router.get("/me", (req, res) => {
  const { email } = req.query;

  // لو مفيش email، نرجع المستخدم التجريبي القديم
  // عشان نحافظ على أي صفحات قديمة في التطبيق.
  if (!email) {
    return res.json({
      ...users[0],
      password: undefined,
    });
  }

  // البحث عن المستخدم بالإيميل
  const found = users.find(
    (u) => u.email === email
  );

  if (!found) {
    return res.status(404).json({
      error: "المستخدم غير موجود",
    });
  }

  // ممنوع إرسال كلمة المرور للـ Frontend
  const {
    password: _pw,
    ...safeUser
  } = found;

  res.json(safeUser);
});

// ============================================================
// GET /api/users/:id
// جلب مستخدم معين عن طريق ID
// ============================================================

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const found = users.find(
    (u) => u.id === id
  );

  if (!found) {
    return res.status(404).json({
      error: "المستخدم غير موجود",
    });
  }

  const {
    password: _pw,
    ...safeUser
  } = found;

  res.json(safeUser);
});

// ============================================================
// GET /api/users/me/requests
// طلبات المستخدم
// ============================================================

router.get("/me/requests", (req, res) => {
  res.json(myRequests);
});

export default router;
