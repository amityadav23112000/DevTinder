import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { FaMagic, FaBuilding, FaTimes, FaHeart } from "react-icons/fa";
import { removeUserFromFeed } from "../utils/feedSlice";
import Avatar from "./Avatar";

const Suggested = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [emptyMessage, setEmptyMessage] = useState("");
    const dispatch = useDispatch();

    const fetchSuggestions = async () => {
        setLoading(true);
        setError("");
        setEmptyMessage("");
        try {
            const response = await axios.get(BASE_URL + "/user/recommendations", {
                withCredentials: true,
            });
            setSuggestions(response.data.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setSuggestions([]);
                setEmptyMessage(err.response?.data?.message || "No suggestions right now.");
            } else {
                setError("Couldn't load suggestions. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    // Reuses the same send-request flow as the feed — Interested/Ignore
    // both remove the card from this list once acted on.
    const handleRespond = async (status, userId) => {
        try {
            await axios.post(BASE_URL + "/request/send/" + status + "/" + userId, {}, {
                withCredentials: true,
            });
            setSuggestions((prev) => prev.filter((s) => s._id !== userId));
            dispatch(removeUserFromFeed(userId)); // keep the swipe feed in sync too
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-gray-400">Finding developers similar to you...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-error">{error}</p>
                <button className="btn btn-primary btn-sm" onClick={fetchSuggestions}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] px-4 py-10">
            <h1 className="text-3xl font-bold mb-2 text-center text-primary flex items-center justify-center gap-2">
                <FaMagic /> Suggested for You
            </h1>
            <p className="text-center text-gray-400 mb-8 text-sm">
                Developers with a similar profile to yours, picked by AI
            </p>

            {suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
                    <FaMagic className="text-5xl text-gray-400" />
                    <h2 className="text-xl font-semibold text-base-content">No suggestions yet</h2>
                    <p className="text-gray-400 max-w-sm">{emptyMessage}</p>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {suggestions.map((person) => (
                        <div
                            key={person._id}
                            className="flex flex-col items-center gap-2 bg-base-200 border border-primary/20 rounded-2xl shadow-md hover:shadow-primary/30 transition duration-300 p-6"
                        >
                            <Avatar
                                photoUrl={person.photoUrl}
                                gender={person.gender}
                                size="w-20 h-20"
                                className="ring ring-primary ring-offset-base-100 ring-offset-2"
                            />
                            <div className="text-lg font-semibold capitalize text-base-content text-center">
                                {person.firstName} {person.lastName}
                            </div>

                            <div
                                className={`radial-progress font-bold text-sm ${
                                    person.matchScore >= 0.9 ? "text-success" : "text-primary"
                                }`}
                                style={{ "--value": Math.round(person.matchScore * 100), "--size": "3.5rem", "--thickness": "3px" }}
                                role="progressbar"
                            >
                                {Math.round(person.matchScore * 100)}%
                            </div>

                            {person.organization && (
                                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <FaBuilding className="shrink-0" /> {person.organization}
                                </p>
                            )}

                            {person.about && (
                                <p className="mt-1 text-sm text-center text-white/80 italic line-clamp-2">
                                    {person.about}
                                </p>
                            )}

                            {person.skills?.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                                    {person.skills.slice(0, 4).map((skill, idx) => (
                                        <span key={idx} className="badge badge-primary badge-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-center text-gray-400 mt-2 italic">
                                {person.reason}
                            </p>

                            <div className="flex justify-center gap-3 mt-4 w-full">
                                <button
                                    className="btn btn-outline btn-error btn-sm rounded-full flex-1 gap-1"
                                    onClick={() => handleRespond("ignore", person._id)}
                                >
                                    <FaTimes /> Ignore
                                </button>
                                <button
                                    className="btn btn-success btn-sm rounded-full flex-1 gap-1 text-black"
                                    onClick={() => handleRespond("interested", person._id)}
                                >
                                    <FaHeart /> Interested
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Suggested;
