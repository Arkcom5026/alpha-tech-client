import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { payment } from '@/features/pos/purchase/api/stripe';

import useAuthStore from '@/features/auth/store/authStore';
import CheckoutForm from '@/features/customer/components/CheckoutForm';

const stripePromise = loadStripe('pk_test_51RKC5uPPBVSi4OBNiar4mZQuCYaJcIVdT5LbR0fzJkqT35ZQ1lBvz5tE5EXs9jSDn9xAdO7RmDFAfymtlAOuIDn300Wsg2pAei');

const Payment = () => {
    const token = useAuthStore((state) => state.token);
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;

        const fetchClientSecret = async () => {
            try {
                const res = await payment(token);
                if (res.data?.clientSecret) {
                    setClientSecret(res.data.clientSecret);
                } else {
                    throw new Error('No client secret received');
                }

                if (!res?.data?.clientSecret) {
                    throw new Error('No client secret received');
                }

            } catch (err) {
                console.error('Failed to fetch client secret:', err);
                setError('Failed to initialize payment');
            } finally {
                setLoading(false);
            }
        };

        fetchClientSecret();
    }, [token]);

    if (loading) return <div>Loading payment gateway...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="payment-container">
            {clientSecret && (
                <Elements
                    stripe={stripePromise}
                    options={{ clientSecret }}
                    key={clientSecret} // 
                >
                    <CheckoutForm />
                </Elements>
            )}
        </div>
    );
};

export default Payment;