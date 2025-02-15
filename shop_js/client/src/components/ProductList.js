import React from 'react';
import ProductItem from './ProductItem';

function ProductList({
  products,
  cartItems,
  addToCart,
  removeOneFromCart,
  removeFromCart
}) {
  return (
    <div className="product-list">
      {products.map(product => (
        <ProductItem
          key={product._id}
          product={product}
          cartItems={cartItems}
          addToCart={addToCart}
          removeOneFromCart={removeOneFromCart}
          removeFromCart={removeFromCart}
        />
      ))}
    </div>
  );
}

export default ProductList;
