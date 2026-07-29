import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FoodMenu.css';

const FoodMenu = () => {
  const [todayMenu, setTodayMenu] = useState(null);
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [view, setView] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (view === 'today') {
      fetchTodayMenu();
    } else {
      fetchWeeklyMenu();
    }
  }, [view]);

  const fetchTodayMenu = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/food-menu', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayMenu(response.data.data[0]);
    } catch (error) {
      console.error('Failed to load today\'s menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyMenu = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/food-menu/weekly', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeeklyMenu(response.data.data);
    } catch (error) {
      console.error('Failed to load weekly menu');
    } finally {
      setLoading(false);
    }
  };

  const renderMeal = (meal) => (
    <div className="meal-section" key={meal.mealType}>
      <h3>
        {meal.mealType === 'breakfast' && '🍳'} 
        {meal.mealType === 'lunch' && '🍛'} 
        {meal.mealType === 'snacks' && '☕'} 
        {meal.mealType === 'dinner' && '🍽️'}
        {' '}{meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
      </h3>
      <p className="meal-time">{meal.servingTime.start} - {meal.servingTime.end}</p>
      <div className="meal-items">
        {meal.items.map((item, idx) => (
          <div className="menu-item" key={idx}>
            <div className="item-name">
              {item.isVegetarian && <span className="veg-badge">🌱</span>}
              {item.name}
            </div>
            {item.description && <p className="item-desc">{item.description}</p>}
            {item.nutritionalInfo && (
              <div className="nutrition-info">
                <span>🔥 {item.nutritionalInfo.calories} cal</span>
                <span>🥚 {item.nutritionalInfo.protein}g protein</span>
                <span>🍚 {item.nutritionalInfo.carbs}g carbs</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="loading">Loading menu...</div>;

  return (
    <div className="food-menu-container">
      <h1>🍽️ Food Menu</h1>

      <div className="menu-tabs">
        <button 
          className={view === 'today' ? 'active' : ''}
          onClick={() => setView('today')}
        >
          Today's Menu
        </button>
        <button 
          className={view === 'weekly' ? 'active' : ''}
          onClick={() => setView('weekly')}
        >
          Weekly Menu
        </button>
      </div>

      {view === 'today' && todayMenu && (
        <div className="today-menu">
          <div className="menu-header">
            <h2>{new Date(todayMenu.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
            {todayMenu.specialNotes && <p className="special-notes">📝 {todayMenu.specialNotes}</p>}
          </div>
          {todayMenu.meals.map(meal => renderMeal(meal))}
        </div>
      )}

      {view === 'weekly' && (
        <div className="weekly-menu">
          {weeklyMenu.length === 0 ? (
            <p className="no-menu">No weekly menu available</p>
          ) : (
            weeklyMenu.map(dayMenu => (
              <div className="day-menu" key={dayMenu._id}>
                <h2>{dayMenu.dayOfWeek}</h2>
                <p className="menu-date">{new Date(dayMenu.date).toLocaleDateString()}</p>
                {dayMenu.meals.map(meal => renderMeal(meal))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FoodMenu;
