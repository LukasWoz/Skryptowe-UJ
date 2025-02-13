import React, { useState } from 'react';
import ProductList from '../components/ProductList';

function HomePage() {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevState) => [...prevState, product]);
  };

  return (
    <div>
      <h1>Sklep React</h1>
      <ProductList addToCart={addToCart} />
    </div>
  );
}

export default HomePage;
