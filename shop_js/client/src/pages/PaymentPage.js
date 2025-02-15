import React, { useState } from 'react';

function PaymentPage({ cartItems, clearCart }) {
  const [isPaid, setIsPaid] = useState(false);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handlePayment = () => {
    alert('Płatność przyjęta!');
    setIsPaid(true);
    clearCart();
  };

  return (
    <div className="payment-section">
      <h1>Strona płatności</h1>
      {isPaid ? (
        <p>Płatność powiodła się. Dziękujemy za zakupy!</p>
      ) : (
        <>
          <p>Do zapłaty: {totalPrice.toFixed(2)} zł</p>
          <button onClick={handlePayment}>Zapłać</button>
        </>
      )}
    </div>
  );
}

export default PaymentPage;
