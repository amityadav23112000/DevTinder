import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import { FaUser, FaEnvelope, FaLock, FaCode } from 'react-icons/fa';

const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await axios.post(
                BASE_URL + '/signup',
                { firstName, lastName, email, password },
                { withCredentials: true }
            );
            navigate("/login");
        }
        catch (error) {
            setError(error.response?.data?.error || "Something went wrong. Please try again.");
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
                    Join a community of developers building their next connection.
                </p>
            </div>

            {/* Form panel */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 bg-base-100">
                <div className="w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-center text-base-content mb-1">Create your account</h2>
                    <p className="text-center text-sm text-gray-400 mb-6">Start connecting with developers</p>

                    <form className="flex flex-col gap-4" onSubmit={handleSignup}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="input input-bordered flex items-center gap-2 w-full">
                                <FaUser className="text-primary" />
                                <input
                                    type="text"
                                    placeholder="First name"
                                    className="grow"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </label>
                            <input
                                type="text"
                                placeholder="Last name"
                                className="input input-bordered w-full"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        <label className="input input-bordered flex items-center gap-2 w-full">
                            <FaEnvelope className="text-primary" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="grow"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                            {loading ? <span className="loading loading-spinner loading-sm"></span> : "Sign Up"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
