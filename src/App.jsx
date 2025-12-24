import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import 'locomotive-scroll/dist/locomotive-scroll.css';
import { useState, useEffect } from 'react';
import YouTubePlayer from './components/Player/YouTubePlayer';
import MiniPlayer from './components/MiniPlayer/MiniPlayer';
import Sidebar from './components/Navigation/Sidebar';
import BottomNav from './components/Navigation/BottomNav';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import Library from './pages/Library/Library';
import PlaylistDetail from './pages/PlaylistDetail/PlaylistDetail';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Logout from './pages/Logout/Logout';
import Settings from './pages/Settings/Settings';
import ProtectedRoute from './components/Routes/ProtectedRoute';
import PublicRoute from './components/Routes/PublicRoute';
import { ModalProvider } from './context/ModalContext';
import GlobalModal from './components/UI/GlobalModal';
import { ScrollProvider } from './context/ScrollContext';
import Scrollbar from './components/UI/Scrollbar';


// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use instant to avoid stutter
    });
  }, [pathname]);

  return null;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate preloading all pages
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second loading screen

    return () => clearTimeout(timer);
  }, []);

  return (
    <PlayerProvider>
      <AuthProvider>
        <ModalProvider>
          {isLoading && <LoadingScreen />}
          <ScrollProvider>
            <Router>
              <ScrollToTop />
              <div className="app">
                <GlobalModal />
                <Sidebar />


                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route
                      path="/library"
                      element={
                        <ProtectedRoute>
                          <Library />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/playlist/:id"
                      element={
                        <ProtectedRoute>
                          <PlaylistDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <PublicRoute>
                          <Login />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <PublicRoute>
                          <Register />
                        </PublicRoute>
                      }
                    />
                    <Route path="/logout" element={<Logout />} />
                  </Routes>
                </main>

                <YouTubePlayer />
                <MiniPlayer />
                <BottomNav />
                <Scrollbar />
              </div>
            </Router>
          </ScrollProvider>
        </ModalProvider>
      </AuthProvider>
    </PlayerProvider>
  );
}

export default App;
