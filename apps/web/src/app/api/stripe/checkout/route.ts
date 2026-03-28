import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

const settingsUrl = process.env.NEXT_PUBLIC_APP_URL + "/pricing";

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { planId, _currency = 'usd' } = await req.json();

        if (!planId) {
            return new NextResponse("Plan ID is required", { status: 400 });
        }

        // 1. Check if user exists in our DB
        const dbUser = await db.user.findUnique({
            where: { id: userId }
        });

        if (!dbUser) {
            return new NextResponse("User not found in DB", { status: 404 });
        }

        // 2. If they already have a stripe customer ID, use it
        let stripeCustomerId = dbUser.stripe_customer_id;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.emailAddresses[0].emailAddress,
                metadata: { clerkUserId: userId }
            });
            stripeCustomerId = customer.id;
            await db.user.update({
                where: { id: userId },
                data: { stripe_customer_id: stripeCustomerId }
            });
        }

        // 3. Define pricing map (this would ideally come from DB or config)
        const priceMap: Record<string, string> = {
            'student': process.env.STRIPE_STUDENT_PRICE_ID!,
            'pro_active': process.env.STRIPE_PRO_PRICE_ID!,
        };

        const priceId = priceMap[planId];

        if (!priceId) {
            return new NextResponse("Invalid Plan ID", { status: 400 });
        }

        // 4. Create Stripe Checkout Session
        const stripeSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            success_url: settingsUrl + "?success=true",
            cancel_url: settingsUrl + "?canceled=true",
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                clerkUserId: userId,
                planType: planId.toUpperCase(),
            },
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.error("[STRIPE_CHECKOUT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
