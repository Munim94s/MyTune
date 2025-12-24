import { Music } from 'lucide-react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-logo">
                    <Music size={64} strokeWidth={2} />
                </div>
                <h1 className="loading-title">MyTune</h1>
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
