import React, { useState } from 'react';
import { 
  Search, Filter, Trash2, Edit3, ArrowUpRight, ArrowDownLeft, 
  ChevronDown, BookOpen, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Gift', 'Food', 
  'Rent', 'Utilities', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Others'
];

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  // Filter logic on client side for super reactive feel!
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === '' || t.category === categoryFilter;
    const matchesType = typeFilter === '' || t.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="glass-card p-6 rounded-2xl space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between pb-4 border-b border-gray-500/10 dark:border-white/5">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Transaction Ledger</span>
          </h3>
          <p className="text-xs text-gray-400">View and manage database transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full xl:w-auto">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by title/notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input py-2 pl-9 pr-4 rounded-xl outline-none text-sm text-gray-800 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full glass-input py-2 pl-9 pr-4 rounded-xl outline-none text-sm text-gray-800 dark:text-white appearance-none cursor-pointer"
            >
              <option value="" className="dark:bg-slate-900">All Types</option>
              <option value="expense" className="dark:bg-slate-900">Expenses</option>
              <option value="income" className="dark:bg-slate-900">Incomes</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <Sparkles className="w-4 h-4" />
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full glass-input py-2 pl-9 pr-4 rounded-xl outline-none text-sm text-gray-800 dark:text-white appearance-none cursor-pointer"
            >
              <option value="" className="dark:bg-slate-900">All Categories</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-500/10 dark:border-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
              <th className="pb-3 pl-2">Date</th>
              <th className="pb-3">Details</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Type</th>
              <th className="pb-3 text-right">Amount</th>
              <th className="pb-3 pr-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <motion.tr
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-gray-500/5 dark:border-white/5 hover:bg-gray-500/5 dark:hover:bg-white/5 transition group"
                  >
                    {/* Date */}
                    <td className="py-4 pl-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {new Date(t.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Title & Description */}
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-850 dark:text-white group-hover:text-indigo-400 transition">
                          {t.title}
                        </span>
                        {t.description && (
                          <span className="text-xs text-gray-450 dark:text-gray-400 mt-0.5 line-clamp-1 italic max-w-xs">
                            {t.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 text-sm">
                      <span className="px-2.5 py-1 rounded-full bg-gray-500/5 border border-gray-500/10 text-gray-500 dark:text-gray-300 text-xs font-semibold">
                        {t.category}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        t.type === 'income' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      }`}>
                        {t.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        <span className="capitalize">{t.type}</span>
                      </span>
                    </td>

                    {/* Amount */}
                    <td className={`py-4 text-right text-sm font-bold ${
                      t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(t)}
                          className="p-1.5 rounded-lg border border-indigo-500/10 bg-indigo-500/5 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/15 transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          className="p-1.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-500 dark:text-rose-400 hover:bg-rose-500/15 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No transactions found matching the filter criteria.
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
