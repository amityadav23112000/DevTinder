import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
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
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="card w-full max-w-sm shadow-xl bg-base-200 border border-primary/20">
                <div className="card-body">
                    <h2 className="card-title justify-center text-2xl text-base-content">Sign Up</h2>

                    <form className="flex flex-col gap-4" onSubmit={handleSignup}>
                        <div>
                            <label className="label">
                                <span className="label-text text-base-content">First Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="First name"
                                className="input input-bordered w-full"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-base-content">Last Name</span>
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

                        <div>
                            <label className="label">
                                <span className="label-text text-base-content">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="input input-bordered w-full"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-base-content">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-error text-sm">{error}</p>}

                        <div className="card-actions mt-4">
                            <button className="btn btn-primary w-full">Sign Up</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Signup;
