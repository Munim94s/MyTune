import { useState } from 'react';
import { Music2, TrendingUp } from 'lucide-react';
import './Home.css';

const Home = () => {
    return (
        <div className="page home-page">
            <div className="home-hero">
                <div className="home-hero-content">
                    <h1 className="home-title">
                        Welcome to <span className="gradient-text">MyTune</span>
                    </h1>
                    <p className="home-subtitle">
                        Your premium YouTube music player. Search, save, and enjoy your favorite music.
                    </p>
                </div>

                <div className="home-features animate-stagger">
                    <div className="feature-card glass">
                        <div className="feature-icon">
                            <Music2 size={32} />
                        </div>
                        <h3>Unlimited Music</h3>
                        <p>Access millions of songs from YouTube with high-quality playback</p>
                    </div>

                    <div className="feature-card glass">
                        <div className="feature-icon">
                            <TrendingUp size={32} />
                        </div>
                        <h3>Smart Library</h3>
                        <p>Organize your tracks into playlists and customize with your own covers</p>
                    </div>
                </div>
            </div>

            <div className="home-cta">
                <h2>Get Started</h2>
                <p>Search for your favorite music or add tracks by URL</p>
                <a href="/search" className="btn btn-primary">
                    Start Searching
                </a>
            </div>
        </div>
    );
};

export default Home;
