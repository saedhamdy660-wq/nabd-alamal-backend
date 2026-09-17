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
