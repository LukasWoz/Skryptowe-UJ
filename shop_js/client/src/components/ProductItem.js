import React from 'react';

function ProductItem({
  product,
  cartItems,
  addToCart,
  removeOneFromCart,
  removeFromCart
}) {
  const cartItem = cartItems.find(item => item._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>Cena: {product.price} zł</p>
      {quantity > 0 ? (
        <div className="product-actions">
          <p>Ilość: {quantity}</p>
          <button onClick={() => addToCart(product)}>+</button>
          <button onClick={() => removeOneFromCart(product)}>-</button>
          <button onClick={() => removeFromCart(product)}>Usuń</button>
        </div>
      ) : (
        <div className="product-actions">
          <button onClick={() => addToCart(product)}>Dodaj do koszyka</button>
        </div>
      )}
    </div>
  );
}

export default ProductItem;
