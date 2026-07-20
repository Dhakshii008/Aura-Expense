import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import { motion } from 'framer-motion';

function MainApp() {
  const { token, loading, logout, getAuthHeaders } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7)); // YYYY-MM
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions', {
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        console.warn("[DEBUG FRONTEND App] fetchTransactions returned 401. Logging out...");
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`/api/transactions/summary?month=${currentMonth}`, {
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        console.warn("[DEBUG FRONTEND App] fetchSummary returned 401. Logging out...");
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const loadAllData = async () => {
    if (!token) return;
    setDataLoading(true);
    await Promise.all([fetchTransactions(), fetchSummary()]);
    setDataLoading(false);
  };

  // Re-fetch all data when token or month changes
  useEffect(() => {
    loadAllData();
  }, [token, currentMonth]);

  const handleFormSubmit = async (payload) => {
    console.log("[DEBUG FRONTEND App] handleFormSubmit payload:", payload);
    try {
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction.id}` 
        : '/api/transactions';
      const method = editingTransaction ? 'PUT' : 'POST';

      const headers = getAuthHeaders();
      console.log("[DEBUG FRONTEND App] handleFormSubmit headers being sent:", headers);

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      console.log("[DEBUG FRONTEND App] handleFormSubmit response status:", res.status);

      if (res.status === 401) {
        console.warn("[DEBUG FRONTEND App] handleFormSubmit returned 401. Logging out...");
        logout();
        return;
      }

      if (res.ok) {
        setIsFormOpen(false);
        setEditingTransaction(null);
        loadAllData();
      } else {
        const errData = await res.json();
        console.error("[DEBUG FRONTEND App] handleFormSubmit error response data:", errData);
        alert(errData.error || 'Operation failed');
      }
    } catch (err) {
      console.error('[DEBUG FRONTEND App] Submit transaction error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        console.warn("[DEBUG FRONTEND App] handleDelete returned 401. Logging out...");
        logout();
        return;
      }
      if (res.ok) {
        loadAllData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete transaction');
      }
    } catch (err) {
      console.error('Delete transaction error:', err);
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading AuraExpense...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen relative pb-12 transition-colors duration-300">
      {/* Background radial accent highlights */}
      <div className="absolute top-[5%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[130px] dark:bg-indigo-600/5 pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[5%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/10 blur-[130px] dark:bg-emerald-600/5 pointer-events-none animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 z-10 relative">
        {/* Dashboard Grid */}
        <Dashboard 
          summaryData={summaryData} 
          currentMonth={currentMonth} 
          setCurrentMonth={setCurrentMonth} 
          onAddClick={() => {
            setEditingTransaction(null);
            setIsFormOpen(true);
          }}
        />

        {/* Ledger Table */}
        <div className="relative">
          {dataLoading && (
            <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-xs flex items-center justify-center rounded-2xl z-30">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
            </div>
          )}
          <TransactionList 
            transactions={transactions} 
            onEdit={handleEditClick} 
            onDelete={handleDelete}
          />
        </div>
      </main>

      {/* Dynamic Slide-in Modal */}
      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }} 
        onSubmit={handleFormSubmit}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
