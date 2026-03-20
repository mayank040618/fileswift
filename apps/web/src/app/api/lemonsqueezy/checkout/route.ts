import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { initializeLemonSqueezy } from "@/lib/lemonsqueezy";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId) {
      return new NextResponse("Plan ID is required", { status: 400 });
    }

    initializeLemonSqueezy();

    const dbUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    const storeId = process.env.LEMON_SQUEEZY_STORE_ID!;
    const variantId =
      planId === "student"
        ? process.env.LEMON_SQUEEZY_STUDENT_VARIANT_ID!
        : process.env.LEMON_SQUEEZY_PRO_VARIANT_ID!;

    const checkout = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: user.emailAddresses[0].emailAddress,
        custom: {
          userId: userId,
          planId: planId.toUpperCase(),
        },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/workspace?success=true`,
      },
    });

    return NextResponse.json({ url: checkout.data?.data.attributes.url });
  } catch (error) {
    console.error("[LEMON_SQUEEZY_CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
