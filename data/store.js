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
  {
    id: "m2",
    name: "إنسولين",
    category: "أدوية مزمنة",
    quantity: "متوفر",
    expiry: "2027-02-01",
    donor: "صيدلية الرحمة",
    distanceKm: 2.8,
    pickupLocation: "صيدلية الرحمة",
  },
  {
    id: "m3",
    name: "فيتامين D",
    category: "فيتامينات",
    quantity: "متوفر",
    expiry: "2026-12-01",
    donor: "صيدلية الأمل",
    distanceKm: 3.2,
    pickupLocation: "صيدلية الأمل",
  },
];

export const myRequests = [
  { id: "r1", title: "أموكسيسيلين 500 مجم", type: "دواء", date: "2026-11-20", status: "تم التسليم" },
  { id: "r2", title: "إنسولين", type: "دواء", date: "2026-11-18", status: "قيد المراجعة" },
  { id: "r3", title: "فيتامين D", type: "دواء", date: "2026-11-15", status: "ملغى" },
  { id: "r4", title: "طلب تبرع بالدم (O+)", type: "دم", date: "2026-11-10", status: "مكتمل" },
];

export const notifications = [
  { id: "n1", title: "تنبيه عاجل", body: "مطلوب فصيلة دم O+", time: "منذ 5 دقائق", type: "urgent" },
  { id: "n2", title: "تم قبول طلب التبرع", body: "تم قبول تبرعك من أحمد محمد", time: "منذ 30 دقيقة", type: "success" },
  { id: "n3", title: "طلب جديد", body: "يوجد طلب تبادل أدوية (إنسولين)", time: "منذ ساعة", type: "info" },
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
