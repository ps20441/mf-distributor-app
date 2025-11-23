import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [userName] = useState('Rajesh');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="text-2xl">☰</button>
            <h1 className="text-xl font-bold">Home</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button className="text-xl">🔍</button>
            <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold">Good Morning, {userName} 👋</h2>
        </div>

        {/* AUM Card */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="text-sm opacity-90 mb-2">💰 Total AUM</div>
          <div className="text-4xl font-bold mb-2">₹2,45,67,890</div>
          <div className="text-sm opacity-90">▲ +12.5% this month</div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-4">
            <button className="bg-white p-4 rounded-xl shadow hover:shadow-md transition text-center">
              <div className="text-3xl mb-2">👤</div>
              <div className="text-sm font-medium">Add Client</div>
            </button>
            <button className="bg-white p-4 rounded-xl shadow hover:shadow-md transition text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-sm font-medium">Place Order</div>
            </button>
            <button className="bg-white p-4 rounded-xl shadow hover:shadow-md transition text-center">
              <div className="text-3xl mb-2">💸</div>
              <div className="text-sm font-medium">Start SIP</div>
            </button>
            <button className="bg-white p-4 rounded-xl shadow hover:shadow-md transition text-center">
              <div className="text-3xl mb-2">📄</div>
              <div className="text-sm font-medium">Reports</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <a href="#" className="text-sm text-primary hover:text-blue-800">
              More ›
            </a>
          </div>
          <div className="bg-white rounded-xl shadow divide-y">
            <div className="p-4 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                ✓
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Order Executed</div>
                <div className="text-sm text-gray-600">Priya Sharma - SIP ₹5,000</div>
                <div className="text-sm text-gray-600">HDFC Equity Fund</div>
                <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
              </div>
            </div>
            <div className="p-4 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                ⚠
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Pending KYC</div>
                <div className="text-sm text-gray-600">Amit Verma</div>
                <div className="text-xs text-gray-400 mt-1">5 hours ago</div>
              </div>
            </div>
            <div className="p-4 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                💰
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Commission Received</div>
                <div className="text-sm text-gray-600">₹2,450 credited</div>
                <div className="text-xs text-gray-400 mt-1">Yesterday</div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Portfolio Performance</h3>
            <a href="#" className="text-sm text-primary hover:text-blue-800">
              More ›
            </a>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white text-lg">
              📊 Portfolio Chart (Last 30 days)
            </div>
          </div>
        </div>

        {/* Top Clients */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Performing Clients</h3>
            <a href="#" className="text-sm text-primary hover:text-blue-800">
              More ›
            </a>
          </div>
          <div className="bg-white rounded-xl shadow divide-y">
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">1. Priya Sharma</div>
                <div className="text-sm text-green-600">+15.2% 🟢</div>
              </div>
              <div className="text-lg font-bold">₹12,45,000</div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">2. Rajesh Kumar</div>
                <div className="text-sm text-green-600">+11.8% 🟢</div>
              </div>
              <div className="text-lg font-bold">₹9,87,650</div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-around">
          <button className="flex flex-col items-center text-primary">
            <span className="text-2xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-400 hover:text-gray-600">
            <span className="text-2xl">👥</span>
            <span className="text-xs mt-1">Clients</span>
          </button>
          <button className="flex flex-col items-center text-gray-400 hover:text-gray-600">
            <span className="text-2xl">📊</span>
            <span className="text-xs mt-1">Portfolio</span>
          </button>
          <button className="flex flex-col items-center text-gray-400 hover:text-gray-600">
            <span className="text-2xl">💰</span>
            <span className="text-xs mt-1">Commission</span>
          </button>
          <button className="flex flex-col items-center text-gray-400 hover:text-gray-600">
            <span className="text-2xl">⚙️</span>
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
