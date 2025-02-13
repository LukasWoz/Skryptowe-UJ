import React from 'react';

function ProductItem({ product, addToCart }) {
  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <li>
      <h3>{product.name}</h3>
      <p>Cena: {product.price} zł</p>
      <button onClick={handleAddToCart}>Dodaj do koszyka</button>
    </li>
  );
}

export default ProductItem;
