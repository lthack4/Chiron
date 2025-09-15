import React, { useState } from 'react'
// import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../firebase'
import GoogleButton from 'react-google-button'
import { useNavigate } from 'react-router-dom';

//might be useful to handle login execution states
export interface ILoginProps {
    onLoginSuccess?: () => void;
    errorMessage?: string;
}

const LoginPage: React.FunctionComponent<ILoginProps> = (props) => {
    
    // const auth = getAuth();
    
    // const provider = new GoogleAuthProvider();
    const navigate = useNavigate();
    const [authing, setAuthing]= useState(false);
    
    const signInWithGoogle = async () => {
        setAuthing(true);

        signInWithPopup(auth, provider)
            .then(res => {
                console.log(res.user.uid);
                navigate('/');
            })
            .catch((error)=>{
                console.log(error);
                setAuthing(false);
            });
    };

    return (
        <div>
            <h2>Login Page</h2>
            <div>
                <GoogleButton onClick={() => signInWithGoogle()} disabled= {authing}/>
            </div>
        </div>
    )
}

export default LoginPage;
