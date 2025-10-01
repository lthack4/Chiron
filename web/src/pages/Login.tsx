import React, { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, isFirebaseConfigured, provider } from '../firebase'
import GoogleButton from 'react-google-button'
import { useNavigate } from 'react-router-dom';

export interface ILoginProps {
    onLoginSuccess?: () => void;
    errorMessage?: string;
}

const LoginPage: React.FunctionComponent<ILoginProps> = () => {
    const navigate = useNavigate();
    const [authing, setAuthing]= useState(false);

    const firebaseReady = Boolean(isFirebaseConfigured && auth && provider)
    
    const signInWithGoogle = async () => {
        if (!firebaseReady || !auth || !provider) {
            navigate('/');
            return;
        }

        setAuthing(true);


        setAuthing(true);
        const result= await signInWithPopup(auth, provider).then((result) => {
            navigate('/');
            return result;
        }).catch((error) => {
            setAuthing(false);
        })
            
    };

    return (
        <div>
            <h2>Login Page</h2>
            {!firebaseReady && (
                <p style={{ color: '#b00' }}>
                    Firebase is not configured. Continuing in offline mode.
                </p>
            )}
            <div>
                <GoogleButton onClick={() => signInWithGoogle()} disabled={firebaseReady ? authing : false}/>
            </div>
        </div>
    )
}

export default LoginPage;
