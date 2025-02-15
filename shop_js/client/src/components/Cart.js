import React from 'react';

function Cart({
  cartItems,
  addToCart,
  removeOneFromCart,
  removeFromCart,
  clearCart
}) {
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-list">
      <h2></h2>
      {cartItems.length === 0 ? (
        <p> (Twój koszyk jest pusty)</p>
      ) : (
        <>
          <ul>
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item-card">
              <h4>{item.name}</h4>
              <p>Cena: {item.price} zł</p>
              <p>Ilość: {item.quantity}</p>
              <button onClick={() => addToCart(item)}>+</button>
              <button onClick={() => removeOneFromCart(item)}>-</button>
              <button onClick={() => removeFromCart(item)}>Usuń</button>
            </div>
          ))}

          </ul>

          <p className="cart-summary">
            Łączna kwota: {totalPrice.toFixed(2)} zł
          </p>
          <button onClick={clearCart}>Wyczyść koszyk</button>
        </>
      )}
    </div>
  );
}

export default Cart;
