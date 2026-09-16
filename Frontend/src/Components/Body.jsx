import {Outlet, useLocation} from 'react-router-dom';
import Navbar from './NavBar';
import Footer  from './Footer';
import { BASE_URL } from '../utils/constants';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Body  =  ()=> {
     const dispatch = useDispatch();
     const navigate = useNavigate();
     const user = useSelector(store => store.user);
     const location = useLocation();
    // Fetches the logged-in user once on mount so every page under this layout has it
    const fetchUser = async () => {
        if(user) return ;
        try{
        const user = await axios.get(BASE_URL + '/profile/view', {
            "withCredentials": true
        });
        dispatch(addUser(user.data));
        }
        catch(error){
            if(error.status ===401)
            return navigate("/login");
            console.error('Error fetching user:', error);
        }
    }
    useEffect(() => {

          fetchUser();
    },[]);

    return (
       <>
       <div className="min-h-screen flex flex-col">
           <Navbar/>
           <main key={location.pathname} className="flex-1 animate-page-fade">
             <Outlet/>
           </main>
           <Footer/>
       </div>
       </>
    );
    }

export default Body;
