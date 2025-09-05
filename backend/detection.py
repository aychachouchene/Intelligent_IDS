import threading
import numpy as np
import pandas as pd
import pickle
from tensorflow.keras.models import load_model # type: ignore
import time
from threading import Lock

class PacketDetector:
    def __init__(self):
        self.models = None
        self.normalizer = None
        self.selected_features = None
        self.features = None
        self.weights = None
        self.thread = None
        self.thread_lock = Lock()
        self.is_running = False

    def initialize(self):
        """Charge tous les artefacts et modèles"""
        with open('feature_tuples_b.pkl', 'rb') as f:
            feature_tuples = pickle.load(f)
            
        with open('normalizer_b.pkl', 'rb') as f:
            self.normalizer = pickle.load(f)
            
        with open('selected_features_final_b.pkl', 'rb') as f:
            self.selected_features = pickle.load(f)

        self.models = {
            'Model 1': load_model('model_1_b.keras'),
            'Model 2': load_model('model_2_b.keras'),
            'Model 3': load_model('model_3_b.keras'),
            'Model 4': load_model('model_4_b.keras'),
            'Model 5': load_model('model_5_b.keras')
        }

        self.features, self.weights = zip(*feature_tuples)

    def generate_realistic_packet(self):
        """Génère un paquet réseau réaliste"""
        packet = {
        'Flow Duration': np.random.randint(1000, 1_000_000),
        'Total Fwd Packets': np.random.randint(1, 50),
        'Fwd Packet Length Mean': np.random.uniform(50, 500),
        'Bwd Packet Length Mean': np.random.uniform(40, 450),
        'Fwd Header Length': np.random.randint(20, 100),
        'FIN Flag Count': np.random.choice([0, 1]),
        'Bwd Packet Length Std': np.random.uniform(0, 5),
        'Subflow Bwd Packets': np.random.randint(0, 10),
        'Subflow Fwd Packets': np.random.randint(0, 10),
        'Avg Bwd Segment Size': np.random.uniform(0, 100),
        'Fwd Packet Length Std': np.random.uniform(0, 5),
        'Bwd Packets/s': np.random.uniform(0, 500),
        'Fwd Packet Length Min': np.random.uniform(0, 100),
         'Avg Packet Size': np.random.uniform(50, 300),
        'Fwd IAT Mean': np.random.uniform(0, 1_000),
        'Fwd Packet Length Max': np.random.uniform(100, 600),
        'Fwd Act Data Packets': np.random.randint(0, 20),
        'Fwd IAT Max': np.random.uniform(0, 5_000),
        'Fwd IAT Std': np.random.uniform(0, 1_000),
        'Bwd Packet Length Min': np.random.uniform(0, 50),
        'Idle Mean': np.random.uniform(0, 10_000),
        'Fwd IAT Total': np.random.uniform(0, 10_000),
        'Total Backward Packets': np.random.randint(0, 30),
        'Flow Bytes/s': np.random.uniform(1000, 1_000_000),
        'Flow Packets/s': np.random.uniform(10, 500),
        'SYN Flag Count': np.random.choice([0, 1]),
        'ACK Flag Count': np.random.choice([0, 1]),
        'Pkt Len Mean': np.random.uniform(100, 400)
    }
        
        for feat in self.features:
            if feat not in packet:
                packet[feat] = 0.0
        return packet

    def process_packet(self, packet):
        """Traite un paquet et retourne les résultats"""
        df = pd.DataFrame([packet]).fillna(0)
        X_norm = self.normalizer.transform(df[list(self.features)])
        df['Combined_Importance_Score'] = X_norm.dot(np.array(self.weights))
        X = df[self.selected_features]
        
        results = []
        for model_name, model in self.models.items():
            prob = model.predict(X, verbose=0)[0][0]
            results.append({
                'Modèle': model_name,
                'Statut': '🔴 Malicieux' if prob > 0.5 else '🟢 Bénin',
                'Confiance': f"{prob*100:.1f}%",
                'Valeur brute': f"{prob:.4f}"
            })
        return results

    def detection_loop(self, socketio):
        """Boucle principale de détection"""
        while self.is_running:
            try:
                packet = self.generate_realistic_packet()
                results = self.process_packet(packet)
                
                socketio.emit('update', {
                    'timestamp': time.strftime('%H:%M:%S'),
                    'results': results
                })
                
                time.sleep(2)
                
            except Exception as e:
                print(f"Error: {str(e)}")
                break

    def start_detection(self, socketio):
        """Démarre la détection"""
        with self.thread_lock:
            if not self.is_running:
                self.is_running = True
                self.thread = threading.Thread(
                    target=self.detection_loop, 
                    args=(socketio,)
                )
                self.thread.start()

    def stop_detection(self):
        """Arrête la détection"""
        with self.thread_lock:
            self.is_running = False
            if self.thread:
                self.thread.join()