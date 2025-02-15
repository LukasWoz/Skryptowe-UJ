import React, { useEffect, useState } from 'react';
import api from '../api'; 
function CategoryList() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error('Błąd pobierania kategorii:', err);
      });
  }, []);

  return (
    <div>
      <h2>Kategorie</h2>
      {categories.length === 0 ? (
        <p>Brak kategorii.</p>
      ) : (
        <ul>
          {categories.map((cat) => (
            <li key={cat._id}>{cat.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CategoryList;
