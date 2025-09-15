import { onAuthStateChanged, User } from 'firebase/auth';
// import { getAuth } from 'firebase/auth';
import { auth } from '../firebase';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

export interface IAuthRouteProps {
    children?: React.ReactNode;
    onAuthSuccess?: () => void;
}

const AuthRoute: React.FC<IAuthRouteProps> = (props) => {
    
    const { children } = props;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is logged in
                setUser(user);
            } else {
                // User is not logged in
                setUser(null);
                navigate('/login');
            }
        });
        return unsubscribe;
    }, [auth]);

    if (loading) {
        return <p>loading...</p>;
    }

    return <>{children}</>
}
export function logout() {
    auth.signOut().then(() => {
        console.log('User signed out');
        window.location.href = '/login';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
};
export function getCurrentUserID() {
    return auth.currentUser?.uid;
}
export function userIsLoggedIn() {
    return auth.currentUser !== null? true : false;
}

export default AuthRoute;
