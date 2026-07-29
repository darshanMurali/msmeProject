import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productAPI, cartAPI } from '../services/api';
import './Shop.css';
import { Link } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = category === 'all' ? {} : { category };
      const response = await productAPI.getProducts(params);
      setProducts(response.data.data);
    } catch (error) {
      showMessage('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data.data);
    } catch (error) {
      console.error('Failed to load cart');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToCart = async (productId) => {
    try {
      await cartAPI.addToCart({ productId, quantity: 1 });
      showMessage('success', 'Added to cart!');
      fetchCart();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>🛒 Shop</h1>
        <p>Browse and purchase canteen items, stationary, and more</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="shop-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          <button 
            className={category === 'all' ? 'active' : ''}
            onClick={() => setCategory('all')}
          >
            All
          </button>
          <button 
            className={category === 'canteen' ? 'active' : ''}
            onClick={() => setCategory('canteen')}
          >
            🍽️ Canteen
          </button>
          <button 
            className={category === 'stationary' ? 'active' : ''}
            onClick={() => setCategory('stationary')}
          >
            📚 Stationary
          </button>
          <button 
            className={category === 'bedding' ? 'active' : ''}
            onClick={() => setCategory('bedding')}
          >
            🛏️ Bedding
          </button>
          <button 
            className={category === 'toiletries' ? 'active' : ''}
            onClick={() => setCategory('toiletries')}
          >
            🧴 Toiletries
          </button>
        </div>
      </div>

      {cart && (
        <div className="cart-summary">
          <span>🛒 Cart: {cart.items.length} items</span>
          <span>Total: ₹{cart.total?.toFixed(2) || '0.00'}</span>
          <Link to="/student/cart" className="btn-view-cart">View Cart</Link>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products">No products found</div>
          ) : (
            filteredProducts.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <img src={product.image || '/placeholder-product.jpg'} alt={product.name} />
                  {product.discount > 0 && (
                    <span className="discount-badge">-{product.discount}%</span>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">
                    {product.discount > 0 ? (
                      <>
                        <span className="original-price">₹{product.price}</span>
                        <span className="final-price">₹{(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="final-price">₹{product.price}</span>
                    )}
                  </div>
                  <div className="product-stock">
                    {product.stock > 0 ? (
                      <span className="in-stock">✓ In Stock ({product.stock})</span>
                    ) : (
                      <span className="out-of-stock">✗ Out of Stock</span>
                    )}
                  </div>
                  <button
                    className="btn-add-to-cart"
                    onClick={() => addToCart(product._id)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Shop;
