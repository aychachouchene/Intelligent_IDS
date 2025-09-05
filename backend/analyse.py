import os
import time
from flask import json
import pandas as pd
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from tabulate import tabulate # type: ignore

def analyze_uploaded_file(filepath, file_type='csv'):
    """Analyse complète d'un fichier uploadé (CSV ou Parquet)"""
    start_time = time.time()
    results = {
        'file_info': {},
        'missing_analysis': {},
        'column_stats': {},
        'issues': [],
        'execution_time': None,
        'plots': []
    }

    try:
        # 1. Lecture du fichier selon son type
        if file_type == 'csv':
            df = pd.read_csv(filepath)
        elif file_type == 'parquet':
            df = pd.read_parquet(filepath)
        else:
            raise ValueError("Type de fichier non supporté")

 # Conversion des types numpy/pandas en types natifs Python
        def convert_to_native(val):
            if pd.api.types.is_integer_dtype(val):
                return int(val)
            elif pd.api.types.is_float_dtype(val):
                return float(val)
            return val

       # 2. Informations générales
        file_size = round(os.path.getsize(filepath) / (1024 * 1024), 2)
        results['file_info'] = {
            'rows': int(len(df)),
            'columns': int(len(df.columns)),
            'file_size_mb': float(file_size),
            'dtypes': {k: str(v) for k, v in df.dtypes.to_dict().items()}
        }

        # 3. Analyse des valeurs manquantes
        missing_values = df.isnull().sum()
        missing_percent = (missing_values / len(df)) * 100

        results['missing_analysis'] = {
            'total_missing': int(missing_values.sum()),
            'missing_percent_total': float(round(missing_values.sum() / (len(df) * len(df.columns)) * 100, 2)),
            'columns_with_missing': {k: int(v) for k, v in missing_values[missing_values > 0].to_dict().items()},
            'missing_percent_by_column': {k: float(round(v, 2)) for k, v in missing_percent[missing_percent > 0].to_dict().items()}
        }
        # 4. Détection des problèmes
        empty_cols = [col for col in df.columns if df[col].isnull().all()]
        if empty_cols:
            results['issues'].append(f"Colonnes vides: {', '.join(empty_cols)}")

        # 5. Analyse détaillée par colonne
        for col in df.columns:
            col_stats = {
                'type': str(df[col].dtype),
                'unique': df[col].nunique(),
                'manquants': missing_values[col],
                '% manquants': round(missing_percent[col], 2)
            }
            results['column_stats'][col] = col_stats

            if df[col].nunique() == 1:
                results['issues'].append(f"Colonne constante: {col} = {df[col].iloc[0]}")

        # 6. Génération des visualisations
        plots = generate_plots(df, missing_percent)
        results['plots'] = plots

        # 7. Temps d'exécution
        results['execution_time'] = time.time() - start_time

       # Conversion finale pour s'assurer que tout est sérialisable
        return json.loads(json.dumps(results, default=convert_to_native))

    except Exception as e:
        results['error'] = str(e)
        return json.loads(json.dumps(results, default=convert_to_native))

def generate_plots(df, missing_percent):
    """Génère les visualisations et les retourne en base64"""
    plots = []
    
    # 1. Valeurs manquantes par colonne
    plt.figure(figsize=(14, 7))
    missing_percent_sorted = missing_percent.sort_values(ascending=False)
    missing_percent_sorted.plot(kind='bar', color='salmon')
    plt.title("Pourcentage de valeurs manquantes par colonne")
    plt.xlabel("Colonne")
    plt.ylabel("% de valeurs manquantes")
    plt.xticks(rotation=90)
    plt.tight_layout()
    
    img_buffer = BytesIO()
    plt.savefig(img_buffer, format='png')
    img_buffer.seek(0)
    plots.append(base64.b64encode(img_buffer.read()).decode('utf-8'))
    plt.close()

    # 2. Nombre d'éléments uniques par colonne
    plt.figure(figsize=(14, 7))
    unique_counts = df.nunique()
    unique_counts.plot(kind='bar', color='lightblue')
    plt.title("Nombre d'éléments uniques par colonne")
    plt.xlabel("Colonne")
    plt.ylabel("Nombre d'éléments uniques")
    plt.xticks(rotation=90)
    plt.tight_layout()
    
    img_buffer = BytesIO()
    plt.savefig(img_buffer, format='png')
    img_buffer.seek(0)
    plots.append(base64.b64encode(img_buffer.read()).decode('utf-8'))
    plt.close()

    # 3. Types de données par colonne
    plt.figure(figsize=(14, 7))
    dtype_counts = df.dtypes.value_counts()
    dtype_counts.plot(kind='pie', autopct='%1.1f%%', colors=['lightgreen', 'lightblue', 'salmon'])
    plt.title("Répartition des types de données")
    plt.ylabel('')
    plt.tight_layout()
    
    img_buffer = BytesIO()
    plt.savefig(img_buffer, format='png')
    img_buffer.seek(0)
    plots.append(base64.b64encode(img_buffer.read()).decode('utf-8'))
    plt.close()

    return plots