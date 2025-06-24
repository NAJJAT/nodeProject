const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Category = require('./models/categoryModel');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Database Connection
mongoose.connect('mongodb+srv://admin:admin@api.woqch.mongodb.net/Node-API?retryWrites=true&w=majority&appName=API')
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
.catch(err => {
    console.error('Database connection failed:', err);
});

// ROOT ENDPOINT - API Documentation
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// ===== CATEGORY CRUD ENDPOINTS (Entity 1) =====

// GET all categories (with pagination)
app.get('/categories', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        const sortBy = req.query.sortBy || 'name';
        const order = req.query.order === 'desc' ? -1 : 1;

        const categories = await Category.find({})
            .sort({ [sortBy]: order })
            .limit(limit)
            .skip(offset);
        
        const total = await Category.countDocuments();
        
        res.status(200).json({
            categories,
            pagination: {
                total,
                limit,
                offset,
                hasMore: (offset + limit) < total
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single category by ID
app.get('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE new category
app.post('/categories', async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE category
app.put('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({
            message: 'Category updated successfully',
            category
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE category
app.delete('/categories/:id', async (req, res) => {
    try {
        // Check if category has products
        const productCount = await Product.countDocuments({ category: req.params.id });
        if (productCount > 0) {
            return res.status(400).json({ 
                error: `Cannot delete category. It has ${productCount} product(s). Delete products first.` 
            });
        }

        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ 
            message: 'Category deleted successfully', 
            category 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEARCH categories by name
app.get('/categories/search-by-name/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const categories = await Category.find({
            name: { $regex: name, $options: 'i' }
        });

        if (categories.length === 0) {
            return res.status(404).json({ message: 'No categories found with the given name' });
        }

        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEARCH categories by field/value
app.get('/categories/search/:field/:value', async (req, res) => {
    try {
        const { field, value } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        
        let query = {};
        
        if (field === 'name') {
            query.name = { $regex: value, $options: 'i' };
        } else if (field === 'isActive') {
            query.isActive = value.toLowerCase() === 'true';
        } else if (field === 'quantity') {
            const numericValue = parseInt(value);
            if (!isNaN(numericValue)) {
                query.quantity = numericValue;
            } else {
                return res.status(400).json({ error: 'Invalid quantity value' });
            }
        } else {
            return res.status(400).json({ 
                error: 'Invalid search field. Use: name, isActive, or quantity' 
            });
        }

        const categories = await Category.find(query)
            .limit(limit)
            .skip(offset);
        
        res.status(200).json({
            categories,
            searchCriteria: { field, value },
            total: categories.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== PRODUCT CRUD ENDPOINTS (Entity 2) =====

// GET all products (with pagination and category population)
app.get('/products', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        const sortBy = req.query.sortBy || 'name';
        const order = req.query.order === 'desc' ? -1 : 1;

        const products = await Product.find({})
            .populate('category', 'name description quantity')
            .sort({ [sortBy]: order })
            .limit(limit)
            .skip(offset);
        
        const total = await Product.countDocuments();
        
        res.status(200).json({
            products,
            pagination: {
                total,
                limit,
                offset,
                hasMore: (offset + limit) < total
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single product by ID
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name description quantity');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE new product
app.post('/products', async (req, res) => {
    try {
        // Verify category exists
        if (req.body.category) {
            const categoryExists = await Category.findById(req.body.category);
            if (!categoryExists) {
                return res.status(400).json({ error: 'Category does not exist' });
            }
        }

        const product = await Product.create(req.body);
        
        // Update category product count
        if (product.category) {
            await Category.findByIdAndUpdate(
                product.category,
                { $inc: { productCount: 1 } }
            );
        }

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name description quantity');
        
        res.status(201).json({
            message: 'Product created successfully',
            product: populatedProduct
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE product
app.put('/products/:id', async (req, res) => {
    try {
        const oldProduct = await Product.findById(req.params.id);
        if (!oldProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Verify new category exists if category is being changed
        if (req.body.category && req.body.category !== oldProduct.category.toString()) {
            const categoryExists = await Category.findById(req.body.category);
            if (!categoryExists) {
                return res.status(400).json({ error: 'New category does not exist' });
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        ).populate('category', 'name description quantity');

        // Update category product counts if category changed
        if (req.body.category && req.body.category !== oldProduct.category.toString()) {
            // Decrease old category count
            await Category.findByIdAndUpdate(
                oldProduct.category,
                { $inc: { productCount: -1 } }
            );
            // Increase new category count
            await Category.findByIdAndUpdate(
                req.body.category,
                { $inc: { productCount: 1 } }
            );
        }

        res.status(200).json({
            message: 'Product updated successfully',
            product
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE product
app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update category product count
        if (product.category) {
            await Category.findByIdAndUpdate(
                product.category,
                { $inc: { productCount: -1 } }
            );
        }

        res.status(200).json({ 
            message: 'Product deleted successfully', 
            product 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEARCH products by name
app.get('/products/search-by-name/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const products = await Product.find({
            name: { $regex: name, $options: 'i' }
        }).populate('category', 'name description quantity');

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found with the given name' });
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEARCH products by category
app.get('/products/search-by-category/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        // Verify category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const products = await Product.find({ category: categoryId })
            .populate('category', 'name description quantity')
            .limit(limit)
            .skip(offset);

        res.status(200).json({
            products,
            category: category.name,
            total: products.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEARCH products by field/value
app.get('/products/search/:field/:value', async (req, res) => {
    try {
        const { field, value } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        
        let query = {};
        
        if (field === 'name') {
            query.name = { $regex: value, $options: 'i' };
        } else if (field === 'price') {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue)) {
                query.price = numericValue;
            } else {
                return res.status(400).json({ error: 'Invalid price value' });
            }
        } else if (field === 'quantity') {
            const numericValue = parseInt(value);
            if (!isNaN(numericValue)) {
                query.quantity = numericValue;
            } else {
                return res.status(400).json({ error: 'Invalid quantity value' });
            }
        } else if (field === 'sku') {
            query.sku = { $regex: value, $options: 'i' };
        } else if (field === 'inStock') {
            query.inStock = value.toLowerCase() === 'true';
        } else {
            return res.status(400).json({ 
                error: 'Invalid search field. Use: name, price, quantity, sku, or inStock' 
            });
        }

        const products = await Product.find(query)
            .populate('category', 'name description quantity')
            .limit(limit)
            .skip(offset);
        
        res.status(200).json({
            products,
            searchCriteria: { field, value },
            total: products.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: 'Check API documentation at the root URL'
    });
});