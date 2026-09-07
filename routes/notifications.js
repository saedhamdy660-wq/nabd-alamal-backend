import express from "express";
import { notifications } from "../data/store.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(notifications);
});

export default router;
