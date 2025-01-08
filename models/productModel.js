const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        validate: {
            validator: function (v) {
                return /^[^\d]+$/.test(v); // Name cannot contain numbers
            },
            message: 'Name cannot contain numbers'
        }
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'] // Minimum 1
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be a positive number'] // Must be greater than 0
    },
    image: {
        type: String,
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(v); // Valid URL check
            },
            message: 'Image must be a valid URL pointing to an image'
        }
    }
}, {
    timestamps: true
});




const Product = mongoose.model('Product', productSchema);

module.exports = Product;
