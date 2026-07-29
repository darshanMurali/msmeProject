import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchCart();
    fetchWallet();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data.data);
    } catch (error) {
      console.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWallet(response.data.data);
    } catch (error) {
      console.error('Failed to load wallet');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/cart/items/${itemId}`, 
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/cart/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    if (wallet.balance < cart.total) {
      alert('Insufficient wallet balance! Please top up your wallet first.');
      navigate('/student/wallet');
      return;
    }

    if (deliveryType === 'delivery' && !deliveryLocation) {
      alert('Please enter delivery location');
      return;
    }

    try {
      setCheckingOut(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/orders', 
        {
          paymentMethod: 'cashless',
          deliveryType,
          deliveryLocation: deliveryType === 'delivery' ? deliveryLocation : undefined,
          notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Order placed successfully! Order #${response.data.data.orderNumber}`);
      navigate('/student/orders');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <h2>🛒 Your Cart is Empty</h2>
        <p>Add some products to your cart to get started!</p>
        <button onClick={() => navigate('/student/shop')} className="btn-shop">
          Go Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>🛒 Shopping Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item._id} className="cart-item">
              <img src={item.product?.image || '/placeholder.jpg'} alt={item.product?.name} />
              <div className="item-details">
                <h3>{item.product?.name}</h3>
                <p className="item-price">₹{item.price} × {item.quantity}</p>
              </div>
              <div className="item-actions">
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
                <button className="btn-remove" onClick={() => removeItem(item._id)}>🗑️ Remove</button>
              </div>
              <div className="item-total">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          
          <div className="order-details-container">
            <div className="summary-item">
              <span className="summary-label">Subtotal:</span>
              <span className="summary-value">₹{cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tax (5%):</span>
              <span className="summary-value">₹{cart.tax.toFixed(2)}</span>
            </div>
            <div className="summary-item total">
              <span className="summary-label">Total:</span>
              <span className="summary-value">₹{cart.total.toFixed(2)}</span>
            </div>

            <div className="wallet-info">
              <div>
                <span>Wallet Balance</span>
                <span className={wallet?.balance >= cart.total ? 'sufficient' : 'insufficient'}>
                  ₹{wallet?.balance.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="delivery-options">
              <h3>Delivery Options</h3>
              <label>
                <input 
                  type="radio" 
                  value="pickup" 
                  checked={deliveryType === 'pickup'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                Pickup from Counter
              </label>
              <label>
                <input 
                  type="radio" 
                  value="delivery" 
                  checked={deliveryType === 'delivery'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                Deliver to Room
              </label>

              {deliveryType === 'delivery' && (
                <input
                  type="text"
                  placeholder="Enter room number"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="delivery-input"
                />
              )}
            </div>
          </div>

          <textarea
            placeholder="Add notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="order-notes"
          />

          <button 
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={checkingOut || (wallet?.balance < cart.total)}
          >
            {checkingOut ? 'Processing...' : 'Place Order'}
          </button>

          {wallet?.balance < cart.total && (
            <p className="insufficient-warning">
              ⚠️ Insufficient balance. <a href="/student/wallet">Top up wallet</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
