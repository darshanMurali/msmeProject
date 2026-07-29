require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  // Canteen Items
  {
    name: 'Samosa',
    description: 'Crispy fried samosa with potato filling',
    price: 15,
    category: 'canteen',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
    isAvailable: true
  },
  {
    name: 'Tea',
    description: 'Hot tea with milk',
    price: 10,
    category: 'canteen',
    stock: 200,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
    isAvailable: true
  },
  {
    name: 'Coffee',
    description: 'Hot coffee',
    price: 15,
    category: 'canteen',
    stock: 150,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    isAvailable: true
  },
  {
    name: 'Vada Pav',
    description: 'Mumbai style vada pav',
    price: 20,
    category: 'canteen',
    stock: 80,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
    isAvailable: true
  },
  {
    name: 'Sandwich',
    description: 'Vegetable grilled sandwich',
    price: 30,
    category: 'canteen',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
    isAvailable: true
  },
  {
    name: 'Maggi',
    description: 'Hot masala maggi',
    price: 25,
    category: 'canteen',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
    isAvailable: true
  },
  {
    name: 'Soft Drink',
    description: 'Chilled soft drink',
    price: 20,
    category: 'canteen',
    stock: 120,
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400',
    isAvailable: true
  },
  {
    name: 'Biscuits Pack',
    description: 'Assorted biscuits',
    price: 30,
    category: 'canteen',
    stock: 90,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    isAvailable: true
  },
  
  // Stationary Items
  {
    name: 'Notebook (Single)',
    description: 'Single line ruled notebook - 100 pages',
    price: 40,
    category: 'stationary',
    stock: 150,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400',
    isAvailable: true
  },
  {
    name: 'Pen Set (5 pcs)',
    description: 'Blue ballpoint pens - pack of 5',
    price: 50,
    category: 'stationary',
    stock: 200,
    image: 'https://images.unsplash.com/photo-1586182987320-4f376d39d787?w=400',
    isAvailable: true
  },
  {
    name: 'Pencil Set',
    description: 'HB pencils with eraser - pack of 10',
    price: 30,
    category: 'stationary',
    stock: 180,
    image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
    isAvailable: true
  },
  {
    name: 'A4 Papers (100 sheets)',
    description: 'White A4 printing paper',
    price: 200,
    category: 'stationary',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400',
    isAvailable: true
  },
  {
    name: 'File Folder',
    description: 'Plastic file folder with clips',
    price: 25,
    category: 'stationary',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1544384723-b196a08a8a43?w=400',
    isAvailable: true
  },
  {
    name: 'Highlighters (4 colors)',
    description: 'Fluorescent highlighters',
    price: 80,
    category: 'stationary',
    stock: 70,
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400',
    isAvailable: true
  },
  {
    name: 'Correction Pen',
    description: 'White correction fluid pen',
    price: 15,
    category: 'stationary',
    stock: 120,
    image: 'https://images.unsplash.com/photo-1615453840897-29de2e6c7d6b?w=400',
    isAvailable: true
  },
  {
    name: 'Stapler with Pins',
    description: 'Standard stapler with pin box',
    price: 100,
    category: 'stationary',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1611117775350-ac3950990985?w=400',
    isAvailable: true
  },

  // Bedding Items
  {
    name: 'Bedsheet Set',
    description: 'Cotton bedsheet with pillow covers',
    price: 500,
    category: 'bedding',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?w=400',
    isAvailable: true
  },
  {
    name: 'Pillow',
    description: 'Soft fiber pillow',
    price: 200,
    category: 'bedding',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400',
    isAvailable: true
  },
  {
    name: 'Blanket',
    description: 'Warm fleece blanket',
    price: 400,
    category: 'bedding',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    isAvailable: true
  },
  {
    name: 'Towel Set (2 pcs)',
    description: 'Cotton bath towels',
    price: 250,
    category: 'bedding',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400',
    isAvailable: true
  },
  {
    name: 'Mattress Protector',
    description: 'Waterproof mattress protector',
    price: 300,
    category: 'bedding',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
    isAvailable: true
  },

  // Toiletries
  {
    name: 'Soap (3 pack)',
    description: 'Bathing soap bars',
    price: 75,
    category: 'toiletries',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400',
    isAvailable: true
  },
  {
    name: 'Shampoo Bottle',
    description: 'Hair shampoo 200ml',
    price: 150,
    category: 'toiletries',
    stock: 80,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',
    isAvailable: true
  },
  {
    name: 'Toothpaste',
    description: 'Fluoride toothpaste 100g',
    price: 50,
    category: 'toiletries',
    stock: 120,
    image: 'https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=400',
    isAvailable: true
  },
  {
    name: 'Toothbrush',
    description: 'Soft bristle toothbrush',
    price: 30,
    category: 'toiletries',
    stock: 150,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400',
    isAvailable: true
  },
  {
    name: 'Face Wash',
    description: 'Deep cleansing face wash',
    price: 120,
    category: 'toiletries',
    stock: 70,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    isAvailable: true
  },
  {
    name: 'Deodorant',
    description: 'Body spray deodorant',
    price: 180,
    category: 'toiletries',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400',
    isAvailable: true
  },
  {
    name: 'Hand Sanitizer',
    description: 'Alcohol-based hand sanitizer 200ml',
    price: 80,
    category: 'toiletries',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400',
    isAvailable: true
  },
  {
    name: 'Tissues Box',
    description: 'Facial tissues 100 pulls',
    price: 40,
    category: 'toiletries',
    stock: 90,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    isAvailable: true
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel-ease');
    console.log('MongoDB connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products!`);

    // Show summary
    const summary = {};
    insertedProducts.forEach(p => {
      summary[p.category] = (summary[p.category] || 0) + 1;
    });

    console.log('\n📊 Products by Category:');
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
