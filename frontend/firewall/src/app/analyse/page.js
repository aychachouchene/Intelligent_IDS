"use client";
import { useState, useCallback } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import styles from './PredictPage.module.css';

export default function Predict() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.parquet')) {
        setFile(selectedFile);
        setError(null);
        setResults(null);
      } else {
        setError('Seuls les fichiers CSV (.csv) et Parquet (.parquet) sont autorisés');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/octet-stream': ['.parquet']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }
  
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post(
        'http://localhost:5000/analyse', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 900000 // 90 secondes timeout
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Erreur inconnue du serveur");
      }
  
      // Conversion sécurisée des nombres
    const safeResults = {
      ...response.data,
      file_info: {
        rows: Number(response.data?.file_info?.rows) || 0,
        columns: Number(response.data?.file_info?.columns) || 0,
        file_size_mb: Number(response.data?.file_info?.file_size_mb) || 0
      },
      execution_time: Number(response.data?.execution_time) || 0
    };

    setResults(safeResults);
  
    } catch (err) {
      console.error("Erreur complète:", err);
      let errorMessage = "Erreur lors de l'analyse";
      
      if (err.response) {
        errorMessage = err.response.data?.error || `Erreur serveur (${err.response.status})`;
      } else if (err.request) {
        errorMessage = "Pas de réponse du serveur";
      } else if (err.message) {
        errorMessage = err.message;
      }
  
      setError(`Détails : ${errorMessage}. Vérifiez que le serveur est démarré.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Analyse de Fichiers</h1>
        <Link href="/" className={styles.backButton}>
          ← Retour à l&apos;accueil
        </Link>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.uploadCard}>
          <div 
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
          >
            <input {...getInputProps()} />
            
            <div className={styles.uploadContent}>
              <svg className={styles.uploadIcon} viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>

              {file ? (
                <div className={styles.fileInfo}>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileSize}>{(file.size / 1024).toFixed(2)} Ko</p>
                </div>
              ) : (
                <div className={styles.uploadText}>
                  <p className={styles.dropText}>
                    {isDragActive 
                      ? "Déposez votre fichier ici..." 
                      : "Glissez-déposez un fichier ou cliquez pour sélectionner"}
                  </p>
                  <p className={styles.fileTypes}>Formats supportés: .csv, .parquet</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className={styles.analyzeButton}
          >
            {isLoading ? (
              <div className={styles.buttonContent}>
                <span className={styles.spinner}></span>
                Analyse en cours...
              </div>
            ) : (
              'Lancer l\'analyse'
            )}
          </button>

          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          )}
        </div>

        {results && (
          <div className={styles.resultsSection}>
            <h2 className={styles.resultsTitle}>Résultats de l&apos;analyse</h2>
            
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Lignes</h3>
                <p className={styles.statValue}>{results.file_info.rows}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Colonnes</h3>
                <p className={styles.statValue}>{results.file_info.columns}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Taille</h3>
                <p className={styles.statValue}>{results.file_info.file_size_mb} MB</p>
              </div>
              <div className={styles.statCard}>
                <h3>Temps d&apos;exécution</h3>
                <p className={styles.statValue}>{results.execution_time.toFixed(2)}s</p>
              </div>
            </div>

            <div className={styles.resultMessage}>
              <p>{results.message}</p>
            </div>

            {results.plots.length > 0 && (
              <div className={styles.plotsContainer}>
                {results.plots.map((plot, index) => (
                  <div key={index} className={styles.plotContainer}>
                    <Image 
                      src={`data:image/png;base64,${plot}`}
                      alt={`Visualisation ${index + 1}`}
                      width={800}
                      height={600}
                      className={styles.resultPlot}
                      unoptimized={true}
                    />
                  </div>
                ))}
              </div>
            )}

            {Object.keys(results.column_stats).length > 0 && (
              <div className={styles.predictionsBox}>
                <h3 className={styles.predictionsTitle}>Statistiques par colonne</h3>
                <div className={styles.predictionsTableContainer}>
                  <table className={styles.predictionsTable}>
                    <thead>
                      <tr>
                        <th>Colonne</th>
                        <th>Type</th>
                        <th>Valeurs uniques</th>
                        <th>Valeurs manquantes</th>
                        <th>% Manquants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(results.column_stats).map(([col, stats]) => (
                        <tr key={col}>
                          <td>{col}</td>
                          <td>{stats.type}</td>
                          <td>{stats.unique}</td>
                          <td>{stats.manquants}</td>
                          <td>{stats['% manquants']}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {results.issues.length > 0 && (
              <div className={styles.issuesBox}>
                <h3 className={styles.issuesTitle}>Problèmes détectés</h3>
                <ul className={styles.issuesList}>
                  {results.issues.map((issue, index) => (
                    <li key={index} className={styles.issueItem}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}