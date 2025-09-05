// frontend/firewall/app/reports/[type]/page.js
"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './ReportPage.module.css';

export default function ReportPage({ params }) {
  const { type } = params;
  const [isValidType, setIsValidType] = useState(false);

  // Validation du type de rapport
  useEffect(() => {
    setIsValidType(['binary', 'multiclass'].includes(type));
  }, [type]);

  if (!isValidType) {
    return (
      <div className={styles.errorContainer}>
        <h1>Type de rapport invalide</h1>
        <p>Le type &quot;{type}&quot; n&apos;est pas reconnu.</p>
        <Link href="/" className={styles.backButton}>
          ← Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const reportTitle = type === 'binary' ? 'Binaire' : 'Multiclasse';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Rapport {reportTitle}</h1>
        <Link href="/" className={styles.backButton}>
          ← Retour à l&apos;accueil
        </Link>
      </header>

      <main className={styles.main}>
        <iframe
          src={`/reports/${type}_report.html`}
          title={`Rapport ${reportTitle}`}
          className={styles.reportFrame}
          onLoad={() => console.log('Rapport chargé')}
          onError={() => console.error('Erreur de chargement du rapport')}
        />
      </main>

      <footer className={styles.footer}>
        <p>Firewall Intelligent - Rapport {reportTitle}</p>
        <p className={styles.timestamp}>
          Généré le {new Date().toLocaleDateString()}
        </p>
      </footer>
    </div>
  );
}