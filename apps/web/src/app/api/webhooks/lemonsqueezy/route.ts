import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("X-Signature") as string;
        const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return new NextResponse("Invalid signature", { status: 400 });
        }

        const payload = JSON.parse(body);
        const eventName = payload.meta.event_name;
        const customData = payload.meta.custom_data;

        if (!customData || !customData.userId || !customData.planId) {
            console.error("LemonSqueezy Webhook: Missing custom data", customData);
            return new NextResponse("Missing custom data", { status: 400 });
        }

        const { userId, planId } = customData;

        if (eventName === "subscription_created" || eventName === "order_created") {
            const attributes = payload.data.attributes;
            
            // Extract customer ID and expiry if available
            // Note: attributes structure varies slightly between order and subscription
            const customerId = attributes.customer_id?.toString();
            const expiresAt = attributes.ends_at ? new Date(attributes.ends_at) : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000); // Default 31 days if missing

            await db.user.update({
                where: { id: userId },
                data: {
                    plan_type: planId.toUpperCase(),
                    payment_provider: 'LEMONSQUEEZY',
                    subscription_status: 'active',
                    lemonsqueezy_customer_id: customerId,
                    plan_expires_at: expiresAt,
                }
            });
        }

        if (eventName === "subscription_updated") {
            const attributes = payload.data.attributes;
            const expiresAt = attributes.ends_at ? new Date(attributes.ends_at) : undefined;
            const status = attributes.status; // e.g., 'active', 'on_trial', 'cancelled', 'expired'

            await db.user.update({
                where: { id: userId },
                data: {
                    subscription_status: status,
                    plan_expires_at: expiresAt,
                }
            });
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("[LEMON_SQUEEZY_WEBHOOK_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
