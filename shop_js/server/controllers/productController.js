const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const product = new Product({ name, price, category });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(500).json({ message: 'Błąd podczas tworzenia produktu' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ message: 'Błąd podczas pobierania produktów' });
  }
};