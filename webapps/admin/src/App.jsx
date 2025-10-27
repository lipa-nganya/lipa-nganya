import { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7070';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [saccos, setSaccos] = useState([]);
  const [matatus, setMatatus] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [transactionStats, setTransactionStats] = useState({});
  const [transactionFilters, setTransactionFilters] = useState({
    status: '',
    limit: 50,
    offset: 0
  });
  
  // Form states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [saccoForm, setSaccoForm] = useState({ name: '' });
  const [matatuForm, setMatatuForm] = useState({ route_name: '', sacco_id: '' });
  const [driverForm, setDriverForm] = useState({ 
    name: '', 
    phone: '', 
    role: 'driver', 
    matatu_id: '', 
    pin: '' 
  });

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
        loadDashboardData();
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading admin dashboard data...');
      const [statsRes, saccosRes, matatusRes, driversRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/dashboard`),
        fetch(`${BACKEND_URL}/api/admin/saccos`),
        fetch(`${BACKEND_URL}/api/admin/matatus`),
        fetch(`${BACKEND_URL}/api/admin/drivers`)
      ]);

      const statsData = await statsRes.json();
      const saccosData = await saccosRes.json();
      const matatusData = await matatusRes.json();
      const driversData = await driversRes.json();

      console.log('✅ Dashboard data loaded:', {
        stats: statsData,
        saccos: saccosData.length,
        matatus: matatusData.length,
        drivers: driversData.length
      });

      setStats(statsData);
      setSaccos(saccosData);
      setMatatus(matatusData);
      setDrivers(driversData);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      alert('Failed to load dashboard data. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate wallet balances
  const recalculateWalletBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/wallet/recalculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Wallet balances recalculated successfully!');
        loadDashboardData(); // Reload dashboard data
      } else {
        alert('Failed to recalculate wallet balances: ' + data.error);
      }
    } catch (error) {
      console.error('❌ Error recalculating wallet balances:', error);
      alert('Failed to recalculate wallet balances');
    } finally {
      setLoading(false);
    }
  };

  // Load transactions data
  const loadTransactions = async () => {
    try {
      console.log('🔄 Loading transactions data...');
      const params = new URLSearchParams();
      if (transactionFilters.status) params.append('status', transactionFilters.status);
      params.append('limit', transactionFilters.limit);
      params.append('offset', transactionFilters.offset);
      
      const [transactionsRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/transactions?${params}`),
        fetch(`${BACKEND_URL}/api/transactions/stats`)
      ]);

      const transactionsData = await transactionsRes.json();
      const statsData = await statsRes.json();

      console.log('✅ Transactions data loaded:', {
        transactions: transactionsData.transactions?.length || 0,
        stats: statsData
      });

      setTransactions(transactionsData.transactions || []);
      setTransactionStats(statsData);
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
      alert('Failed to load transactions data. Please check if the backend is running.');
    }
  };

  // Handle transaction filter change
  const handleTransactionFilterChange = (filterType, value) => {
    setTransactionFilters(prev => ({
      ...prev,
      [filterType]: value,
      offset: 0 // Reset offset when filter changes
    }));
  };

  // Create sacco
  const createSacco = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/saccos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saccoForm)
      });
      
      if (response.ok) {
        setSaccoForm({ name: '' });
        loadDashboardData();
        alert('Sacco created successfully!');
      }
    } catch (error) {
      console.error('Error creating sacco:', error);
      alert('Failed to create sacco');
    }
  };

  // Create matatu
  const createMatatu = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/matatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matatuForm)
      });
      
      if (response.ok) {
        setMatatuForm({ route_name: '', sacco_id: '' });
        loadDashboardData();
        alert('Matatu created successfully!');
      }
    } catch (error) {
      console.error('Error creating matatu:', error);
      alert('Failed to create matatu');
    }
  };

  // Create driver/conductor
  const createDriver = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverForm)
      });
      
      if (response.ok) {
        setDriverForm({ name: '', phone: '', role: 'driver', matatu_id: '', pin: '' });
        loadDashboardData();
        alert(`${driverForm.role} created successfully!`);
      }
    } catch (error) {
      console.error('Error creating driver/conductor:', error);
      alert('Failed to create driver/conductor');
    }
  };

  // Delete driver/conductor
  const deleteDriver = async (id) => {
    if (!confirm('Are you sure you want to delete this driver/conductor?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/drivers/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadDashboardData();
        alert('Driver/conductor deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting driver/conductor:', error);
      alert('Failed to delete driver/conductor');
    }
  };

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Lipa Nganya Admin</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn-primary">Login</button>
          </form>
          <div className="login-info">
            <p><strong>Default credentials:</strong></p>
            <p>Username: admin</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  // Load transactions when transactions view is selected
  useEffect(() => {
    if (currentView === 'transactions') {
      loadTransactions();
    }
  }, [currentView]);

  // Load dashboard data when admin logs in
  useEffect(() => {
    if (isLoggedIn && currentView === 'dashboard') {
      loadDashboardData();
    }
  }, [isLoggedIn, currentView]);

  // Main admin interface
  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Lipa Nganya Admin Panel</h1>
        <button onClick={() => setIsLoggedIn(false)} className="btn-secondary">Logout</button>
      </header>

      <nav className="admin-nav">
        <button 
          className={currentView === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={currentView === 'saccos' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setCurrentView('saccos')}
        >
          Saccos
        </button>
        <button 
          className={currentView === 'matatus' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setCurrentView('matatus')}
        >
          Matatus
        </button>
        <button 
          className={currentView === 'drivers' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setCurrentView('drivers')}
        >
          Drivers & Conductors
        </button>
        <button 
          className={currentView === 'transactions' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setCurrentView('transactions')}
        >
          Transactions
        </button>
      </nav>

      <main className="admin-main">
        {/* Dashboard */}
        {currentView === 'dashboard' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <h2>Dashboard Overview</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={recalculateWalletBalances} className="btn-secondary" disabled={loading}>
                  {loading ? '⏳ Recalculating...' : '💰 Recalculate Wallets'}
                </button>
                <button onClick={loadDashboardData} className="btn-secondary" disabled={loading}>
                  {loading ? '⏳ Loading...' : '🔄 Refresh Data'}
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <p>Loading dashboard data...</p>
              </div>
            ) : (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Saccos</h3>
                    <p className="stat-number">{stats.saccos || 0}</p>
                    <p className="stat-description">Transport companies</p>
                  </div>
                  <div className="stat-card">
                    <h3>Matatus</h3>
                    <p className="stat-number">{stats.matatus || 0}</p>
                    <p className="stat-description">Active routes</p>
                  </div>
                  <div className="stat-card">
                    <h3>Drivers</h3>
                    <p className="stat-number">{stats.drivers || 0}</p>
                    <p className="stat-description">Licensed drivers</p>
                  </div>
                  <div className="stat-card">
                    <h3>Conductors</h3>
                    <p className="stat-number">{stats.conductors || 0}</p>
                    <p className="stat-description">Fare collectors</p>
                  </div>
                  <div className="stat-card">
                    <h3>Customers</h3>
                    <p className="stat-number">{stats.customers || 0}</p>
                    <p className="stat-description">Registered users</p>
                  </div>
                  <div className="stat-card">
                    <h3>Payments</h3>
                    <p className="stat-number">{stats.completedPayments || 0}</p>
                    <p className="stat-description">Successful transactions</p>
                  </div>
                </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-grid">
                <div className="activity-section">
                  <h4>Latest Saccos</h4>
                  <div className="activity-list">
                    {saccos.slice(0, 3).map(sacco => (
                      <div key={sacco.id} className="activity-item">
                        <span className="activity-name">{sacco.name}</span>
                        <span className="activity-date">
                          {new Date(sacco.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {saccos.length === 0 && (
                      <p className="no-data">No saccos found</p>
                    )}
                  </div>
                </div>
                
                <div className="activity-section">
                  <h4>Latest Matatus</h4>
                  <div className="activity-list">
                    {matatus.slice(0, 3).map(matatu => (
                      <div key={matatu.id} className="activity-item">
                        <span className="activity-name">{matatu.route_name}</span>
                        <span className="activity-subtitle">{matatu.sacco_name}</span>
                        <span className="activity-date">
                          {new Date(matatu.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {matatus.length === 0 && (
                      <p className="no-data">No matatus found</p>
                    )}
                  </div>
                </div>
                
                <div className="activity-section">
                  <h4>Latest Drivers & Conductors</h4>
                  <div className="activity-list">
                    {drivers.slice(0, 3).map(driver => (
                      <div key={driver.id} className="activity-item">
                        <span className="activity-name">{driver.name}</span>
                        <span className="activity-subtitle">
                          {driver.role} - {driver.route_name}
                        </span>
                        <span className="activity-date">
                          {new Date(driver.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {drivers.length === 0 && (
                      <p className="no-data">No drivers/conductors found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        )}

        {/* Saccos Management */}
        {currentView === 'saccos' && (
          <div className="saccos">
            <h2>Saccos Management</h2>
            
            <div className="form-section">
              <h3>Add New Sacco</h3>
              <form onSubmit={createSacco}>
                <div className="form-group">
                  <label>Sacco Name:</label>
                  <input
                    type="text"
                    value={saccoForm.name}
                    onChange={(e) => setSaccoForm({...saccoForm, name: e.target.value})}
                    placeholder="e.g., KBS Sacco"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">Create Sacco</button>
              </form>
            </div>

            <div className="list-section">
              <h3>Existing Saccos ({saccos.length})</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Matatus</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saccos.map(sacco => {
                      const matatuCount = matatus.filter(m => m.sacco_id === sacco.id).length;
                      return (
                        <tr key={sacco.id}>
                          <td className="id-cell">{sacco.id}</td>
                          <td className="name-cell">{sacco.name}</td>
                          <td className="count-cell">
                            <span className="count-badge">{matatuCount}</span>
                          </td>
                          <td className="date-cell">{new Date(sacco.created_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                    {saccos.length === 0 && (
                      <tr>
                        <td colSpan="4" className="no-data-cell">No saccos found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Matatus Management */}
        {currentView === 'matatus' && (
          <div className="matatus">
            <h2>Matatus Management</h2>
            
            <div className="form-section">
              <h3>Add New Matatu</h3>
              <form onSubmit={createMatatu}>
                <div className="form-group">
                  <label>Route Name:</label>
                  <input
                    type="text"
                    value={matatuForm.route_name}
                    onChange={(e) => setMatatuForm({...matatuForm, route_name: e.target.value})}
                    placeholder="e.g., CBD to Westlands"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sacco:</label>
                  <select
                    value={matatuForm.sacco_id}
                    onChange={(e) => setMatatuForm({...matatuForm, sacco_id: e.target.value})}
                    required
                  >
                    <option value="">Select Sacco</option>
                    {saccos.map(sacco => (
                      <option key={sacco.id} value={sacco.id}>{sacco.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary">Create Matatu</button>
              </form>
            </div>

            <div className="list-section">
              <h3>Existing Matatus</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Route</th>
                      <th>Sacco</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matatus.map(matatu => (
                      <tr key={matatu.id}>
                        <td>{matatu.id}</td>
                        <td>{matatu.route_name}</td>
                        <td>{matatu.sacco_name}</td>
                        <td>{new Date(matatu.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Drivers & Conductors Management */}
        {currentView === 'drivers' && (
          <div className="drivers">
            <h2>Drivers & Conductors Management</h2>
            
            <div className="form-section">
              <h3>Add New Driver/Conductor</h3>
              <form onSubmit={createDriver}>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={driverForm.name}
                    onChange={(e) => setDriverForm({...driverForm, name: e.target.value})}
                    placeholder="e.g., John Kamau"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="text"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({...driverForm, phone: e.target.value})}
                    placeholder="e.g., 254708374153"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    value={driverForm.role}
                    onChange={(e) => setDriverForm({...driverForm, role: e.target.value})}
                  >
                    <option value="driver">Driver</option>
                    <option value="conductor">Conductor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Matatu:</label>
                  <select
                    value={driverForm.matatu_id}
                    onChange={(e) => setDriverForm({...driverForm, matatu_id: e.target.value})}
                    required
                  >
                    <option value="">Select Matatu</option>
                    {matatus.map(matatu => (
                      <option key={matatu.id} value={matatu.id}>
                        {matatu.route_name} ({matatu.sacco_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>PIN:</label>
                  <input
                    type="text"
                    value={driverForm.pin}
                    onChange={(e) => setDriverForm({...driverForm, pin: e.target.value})}
                    placeholder="4-digit PIN (optional)"
                    maxLength="4"
                  />
                </div>
                <button type="submit" className="btn-primary">Create {driverForm.role}</button>
              </form>
            </div>

            <div className="list-section">
              <h3>Existing Drivers & Conductors</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Matatu</th>
                      <th>Sacco</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(driver => (
                      <tr key={driver.id}>
                        <td>{driver.id}</td>
                        <td>{driver.name}</td>
                        <td>{driver.phone}</td>
                        <td>
                          <span className={`role-badge ${driver.role}`}>
                            {driver.role}
                          </span>
                        </td>
                        <td>{driver.route_name}</td>
                        <td>{driver.sacco_name}</td>
                        <td>
                          <button 
                            onClick={() => deleteDriver(driver.id)}
                            className="btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Management */}
        {currentView === 'transactions' && (
          <div className="transactions-section">
            <div className="section-header">
              <h2>System Transactions</h2>
              <button onClick={loadTransactions} className="btn-secondary">
                🔄 Refresh Data
              </button>
            </div>

            {/* Transaction Statistics */}
            {transactionStats && Object.keys(transactionStats).length > 0 && (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Transactions</h3>
                  <p className="stat-number">{transactionStats.total_transactions || 0}</p>
                  <p className="stat-description">All time</p>
                </div>
                <div className="stat-card success">
                  <h3>Successful</h3>
                  <p className="stat-number">{transactionStats.successful_transactions || 0}</p>
                  <p className="stat-description">Completed payments</p>
                </div>
                <div className="stat-card warning">
                  <h3>Pending</h3>
                  <p className="stat-number">{transactionStats.pending_transactions || 0}</p>
                  <p className="stat-description">Awaiting confirmation</p>
                </div>
                <div className="stat-card danger">
                  <h3>Failed</h3>
                  <p className="stat-number">{transactionStats.failed_transactions || 0}</p>
                  <p className="stat-description">Unsuccessful payments</p>
                </div>
                <div className="stat-card">
                  <h3>Total Amount</h3>
                  <p className="stat-number">{(transactionStats.total_amount || 0).toLocaleString()}</p>
                  <p className="stat-description">KES processed</p>
                </div>
                <div className="stat-card">
                  <h3>Average Amount</h3>
                  <p className="stat-number">{(transactionStats.average_amount || 0).toFixed(0)}</p>
                  <p className="stat-description">KES per transaction</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <label htmlFor="status-filter">Filter by Status:</label>
                <select 
                  id="status-filter"
                  value={transactionFilters.status} 
                  onChange={(e) => handleTransactionFilterChange('status', e.target.value)}
                  className="form-select"
                >
                  <option value="">All Status</option>
                  <option value="success">Successful</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="limit-filter">Show:</label>
                <select 
                  id="limit-filter"
                  value={transactionFilters.limit} 
                  onChange={(e) => handleTransactionFilterChange('limit', parseInt(e.target.value))}
                  className="form-select"
                >
                  <option value="20">20 transactions</option>
                  <option value="50">50 transactions</option>
                  <option value="100">100 transactions</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="table-container">
              <h3>Transaction History ({transactions.length} shown)</h3>
              {transactions.length === 0 ? (
                <div className="no-data">
                  <p>No transactions found</p>
                </div>
              ) : (
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Matatu</th>
                      <th>Sacco</th>
                      <th>M-Pesa ID</th>
                      <th>Wallet Credited</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.id} className={`status-${transaction.status}`}>
                        <td>{transaction.id}</td>
                        <td>{transaction.customer_name || 'N/A'}</td>
                        <td>{transaction.phone}</td>
                        <td className="amount">{transaction.amount} KES</td>
                        <td>
                          <span className={`status-badge ${transaction.status}`}>
                            {transaction.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{transaction.route_name || 'N/A'}</td>
                        <td>{transaction.sacco_name || 'N/A'}</td>
                        <td className="mpesa-id">
                          {transaction.mpesa_transaction_id || 'N/A'}
                        </td>
                        <td>
                          {transaction.wallet_credited ? (
                            <span className="wallet-credited">✓ Yes</span>
                          ) : (
                            <span className="wallet-not-credited">✗ No</span>
                          )}
                        </td>
                        <td className="date">
                          {new Date(transaction.created_at).toLocaleDateString()}<br/>
                          <small>{new Date(transaction.created_at).toLocaleTimeString()}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Load More Button */}
            {transactions.length >= transactionFilters.limit && (
              <div className="load-more-section">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setTransactionFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }));
                    loadTransactions();
                  }}
                >
                  Load More Transactions
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;