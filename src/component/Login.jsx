import { useRef, useState } from 'react';
import Header from './Header';
import background from "../assets/bg-netflix.jpg"; 
import { checkValidateForm } from '../utlis/validate';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../utlis/firebase";
import { addUser } from '../utlis/userSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [islogin, setIslogin] =  useState(true);
    const [errorMessage, setErrorMessage] = useState();
    const email = useRef(null);
    const password = useRef(null);
    const name = useRef(null);

    const handlechageform = () => {
        setIslogin(!islogin);
    }

    const handleAuthError = (error) => {
        setErrorMessage(`${error.code}-${error.message}`);
    };

    const handlesubmit = () => {
        const message = checkValidateForm(email.current.value, password.current.value);
        setErrorMessage(message);
        if(message) return;
        
        if(!islogin) {
            const fullName = name.current.value.trim();
            createUserWithEmailAndPassword(auth, email.current.value, password.current.value)
                .then(({ user }) => updateProfile(user, { displayName: fullName })
                    .then(() => {
                        dispatch(addUser({ uid: user.uid, email: user.email, displayName: fullName }));
                        navigate("/browse");
                    })
                )
                .catch(handleAuthError);
        } else {
            signInWithEmailAndPassword(auth, email.current.value, password.current.value)
                .catch(handleAuthError);
        }
    }

    return (
    <div className='relative w-full h-screen'>
        <div className='bg-cover'>
            <img className='absolute w-full h-full object-cover bg-blend-overlay' src={background} alt='netflix-bg'></img>
            <div className="absolute w-full h-full bg-black opacity-80"></div>
        </div>
        <Header />
        <div className="absolute mx-auto right-0 left-0 align-middle w-3/12 bg-black bg-opacity-50">
            <form onSubmit={(e) => e.preventDefault()}className="relative px-12 py-4">
                <h1 className="text-white font-bold text-3xl py-2 my-2">{islogin ? "Sign In" : "Sign Up"}</h1>
                {!islogin && (<input ref={name} className="rounded-md p-2 my-2 w-full bg-transparent border-gray-100 border" type="text" placeholder="Full Name"/>)}
                <input ref={email} className="text-white rounded-md p-2 my-2 w-full bg-transparent border-gray-100 border" type="email" placeholder="Email Address"/>
                <input ref={password} className="text-white rounded-md p-2 my-2 w-full bg-transparent border-gray-100 border" type="password" placeholder="Password"/>
                <p className="text-red-700 font-bold">{errorMessage}</p>
                <button onClick={handlesubmit} className="rounded-md w-full my-4 text-white bg-red-600 px-4 py-2">{islogin ? "Sign In" : "Sign Up"}</button>
                <p onClick={handlechageform} className="text-white my-4 cursor-pointer">New to Netflix? {islogin ? "Sign Up" : "Sign In"} now.</p>
            </form>
        </div>
    </div>
    )
}

export default Login
