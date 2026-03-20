import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export const initializeLemonSqueezy = () => {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

  if (!apiKey) {
    throw new Error("LEMON_SQUEEZY_API_KEY is not defined");
  }

  lemonSqueezySetup({
    apiKey,
    onError: (error) => {
      console.error("Lemon Squeezy error:", error);
    },
  });
};
