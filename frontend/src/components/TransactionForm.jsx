import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, Tag, FileText, Plus, Save } from 'lucide-react';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Others'];
const EXPENSE_CATEGORIES = ['Food', 'Rent', 'Utilities', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Others'];

const TransactionForm = ({ isOpen, onClose, onSubmit, editingTransaction }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount);
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description || '');
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory(EXPENSE_CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setError('');
  }, [editingTransaction, isOpen]);

  // Adjust default category when type changes
  useEffect(() => {
    if (!editingTransaction) {
      setCategory(type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    }
  }, [type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Title is required');
    if (!amount || parseFloat(amount) <= 0) return setError('Amount must be greater than 0');
    if (!date) return setError('Date is required');

    const payload = {
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      description: description.trim()
    };

    onSubmit(payload);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Form Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-lg glass-panel p-6 rounded-3xl z-10 relative overflow-hidden backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-500/10 dark:border-white/5">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-500/10 dark:hover:bg-white/5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex bg-gray-500/5 dark:bg-white/5 p-1 rounded-xl border border-gray-500/10 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition duration-150 ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition duration-150 ${
                    type === 'income'
                      ? 'bg-emerald-500 text-white shadow'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Title & Amount (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grocery Shop"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full glass-input py-2.5 px-3.5 rounded-xl outline-none text-sm text-gray-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Amount (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                      <span className="text-xs font-semibold">₹</span>
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full glass-input py-2.5 pl-8 pr-3.5 rounded-xl outline-none text-sm text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Date (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Category
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                      <Tag className="w-4 h-4" />
                    </span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full glass-input py-2.5 pl-9 pr-3.5 rounded-xl outline-none text-sm text-gray-800 dark:text-white appearance-none cursor-pointer"
                    >
                      {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                        <option key={cat} value={cat} className="dark:bg-slate-900">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Date
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full glass-input py-2.5 pl-9 pr-3.5 rounded-xl outline-none text-sm text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                  Description (Optional)
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3 flex items-center text-gray-400 pointer-events-none">
                    <FileText className="w-4 h-4" />
                  </span>
                  <textarea
                    rows="3"
                    placeholder="Short description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full glass-input py-2.5 pl-9 pr-3.5 rounded-xl outline-none text-sm text-gray-800 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="flex gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-500/10 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-500/5 dark:hover:bg-white/5 transition text-sm font-semibold"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-semibold transition text-sm flex items-center justify-center gap-1.5 shadow-md"
                >
                  {editingTransaction ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingTransaction ? 'Save Changes' : 'Add Item'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionForm;
