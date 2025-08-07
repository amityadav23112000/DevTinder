import axios from 'axios';
import  { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';

const Login= () =>{

    const [emailId,setEmailId] = useState("romish@gmail.com");
    const [password, setPassword] = useState("Myloveap@123");
    const dispatch = useDispatch();
     const navigate = useNavigate();
   

    const handleLogin = async (e) => {
       
        // Prevent default form submission
        // await axios.post('http://localhost:1234/login', {
        //     email: emailId,  
        //     password: password
        // });
        // Handle login logic here
        // For example, you can send a POST request to your backend API
        // using axios or fetch
        e.preventDefault();
       try{  const res = await axios.post(
            'http://localhost:1234/login',
            {
                email :emailId,
                password:  password
            },
            {
                withCredentials: true // ✅ This goes in the config, not the data
            }
        );
        console.log('Login successful:', res.data);
        // Dispatch an action to update the Redux store with user data
        dispatch(addUser(res.data));
        return navigate("/feed")
        }
      catch(error){
        {
            console.error('Login failed:', error);
            // Handle error (e.g., show an error message to the user)
        }
    }
    };

return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-full max-w-sm shadow-xl bg-white">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl text-neutral">Login</h2>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label className="label">
                <span className="label-text text-neutral">Email</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                required
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-neutral">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                required
                value = {password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="card-actions mt-4">
              <button className="btn btn-primary w-full">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>


)
}

export default Login;