const Category = require('../models/Category');

// Utworzenie nowej kategorii
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('createCategory error:', error);
    res.status(500).json({ message: 'Błąd podczas tworzenia kategorii' });
  }
};

// Pobranie wszystkich kategorii
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('getCategories error:', error);
    res.status(500).json({ message: 'Błąd podczas pobierania kategorii' });
  }
};