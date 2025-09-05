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
        'http://localhost:5000/predict', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 900000 // 90 secondes timeout
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erreur inconnue du serveur");
      }
  
      setResults({
        message: response.data.message || "Analyse terminée avec succès",
        imageUrl: `data:image/png;base64,${response.data.image}`,
        predictions: response.data.predictions || [],
        stats: response.data.stats || {
          total: 0,
          benign: 0,
          malicious: 0
        }
      });
  
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
        <h1>Détection d&apos;Intrusions</h1>
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
              'Lancer la détection'
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
            
            <div className={styles.resultMessage}>
              <p>{results.message}</p>
            </div>

        {results.imageUrl && (
          <div className={styles.plotContainer}>
            <Image 
              src={results.imageUrl} 
              alt="Résultats de l'analyse"
              width={800}  // Largeur en pixels
              height={600}  // Hauteur en pixels
              className={styles.resultPlot}
              unoptimized={true}  // Important pour les images base64
              priority={false}
            />
          </div>
        )}

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total</h3>
                <p className={styles.statValue}>{results.stats.total}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Bénin</h3>
                <p className={styles.statValue}>{results.stats.benign}</p>
              </div>
              <div className={`${styles.statCard} ${styles.malicious}`}>
                <h3>Malveillant</h3>
                <p className={styles.statValue}>{results.stats.malicious}</p>
              </div>
            </div>

            {results.predictions.length > 0 && (
              <div className={styles.predictionsBox}>
                <h3 className={styles.predictionsTitle}>Détails des prédictions</h3>
                <div className={styles.predictionsTableContainer}>
                  <table className={styles.predictionsTable}>
                    <thead>
                      <tr>
                        <th>Modèle</th>
                        <th>Prédiction</th>
                        <th>Confidence</th>
                        <th>Bénin (%)</th>
                        <th>Malveillant (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.predictions.map((pred, index) => (
                        <tr key={index}>
                          <td>{pred.Model}</td>
                          <td>
                            <span className={
                              pred['Final Prediction'] === 'Benign' 
                                ? styles.benignPrediction 
                                : styles.maliciousPrediction
                            }>
                              {pred['Final Prediction']}
                            </span>
                          </td>
                          <td>{pred['Confidence (%)']}%</td>
                          <td>{pred['Benign (%)']}</td>
                          <td>{pred['Malicious (%)']}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}