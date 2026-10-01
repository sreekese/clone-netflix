import background from "../assets/bg-netflix.jpg";
import { Link } from "react-router-dom";
import logo from "../assets/Netflix_Logo_PMS.png";

const Initialloading = () => {
    return (
         <div className='relative w-full h-screen'>
            <div className='bg-cover'>
                <img className=' absolute w-full h-full object-cover bg-blend-overlay' src={background} alt='netflix-bg'></img>
                <div className="absolute w-full h-full bg-black opacity-80"></div>
            </div>
            <div className="flex z-10 p-6 justify-between">
                <div className="px-24  flex">
                    <Link to="/"><img className="absolute w-48" src={logo} alt="Netflix-logo"/></Link>
                </div>
                <div className="relative mx-14 flex">
                    <button className="text-white bg-red-600 rounded-lg px-4 py-2" ><Link to="/login">Sign Up </Link></button> 
                </div>   
            </div> 
            <div className="relative my-16 ">
                <h1 className='leading-normal text-white text-6xl text-center font-bold'>Unlimited movies, TV  <br />shows and more</h1>
                <p className='text-white text-center text-2xl py-2'> Starts at ₹149. Cancel at any time.</p>
                <p className='text-white text-center text-1xl py-2'> Ready to watch? Enter your email to create or restart your membership.</p>
            </div>
        </div>
    );
}

export default Initialloading;