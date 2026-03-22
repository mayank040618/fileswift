import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { initializeLemonSqueezy } from "@/lib/lemonsqueezy";

import { db } from "@/lib/db";

const settingsUrl = process.env.NEXT_PUBLIC_APP_URL + "/workspace";

export async function GET() {
    try {
        const { userId } = auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const dbUser = await db.user.findUnique({
            where: { id: userId }
        });

        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // 1. Stripe Portal
        if (dbUser.payment_provider === 'STRIPE' && dbUser.stripe_customer_id) {
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: dbUser.stripe_customer_id,
                return_url: settingsUrl,
            });
            return NextResponse.json({ url: portalSession.url });
        }

        // 2. LemonSqueezy Portal
        if (dbUser.payment_provider === 'LEMONSQUEEZY' && dbUser.lemonsqueezy_customer_id) {
            initializeLemonSqueezy();
            
            // LemonSqueezy hosted customer portal URL pattern:
            // https://[your-store].lemonsqueezy.com/billing
            const storeUrl = process.env.LEMON_SQUEEZY_STORE_URL || `https://fileswift.lemonsqueezy.com`;
            return NextResponse.json({ url: `${storeUrl}/billing` });
        }

        // 3. Razorpay (Custom View or just workspace)
        if (dbUser.payment_provider === 'RAZORPAY') {
            return NextResponse.json({ 
                error: "RAZORPAY_MANUAL", 
                message: "Razorpay management is currently handled within the dashboard." 
            });
        }

        return new NextResponse("No active subscription found", { status: 404 });
    } catch (error) {
        console.error("[BILLING_PORTAL_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
