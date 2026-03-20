import { NextResponse } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("X-Razorpay-Signature") as string;
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return new NextResponse("Invalid signature", { status: 400 });
        }

        const payload = JSON.parse(body);
        const event = payload.event;

        if (event === "payment.captured") {
            const payment = payload.payload.payment.entity;
            const { clerkUserId, planType } = payment.notes;

            // Extract raw plan name from metadata or notes
            const normalizedPlan = planType === 'PRO_ACTIVE' ? 'PRO_ACTIVE' : 'STUDENT';

            await db.user.update({
                where: { id: clerkUserId },
                data: {
                    plan_type: normalizedPlan,
                    payment_provider: 'RAZORPAY',
                    subscription_status: 'active',
                    razorpay_customer_id: payment.customer_id || undefined,
                    // For simplicity, Razorpay one-time captures set 30 days expiry
                    plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                }
            });
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("[RAZORPAY_WEBHOOK_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
