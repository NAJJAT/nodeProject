const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        minlength: [2, 'Category name must be at least 2 characters'],
        maxlength: [50, 'Category name cannot exceed 50 characters'],
        validate: {
            validator: function (v) {
                // Category name cannot contain numbers
                return /^[a-zA-Z\s\-&]+$/.test(v);
            },
            message: 'Category name can only contain letters, spaces, hyphens and ampersands'
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    productCount: {
        type: Number,
        default: 0,
        min: [0, 'Product count cannot be negative']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        validate: {
            validator: function (v) {
                return Number.isInteger(v);
            },
            message: 'Quantity must be a whole number'
        }
    }
}, {
    timestamps: true,
    versionKey: false
});

// Pre-save middleware to capitalize first letter
categorySchema.pre('save', function(next) {
    if (this.name) {
        this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
    }
    next();
});

// Define indexes explicitly (no duplicates)
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });
categorySchema.index({ quantity: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;