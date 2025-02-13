// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Połączenie z MongoDB
connectDB(process.env.MONGO_URI);

// Middleware
app.use(cors());               // Konfiguracja CORS
app.use(express.json());       // Obsługa JSON w body

// Endpointy
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
