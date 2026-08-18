import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const paymentRoutes = Router();

paymentRoutes.use(requireAuth);

paymentRoutes.post("/create-order", asyncHandler(createOrder));
paymentRoutes.post("/verify-payment", asyncHandler(verifyPayment));
