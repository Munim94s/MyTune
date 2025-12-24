import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }

    if (user) {
        // If user is already logged in, redirect them.
        // Check if there's a 'from' state to send them back to where they were, otherwise home.
        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    return children;
};

export default PublicRoute;
