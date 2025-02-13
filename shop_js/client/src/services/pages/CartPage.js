import React, { useState } from 'react';
import Cart from '../components/Cart';

function CartPage() {
  // Dla uproszczenia: symulujemy, że mamy już produkty w koszyku
  const [cartItems, setCartItems] = useState([
    { name: 'Domyślny produkt', price: 99, _id: '1' }
  ]);

  const removeFromCart = (productToRemove) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== productToRemove._id)
    );
  };

  return (
    <div>
      <h1>Twój koszyk</h1>
      <Cart cartItems={cartItems} removeFromCart={removeFromCart} />
    </div>
  );
}

export default CartPage;
