import React from 'react';
import { Link } from 'react-router-dom';
import Cart from '../components/Cart';

function CartPage({
  cartItems,
  addToCart,
  removeOneFromCart,
  removeFromCart,
  clearCart
}) {
  return (
    <div className="container">
      <div className="main-content">
        <h2>Twój koszyk</h2>
        <div className="cart-container">
          <Cart
            cartItems={cartItems}
            addToCart={addToCart}
            removeOneFromCart={removeOneFromCart}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
          />
          {cartItems.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <Link to="/payment">
                <button className="payment-button">Przejdź do płatności</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartPage;
