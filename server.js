const express = require('express')
const app = express()
const mongoose = require('mongoose');
const Product = require('./models/productModel');
    //const Product = require('../models/productModel')        



mongoose.connect('mongodb+srv://admin:admin@api.woqch.mongodb.net/Node-API?retryWrites=true&w=majority&appName=API')



.then(function(){
    app.listen(3000, () => {
        console.log('Connected to the database')
        console.log('Server is running on http://localhost:3000')
        });
    
}).catch(function   (err) {
    console.log('Failed to connect to the database', err)
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Get all products with pagination (limit and offset)
app.get('/products', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const products = await Product.find({}).limit(limit).skip(offset);
    res.status(200).json(products);
});

// Get product by ID
app.get('/products/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('The product with the given ID was not found.');
    res.status(200).json(product);
    
});
app.use(express.json());
// Create a new product
app.post('/products', async (req, res) => {
    try {
        
        const product = await Product.create(req.body);
        res.status(201).send(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update product by ID
app.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).send('The product with the given ID was not found.');
        res.status(200).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete product by ID
app.delete('/products/:id', async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send('The product with the given ID was not found.');
    res.status(200).json(product);
});

// seqrch  by price
app.get('/products/searchPrice/:price', async (req, res) => {
    try {
        const price = parseFloat(req.params.price);

        if (isNaN(price)) {
            return res.status(400).send('Invalid price value.');
        }

        const products = await Product.find()
        .sort({ price: 1 }); // 1 = oplopend, -1 = aflopend

        res.status(200).json(products);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
app.get('/products/searchName/:name', async (req, res) => {
    try {
        const name = req.params.name;

        const products = await Product.find({
            name: { $regex: name, $options: 'i' } // Case-insensitive search
        });

        if (products.length === 0) {
            return res.status(404).send('No products found with the given name.');
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).send(err.message);
    }
});




app.use(express.json());
app.get('/products/:id', async (req, res) => {
    const product = await Product.find(c => c.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('The product with the given ID was not found.');
    const{error} = validateProduct(req.body);
    if(error){

     return res.status(400).send(error.details[0].message);
    return;
}
product.name = req.body.name;
res.send(product);

});


