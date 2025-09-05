"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import "./SurveillancePage.css"; // 🔗 Import du fichier CSS
import Link from 'next/link';

const SurveillancePage = () => {
    const [data, setData] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io("http://localhost:5000", {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on("connect", () => {
            console.log("Connected to server");
        });

        newSocket.on("update", (newData) => {
            setData(newData);
        });

        newSocket.on("disconnect", () => {
            setIsRunning(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const toggleDetection = () => {
        if (!socket) return;

        if (!isRunning) {
            socket.emit("start_detection");
        } else {
            socket.emit("stop_detection");
        }
        setIsRunning(!isRunning);
    };

    return (
        <div className="surveillance-container">
            <header className="header">
                <h1>🛡️ Firewall Intelligent</h1>
                
                <Link href="/" className="return-button">Retour à l&apos;Accueil</Link>

                   
                
            </header>

            <main className="main">
                <div className="card">
                    <div className="card-header">
                        <h2>
                            {data
                                ? `📡 Dernière analyse à ${data.timestamp}`
                                : "Surveillance réseau"}
                        </h2>
                        <button
                            className={`toggle-btn ${isRunning ? "stop" : "start"}`}
                            onClick={toggleDetection}
                        >
                            {isRunning ? "Arrêter" : "Démarrer"}
                        </button>
                    </div>

                    {data && (
                        <div className="table-container">
                            <table className="result-table">
                                <thead>
                                    <tr>
                                        <th>Modèle</th>
                                        <th>Statut</th>
                                        <th>Confiance</th>
                                        <th>Valeur brute</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.results.map((result, index) => (
                                        <tr key={index}>
                                            <td>{result.Modèle}</td>
                                            <td className={result.Statut.includes("Malicieux") ? "danger" : "safe"}>
                                                {result.Statut}
                                            </td>
                                            <td>{result.Confiance}</td>
                                            <td>{result["Valeur brute"]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <p className="status-msg">
                        {isRunning
                            ? "🔄 Mise à jour toutes les 3 secondes..."
                            : "🔴 Surveillance arrêtée"}
                    </p>
                </div>
            </main>

            <footer className="footer">
                <p>&copy; 2025 Firewall Intelligent. Tous droits réservés.</p>
                <div>
                    <a href="#">Contact</a> | <a href="#">Mentions légales</a>
                </div>
            </footer>
        </div>
    );
};

export default SurveillancePage;
