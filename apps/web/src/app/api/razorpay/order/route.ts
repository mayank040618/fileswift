import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { planId, currency = 'INR' } = await req.json();

        if (!planId) {
            return new NextResponse("Plan ID is required", { status: 400 });
        }

        // Pricing in Paisa (100 Paisa = 1 INR)
        const pricingMap: Record<string, number> = {
            'student': 4900,
            'pro_active': 14900,
        };

        const amount = pricingMap[planId];
        if (!amount) {
            return new NextResponse("Invalid Plan ID", { status: 400 });
        }

        const options = {
            amount: amount,
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                clerkUserId: userId,
                planType: planId.toUpperCase(),
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error) {
        console.error("[RAZORPAY_ORDER_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
