import React from "react";

import CartItemList from "../components/CartItemList";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

const CartPage = () => {
    const cartItems = useCartStore((state) => state.items);
    const total = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const navigate = useNavigate();
    return (
        <div className="p-4 space-y-4">
            <h1 className="text-xl font-bold">ตะกร้าสินค้า</h1>
            <CartItemList items={cartItems} />
            <div className="text-right font-semibold text-lg">
                รวมทั้งหมด: {total.toLocaleString()} บาท
            </div>

            <button
                onClick={() => navigate("/checkout")}
                disabled={cartItems.length === 0}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                ดำเนินการสั่งซื้อ
            </button>

        </div>

    );
};

export default CartPage;
