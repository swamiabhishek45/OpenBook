"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { apiClient } from "@/lib/api-client";
import { RazorpayOrderResponse, RazorpayPaymentSuccessResponse } from "../types";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fireCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    } catch {
      // ignore
    }
  }, []);

  const checkout = useCallback(
    async (options?: {
      amountInr?: number;
      plan?: "PRO" | "PRO_PLUS";
      onSuccess?: () => void;
      onError?: (err: Error) => void;
    }) => {
      setIsLoading(true);
      setError(null);

      const amountInr = options?.amountInr ?? 50;

      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error(
            "Failed to load Razorpay checkout script. Please check your internet connection."
          );
        }

        // 1. Create order on backend
        const orderData = await apiClient<RazorpayOrderResponse>(
          "/api/payment/create-order",
          {
            method: "POST",
            body: JSON.stringify(
              options?.amountInr
                ? { amountInr: options.amountInr }
                : { plan: options?.plan ?? "PRO", amountInr: 50 }
            ),
          }
        );

        if (!orderData?.orderId || !orderData?.keyId) {
          throw new Error("Invalid order data received from server.");
        }

        const description = orderData.credits
          ? `Top up ${orderData.credits} OpenBook Credits`
          : "OpenBook Credits Top-up";

        // 2. Open Razorpay modal
        const rzpOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "OpenBook",
          description,
          order_id: orderData.orderId,
          prefill: {
            name: orderData.user?.name || "",
            email: orderData.user?.email || "",
          },
          theme: {
            color: "#0f172a",
            backdrop_color: "rgba(0, 0, 0, 0.75)",
          },
          handler: async (response: RazorpayPaymentSuccessResponse) => {
            try {
              setIsLoading(true);
              // 3. Verify signature on backend
              await apiClient("/api/payment/verify-payment", {
                method: "POST",
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amountInr,
                  plan: options?.plan,
                }),
              });

              // Refresh usage & credits cache
              await queryClient.invalidateQueries({ queryKey: ["user-usage"] });
              await queryClient.invalidateQueries({ queryKey: ["user-credits"] });
              await queryClient.invalidateQueries({ queryKey: ["workspaces"] });

              fireCelebration();
              setIsLoading(false);
              options?.onSuccess?.();
            } catch (verifyErr) {
              setIsLoading(false);
              const err =
                verifyErr instanceof Error
                  ? verifyErr
                  : new Error("Payment verification failed");
              setError(err.message);
              options?.onError?.(err);
            }
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
            },
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(rzpOptions);
          rzp.open();
        } else {
          throw new Error("Razorpay SDK not available");
        }
      } catch (err) {
        setIsLoading(false);
        const errorObj =
          err instanceof Error
            ? err
            : new Error("Failed to initiate payment checkout");
        setError(errorObj.message);
        options?.onError?.(errorObj);
      }
    },
    [queryClient, fireCelebration]
  );

  return {
    checkout,
    isLoading,
    error,
  };
}
