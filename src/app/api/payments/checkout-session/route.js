import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';

export async function POST(request) {
    try {
        const headersList = await headers();
        const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await auth.api.getSession({ headers: headersList });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, recipeId, amount } = body; // type: 'premium' or 'recipe'

        let productName, description, unitAmount, metadata, successUrl, cancelUrl;

        if (type === 'premium') {
            productName = 'RecipeHub Premium Membership';
            description = 'Unlimited recipe uploads and premium badge';
            unitAmount = 999; // ৳9.99 in paisa (BDT)
            metadata = {
                type: 'premium',
                userEmail: session.user.email,
                userId: session.user.id,
                amount: (unitAmount / 100).toString(),
            };
            successUrl = `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
            cancelUrl = `${origin}/dashboard/user`;
        } else if (type === 'recipe') {
            if (!recipeId) {
                return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
            }
            // You could fetch recipe details from your backend to get the price
            // For now, use the provided amount or default
            const priceInBDT = amount || 499; // default ৳4.99
            const recipe = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/recipes/${recipeId}`, {
                headers: { 'user-email': session.user.email },
            }).then(res => res.json()).catch(() => null);

            productName = recipe?.recipeName || 'Recipe Purchase';
            description = `Full recipe: ${productName}`;
            unitAmount = Math.round(priceInBDT * 100); // convert to paisa
            metadata = {
                type: 'recipe',
                recipeId,
                userEmail: session.user.email,
                userId: session.user.id,
                amount: (unitAmount / 100).toString(),
            };
            successUrl = `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
            cancelUrl = `${origin}/recipes/${recipeId}`;
        } else {
            return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            customer_email: session.user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'bdt',
                        product_data: {
                            name: productName,
                            description: description,
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata,
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (err) {
        console.error('Stripe error:', err);
        return NextResponse.json(
            { error: err.message || 'Payment initialization failed' },
            { status: err.statusCode || 500 }
        );
    }
}