import express from "express";
import cors from "cors";

import bloodRoutes from "./routes/blood.js";
import medicineRoutes from "./routes/medicine.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import medicalRoutes from "./routes/medical.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// =========================
// Health Check
// =========================
app.get("/", (req, res) => {
  res.send("Nabd Al-Amal API is running ✅");
});

// =========================
// API Routes
// =========================
app.use("/api/blood", bloodRoutes);

app.use("/api/medicines", medicineRoutes);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);

// =========================
// Medical Entity Routes
// =========================
app.use(
  "/api/medical",
  medicalRoutes
);

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
  console.log(
    `🚑 Nabd Al-Amal backend running on port ${PORT}`
  );
});
