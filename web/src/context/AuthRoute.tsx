import { onAuthStateChanged, User } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

export interface IAuthRouteProps {
    children?: React.ReactNode;
}

const AuthRoute: React.FC<IAuthRouteProps> = (props) => {
    const auth = getAuth();
    const { children } = props;
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
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

export default AuthRoute;