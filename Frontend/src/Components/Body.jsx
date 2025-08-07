import {Outlet} from 'react-router-dom';
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
    // This component serves as the main layout for the application,
    const fetchUser = async () => {
        if(user) return ;
        // You can implement user fetching logic here if needed
        try{
        const user = await axios.get(BASE_URL + '/profile/view', {
            "withCredentials": true
        });
        dispatch(addUser(user.data));
        console.log('User fetched:', user.data);
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
           <Outlet/>
           <Footer/>
       </div>
       </>
    );
    }

export default Body;
