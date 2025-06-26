// ✅ CheckoutPage.jsx 
import React, { useState, useEffect, useMemo } from "react";
import { useCartStore } from "../../cart/store/cartStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useOrderOnlineStore } from "../store/orderOnlineStore";
import { useBranchStore } from "@/features/branch/store/branchStore";
import RegisterForm from "../components/RegisterForm";
import CustomerInfoForm from "../components/CustomerInfoForm";
import LoginForm from "../components/LoginForm";

const CheckoutPage = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const fetchCartAction = useCartStore((state) => state.fetchCartAction);
  const fetchCartBranchPricesAction = useCartStore((state) => state.fetchCartBranchPricesAction);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const token = useAuthStore((state) => state.token);
  const customer = useAuthStore((state) => state.customer);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const [showRegister, setShowRegister] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    province: "",
    postalCode: "",
  });

  const submitOrderAction = useOrderOnlineStore((state) => state.submitOrderAction);

  const handleLoginSuccess = async () => {
    await fetchCartAction();
    await fetchCartBranchPricesAction();

    const items = useCartStore.getState().cartItems;
    setSelectedItems(items.map((item) => item.id));

    const user = useAuthStore.getState().customer;
    console.log("✅ customer after login:", user);
    if (user) {
      setCustomerInfo((prev) => ({
        ...prev,
        fullName: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
  };

  useEffect(() => {
    const loadCart = async () => {
      await fetchCartAction();

      const storedToken = useAuthStore.getState().token;
      const storedCustomer = useAuthStore.getState().customer;
      const currentBranch = useBranchStore.getState().currentBranch;

      if (storedToken && storedCustomer && currentBranch?.id) {
        await fetchCartBranchPricesAction(currentBranch.id);
        const items = useCartStore.getState().cartItems;
        setSelectedItems(items.map((item) => item.id));

        setCustomerInfo((prev) => ({
          ...prev,
          fullName: storedCustomer.name || "",
          phone: storedCustomer.phone || "",
          email: storedCustomer.email || "",
        }));
      }
    };
    loadCart();
  }, []);


  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.length === 0) {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  }, [cartItems]);

  const selectedCartItemsWithPrice = useMemo(() => {
    return cartItems.filter((item) => selectedItems.includes(item.id));
  }, [cartItems, selectedItems]);

  useEffect(() => {
    const sum = selectedCartItemsWithPrice.reduce((acc, item) => {
      const price = item.branchPrice?.price || item.priceOnline || item.price || item.priceAtThatTime || 0;
      return acc + price * item.quantity;
    }, 0);
    setCalculatedTotal(sum);
  }, [selectedCartItemsWithPrice]);

  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleIncrease = (item) => {
    increaseQuantity(item.id);
  };

  const handleDecrease = (item) => {
    decreaseQuantity(item.id);
  };

  const submitOrder = async () => {
    try {
      if (!token || !customer || !selectedBranchId) return;

      if (!selectedCartItemsWithPrice.length) {
        alert("กรุณาเลือกสินค้าก่อนทำรายการ");
        return;
      }

      const payload = {
        customerId: customer.id,
        branchId: selectedBranchId,
        note: "คำสั่งซื้อจากลูกค้าออนไลน์",

        fullName: customerInfo.fullName,
        phone: customerInfo.phone,
        email: customerInfo.email,
        address: customerInfo.address,
        district: customerInfo.district,
        province: customerInfo.province,
        postalCode: customerInfo.postalCode,

        items: selectedCartItemsWithPrice.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.branchPrice?.price || item.priceOnline || item.price || item.priceAtThatTime || 0,
        })),
      };
      console.log("payload : ", payload);
      const result = await submitOrderAction(payload);
      if (result?.order?.id) {
        window.location.href = `/order-success/${result.order.id}`;
      }
    } catch (err) {
      console.error("❌ submitOrder error:", err);
      alert("ไม่สามารถยืนยันคำสั่งซื้อได้");
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-semibold mb-4">ยืนยันคำสั่งซื้อ</h1>
        {cartItems.length === 0 ? (
          <div className="text-gray-500">ไม่มีสินค้าที่เลือก</div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => {
              const imageUrl = item.product?.productImages?.[0]?.secure_url || item.imageUrl || "/no-image.png";
              const name = item.product?.name || item.name || "ไม่มีชื่อ";
              const price = item.branchPrice?.price || item.priceOnline || item.price || item.priceAtThatTime || 0;
              return (
                <div key={item.id} className="flex gap-4 items-start border-b pb-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="mt-2"
                  />
                  <img src={imageUrl} alt={name} className="w-16 h-16 object-contain border rounded" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{name}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <button onClick={() => handleDecrease(item)} className="px-2 py-0.5 border rounded hover:bg-gray-100">-</button>
                      <span className="min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => handleIncrease(item)} className="px-2 py-0.5 border rounded hover:bg-gray-100">+</button>
                      <span className="ml-2">× {Number(price).toLocaleString()} ฿</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {(item.quantity * price).toLocaleString()} ฿
                  </div>
                </div>
              );
            })}
            <div className="pt-4 border-t text-right text-base font-semibold">
              รวมทั้งหมด: {Number(calculatedTotal || 0).toLocaleString()} ฿
            </div>
            {token && customer && (
              <button
                onClick={submitOrder}
                className="mt-6 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
              >
                ยืนยันการสั่งซื้อ
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md h-fit">
        {(token && customer) ? (
          <CustomerInfoForm value={customerInfo} onChange={setCustomerInfo} />
        ) : showRegister ? (
          <RegisterForm setShowRegister={setShowRegister} />
        ) : (
          <LoginForm setShowRegister={setShowRegister} onSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
