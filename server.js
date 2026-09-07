import express from "express";
import cors from "cors";

import bloodRoutes from "./routes/blood.js";
import medicineRoutes from "./routes/medicine.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Nabd Al-Amal API is running ✅");
});

app.use("/api/blood", bloodRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`🚑 Nabd Al-Amal backend running on http://localhost:${PORT}`);
});
