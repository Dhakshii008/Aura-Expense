import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
import jwt
import sqlite3
import datetime
from functools import wraps
from database import get_db_connection, init_db

app = Flask(__name__)
CORS(app)

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-expense-tracker-987654')

# Initialize DB on start
init_db()

# JWT Token decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        print(f"[DEBUG APP] Authorization Header: {auth_header}")
        
        if auth_header:
            try:
                parts = auth_header.split(" ")
                if len(parts) == 2 and parts[0].lower() == 'bearer':
                    token = parts[1]
                else:
                    print(f"[DEBUG APP] Bad Authorization header format: {parts}")
            except Exception as e:
                print(f"[DEBUG APP] Error splitting Auth header: {str(e)}")
        
        if not token:
            print("[DEBUG APP] Token is missing from request headers")
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            print(f"[DEBUG APP] Decoding token: {token[:15]}... [Length: {len(token)}]")
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user_id = int(data['sub'])
            print(f"[DEBUG APP] Token successfully decoded. User ID: {current_user_id}")
        except jwt.ExpiredSignatureError as e:
            print(f"[DEBUG APP] Expired signature exception: {str(e)}")
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            print(f"[DEBUG APP] Invalid token exception: {str(e)}")
            return jsonify({'error': 'Invalid token'}), 401
            
        return f(current_user_id, *args, **kwargs)
    return decorated

# Helper to serialize sqlite Row
def row_to_dict(row):
    return dict(row) if row else None

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    username = data['username'].strip()
    password = data['password']
    
    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters long'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            (username, password_hash)
        )
        conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400
    finally:
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    username = data['username'].strip()
    password = data['password']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = row_to_dict(cursor.fetchone())
    conn.close()
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Generate JWT
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow(),
        'sub': str(user['id'])
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username']
        }
    }), 200

# Transaction Routes
@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions(current_user_id):
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    txn_type = request.args.get('type', '').strip()
    
    query = 'SELECT * FROM transactions WHERE user_id = ?'
    params = [current_user_id]
    
    if search:
        query += ' AND (title LIKE ? OR description LIKE ?)'
        params.extend([f'%{search}%', f'%{search}%'])
    if category:
        query += ' AND category = ?'
        params.append(category)
    if txn_type:
        query += ' AND type = ?'
        params.append(txn_type)
        
    query += ' ORDER BY date DESC, id DESC'
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    transactions = [row_to_dict(row) for row in rows]
    return jsonify(transactions), 200

@app.route('/api/transactions', methods=['POST'])
@token_required
def add_transaction(current_user_id):
    data = request.get_json()
    if not data or not data.get('title') or data.get('amount') is None or not data.get('category') or not data.get('date') or not data.get('type'):
        return jsonify({'error': 'Missing required fields'}), 400
        
    title = data['title'].strip()
    try:
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than zero'}), 400
    except ValueError:
        return jsonify({'error': 'Amount must be a number'}), 400
        
    category = data['category'].strip()
    date = data['date'].strip()  # YYYY-MM-DD
    description = data.get('description', '').strip()
    txn_type = data['type'].strip()  # 'income' or 'expense'
    
    if txn_type not in ['income', 'expense']:
        return jsonify({'error': 'Type must be income or expense'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO transactions (user_id, title, amount, category, date, description, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (current_user_id, title, amount, category, date, description, txn_type)
    )
    conn.commit()
    new_id = cursor.lastrowid
    
    cursor.execute('SELECT * FROM transactions WHERE id = ?', (new_id,))
    new_txn = row_to_dict(cursor.fetchone())
    conn.close()
    
    return jsonify(new_txn), 201

@app.route('/api/transactions/<int:txn_id>', methods=['PUT'])
@token_required
def update_transaction(current_user_id, txn_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM transactions WHERE id = ? AND user_id = ?', (txn_id, current_user_id))
    txn = cursor.fetchone()
    
    if not txn:
        conn.close()
        return jsonify({'error': 'Transaction not found'}), 404
        
    data = request.get_json()
    if not data:
        conn.close()
        return jsonify({'error': 'No data provided'}), 400
        
    title = data.get('title', txn['title']).strip()
    try:
        amount = float(data.get('amount', txn['amount']))
        if amount <= 0:
            conn.close()
            return jsonify({'error': 'Amount must be greater than zero'}), 400
    except ValueError:
        conn.close()
        return jsonify({'error': 'Amount must be a number'}), 400
        
    category = data.get('category', txn['category']).strip()
    date = data.get('date', txn['date']).strip()
    description = data.get('description', txn['description']).strip()
    txn_type = data.get('type', txn['type']).strip()
    
    if txn_type not in ['income', 'expense']:
        conn.close()
        return jsonify({'error': 'Type must be income or expense'}), 400
        
    cursor.execute(
        'UPDATE transactions SET title = ?, amount = ?, category = ?, date = ?, description = ?, type = ? WHERE id = ?',
        (title, amount, category, date, description, txn_type, txn_id)
    )
    conn.commit()
    
    cursor.execute('SELECT * FROM transactions WHERE id = ?', (txn_id,))
    updated_txn = row_to_dict(cursor.fetchone())
    conn.close()
    
    return jsonify(updated_txn), 200

@app.route('/api/transactions/<int:txn_id>', methods=['DELETE'])
@token_required
def delete_transaction(current_user_id, txn_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM transactions WHERE id = ? AND user_id = ?', (txn_id, current_user_id))
    txn = cursor.fetchone()
    
    if not txn:
        conn.close()
        return jsonify({'error': 'Transaction not found'}), 404
        
    cursor.execute('DELETE FROM transactions WHERE id = ?', (txn_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Transaction deleted successfully'}), 200

@app.route('/api/transactions/summary', methods=['GET'])
@token_required
def get_summary(current_user_id):
    month_param = request.args.get('month', '').strip()  # Expected format YYYY-MM
    if not month_param:
        month_param = datetime.datetime.now().strftime('%Y-%m')
        a 
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Overall totals
    cursor.execute(
        "SELECT type, SUM(amount) as total FROM transactions WHERE user_id = ? GROUP BY type",
        (current_user_id,)
    )
    overall_rows = cursor.fetchall()
    overall_totals = {'income': 0.0, 'expense': 0.0}
    for row in overall_rows:
        overall_totals[row['type']] = row['total']
    
    # 2.Month -specific totals
    cursor.execute(
        "SELECT type, SUM(amount) as total FROM transactions WHERE user_id = ? AND strftime('%Y-%m', date) = ? GROUP BY type",
        (current_user_id, month_param)
    )
    month_rows = cursor.fetchall()
    month_totals = {'income': 0.0, 'expense': 0.0}
    for row in month_rows:
        month_totals[row['type']] = row['total']
        
    # 3. Monthly category breakdown (for expenses)
    cursor.execute(
        "SELECT category, SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND strftime('%Y-%m', date) = ? GROUP BY category ORDER BY total DESC",
        (current_user_id, month_param)
    )
    category_rows = cursor.fetchall()
    categories = [row_to_dict(row) for row in category_rows]
    
    # 4. Monthly category breakdown (for income)
    cursor.execute(
        "SELECT category, SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'income' AND strftime('%Y-%m', date) = ? GROUP BY category ORDER BY total DESC",
        (current_user_id, month_param)
    )
    income_categories = [row_to_dict(row) for row in cursor.fetchall()]
    
    # 5. Last 6 months trend
    trend = []
    # Calculate last 6 months names (e.g. YYYY-MM)
    current_date = datetime.datetime.now()
    for i in range(5, -1, -1):
        # Subtract months
        # Let's do simple arithmetic for month subtraction
        m = current_date.month - i
        y = current_date.year
        while m <= 0:
            m += 12
            y -= 1
        month_str = f"{y:04d}-{m:02d}"
        
        cursor.execute(
            "SELECT type, SUM(amount) as total FROM transactions WHERE user_id = ? AND strftime('%Y-%m', date) = ? GROUP BY type",
            (current_user_id, month_str)
        )
        t_rows = cursor.fetchall()
        t_totals = {'income': 0.0, 'expense': 0.0}
        for r in t_rows:
            t_totals[r['type']] = r['total']
            
        trend.append({
            'month': month_str,
            'income': t_totals['income'],
            'expense': t_totals['expense']
        })
        
    conn.close()
    
    return jsonify({
        'overall': {
            'total_income': overall_totals['income'],
            'total_expense': overall_totals['expense'],
            'balance': overall_totals['income'] - overall_totals['expense']
        },
        'monthly': {
            'month': month_param,
            'total_income': month_totals['income'],
            'total_expense': month_totals['expense'],
            'balance': month_totals['income'] - month_totals['expense'],
            'expense_categories': categories,
            'income_categories': income_categories
        },
        'trend': trend
    }), 200

if __name__ == '__main__':
    # Try imports import sqlite3 to catch sqlite3 import errors early
    import sqlite3
    app.run(
    host="0.0.0.0",
    port=int(os.environ.get("PORT", 5000)),
    debug=False
)
