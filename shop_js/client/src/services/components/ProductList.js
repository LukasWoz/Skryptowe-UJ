import React, { useEffect, useState } from 'react';
import api from '../api';
import ProductItem from './ProductItem';

function ProductList({ addToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Pobranie listy produktów z backendu
    api.get('/products')
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error('Błąd pobierania produktów:', err);
      });
  }, []);

  return (
    <div>
      <h2>Lista Produktów</h2>
      <ul>
        {products.map((product) => (
          <ProductItem key={product._id} product={product} addToCart={addToCart} />
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
