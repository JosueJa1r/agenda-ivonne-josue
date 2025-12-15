from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Permitir peticiones desde el frontend

# Configuración de base de datos
DB_NAME = 'agenda.db'

def init_db():
    """Inicializar la base de datos"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS unavailable_days (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            user TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(date, user)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS unavailable_hours (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            user TEXT NOT NULL,
            hour TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(date, user, hour)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Base de datos inicializada correctamente")

def get_db():
    """Obtener conexión a la base de datos"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/days/<int:year>/<int:month>', methods=['GET'])
def get_unavailable_days(year, month):
    """Obtener todos los días no disponibles de un mes específico con horas"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Buscar días del mes específico
        start_date = f"{year}-{month:02d}-01"
        end_date = f"{year}-{month:02d}-31"
        
        # Obtener días con horas ocupadas
        cursor.execute('''
            SELECT date, user, COUNT(*) as hour_count
            FROM unavailable_hours
            WHERE date BETWEEN ? AND ?
            GROUP BY date, user
            ORDER BY date
        ''', (start_date, end_date))
        
        days_dict = {}
        for row in cursor.fetchall():
            date = row['date']
            if date not in days_dict:
                days_dict[date] = {'users': [], 'hour_counts': []}
            days_dict[date]['users'].append(row['user'])
            days_dict[date]['hour_counts'].append(str(row['hour_count']))
        
        days = []
        for date, data in days_dict.items():
            days.append({
                'date': date,
                'users': ','.join(data['users']),
                'hour_counts': ','.join(data['hour_counts'])
            })
        
        conn.close()
        return jsonify(days)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/toggle', methods=['POST'])
def toggle_day():
    """Marcar o desmarcar un día como no disponible para un usuario"""
    try:
        data = request.json
        date = data.get('date')
        user = data.get('user')
        
        if not date or not user:
            return jsonify({'error': 'Faltan parámetros'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Verificar si ya existe
        cursor.execute('''
            SELECT id FROM unavailable_days
            WHERE date = ? AND user = ?
        ''', (date, user))
        
        existing = cursor.fetchone()
        
        if existing:
            # Si existe, eliminarlo (toggle off)
            cursor.execute('''
                DELETE FROM unavailable_days
                WHERE date = ? AND user = ?
            ''', (date, user))
            message = f"Día {date} desmarcado para {user}"
        else:
            # Si no existe, agregarlo (toggle on)
            cursor.execute('''
                INSERT INTO unavailable_days (date, user)
                VALUES (?, ?)
            ''', (date, user))
            message = f"Día {date} marcado como no disponible para {user}"
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': message, 'success': True})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/all-days', methods=['GET'])
def get_all_days():
    """Obtener todos los días marcados (para estadísticas o respaldo)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT date, user, created_at
            FROM unavailable_days
            ORDER BY date DESC
        ''')
        
        days = []
        for row in cursor.fetchall():
            days.append({
                'date': row['date'],
                'user': row['user'],
                'created_at': row['created_at']
            })
        
        conn.close()
        return jsonify(days)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Obtener estadísticas de disponibilidad"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Contar días por usuario
        cursor.execute('''
            SELECT user, COUNT(*) as count
            FROM unavailable_days
            WHERE date >= date('now')
            GROUP BY user
        ''')
        
        stats = {}
        for row in cursor.fetchall():
            stats[row['user']] = row['count']
        
        # Días donde ambos no están disponibles
        cursor.execute('''
            SELECT COUNT(DISTINCT d1.date) as both_count
            FROM unavailable_days d1
            INNER JOIN unavailable_days d2 
                ON d1.date = d2.date AND d1.user != d2.user
            WHERE d1.date >= date('now')
        ''')
        
        both_count = cursor.fetchone()['both_count']
        stats['both'] = both_count
        
        conn.close()
        return jsonify(stats)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hours/<date>/<user>', methods=['GET'])
def get_hours(date, user):
    """Obtener horas ocupadas de un día específico para un usuario"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT hour FROM unavailable_hours
            WHERE date = ? AND user = ?
            ORDER BY hour
        ''', (date, user))
        
        hours = [row['hour'] for row in cursor.fetchall()]
        
        conn.close()
        return jsonify({'hours': hours})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hours-all/<date>', methods=['GET'])
def get_hours_all(date):
    """Obtener horas ocupadas de un día para todos los usuarios"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Obtener horas de Josué
        cursor.execute('''
            SELECT hour FROM unavailable_hours
            WHERE date = ? AND user = 'josue'
            ORDER BY hour
        ''', (date,))
        josue_hours = [row['hour'] for row in cursor.fetchall()]
        
        # Obtener horas de Ivonne
        cursor.execute('''
            SELECT hour FROM unavailable_hours
            WHERE date = ? AND user = 'ivonne'
            ORDER BY hour
        ''', (date,))
        ivonne_hours = [row['hour'] for row in cursor.fetchall()]
        
        conn.close()
        return jsonify({
            'josue': josue_hours,
            'ivonne': ivonne_hours
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hours', methods=['POST'])
def save_hours():
    """Guardar horas ocupadas de un día para un usuario"""
    try:
        data = request.json
        date = data.get('date')
        user = data.get('user')
        hours = data.get('hours', [])
        
        if not date or not user:
            return jsonify({'error': 'Faltan parámetros'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Eliminar todas las horas existentes para este día y usuario
        cursor.execute('''
            DELETE FROM unavailable_hours
            WHERE date = ? AND user = ?
        ''', (date, user))
        
        # Insertar las nuevas horas
        for hour in hours:
            cursor.execute('''
                INSERT INTO unavailable_hours (date, user, hour)
                VALUES (?, ?, ?)
            ''', (date, user, hour))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': f'{len(hours)} horas guardadas para {user} el {date}',
            'success': True
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    """Ruta raíz para verificar que el servidor está funcionando"""
    return jsonify({
        'message': '💕 Servidor de Agenda Compartida activo',
        'status': 'running',
        'endpoints': [
            '/api/days/<year>/<month>',
            '/api/hours/<date>/<user>',
            '/api/hours (POST)',
            '/api/toggle',
            '/api/all-days',
            '/api/stats'
        ]
    })

@app.route('/app')
def serve_app():
    """Servir la aplicación HTML"""
    with open('index.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/style.css')
def serve_css():
    """Servir CSS"""
    with open('style.css', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'text/css'}

@app.route('/java.js')
def serve_js():
    """Servir JavaScript"""
    with open('java.js', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'application/javascript'}

if __name__ == '__main__':
    # Inicializar base de datos
    init_db()
    
    # Obtener puerto del entorno (para Railway/Render)
    port = int(os.environ.get('PORT', 5000))
    
    print("\n" + "="*50)
    print(f"🚀 Servidor iniciado en puerto {port}")
    print("📊 Base de datos: agenda.db")
    print("💕 Aplicación disponible en: /app")
    print("="*50 + "\n")
    
    # Ejecutar servidor
    app.run(debug=False, host='0.0.0.0', port=port)
