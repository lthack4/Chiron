import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
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
    
    const user = useAuthState();

    if (!user) {
        return <p>loading...</p>;
    }
    
    return <>{children}</>
}

function useAuthState() {
    
    const navigate = useNavigate();
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

    return user;
}


export function logout() {
    auth.signOut().then(() => {
        window.location.href = '/login';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
};
export function getCurrentUserID() {
    return auth.currentUser?.uid;
}

export default AuthRoute;
