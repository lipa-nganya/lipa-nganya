// src/routes/mpesaRoutes.js
import express from "express";
import { lipaNaMpesaOnline, mpesaCallback } from "../controllers/mpesaController.js";

export default function(pool) {
  const router = express.Router();

  // STK Push
  router.post("/stkpush", (req, res) => lipaNaMpesaOnline(req, res, pool));

  // Callback
  router.post("/stkcallback", (req, res) => {
    req.pool = pool;
    mpesaCallback(req, res);
  });

  return router;
}
