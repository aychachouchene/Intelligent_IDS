/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
// frontend/firewall/app/page.js (Page d'accueil complète et corrigée)
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Home.module.css';

export default function HomePage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [loaded, setLoaded] = useState(false);

  // États pour les formulaires
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setLoaded(true);
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleAuthSubmit = async (e, type) => {
    e.preventDefault();
    const endpoint = type;
    const formData = type === 'login' ? {
      username: e.target.username.value,
      password: e.target.password.value
    } : {
      username: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value
    };

    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        if (type === 'login') {
          localStorage.setItem('token', data.token);
          setIsAuthenticated(true);
          setShowLogin(false);
        } else {
          alert("Inscription réussie ! Veuillez vous connecter.");
          setActiveTab('login');
        }
      } else {
        alert(data.message || `Échec de ${type === 'login' ? 'la connexion' : "l'inscription"}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur lors de ${type === 'login' ? 'la connexion' : "l'inscription"}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div className={`${styles.container} ${loaded ? styles.loaded : ''}`}>
      {/* Background animation */}
      <div className={styles.background}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🛡️</span>
          <h1>Firewall Intelligent</h1>
        </div>
        
        <nav className={styles.nav}>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className={styles.navLink}>Tableau de bord</Link>
              <button onClick={handleLogout} className={styles.navButton}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setShowLogin(true); setActiveTab('login'); }} 
                className={styles.navButton}
              >
                Connexion
              </button>
              <button 
                onClick={() => { setShowLogin(true); setActiveTab('signup'); }} 
                className={`${styles.navButton} ${styles.primary}`}
              >
                Inscription
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>
            Système de Détection <span>d&apos;Intrusions Avancé</span>
          </h2>
          <p className={styles.heroText}>
            Notre solution utilise l&apos;intelligence artificielle pour protéger votre réseau
            contre les cybermenaces en temps réel avec une précision inégalée.
          </p>
          
          <div className={styles.heroButtons}>
            <button 
              onClick={() => router.push('/predict')} 
              className={styles.heroButton}
            >
              {isAuthenticated ? 'Détection d&apos;intrusions' : 'Binaire'}
            </button>
            {/* Nouveau bouton multiclasse */}
  <button 
    onClick={() => router.push('/predict-multiclass')} 
    className={`${styles.heroButton} ${styles.multiclassButton}`}
  >
    {isAuthenticated ? 'Mode Multiclasse' : ' Multiclasse'}
  </button>

            <button 
              onClick={() => router.push('/analyse')} 
              className={styles.heroButtonOutline}
            >
              {isAuthenticated ? 'Détection d&apos;intrusions' : 'Analysateur de fichiers'}
            </button>

            <button 
              onClick={() => router.push('/surveillance')} 
              className={styles.heroButtonOutline}
            >
              {isAuthenticated ? 'surveillance' : 'surveillance'}
            </button>

           



          
          </div>
        </div>

        <div className={styles.heroIllustration}>
          <div className={styles.gradientCircle}></div>
          <img 
            src="/image1.png" 
            alt="Protection Firewall" 
            className={styles.shieldImage}
          />
        </div>
      </main>

      {/* Auth Modal */}
      {(showLogin || showSignup) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button 
              onClick={() => setShowLogin(false)} 
              className={styles.closeButton}
            >
              &times;
            </button>
            
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'login' ? styles.active : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Connexion
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'signup' ? styles.active : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                Inscription
              </button>
            </div>
            
            <form 
              onSubmit={(e) => handleAuthSubmit(e, activeTab)} 
              className={styles.authForm}
            >
              <div className={styles.formGroup}>
                <label htmlFor="username">Nom d&apos;utilisateur</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Entrez votre nom d&apos;utilisateur"
                  required
                />
              </div>
              
              {activeTab === 'signup' && (
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Entrez votre email"
                    required
                  />
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label htmlFor="password">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder={`Entrez votre mot de passe${activeTab === 'signup' ? ' (min. 8 caractères)' : ''}`}
                  required
                  minLength={activeTab === 'signup' ? 8 : undefined}
                />
              </div>
              
              {activeTab === 'signup' && (
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                </div>
              )}
              
              <button type="submit" className={styles.submitButton}>
                {activeTab === 'login' ? 'Se connecter' : 'S&apos;inscrire'}
              </button>
            </form>
            
            {activeTab === 'login' && (
              <div className={styles.authFooter}>
                <p>Pas encore de compte ? <button onClick={() => setActiveTab('signup')}>Inscrivez-vous</button></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features Section (visible seulement si non connecté) */}
      {!isAuthenticated && !showLogin && (
        <section className={styles.features}>
          <div className={styles.featuresContainer}>
            <h3 className={styles.featuresTitle}>Pourquoi choisir notre solution ?</h3>
            
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔍</div>
                <h4>Détection en temps réel</h4>
                <p>Surveillance continue pour identifier les menaces immédiatement.</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🤖</div>
                <h4>IA Avancée</h4>
                <p>Algorithmes d&apos;apprentissage automatique pour une protection optimale.</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📊</div>
                <h4>Analyses Complètes</h4>
                <p>Rapports détaillés et visualisations des activités suspectes.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
           
            <h3>Firewall Intelligent</h3>
          </div>
          
          <div className={styles.footerLinks}>
            <Link href="/about">À propos</Link>
            <Link href="/features">Fonctionnalités</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Confidentialité</Link>
          </div>
          
          
        </div>
        
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Firewall Intelligent. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}