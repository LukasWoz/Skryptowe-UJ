import React, { useState } from 'react';

function PaymentPage() {
  const [isPaid, setIsPaid] = useState(false);

  const handlePayment = () => {
    // Symulacja płatności
    alert('Płatność przyjęta!');
    setIsPaid(true);
  };

  return (
    <div>
      <h1>Strona płatności</h1>
      {isPaid ? (
        <p>Płatność powiodła się. Dziękujemy za zakupy!</p>
      ) : (
        <button onClick={handlePayment}>Zapłać</button>
      )}
    </div>
  );
}

export default PaymentPage;
