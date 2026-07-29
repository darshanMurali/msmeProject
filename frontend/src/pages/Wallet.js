import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Wallet.css';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopup, setShowTopup] = useState(false);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWallet(response.data.data);
    } catch (error) {
      console.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/wallet/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Failed to load transactions');
    }
  };

  const handleTopup = async () => {
    if (!topupAmount || topupAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/wallet/topup', 
        { amount: parseFloat(topupAmount), paymentMethod: 'online' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Wallet topped up successfully!');
      setTopupAmount('');
      setShowTopup(false);
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to top up wallet');
    }
  };

  if (loading) return <div className="loading">Loading wallet...</div>;

  return (
    <div className="wallet-container">
      <h1>💰 My Wallet</h1>

      <div className="wallet-balance-card">
        <div className="balance-info">
          <p>Current Balance</p>
          <h2>₹{wallet?.balance.toFixed(2)}</h2>
        </div>
        <button className="btn-topup" onClick={() => setShowTopup(!showTopup)}>
          + Top Up
        </button>
      </div>

      {showTopup && (
        <div className="topup-form">
          <h3>Add Money to Wallet</h3>
          <div className="quick-amounts">
            {[100, 500, 1000, 2000].map(amount => (
              <button key={amount} onClick={() => setTopupAmount(amount.toString())}>
                ₹{amount}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Enter amount"
            value={topupAmount}
            onChange={(e) => setTopupAmount(e.target.value)}
          />
          <button className="btn-confirm" onClick={handleTopup}>
            Confirm Top Up
          </button>
        </div>
      )}

      <div className="transactions-section">
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="no-transactions">No transactions yet</p>
        ) : (
          <div className="transactions-list">
            {transactions.map(tx => (
              <div key={tx._id} className="transaction-item">
                <div className="tx-icon">
                  {tx.type === 'credit' ? '⬆️' : '⬇️'}
                </div>
                <div className="tx-details">
                  <p className="tx-description">{tx.description}</p>
                  <p className="tx-date">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
                <div className={`tx-amount ${tx.type}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
