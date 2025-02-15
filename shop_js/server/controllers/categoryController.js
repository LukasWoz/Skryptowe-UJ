const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Nazwa kategorii jest wymagana.' });
    }

    const newCategory = new Category({ name });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Błąd tworzenia kategorii:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Błąd pobierania kategorii:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
  }
};
