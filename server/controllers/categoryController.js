const Category = require('../models/Category');
const slugify = require('slugify');

// @desc  Get all categories
// @route GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const { providerType } = req.query;
    const query = { isActive: true, parentCategory: null };
    if (providerType) query.applicableProviderTypes = providerType;

    const categories = await Category.find(query).sort({ sortOrder: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc  Create category (Admin)
// @route POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, ...rest } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const category = await Category.create({ name, slug, ...rest });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc  Update category
// @route PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete category
// @route DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
