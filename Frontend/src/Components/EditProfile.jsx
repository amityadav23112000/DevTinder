import axios from 'axios';
import  { useState } from 'react';
import { useDispatch } from 'react-redux';

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const EditProfile= () =>{
    const user = useSelector((store) => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error,setError] = useState("");

return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-full max-w-sm shadow-xl bg-white">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl text-neutral">EditProfile</h2>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label className="label">
                <span className="label-text text-neutral">FirstName</span>
              </label>
              <input
                type="text"
                placeholder={user.firstName}
                className="input input-bordered w-full"
                value={user.firstName}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-neutral">LastName</span>
              </label>
              <input
                type="text"
                placeholder={user.lastName}
                className="input input-bordered w-full"
                required
                value = {user.lastName}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text text-neutral">LastName</span>
              </label>
              <input
                type="text"
                placeholder={user.lastName}
                className="input input-bordered w-full"
                required
                value = {user.lastName}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text text-neutral"></span>
              </label>
              <input
                type="text"
                placeholder={user.lastName}
                className="input input-bordered w-full"
                required
                value = {user.lastName}
              />
            </div>

            <div className="card-actions mt-4">
              <button className="btn btn-primary w-full">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>


)
}

export default Login;