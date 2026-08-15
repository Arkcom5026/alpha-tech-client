import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';

import { saveOrder } from '@/features/customer/api/user';
import useAuthStore from '@/features/auth/store/authStore';
import useCartStore from '@/features/online/store/cartStore';

export default function CheckoutForm() {
  const token = useAuthStore((state) => state.token);
  const clearCart = useCartStore((state) => state.clearCart);

  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || isLoading) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const payload = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (payload.error) {
        const errorMessage = payload.error.message || 'ชำระเงินไม่สำเร็จ';
        setMessage(errorMessage);
        feedback.actionError(
          payload.error,
          errorMessage,
          'checkout.payment.confirm',
        );
        return;
      }

      if (payload.paymentIntent?.status === 'succeeded') {
        try {
          await saveOrder(token, payload);
          clearCart();
          feedback.actionSuccess(
            'ชำระเงินและบันทึกคำสั่งซื้อสำเร็จ',
            'checkout.order.persist',
          );
          navigate('/user/history');
        } catch (err) {
          const errorMessage = err?.response?.data?.message || err?.message || 'บันทึกคำสั่งซื้อไม่สำเร็จ';
          setMessage(errorMessage);
          feedback.actionError(
            err,
            errorMessage,
            'checkout.order.persist',
          );
        }
        return;
      }

      const warningMessage = 'ชำระเงินไม่สำเร็จ';
      setMessage(warningMessage);
      feedback.warning(warningMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs',
  };

  return (
    <form className="space-y-6" id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button
        className="stripe-button"
        disabled={isLoading || !stripe || !elements}
        id="submit"
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner" /> : 'Pay now'}
        </span>
      </button>
      {message && <div id="payment-message" role="alert">{message}</div>}
    </form>
  );
}