import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Landmark, Calendar, Plus, 
  ChevronRight, AlertTriangle 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4'];

const Dashboard = ({ summaryData, currentMonth, setCurrentMonth, onAddClick }) => {
  const overall = summaryData?.overall || { total_income: 0.0, total_expense: 0.0, balance: 0.0 };
  const monthly = summaryData?.monthly || { total_income: 0.0, total_expense: 0.0, balance: 0.0, expense_categories: [], income_categories: [] };
  const trend = summaryData?.trend || [];

  // Prepare monthly trend data (formatting labels)
  const chartData = trend.map(t => {
    const [year, month] = t.month.split('-');
    const date = new Date(year, month - 1);
    const label = date.toLocaleString('default', { month: 'short' }) + ' ' + year.substring(2);
    return {
      name: label,
      Income: t.income,
      Expense: t.expense,
    };
  });

  // Prepare category data for PieChart
  const pieData = (monthly.expense_categories || []).map(cat => ({
    name: cat.category,
    value: cat.total
  }));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Upper Dashboard Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Workspace Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Financial analytics for the period of {new Date(currentMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Month selector */}
          <div className="relative w-full sm:w-auto">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="w-full sm:w-auto glass-input py-2 pl-9 pr-4 rounded-xl outline-none text-sm text-gray-800 dark:text-white"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onAddClick}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white text-sm font-semibold transition shadow-md shadow-indigo-500/25 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </motion.button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/15">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
              {formatCurrency(monthly.total_income)}
            </h3>
            <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
              Overall: {formatCurrency(overall.total_income)}
            </p>
          </div>
        </motion.div>

        {/* Expenses Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/15">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
              {formatCurrency(monthly.total_expense)}
            </h3>
            <p className="text-xs text-rose-500 dark:text-rose-400 mt-2 font-medium flex items-center gap-1">
              Overall: {formatCurrency(overall.total_expense)}
            </p>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Remaining Balance</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/15">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-3xl font-extrabold tracking-tight ${
              monthly.balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrency(monthly.balance)}
            </h3>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 font-medium flex items-center gap-1">
              Overall: {formatCurrency(overall.balance)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col"
        >
          <div className="mb-4">
            <h4 className="text-md font-bold text-gray-800 dark:text-white">Transaction History</h4>
            <p className="text-xs text-gray-400">Six-month comparison of earnings and spendings</p>
          </div>

          <div className="h-72 w-full flex-grow text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="Income" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="Expense" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown (Pie Chart) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 rounded-2xl flex flex-col justify-between"
        >
          <div>
            <h4 className="text-md font-bold text-gray-800 dark:text-white">Category Breakdown</h4>
            <p className="text-xs text-gray-400">Expense categories details this month</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-4">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-gray-400 py-6">
                <AlertTriangle className="w-8 h-8 mb-2 text-gray-500" />
                <span className="text-xs font-semibold">No expenses reported</span>
              </div>
            )}
          </div>

          {/* List of categories with values */}
          <div className="space-y-2 overflow-y-auto max-h-36 pr-1">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
