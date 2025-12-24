import { useState } from 'react';
import { Key, Trash2, Info } from 'lucide-react';
import { clearAllData } from '../../services/storage';
import { useModal } from '../../context/ModalContext';
import './Settings.css';

const Settings = () => {
    const { showConfirm, showAlert } = useModal();
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_YOUTUBE_API_KEY || '');

    const handleClearLibrary = async () => {
        showConfirm(
            'Clear Library',
            'Are you sure you want to clear all library data? This cannot be undone.',
            async () => {
                try {
                    await clearAllData();
                    showAlert('Library cleared successfully', 'success');
                    window.location.reload();
                } catch (error) {
                    console.error('Error clearing library:', error);
                    showAlert('Failed to clear library', 'error');
                }
            }
        );
    };

    return (
        <div className="page settings-page">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Configure your MyTune experience
                </p>
            </div>

            {/* API Configuration */}
            <div className="settings-section glass">
                <div className="settings-section-header">
                    <Key size={24} />
                    <h2>YouTube API Configuration</h2>
                </div>

                <p className="settings-description">
                    To use search functionality, you need a YouTube Data API v3 key.
                </p>

                <div className="settings-field">
                    <label>API Key Status:</label>
                    <span className={apiKey ? 'status-active' : 'status-inactive'}>
                        {apiKey ? '✓ Configured' : '✗ Not Configured'}
                    </span>
                </div>

                <div className="info-box">
                    <Info size={20} />
                    <div>
                        <strong>How to get an API key:</strong>
                        <ol>
                            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                            <li>Create a new project or select existing one</li>
                            <li>Enable "YouTube Data API v3"</li>
                            <li>Create credentials (API Key)</li>
                            <li>Copy the key to your <code>.env</code> file as <code>VITE_YOUTUBE_API_KEY</code></li>
                            <li>Restart the development server</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="settings-section glass">
                <div className="settings-section-header">
                    <Trash2 size={24} />
                    <h2>Data Management</h2>
                </div>

                <p className="settings-description">
                    Clear all saved tracks and playlists from your library.
                </p>

                <button
                    className="btn btn-danger"
                    onClick={handleClearLibrary}
                >
                    <Trash2 size={20} />
                    Clear All Library Data
                </button>
            </div>

            {/* About */}
            <div className="settings-section glass">
                <div className="settings-section-header">
                    <Info size={24} />
                    <h2>About MyTune</h2>
                </div>

                <p className="settings-description">
                    MyTune is a premium YouTube music player built with React.
                    It allows you to search, save, and organize your favorite music from YouTube.
                </p>

                <div className="about-info">
                    <div className="about-item">
                        <strong>Version:</strong>
                        <span>1.0.0</span>
                    </div>
                    <div className="about-item">
                        <strong>Features:</strong>
                        <span>Search, Library, Playlists, Custom Covers</span>
                    </div>
                    <div className="about-item">
                        <strong>Storage:</strong>
                        <span>IndexedDB (Local)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
