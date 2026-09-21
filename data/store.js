// In-memory data store (replace later with a real database like MongoDB/PostgreSQL)

export const user = {
  id: "u1",
  name: "زوزو",
  email: "zizo@example.com",
  bloodType: "O+",
  lat: 30.0444,
  lng: 31.2357,
};

// Demo-only user list for login/signup
// ملاحظة: في التطبيق الحقيقي يجب تخزين كلمات المرور بشكل مشفر
export const users = [
  { ...user, password: "123456" },
];

// ============================================================
// المتبرعون
// ============================================================
// لا يوجد متبرعون تجريبيون هنا.
// أي مستخدم يسجل Account Type = donor
// سيتم إضافته تلقائيًا من routes/auth.js
// وسيظهر في قائمة المتبرعين القريبين.
// ============================================================

export const donors = [];

export const bloodRequests = [
  {
    id: "b1",
    bloodType: "O+",
    urgency: "عاجلة",
    hospital: "مستشفى النور التخصصي",
    distanceKm: 2.3,
    lat: 30.045,
    lng: 31.236,
    status: "قيد التنفيذ",
    timeline: [
      {
        label: "تم إرسال التنبيه للمتبرعين",
        time: "12:30 م",
        done: true,
      },
      {
        label: "تم قبول الطلب من متبرع",
        time: "12:45 م",
        done: true,
      },
      {
        label: "المتبرع في طريقه إلى المستشفى",
        time: "1:10 م",
        done: true,
      },
      {
        label: "تم الوصول إلى المستشفى",
        time: "1:25 م",
        done: false,
      },
      {
        label: "تم التبرع بنجاح",
        time: "1:40 م",
        done: false,
      },
    ],
  },
];

/*
  ============================================================
  الأدوية
  ============================================================

  9 أقسام × 5 أدوية = 45 دواء

  الأقسام:
  1. الأورام
  2. الضغط والقلب
  3. السكري
  4. الجهاز الهضمي
  5. البرد والحساسية
  6. مسكنات
  7. المضادات الحيوية
  8. الأدوية الجلدية
  9. الجهاز التنفسي

  تم حذف:
  - الإنسولين
  - فيتامين D

  مهم:
  قيمة category لازم تطابق أسماء الأقسام الموجودة
  في الفرونت إند بالضبط.
*/

export const medicines = [
  // ============================================================
  // الأورام - 5 أدوية
  // ============================================================

  {
    id: "m1",
    name: "تاموكسيفين 20 مجم",
    category: "الأورام",
    quantity: "2 علبة",
    expiry: "2027-05-10",
    donor: "صيدلية الأمل",
    distanceKm: 2.1,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m2",
    name: "ليتروزول 2.5 مجم",
    category: "الأورام",
    quantity: "1 علبة",
    expiry: "2027-03-01",
    donor: "صيدلية الرحمة",
    distanceKm: 3.0,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m3",
    name: "أناستروزول 1 مجم",
    category: "الأورام",
    quantity: "2 علبة",
    expiry: "2027-07-15",
    donor: "صيدلية الحياة",
    distanceKm: 1.8,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m4",
    name: "إيماتينيب 400 مجم",
    category: "الأورام",
    quantity: "1 علبة",
    expiry: "2027-09-20",
    donor: "صيدلية الأمل",
    distanceKm: 2.6,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m5",
    name: "كابسيتابين 500 مجم",
    category: "الأورام",
    quantity: "2 علبة",
    expiry: "2027-04-12",
    donor: "صيدلية الرحمة",
    distanceKm: 3.2,
    pickupLocation: "صيدلية الرحمة",
  },

  // ============================================================
  // الضغط والقلب - 5 أدوية
  // ============================================================

  {
    id: "m6",
    name: "أملوديبين 5 مجم",
    category: "الضغط والقلب",
    quantity: "3 علب",
    expiry: "2027-09-15",
    donor: "صيدلية الحياة",
    distanceKm: 1.8,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m7",
    name: "أتورفاستاتين 20 مجم",
    category: "الضغط والقلب",
    quantity: "2 علبة",
    expiry: "2027-07-20",
    donor: "صيدلية الأمل",
    distanceKm: 2.5,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m8",
    name: "بيسوبرولول 5 مجم",
    category: "الضغط والقلب",
    quantity: "2 علبة",
    expiry: "2027-06-18",
    donor: "صيدلية الرحمة",
    distanceKm: 2.9,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m9",
    name: "لوسارتان 50 مجم",
    category: "الضغط والقلب",
    quantity: "3 علب",
    expiry: "2027-10-11",
    donor: "صيدلية الحياة",
    distanceKm: 1.4,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m10",
    name: "أسبرين 100 مجم",
    category: "الضغط والقلب",
    quantity: "4 علب",
    expiry: "2027-08-25",
    donor: "صيدلية الأمل",
    distanceKm: 2.3,
    pickupLocation: "صيدلية الأمل",
  },

  // ============================================================
  // السكري - 5 أدوية
  // ============================================================

  {
    id: "m11",
    name: "ميتفورمين 500 مجم",
    category: "السكري",
    quantity: "4 علب",
    expiry: "2027-11-01",
    donor: "صيدلية الرحمة",
    distanceKm: 2.2,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m12",
    name: "جليكلازيد 80 مجم",
    category: "السكري",
    quantity: "2 علبة",
    expiry: "2027-04-18",
    donor: "صيدلية الحياة",
    distanceKm: 1.9,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m13",
    name: "جليمبيريد 2 مجم",
    category: "السكري",
    quantity: "2 علبة",
    expiry: "2027-08-09",
    donor: "صيدلية الأمل",
    distanceKm: 2.7,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m14",
    name: "سيتاجليبتين 100 مجم",
    category: "السكري",
    quantity: "1 علبة",
    expiry: "2027-05-22",
    donor: "صيدلية الرحمة",
    distanceKm: 3.1,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m15",
    name: "داباجليفلوزين 10 مجم",
    category: "السكري",
    quantity: "2 علبة",
    expiry: "2027-12-03",
    donor: "صيدلية الحياة",
    distanceKm: 1.6,
    pickupLocation: "صيدلية الحياة",
  },

  // ============================================================
  // الجهاز الهضمي - 5 أدوية
  // ============================================================

  {
    id: "m16",
    name: "أوميبرازول 20 مجم",
    category: "الجهاز الهضمي",
    quantity: "3 علب",
    expiry: "2027-06-30",
    donor: "صيدلية الأمل",
    distanceKm: 2.7,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m17",
    name: "دومبيريدون 10 مجم",
    category: "الجهاز الهضمي",
    quantity: "1 علبة",
    expiry: "2027-02-14",
    donor: "صيدلية الرحمة",
    distanceKm: 3.3,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m18",
    name: "بانتوبرازول 40 مجم",
    category: "الجهاز الهضمي",
    quantity: "2 علبة",
    expiry: "2027-09-06",
    donor: "صيدلية الحياة",
    distanceKm: 1.5,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m19",
    name: "موتيليوم 10 مجم",
    category: "الجهاز الهضمي",
    quantity: "2 علبة",
    expiry: "2027-05-14",
    donor: "صيدلية الأمل",
    distanceKm: 2.8,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m20",
    name: "فاموتيدين 20 مجم",
    category: "الجهاز الهضمي",
    quantity: "3 علب",
    expiry: "2027-10-19",
    donor: "صيدلية الرحمة",
    distanceKm: 3.4,
    pickupLocation: "صيدلية الرحمة",
  },

  // ============================================================
  // البرد والحساسية - 5 أدوية
  // ============================================================

  {
    id: "m21",
    name: "سيتيريزين 10 مجم",
    category: "البرد والحساسية",
    quantity: "2 علبة",
    expiry: "2027-01-25",
    donor: "صيدلية الحياة",
    distanceKm: 1.4,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m22",
    name: "بنادول كولد آند فلو",
    category: "البرد والحساسية",
    quantity: "5 علب",
    expiry: "2026-12-20",
    donor: "صيدلية الأمل",
    distanceKm: 2.0,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m23",
    name: "لوراتادين 10 مجم",
    category: "البرد والحساسية",
    quantity: "2 علبة",
    expiry: "2027-07-11",
    donor: "صيدلية الرحمة",
    distanceKm: 2.6,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m24",
    name: "كلورفينيرامين 4 مجم",
    category: "البرد والحساسية",
    quantity: "3 علب",
    expiry: "2027-03-28",
    donor: "صيدلية الحياة",
    distanceKm: 1.9,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m25",
    name: "أقراص استحلاب للحلق",
    category: "البرد والحساسية",
    quantity: "4 علب",
    expiry: "2027-08-17",
    donor: "صيدلية الأمل",
    distanceKm: 2.4,
    pickupLocation: "صيدلية الأمل",
  },

  // ============================================================
  // مسكنات - 5 أدوية
  // ============================================================

  {
    id: "m26",
    name: "باراسيتامول 500 مجم",
    category: "مسكنات",
    quantity: "6 علب",
    expiry: "2027-10-05",
    donor: "صيدلية الرحمة",
    distanceKm: 1.6,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m27",
    name: "إيبوبروفين 400 مجم",
    category: "مسكنات",
    quantity: "3 علب",
    expiry: "2027-08-08",
    donor: "صيدلية الحياة",
    distanceKm: 1.1,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m28",
    name: "ديكلوفيناك 50 مجم",
    category: "مسكنات",
    quantity: "2 علبة",
    expiry: "2027-06-21",
    donor: "صيدلية الأمل",
    distanceKm: 2.2,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m29",
    name: "نابروكسين 250 مجم",
    category: "مسكنات",
    quantity: "2 علبة",
    expiry: "2027-09-13",
    donor: "صيدلية الرحمة",
    distanceKm: 3.0,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m30",
    name: "كيتوبروفين 100 مجم",
    category: "مسكنات",
    quantity: "1 علبة",
    expiry: "2027-04-09",
    donor: "صيدلية الحياة",
    distanceKm: 1.8,
    pickupLocation: "صيدلية الحياة",
  },

  // ============================================================
  // المضادات الحيوية - 5 أدوية
  // ============================================================

  {
    id: "m31",
    name: "أموكسيسيلين 500 مجم",
    category: "المضادات الحيوية",
    quantity: "3 علب",
    expiry: "2027-08-12",
    donor: "صيدلية الحياة",
    distanceKm: 1.5,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m32",
    name: "أزيثروميسين 250 مجم",
    category: "المضادات الحيوية",
    quantity: "2 علبة",
    expiry: "2027-05-27",
    donor: "صيدلية الأمل",
    distanceKm: 2.4,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m33",
    name: "أموكسيسيلين/كلافولانات 625 مجم",
    category: "المضادات الحيوية",
    quantity: "2 علبة",
    expiry: "2027-07-04",
    donor: "صيدلية الرحمة",
    distanceKm: 3.2,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m34",
    name: "سيفيكسيم 400 مجم",
    category: "المضادات الحيوية",
    quantity: "1 علبة",
    expiry: "2027-10-16",
    donor: "صيدلية الحياة",
    distanceKm: 1.7,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m35",
    name: "كلاريثروميسين 500 مجم",
    category: "المضادات الحيوية",
    quantity: "2 علبة",
    expiry: "2027-03-23",
    donor: "صيدلية الأمل",
    distanceKm: 2.9,
    pickupLocation: "صيدلية الأمل",
  },

  // ============================================================
  // الأدوية الجلدية - 5 أدوية
  // ============================================================

  {
    id: "m36",
    name: "كريم بيتاميثازون",
    category: "الأدوية الجلدية",
    quantity: "2 أنبوبة",
    expiry: "2027-03-19",
    donor: "صيدلية الرحمة",
    distanceKm: 2.9,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m37",
    name: "كريم فيوسيدين",
    category: "الأدوية الجلدية",
    quantity: "1 أنبوبة",
    expiry: "2027-09-02",
    donor: "صيدلية الحياة",
    distanceKm: 1.7,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m38",
    name: "كريم هيدروكورتيزون",
    category: "الأدوية الجلدية",
    quantity: "2 أنبوبة",
    expiry: "2027-06-12",
    donor: "صيدلية الأمل",
    distanceKm: 2.3,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m39",
    name: "كريم كلوتريمازول",
    category: "الأدوية الجلدية",
    quantity: "3 أنابيب",
    expiry: "2027-08-29",
    donor: "صيدلية الرحمة",
    distanceKm: 3.1,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m40",
    name: "كريم ميكونازول",
    category: "الأدوية الجلدية",
    quantity: "2 أنبوبة",
    expiry: "2027-11-07",
    donor: "صيدلية الحياة",
    distanceKm: 1.3,
    pickupLocation: "صيدلية الحياة",
  },

  // ============================================================
  // الجهاز التنفسي - 5 أدوية
  // ============================================================

  {
    id: "m41",
    name: "بخاخ فنتولين (سالبوتامول)",
    category: "الجهاز التنفسي",
    quantity: "2 بخاخة",
    expiry: "2027-06-11",
    donor: "صيدلية الأمل",
    distanceKm: 2.3,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m42",
    name: "شراب بروميكسين",
    category: "الجهاز التنفسي",
    quantity: "3 عبوات",
    expiry: "2027-04-30",
    donor: "صيدلية الرحمة",
    distanceKm: 3.1,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m43",
    name: "أمبروكسول 30 مجم",
    category: "الجهاز التنفسي",
    quantity: "2 علبة",
    expiry: "2027-09-18",
    donor: "صيدلية الحياة",
    distanceKm: 1.9,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m44",
    name: "بوديزونيد للاستنشاق",
    category: "الجهاز التنفسي",
    quantity: "1 عبوة",
    expiry: "2027-05-31",
    donor: "صيدلية الأمل",
    distanceKm: 2.7,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m45",
    name: "مونتيلوكاست 10 مجم",
    category: "الجهاز التنفسي",
    quantity: "2 علبة",
    expiry: "2027-12-15",
    donor: "صيدلية الرحمة",
    distanceKm: 3.5,
    pickupLocation: "صيدلية الرحمة",
  },
];

export const myRequests = [
  {
    id: "r1",
    title: "أموكسيسيلين 500 مجم",
    type: "دواء",
    date: "2026-11-20",
    status: "تم التسليم",
  },
  {
    id: "r4",
    title: "طلب تبرع بالدم (O+)",
    type: "دم",
    date: "2026-11-10",
    status: "مكتمل",
  },
];

export const notifications = [
  {
    id: "n1",
    title: "تنبيه عاجل",
    body: "مطلوب فصيلة دم O+",
    time: "منذ 5 دقائق",
    type: "urgent",
  },
  {
    id: "n2",
    title: "تم قبول طلب التبرع",
    body: "تم قبول تبرعك من أحمد محمد",
    time: "منذ 30 دقيقة",
    type: "success",
  },
  {
    id: "n4",
    title: "تم تسليم الدواء",
    body: "تم تسليم طلبك بنجاح",
    time: "منذ 3 ساعات",
    type: "success",
  },
];

export const pharmacies = [
  {
    id: "p1",
    name: "صيدلية الحياة",
    distanceKm: 1.5,
    rating: 4.8,
    reviews: 124,
    lat: 30.048,
    lng: 31.238,
  },
];

export const hospitals = [
  {
    id: "h1",
    name: "مستشفى النور التخصصي",
    distanceKm: 2.3,
    lat: 30.045,
    lng: 31.236,
  },
  {
    id: "h2",
    name: "مستشفى السلام",
    distanceKm: 4.1,
    lat: 30.03,
    lng: 31.21,
  },
  {
    id: "h3",
    name: "مستشفى المدينة",
    distanceKm: 6.7,
    lat: 30.06,
    lng: 31.3,
  },
];
