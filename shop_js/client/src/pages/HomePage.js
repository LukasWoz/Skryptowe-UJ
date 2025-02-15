import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductList from '../components/ProductList';
import Toast from '../components/Toast';

function HomePage({
  addToCart,
  removeOneFromCart,
  removeFromCart,
  cartItems
}) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchCategories = () => {
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Błąd pobierania kategorii:', err));
  };

  const fetchProducts = () => {
    api.get('/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Błąd pobierania produktów:', err));
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(
        (p) => p.category && p.category._id === selectedCategory
      )
    : products;

  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage(`Dodano do koszyka: ${product.name}`);
  };

  const handleCloseToast = () => {
    setToastMessage('');
  };

  const CategorySidebar = () => (
    <div className="categories-panel pinned">
      <h3>Kategorie</h3>
      <ul className="category-list">
        <li>
          <button
            className={`category-button ${
              selectedCategory === null ? 'bold' : ''
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            Wszystkie
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat._id}>
            <button
              className={`category-button ${
                selectedCategory === cat._id ? 'bold' : ''
              }`}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <Toast
        message={toastMessage}
        duration={2000}
        onClose={handleCloseToast}
      />

      <div className="container">
        <CategorySidebar />

        <div className="main-content">
          <h1>Lista produktów</h1>
          <div className="products-container">
            <ProductList
              products={filteredProducts}
              cartItems={cartItems}
              addToCart={handleAddToCart}
              removeOneFromCart={removeOneFromCart}
              removeFromCart={removeFromCart}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
