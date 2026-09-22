import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, "db.json");

// ============================================================
// المستخدمون
// ============================================================
// لا يوجد أي مستخدم تجريبي.
// كل مستخدم جديد يتم إنشاؤه من خلال auth/register أو Google.

export const users = [];

// ============================================================
// المتبرعون
// ============================================================

export const donors = [];

// ============================================================
// طلبات الدم
// ============================================================
// لا يوجد أي طلب دم تجريبي.
// الطلبات الجديدة يتم إنشاؤها من خلال routes/blood.js
// وترتبط بصاحب الطلب عن طريق userId / requesterId.

export const bloodRequests = [];

// ============================================================
// الأدوية
// ============================================================

export const medicines = [
  // الأورام
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

  // الضغط والقلب
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

  // السكري
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

  // الجهاز الهضمي
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

  // البرد والحساسية
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

  // مسكنات
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

  // المضادات الحيوية
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

  // الأدوية الجلدية
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

  // الجهاز التنفسي
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

// ============================================================
// طلباتي
// ============================================================
// الطلبات هنا أصبحت بيانات حقيقية مرتبطة بالمستخدم.
// لا نضع أي طلبات تجريبية داخل النظام.

export const myRequests = [];

// ============================================================
// الإشعارات
// ============================================================
// لا توجد إشعارات تجريبية.
// كل Notification جديد يجب أن يحتوي على recipientId.

export const notifications = [];

// ============================================================
// الصيدليات
// ============================================================

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

// ============================================================
// المستشفيات
// ============================================================

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

// ============================================================
// الحفظ في db.json
// ============================================================

export function saveStore() {
  const data = {
    users,
    donors,
    bloodRequests,
    medicines,
    myRequests,
    notifications,
    pharmacies,
    hospitals,
  };

  try {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error(
      "Failed to save database:",
      error
    );
  }
}

// ============================================================
// تحميل البيانات من db.json
// ============================================================

export function loadStore() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveStore();
      return;
    }

    const rawData = fs.readFileSync(
      DB_FILE,
      "utf-8"
    );

    if (!rawData.trim()) {
      saveStore();
      return;
    }

    const data = JSON.parse(rawData);

    // ========================================================
    // المستخدمون
    // ========================================================
    // نحمل المستخدمين الحقيقيين فقط.
    // أي حساب تجريبي قديم باسم زوزو أو البريد القديم يتم تجاهله.

    if (Array.isArray(data.users)) {
      users.splice(
        0,
        users.length,
        ...data.users.filter(
          (item) =>
            item &&
            item.email !== "zizo@example.com" &&
            item.name !== "زوزو"
        )
      );
    }

    // ========================================================
    // المتبرعون
    // ========================================================

    if (Array.isArray(data.donors)) {
      donors.splice(
        0,
        donors.length,
        ...data.donors.filter(
          (item) => item && item.userId
        )
      );
    }

    // ========================================================
    // طلبات الدم
    // ========================================================
    // لا نحمل الطلبات القديمة التي ليس لها صاحب.
    // الطلب الحقيقي يجب أن يكون مرتبطًا بـ requesterId أو userId.

    if (Array.isArray(data.bloodRequests)) {
      bloodRequests.splice(
        0,
        bloodRequests.length,
        ...data.bloodRequests.filter(
          (item) =>
            item &&
            (item.requesterId || item.userId)
        )
      );
    }

    // ========================================================
    // الأدوية
    // ========================================================
    // الـ45 دواء يتم تحميلهم كما هم من db.json.
    // لا يتم حذف أي دواء.

    if (Array.isArray(data.medicines)) {
      medicines.splice(
        0,
        medicines.length,
        ...data.medicines
      );
    }

    // ========================================================
    // طلباتي
    // ========================================================
    // الطلب القديم الذي ليس له userId يتم تجاهله.

    if (Array.isArray(data.myRequests)) {
      myRequests.splice(
        0,
        myRequests.length,
        ...data.myRequests.filter(
          (item) =>
            item &&
            item.userId
        )
      );
    }

    // ========================================================
    // الإشعارات
    // ========================================================
    // الإشعار القديم الذي ليس له recipientId يتم تجاهله.

    if (Array.isArray(data.notifications)) {
      notifications.splice(
        0,
        notifications.length,
        ...data.notifications.filter(
          (item) =>
            item &&
            item.recipientId
        )
      );
    }

    // ========================================================
    // الصيدليات
    // ========================================================

    if (Array.isArray(data.pharmacies)) {
      pharmacies.splice(
        0,
        pharmacies.length,
        ...data.pharmacies
      );
    }

    // ========================================================
    // المستشفيات
    // ========================================================

    if (Array.isArray(data.hospitals)) {
      hospitals.splice(
        0,
        hospitals.length,
        ...data.hospitals
      );
    }

    // ========================================================
    // إعادة حفظ البيانات بعد تنظيف الـ demo القديم
    // ========================================================
    // بهذه الطريقة db.json نفسه يتم تنظيفه من البيانات
    // القديمة التي لا تخص مستخدمًا حقيقيًا.

    saveStore();

    console.log(
      "✅ Database loaded and cleaned from db.json"
    );
  } catch (error) {
    console.error(
      "Failed to load database:",
      error
    );

    console.log(
      "Using default data instead."
    );
  }
}

// ============================================================
// تحميل البيانات عند تشغيل السيرفر
// ============================================================

loadStore();
