import { onAuthStateChanged, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Netflix_Logo_PMS.png";
import { auth } from "../utlis/firebase";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addUser, removeUser } from "../utlis/userSlice";

const Header = () => {
    const dispatch = useDispatch();
    const user = auth.currentUser;
    const navigate = useNavigate();

    useEffect(()=> {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
        const {uid, email, displayName}  = user;
        dispatch(addUser({uid:uid, email:email,displayName:displayName}));
        navigate("/browse");

    } else {
        dispatch(removeUser());
        navigate("/login");
    }
    });

    return () => unsubscribe();
    },[]);

    const handlesignout = () => {
        signOut(auth).then(() => {
        navigate("/");
        }).catch((error) => {

        });
    }

    return(
        <div className="flex z-20 p-6 justify-between absolute w-screen" >
            <div className="px-24  flex">
                <Link to="/"><img className="absolute w-48" src={logo} alt="Netflix-logo"/></Link>
            </div>
            <div className="relative mx-14 flex">
               {user ? <button onClick={handlesignout} className="text-white bg-red-600 rounded-lg px-4 py-2" ><Link to="/">Sign Out </Link></button> : <button className="text-white bg-red-600 rounded-lg px-4 py-2" ><Link to="/login">Sign Up </Link></button> }
            </div>
            
        </div>
    );
}

export default Header;