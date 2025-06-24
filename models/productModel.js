const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters'],
        maxlength: [100, 'Product name cannot exceed 100 characters'],
        validate: {
            validator: function (v) {
                // Product name cannot consist only of numbers
                return !/^\d+$/.test(v.trim());
            },
            message: 'Product name cannot consist only of numbers'
        }
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        validate: {
            validator: function (v) {
                // Must be a whole number
                return Number.isInteger(v);
            },
            message: 'Quantity must be a whole number'
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be a positive number'],
        validate: {
            validator: function (v) {
                // Price cannot have more than 2 decimal places
                return Math.round(v * 100) === v * 100;
            },
            message: 'Price cannot have more than 2 decimal places'
        }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    image: {
        type: String,
        validate: {
            validator: function (v) {
                if (!v) return true; // Optional field
                return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(v);
            },
            message: 'Image must be a valid URL pointing to an image file'
        }
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        trim: true
    },
    sku: {
        type: String,
        // Removed unique: true from here - will be defined in index only
        validate: {
            validator: function (v) {
                if (!v) return true; // Optional field
                return /^[A-Z0-9\-]+$/.test(v);
            },
            message: 'SKU must contain only uppercase letters, numbers, and hyphens'
        }
    },
    inStock: {
        type: Boolean,
        default: function() {
            return this.quantity > 0;
        }
    },
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative'],
        validate: {
            validator: function (v) {
                if (v === undefined || v === null) return true; // Optional field
                return v >= 0;
            },
            message: 'Weight must be a positive number'
        }
    }
}, {
    timestamps: true,
    versionKey: false
});

// Update inStock status automatically
productSchema.pre('save', function(next) {
    this.inStock = this.quantity > 0;
    next();
});

// Define indexes explicitly (no duplicates)
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;