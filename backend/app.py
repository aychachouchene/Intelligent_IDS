import eventlet # type: ignore
# Ajoutez après les autres configurations
eventlet.monkey_patch()

from flask import Flask, Response, json, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from matplotlib import pyplot as plt
import pandas as pd
import joblib
import os
from testm import  load_artifacts, process_file_m 
from analyse import analyze_uploaded_file

# Ajoutez en haut du fichier

import threading
import time
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'




    

from flask import Flask, request, jsonify
import matplotlib
matplotlib.use('Agg')  # Doit être avant les autres imports matplotlib
from testb import process_file
import io
import base64
import numpy as np
from werkzeug.utils import secure_filename
from ydata_profiling import ProfileReport
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from testb import process_file 

from io import BytesIO
from flask import abort



from threading import Lock

from flask_socketio import SocketIO # type: ignore
from detection import PacketDetector  # Ajout pour la détection en temps réel




app = Flask(__name__, static_folder="static", template_folder="templates")
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max upload size
CORS(app)

# Configuration
SECRET_KEY = 'votre_cle_secrete_super_securisee'
UPLOAD_FOLDER = 'uploads'
REPORTS_DIR = 'reports'
ALLOWED_EXTENSIONS = {'csv', 'parquet'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)





#detection

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Initialisation du détecteur temps réel
detector = PacketDetector()
detector.initialize()

# Variables globales pour la surveillance temps réel
realtime_thread = None
thread_lock = Lock()
is_detection_running = False


# Fonction utilitaire
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
# Dictionnaire pour stocker les utilisateurs (remplacez par une base de données en production)
users = {}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token manquant'}), 401
            
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data['username']
        except:
            return jsonify({'message': 'Token invalide'}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated


# Routes principales
@app.route("/")
def home():
    return render_template("index.html")

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Données manquantes'}), 400
        
    if data['username'] in users:
        return jsonify({'message': 'Utilisateur déjà existant'}), 400
        
    hashed_password = generate_password_hash(data['password'])
    
    users[data['username']] = {
        'username': data['username'],
        'email': data.get('email', ''),
        'password': hashed_password
    }
    
    return jsonify({'message': 'Utilisateur créé avec succès'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Données manquantes'}), 400
        
    user = users.get(data['username'])
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Identifiants incorrects'}), 401
        
    token = jwt.encode({
        'username': user['username'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY)
    
    return jsonify({
        'message': 'Connexion réussie',
        'token': token
    }), 200

# Protégez vos routes avec @token_required
@app.route('/protected', methods=['GET'])
@token_required
def protected_route(current_user):
 return jsonify({'message': f'Bienvenue {current_user}'}), 200




# Gestion des rapports EDA
@app.route('/report/<report_type>')
def serve_report(report_type):
    valid_types = {
        'binary': 'cic_ids_2017_b.html',
        'multiclass': 'cic_ids_2017_m.html'
    }
    
    if report_type not in valid_types:
        abort(404, description="Type de rapport non valide")
    
    filename = valid_types[report_type]
    report_path = os.path.join(REPORTS_DIR, filename)
    
    if not os.path.exists(report_path):
        abort(404, description="Rapport non généré. Veuillez d'abord générer le rapport.")
    
    return send_from_directory(REPORTS_DIR, filename)





@app.route('/health')
def health_check():
    return "Server is running", 200




@app.route('/predict', methods=['POST'])
def predict():
    # Vérification du fichier
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Aucun fichier sélectionné'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Seuls les fichiers CSV ou Parquet sont acceptés'}), 400

    try:
        # Sauvegarde temporaire du fichier
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Traitement du fichier
        result = process_file(filepath)
        
        if not result or 'image' not in result:
             raise ValueError("Erreur lors de la génération du graphique")
        
        return jsonify({
            'success': True,
            'message': 'Analyse terminée avec succès',
            'image': result['image'],  # déjà en base64
            'predictions': result.get('predictions', []),
            'stats': result.get('stats', {})
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        # Nettoyage du fichier temporaire
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)

@app.route('/analyse', methods=['POST'])
def analyse():
    # Vérification du fichier
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Aucun fichier sélectionné'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Seuls les fichiers CSV ou Parquet sont acceptés'}), 400

    try:
        # Sauvegarde temporaire du fichier
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Déterminer le type de fichier
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        # Analyser le fichier
        analysis_results = analyze_uploaded_file(filepath, file_ext)
        
        if 'error' in analysis_results:
            raise ValueError(analysis_results['error'])
        
        return jsonify({
            'success': True,
            'message': 'Analyse terminée avec succès',
            'plots': analysis_results['plots'],
            'file_info': analysis_results['file_info'],
            'missing_analysis': analysis_results['missing_analysis'],
            'column_stats': analysis_results['column_stats'],
            'issues': analysis_results['issues'],
            'execution_time': analysis_results['execution_time']
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        # Nettoyage du fichier temporaire
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)


@app.route('/predict-multiclass', methods=['POST'])
def predictM():
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Aucun fichier sélectionné'}), 400

    try:
        # Sauvegarde temporaire
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Traitement
        result = process_file_m(filepath)

        # Chargement des classes (label encoder)
        label_encoder = load_artifacts()['label_encoder']
        classes = list(label_encoder.classes_)

        return jsonify({
            'success': True,
            'image': result.get('image', ''),
            'predictions': result.get('predictions', []),
            
            'stats': result.get('stats', {}),
            'classNames': classes  # <- nécessaire pour `results.classNames.map`
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)







@app.route('/surveillance')
def surveillance():
    return render_template('surveillance.html')

@socketio.on('connect')
def handle_connect():
    print('Connexion client établie')

@socketio.on('start_detection')
def handle_start_detection():
    global is_detection_running
    with thread_lock:
        if not is_detection_running:
            is_detection_running = True
            socketio.start_background_task(detection_loop)
            print('Détection démarrée')

@socketio.on('stop_detection')
def handle_stop_detection():
    global is_detection_running
    with thread_lock:
        is_detection_running = False
        print('Détection arrêtée')

def detection_loop():
    while is_detection_running:
        try:
            packet = detector.generate_realistic_packet()
            results = detector.process_packet(packet)
            
            socketio.emit('update', {
                'timestamp': time.strftime('%H:%M:%S'),
                'results': results
            })
            eventlet.sleep(3)
            
        except Exception as e:
            print(f"Erreur: {str(e)}")
            break
        


if __name__ == "__main__":
    socketio.run(app , host="0.0.0.0", port=5000, debug=True)