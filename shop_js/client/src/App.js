import React from 'react';
import HomePage from './services/pages/HomePage';
import CartPage from './services/pages/CartPage';
import PaymentPage from './services/pages/PaymentPage';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/payment" element={<PaymentPage />} />
    </Routes>
  );
}

export default App;
