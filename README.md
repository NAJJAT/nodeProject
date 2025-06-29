# Node.js Categories & Products API

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v4.21+-blue.svg)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://mongodb.com)


A robust, database-driven REST API built with Node.js and Express that provides complete CRUD operations for product category management with advanced validation, search capabilities, and referential integrity.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)
- [Project Structure](#project-structure)



## 🎯 Overview

This project implements a professional-grade REST API for managing product categories and their associated products. The system demonstrates enterprise-level patterns including data validation, referential integrity, pagination, search functionality, and comprehensive error handling.

### Key Business Logic
- **Categories** serve as organizational units for products with quantity tracking
- **Products** must belong to valid categories, ensuring data consistency
- **Automatic calculations** maintain product counts and stock status
- **Cascade protection** prevents data orphaning

## ✨ Features

### Core Functionality
- ✅ **Complete CRUD Operations** - Full Create, Read, Update, Delete for both entities
- ✅ **Referential Integrity** - Enforced relationships between categories and products
- ✅ **Advanced Validation** - Custom business rules and data format validation
- ✅ **Search & Filtering** - Multi-field search with case-insensitive matching
- ✅ **Pagination** - Efficient data retrieval with limit/offset support
- ✅ **Sorting** - Flexible sorting by any field in ascending/descending order

### Advanced Features
- 🔄 **Auto-calculated Fields** - Dynamic product counts and stock status
- 🛡️ **Data Integrity** - Cascade protection and validation
- 📊 **Comprehensive Logging** - Request tracking and error monitoring
- 📚 **Interactive Documentation** - Self-documenting API at root endpoint
- 🚀 **Performance Optimized** - Database indexing and efficient queries

## 🛠️ Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript runtime environment |
| **Framework** | Express.js | 4.21+ | Web application framework |
| **Database** | MongoDB | Atlas | NoSQL document database |
| **ODM** | Mongoose | 8.9+ | Object Document Mapping |
| **Validation** | Custom | - | Business rule enforcement |
| **Development** | Nodemon | 3.1+ | Development auto-restart |

## 🚀 Installation

### Prerequisites
```bash
# Required software
Node.js >= 20.0.0
npm >= 10.0.0
MongoDB Atlas account (or local MongoDB)
Git
```

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/node-api-project.git
cd node-api-project

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Verify installation
curl http://localhost:3000/
```

### Environment Setup
The application connects to MongoDB Atlas using the connection string configured in `server.js`. For production use, consider using environment variables:

```javascript
// Recommended: Use environment variables
const mongoURI = process.env.MONGODB_URI || 'your-connection-string';
```

## 📖 API Documentation

### Base URL
```
http://localhost:3000
```

### Categories Endpoints

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/categories` | Retrieve all categories | `limit`, `offset`, `sortBy`, `order` |
| `GET` | `/categories/:id` | Get specific category | `id` (Category ID) |
| `POST` | `/categories` | Create new category | Request body |
| `PUT` | `/categories/:id` | Update category | `id`, Request body |
| `DELETE` | `/categories/:id` | Delete category | `id` (Category ID) |

#### Category Search Endpoints
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/categories/search-by-name/:name` | Search by name | `name` (Search term) |
| `GET` | `/categories/search/:field/:value` | Search by field | `field`, `value`, `limit`, `offset` |

**Searchable Fields:** `name`, `quantity`, `isActive`

### Products Endpoints

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/products` | Retrieve all products | `limit`, `offset`, `sortBy`, `order` |
| `GET` | `/products/:id` | Get specific product | `id` (Product ID) |
| `POST` | `/products` | Create new product | Request body |
| `PUT` | `/products/:id` | Update product | `id`, Request body |
| `DELETE` | `/products/:id` | Delete product | `id` (Product ID) |

#### Product Search Endpoints
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/products/search-by-name/:name` | Search by name | `name` (Search term) |
| `GET` | `/products/search-by-category/:categoryId` | Search by category | `categoryId`, `limit`, `offset` |
| `GET` | `/products/search/:field/:value` | Search by field | `field`, `value`, `limit`, `offset` |

**Searchable Fields:** `name`, `price`, `quantity`, `sku`, `inStock`

## 🗄️ Database Schema

### Category Model
```javascript
{
  _id: ObjectId,              // Auto-generated unique identifier
  name: String,               // Required, unique, 2-50 chars, letters/spaces/hyphens
  description: String,        // Optional, max 200 characters
  quantity: Number,           // Required, non-negative integer
  isActive: Boolean,          // Default: true
  productCount: Number,       // Auto-calculated, tracks associated products
  createdAt: Date,           // Auto-generated timestamp
  updatedAt: Date            // Auto-updated timestamp
}
```

### Product Model
```javascript
{
  _id: ObjectId,              // Auto-generated unique identifier
  name: String,               // Required, 2-100 chars, cannot be only numbers
  quantity: Number,           // Required, non-negative integer
  price: Number,              // Required, positive, max 2 decimal places
  category: ObjectId,         // Required, references Category._id
  image: String,              // Optional, valid image URL
  description: String,        // Optional, max 500 characters
  sku: String,                // Optional, unique, uppercase/numbers/hyphens
  weight: Number,             // Optional, positive number
  inStock: Boolean,           // Auto-calculated from quantity > 0
  createdAt: Date,           // Auto-generated timestamp
  updatedAt: Date            // Auto-updated timestamp
}
```

### Relationships
- **One-to-Many:** Category → Products
- **Foreign Key:** Product.category → Category._id
- **Cascade Rules:** Cannot delete Category with existing Products

## 💡 Usage Examples

### Creating a Category
```javascript
POST /categories
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "quantity": 100,
  "isActive": true
}

// Response: 201 Created
{
  "message": "Category created successfully",
  "category": {
    "_id": "677exxxxxxxxxxxxxxxxxx",
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "quantity": 100,
    "isActive": true,
    "productCount": 0,
    "createdAt": "2025-01-08T10:30:45.123Z",
    "updatedAt": "2025-01-08T10:30:45.123Z"
  }
}
```

### Creating a Product
```javascript
POST /products
Content-Type: application/json

{
  "name": "Wireless Gaming Mouse",
  "quantity": 25,
  "price": 79.99,
  "category": "677exxxxxxxxxxxxxxxxxx",
  "sku": "MOUSE-WL-001",
  "description": "RGB wireless gaming mouse with precision tracking",
  "image": "https://example.com/images/gaming-mouse.jpg",
  "weight": 0.15
}

// Response: 201 Created
{
  "message": "Product created successfully",
  "product": {
    "_id": "677fxxxxxxxxxxxxxxxxxx",
    "name": "Wireless Gaming Mouse",
    "quantity": 25,
    "price": 79.99,
    "category": {
      "_id": "677exxxxxxxxxxxxxxxxxx",
      "name": "Electronics",
      "description": "Electronic devices and gadgets",
      "quantity": 100
    },
    "sku": "MOUSE-WL-001",
    "description": "RGB wireless gaming mouse with precision tracking",
    "image": "https://example.com/images/gaming-mouse.jpg",
    "weight": 0.15,
    "inStock": true,
    "createdAt": "2025-01-08T10:35:22.456Z",
    "updatedAt": "2025-01-08T10:35:22.456Z"
  }
}
```

### Advanced Search Examples
```bash
# Search products by name (case-insensitive)
GET /products/search-by-name/wireless

# Get products in specific category with pagination
GET /products/search-by-category/677exxxxxxxxxxxxxxxxxx?limit=5&offset=0

# Search categories by quantity
GET /categories/search/quantity/100

# Get all products sorted by price (descending) with pagination
GET /products?limit=10&offset=0&sortBy=price&order=desc
```

## 🧪 Testing

### Manual Testing with cURL

#### Test Categories
```bash
# Create category
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Books", "quantity": 50, "description": "Educational materials"}'

# Get all categories
curl http://localhost:3000/categories

# Search categories
curl http://localhost:3000/categories/search-by-name/books
```

#### Test Products
```bash
# Create product (replace category ID)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "JavaScript Guide", "quantity": 10, "price": 29.99, "category": "CATEGORY_ID"}'

# Search products
curl http://localhost:3000/products/search-by-name/javascript
```

### Automated Testing
The project includes validation testing through API requests. Recommended testing tools:
- **Postman** - For interactive API testing
- **Insomnia** - Alternative REST client
- **Jest** - For unit testing (future enhancement)

### Test Scenarios
1. **CRUD Operations** - Create, read, update, delete for both entities
2. **Validation Testing** - Submit invalid data to verify error handling
3. **Relationship Testing** - Verify category-product relationships
4. **Search Testing** - Test all search endpoints with various queries
5. **Pagination Testing** - Verify limit/offset functionality
6. **Edge Cases** - Test with boundary values and error conditions

## ✅ Validation Rules

### Category Validation
| Field | Rule | Description |
|-------|------|-------------|
| `name` | Required, Unique | 2-50 characters, letters/spaces/hyphens/ampersands only |
| `description` | Optional | Maximum 200 characters |
| `quantity` | Required | Non-negative integer |
| `isActive` | Optional | Boolean, defaults to `true` |

### Product Validation
| Field | Rule | Description |
|-------|------|-------------|
| `name` | Required | 2-100 characters, cannot consist only of numbers |
| `quantity` | Required | Non-negative integer |
| `price` | Required | Positive number, maximum 2 decimal places |
| `category` | Required | Must reference existing category ID |
| `sku` | Optional, Unique | Uppercase letters, numbers, hyphens only |
| `image` | Optional | Valid image URL (.jpg, .jpeg, .png, .gif, .webp, .svg) |
| `description` | Optional | Maximum 500 characters |
| `weight` | Optional | Positive number |

### Business Rules
- Products cannot exist without valid categories
- Categories with existing products cannot be deleted
- Product counts in categories update automatically
- Stock status calculated from quantity (inStock = quantity > 0)

## 🚨 Error Handling

### HTTP Status Codes
| Code | Description | Example Scenario |
|------|-------------|------------------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Validation errors, invalid data |
| `404` | Not Found | Resource doesn't exist |
| `500` | Internal Server Error | Database or server issues |

### Error Response Format
```javascript
{
  "error": "Descriptive error message explaining what went wrong"
}
```

### Common Error Examples
```javascript
// Validation Error
{
  "error": "Category validation failed: quantity: Quantity is required"
}

// Not Found Error
{
  "error": "Product not found"
}

// Business Rule Violation
{
  "error": "Cannot delete category. It has 3 product(s). Delete products first."
}

// Referential Integrity Error
{
  "error": "Category does not exist"
}
```

## 📁 Project Structure

```
node-api-project/
├── models/                     # Database models
│   ├── categoryModel.js       # Category schema and validation
│   └── productModel.js        # Product schema and validation
├── server.js                  # Main application file
├── index.html                 # API documentation (served at /)
├── package.json               # Dependencies and scripts
├── package-lock.json          # Dependency lock file
├── README.md                  # Project documentation
├── .gitignore                 # Git ignore rules


### Key Files Description
- **`server.js`** - Express application with all routes and middleware
- **`models/`** - Mongoose schemas with validation and business logic
- **`index.html`** - Interactive API documentation served at root
- **`package.json`** - Project configuration and dependencies

## 🔧 Development

### Available Scripts
```bash
npm run serve    # Start production server
npm run dev      # Start development server with auto-restart
npm start        # Alternative production start command
```

### Development Workflow
1. **Start development server:** `npm run dev`
2. **Make changes** to code files
3. **Server auto-restarts** on file changes
4. **Test changes** using API documentation at `http://localhost:3000`
5. **Commit changes** with descriptive messages

### Code Standards
- **ES6+ JavaScript** with modern syntax
- **RESTful API design** following HTTP standards
- **Comprehensive error handling** with appropriate status codes
- **Input validation** at multiple levels
- **Consistent naming conventions** for routes and variables


## 🙏 Acknowledgments

### Technologies & Resources
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - Flexible, scalable NoSQL database
- **Mongoose** - Elegant MongoDB object modeling

### Educational Resources
- **Express.js Documentation** - API design patterns and best practices
- **Mongoose Documentation** - Database modeling and validation
- **MongoDB Atlas** - Cloud database setup and management
- **REST API Design** - Industry standard API design principles

---

** using Node.js, Express, and MongoDB**
