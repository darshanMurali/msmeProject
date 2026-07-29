require('dotenv').config();
const mongoose = require('mongoose');
const FoodMenu = require('../models/FoodMenu');

const today = new Date();
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const seedFoodMenu = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel-ease');
    console.log('MongoDB connected');

    await FoodMenu.deleteMany({});
    console.log('Cleared existing food menus');

    const menus = [];

    // Create menu for today
    const todayMenu = {
      date: today,
      dayOfWeek: weekDays[today.getDay()],
      meals: [
        {
          mealType: 'breakfast',
          items: [
            { name: 'Idli', category: 'main_course', isVegetarian: true },
            { name: 'Sambar', category: 'side_dish', isVegetarian: true },
            { name: 'Coconut Chutney', category: 'side_dish', isVegetarian: true },
            { name: 'Tea/Coffee', category: 'beverage', isVegetarian: true }
          ],
          servingTime: { start: '7:00 AM', end: '9:00 AM' }
        },
        {
          mealType: 'lunch',
          items: [
            { name: 'Rice', category: 'main_course', isVegetarian: true },
            { name: 'Roti', category: 'main_course', isVegetarian: true },
            { name: 'Dal Fry', category: 'side_dish', isVegetarian: true },
            { name: 'Paneer Butter Masala', category: 'main_course', isVegetarian: true },
            { name: 'Mix Veg', category: 'side_dish', isVegetarian: true },
            { name: 'Curd', category: 'side_dish', isVegetarian: true },
            { name: 'Salad', category: 'side_dish', isVegetarian: true }
          ],
          servingTime: { start: '12:00 PM', end: '2:00 PM' }
        },
        {
          mealType: 'dinner',
          items: [
            { name: 'Rice', category: 'main_course', isVegetarian: true },
            { name: 'Chapati', category: 'main_course', isVegetarian: true },
            { name: 'Chicken Curry', category: 'main_course', isVegetarian: false },
            { name: 'Dal Tadka', category: 'side_dish', isVegetarian: true },
            { name: 'Raita', category: 'side_dish', isVegetarian: true },
            { name: 'Sweet Dish', category: 'dessert', isVegetarian: true }
          ],
          servingTime: { start: '7:00 PM', end: '9:00 PM' }
        }
      ],
      isActive: true
    };

    menus.push(todayMenu);

    // Create menus for the rest of the week
    for (let i = 1; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const menu = {
        date: date,
        dayOfWeek: weekDays[date.getDay()],
        meals: [
          {
            mealType: 'breakfast',
            items: [
              { name: 'Dosa', category: 'main_course', isVegetarian: true },
              { name: 'Sambar', category: 'side_dish', isVegetarian: true },
              { name: 'Chutney', category: 'side_dish', isVegetarian: true },
              { name: 'Tea/Coffee', category: 'beverage', isVegetarian: true }
            ],
            servingTime: { start: '7:00 AM', end: '9:00 AM' }
          },
          {
            mealType: 'lunch',
            items: [
              { name: 'Rice', category: 'main_course', isVegetarian: true },
              { name: 'Roti', category: 'main_course', isVegetarian: true },
              { name: 'Dal', category: 'side_dish', isVegetarian: true },
              { name: 'Vegetable Curry', category: 'main_course', isVegetarian: true },
              { name: 'Curd', category: 'side_dish', isVegetarian: true }
            ],
            servingTime: { start: '12:00 PM', end: '2:00 PM' }
          },
          {
            mealType: 'dinner',
            items: [
              { name: 'Rice', category: 'main_course', isVegetarian: true },
              { name: 'Chapati', category: 'main_course', isVegetarian: true },
              { name: 'Paneer Curry', category: 'main_course', isVegetarian: true },
              { name: 'Dal', category: 'side_dish', isVegetarian: true },
              { name: 'Raita', category: 'side_dish', isVegetarian: true }
            ],
            servingTime: { start: '7:00 PM', end: '9:00 PM' }
          }
        ],
        isActive: true
      };
      
      menus.push(menu);
    }

    const insertedMenus = await FoodMenu.insertMany(menus);
    console.log(`✅ Successfully seeded ${insertedMenus.length} food menus!`);

    console.log('\n📊 Food Menus Created:');
    insertedMenus.forEach(menu => {
      const breakfastMeal = menu.meals.find(m => m.mealType === 'breakfast');
      const lunchMeal = menu.meals.find(m => m.mealType === 'lunch');
      const dinnerMeal = menu.meals.find(m => m.mealType === 'dinner');
      
      console.log(`  ${menu.dayOfWeek} (${menu.date.toDateString()})`);
      console.log(`    - Breakfast: ${breakfastMeal?.items?.length || 0} items`);
      console.log(`    - Lunch: ${lunchMeal?.items?.length || 0} items`);
      console.log(`    - Dinner: ${dinnerMeal?.items?.length || 0} items`);
    });

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding food menu:', error);
    process.exit(1);
  }
};

seedFoodMenu();
