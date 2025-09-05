import React from "react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-800 text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Paramètres - Firewall Intelligent</h1>
      </header>

      <main className="flex-1 bg-white py-8 px-10">
        <h2 className="text-2xl font-semibold text-gray-800">Page des Paramètres</h2>
        {/* Contenu de la page des paramètres */}
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="text-center">
          <p className="text-sm">© 2025 - Projet Firewall Intelligent</p>
        </div>
      </footer>
    </div>
  );
};

export default Settings;
