// In-memory data store (replace later with a real database like MongoDB/PostgreSQL)

export const user = {
  id: "u1",
  name: "زوزو",
  email: "zizo@example.com",
  bloodType: "O+",
  lat: 30.0444,
  lng: 31.2357,
};

// Demo-only user list for login/signup (passwords stored as plain text here for
// simplicity — a real app must hash passwords, e.g. with bcrypt, before storing them)
export const users = [
  { ...user, password: "123456" },
];

export const donors = [
  { id: "d1", name: "أحمد محمد", bloodType: "O+", distanceKm: 1.2, lat: 30.05, lng: 31.24, donationsCount: 12, lastDonation: "2026-06-10", verified: true },
  { id: "d2", name: "سارة علي", bloodType: "O+", distanceKm: 3.4, lat: 30.03, lng: 31.22, donationsCount: 5, lastDonation: "2026-08-02", verified: true },
  { id: "d3", name: "محمد خالد", bloodType: "O+", distanceKm: 4.7, lat: 30.06, lng: 31.20, donationsCount: 2, lastDonation: "2026-03-15", verified: false },
];

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
      { label: "تم إرسال التنبيه للمتبرعين", time: "12:30 م", done: true },
      { label: "تم قبول الطلب من متبرع", time: "12:45 م", done: true },
      { label: "المتبرع في طريقه إلى المستشفى", time: "1:10 م", done: true },
      { label: "تم الوصول إلى المستشفى", time: "1:25 م", done: false },
      { label: "تم التبرع بنجاح", time: "1:40 م", done: false },
    ],
  },
];

/*
  الأدوية
  ملاحظة: قيمة "category" لازم تطابق بالظبط أسماء الأقسام
  المستخدمة في صفحة "تبادل الأدوية" بالفرونت إند
  (الأورام، الضغط والقلب، السكري، الجهاز الهضمي،
   البرد والحساسية، مسكنات، المضادات الحيوية،
   الأدوية الجلدية، الجهاز التنفسي)
  عشان الدواء يظهر تحت القسم الصحيح.
*/

export const medicines = [
  {
    id: "m1",
    name: "أموكسيسيلين 500 مجم",
    category: "المضادات الحيوية",
    quantity: "3 علب",
    expiry: "2027-08-12",
    donor: "صيدلية الحياة",
    distanceKm: 1.5,
    pickupLocation: "صيدلية الحياة",
  },

  // ===== الأورام =====
  {
    id: "m4",
    name: "تاموكسيفين 20 مجم",
    category: "الأورام",
    quantity: "2 علبة",
    expiry: "2027-05-10",
    donor: "صيدلية الأمل",
    distanceKm: 2.1,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m5",
    name: "ليتروزول 2.5 مجم",
    category: "الأورام",
    quantity: "1 علبة",
    expiry: "2027-03-01",
    donor: "صيدلية الرحمة",
    distanceKm: 3.0,
    pickupLocation: "صيدلية الرحمة",
  },

  // ===== الضغط والقلب =====
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

  // ===== السكري =====
  {
    id: "m8",
    name: "ميتفورمين 500 مجم",
    category: "السكري",
    quantity: "4 علب",
    expiry: "2027-11-01",
    donor: "صيدلية الرحمة",
    distanceKm: 2.2,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m9",
    name: "جليكلازيد 80 مجم",
    category: "السكري",
    quantity: "2 علبة",
    expiry: "2027-04-18",
    donor: "صيدلية الحياة",
    distanceKm: 1.9,
    pickupLocation: "صيدلية الحياة",
  },

  // ===== الجهاز الهضمي =====
  {
    id: "m10",
    name: "أوميبرازول 20 مجم",
    category: "الجهاز الهضمي",
    quantity: "3 علب",
    expiry: "2027-06-30",
    donor: "صيدلية الأمل",
    distanceKm: 2.7,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m11",
    name: "دومبيريدون 10 مجم",
    category: "الجهاز الهضمي",
    quantity: "1 علبة",
    expiry: "2027-02-14",
    donor: "صيدلية الرحمة",
    distanceKm: 3.3,
    pickupLocation: "صيدلية الرحمة",
  },

  // ===== البرد والحساسية =====
  {
    id: "m12",
    name: "سيتيريزين 10 مجم",
    category: "البرد والحساسية",
    quantity: "2 علبة",
    expiry: "2027-01-25",
    donor: "صيدلية الحياة",
    distanceKm: 1.4,
    pickupLocation: "صيدلية الحياة",
  },
  {
    id: "m13",
    name: "بنادول كولد آند فلو",
    category: "البرد والحساسية",
    quantity: "5 علب",
    expiry: "2026-12-20",
    donor: "صيدلية الأمل",
    distanceKm: 2.0,
    pickupLocation: "صيدلية الأمل",
  },

  // ===== مسكنات =====
  {
    id: "m14",
    name: "باراسيتامول 500 مجم",
    category: "مسكنات",
    quantity: "6 علب",
    expiry: "2027-10-05",
    donor: "صيدلية الرحمة",
    distanceKm: 1.6,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m15",
    name: "إيبوبروفين 400 مجم",
    category: "مسكنات",
    quantity: "3 علب",
    expiry: "2027-08-08",
    donor: "صيدلية الحياة",
    distanceKm: 1.1,
    pickupLocation: "صيدلية الحياة",
  },

  // ===== المضادات الحيوية =====
  {
    id: "m16",
    name: "أزيثروميسين 250 مجم",
    category: "المضادات الحيوية",
    quantity: "2 علبة",
    expiry: "2027-05-27",
    donor: "صيدلية الأمل",
    distanceKm: 2.4,
    pickupLocation: "صيدلية الأمل",
  },

  // ===== الأدوية الجلدية =====
  {
    id: "m17",
    name: "كريم بيتاميثازون",
    category: "الأدوية الجلدية",
    quantity: "2 أنبوبة",
    expiry: "2027-03-19",
    donor: "صيدلية الرحمة",
    distanceKm: 2.9,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m18",
    name: "كريم فيوسيدين",
    category: "الأدوية الجلدية",
    quantity: "1 أنبوبة",
    expiry: "2027-09-02",
    donor: "صيدلية الحياة",
    distanceKm: 1.7,
    pickupLocation: "صيدلية الحياة",
  },

  // ===== الجهاز التنفسي =====
  {
    id: "m19",
    name: "بخاخ فنتولين (سالبوتامول)",
    category: "الجهاز التنفسي",
    quantity: "2 بخاخة",
    expiry: "2027-06-11",
    donor: "صيدلية الأمل",
    distanceKm: 2.3,
    pickupLocation: "صيدلية الأمل",
  },
  {
    id: "m20",
    name: "شراب بروميكسين",
    category: "الجهاز التنفسي",
    quantity: "3 عبوات",
    expiry: "2027-04-30",
    donor: "صيدلية الرحمة",
    distanceKm: 3.1,
    pickupLocation: "صيدلية الرحمة",
  },
];

export const myRequests = [
  { id: "r1", title: "أموكسيسيلين 500 مجم", type: "دواء", date: "2026-11-20", status: "تم التسليم" },
  { id: "r4", title: "طلب تبرع بالدم (O+)", type: "دم", date: "2026-11-10", status: "مكتمل" },
];

export const notifications = [
  { id: "n1", title: "تنبيه عاجل", body: "مطلوب فصيلة دم O+", time: "منذ 5 دقائق", type: "urgent" },
  { id: "n2", title: "تم قبول طلب التبرع", body: "تم قبول تبرعك من أحمد محمد", time: "منذ 30 دقيقة", type: "success" },
  { id: "n4", title: "تم تسليم الدواء", body: "تم تسليم طلبك بنجاح", time: "منذ 3 ساعات", type: "success" },
];

export const pharmacies = [
  { id: "p1", name: "صيدلية الحياة", distanceKm: 1.5, rating: 4.8, reviews: 124, lat: 30.048, lng: 31.238 },
];

export const hospitals = [
  { id: "h1", name: "مستشفى النور التخصصي", distanceKm: 2.3, lat: 30.045, lng: 31.236 },
  { id: "h2", name: "مستشفى السلام", distanceKm: 4.1, lat: 30.03, lng: 31.21 },
  { id: "h3", name: "مستشفى المدينة", distanceKm: 6.7, lat: 30.06, lng: 31.30 },
];
