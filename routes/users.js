import express from "express";
import { user, myRequests } from "../data/store.js";

const router = express.Router();

router.get("/me", (req, res) => {
  res.json(user);
});

router.get("/me/requests", (req, res) => {
  res.json(myRequests);
});

export default router;
