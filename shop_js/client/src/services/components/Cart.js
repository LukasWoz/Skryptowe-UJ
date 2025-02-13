import React from 'react';

function Cart({ cartItems, removeFromCart }) {
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div>
      <h2>Koszyk</h2>
      {cartItems.length === 0 ? (
        <p>Twój koszyk jest pusty.</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index}>
                {item.name} - {item.price} zł
                <button onClick={() => removeFromCart(item)}>Usuń</button>
              </li>
            ))}
          </ul>
          <p>Łączna kwota: {totalPrice} zł</p>
        </>
      )}
    </div>
  );
}

export default Cart;
