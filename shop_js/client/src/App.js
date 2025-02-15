import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';

function App() {
  const [cartItems, setCartItems] = useState([]);

  function addToCart(product) {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item._id === product._id
      );
      if (existingIndex !== -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  }

  function removeOneFromCart(product) {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item._id === product._id) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(product) {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== product._id)
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  return (
    <BrowserRouter>
    <header className="header">
      <div className="logo">Sklep React</div>
      <div className="nav-bar">
        <Link to="/">Strona Główna</Link>
        <Link to="/cart">Koszyk{cartItems.length > 0 && ` (${cartItems.length})`}</Link>
      </div>
    </header>

      <div className="container">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                addToCart={addToCart}
                removeOneFromCart={removeOneFromCart}
                removeFromCart={removeFromCart}
                cartItems={cartItems}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={cartItems}
                addToCart={addToCart}
                removeOneFromCart={removeOneFromCart}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
              />
            }
          />
          <Route
            path="/payment"
            element={
              <PaymentPage
                cartItems={cartItems}
                clearCart={clearCart}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
