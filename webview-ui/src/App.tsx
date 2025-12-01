import { useState } from 'react';
import { useVSCodeApi } from './hooks/useVSCodeApi';
import './App.css';

function App() {
  const vscode = useVSCodeApi();
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    vscode.postMessage({
      command: 'alert',
      text: message || 'Hello from webview!',
    });
  };

  const handleGetData = () => {
    vscode.postMessage({
      command: 'getData',
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>VS Code Extension Template</h1>
        <p className="subtitle">Built with Vite + React + TypeScript</p>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>Message Extension</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="vscode-input"
            />
            <button onClick={handleSendMessage} className="vscode-button primary">
              Send Alert
            </button>
          </div>
        </section>

        <section className="card">
          <h2>Get Data from Extension</h2>
          <p className="description">
            Click the button below to request data from the extension backend.
            Check the browser console for the response.
          </p>
          <button onClick={handleGetData} className="vscode-button">
            Get Data
          </button>
        </section>

        <section className="card info">
          <h3>🚀 Quick Start</h3>
          <ul>
            <li>Press <code>F5</code> to launch Extension Development Host</li>
            <li>Run command: <strong>Template: Open Example Panel</strong></li>
            <li>Edit files with HMR (Hot Module Replacement)</li>
            <li>Check <code>agents.md</code> for AI assistant guidelines</li>
          </ul>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Template by <strong>simple-vscode-vite-template</strong>
        </p>
      </footer>
    </div>
  );
}

export default App;
