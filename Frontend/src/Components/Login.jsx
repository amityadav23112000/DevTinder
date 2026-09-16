import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import { FaEnvelope, FaLock, FaCode } from 'react-icons/fa';

const Login = () => {
    const [emailId, setEmailId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await axios.post(
                BASE_URL + '/login',
                { email: emailId, password: password },
                { withCredentials: true }
            );
            dispatch(addUser(res.data));
            navigate("/feed");
        }
        catch (error) {
            setError(error.response?.data?.error || "Invalid email or password.");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex">
            {/* Branding panel — hidden on mobile, form takes full width there */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white flex-col items-center justify-center p-12 text-center">
                <FaCode className="text-6xl mb-4" />
                <h1 className="text-4xl font-extrabold tracking-tight">DevTinder</h1>
                <p className="mt-3 text-white/90 max-w-xs">
                    Swipe, match, and connect with developers who share your stack.
                </p>
            </div>

            {/* Form panel */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 bg-base-100">
                <div className="w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-center text-base-content mb-1">Welcome back</h2>
                    <p className="text-center text-sm text-gray-400 mb-6">Log in to continue swiping</p>

                    <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                        <label className="input input-bordered flex items-center gap-2 w-full">
                            <FaEnvelope className="text-primary" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="grow"
                                required
                                value={emailId}
                                onChange={(e) => setEmailId(e.target.value)}
                            />
                        </label>

                        <label className="input input-bordered flex items-center gap-2 w-full">
                            <FaLock className="text-primary" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="grow"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>

                        {error && <p className="text-error text-sm">{error}</p>}

                        <button className="btn btn-primary w-full gap-2 mt-2" disabled={loading}>
                            {loading ? <span className="loading loading-spinner loading-sm"></span> : "Login"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        New here?{" "}
                        <Link to="/signup" className="text-primary font-medium hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
