import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { FaUserFriends, FaLinkedin, FaGithub, FaBuilding, FaGraduationCap } from "react-icons/fa";
import { SiLeetcode, SiCodeforces } from "react-icons/si";
import Avatar from "./Avatar";

const Connections = () => {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchConnections = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(BASE_URL + '/user/connections', {
                withCredentials: true,
            });
            setConnections(response.data.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setConnections([]);
            } else {
                setError("Couldn't load your connections. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-gray-400">Loading your connections...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-error">{error}</p>
                <button className="btn btn-primary btn-sm" onClick={fetchConnections}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] px-4 py-10">
            <h1 className="text-3xl font-bold mb-8 text-center text-primary">Your Connections</h1>

            {connections.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
                    <FaUserFriends className="text-5xl text-gray-400" />
                    <h2 className="text-xl font-semibold text-base-content">No connections yet</h2>
                    <p className="text-gray-400 max-w-sm">
                        Head over to the feed and start connecting with developers.
                    </p>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {connections.map((conn) => (
                        <div
                            key={conn.userId}
                            className="flex flex-col items-center gap-2 bg-base-200 border border-primary/20 rounded-2xl shadow-md hover:shadow-primary/30 hover:-translate-y-1 transition duration-300 p-6"
                        >
                            <Avatar
                                photoUrl={conn.photoUrl}
                                gender={conn.gender}
                                size="w-20 h-20"
                                className="ring ring-primary ring-offset-base-100 ring-offset-2"
                            />
                            <div className="text-lg font-semibold capitalize text-base-content text-center">
                                {conn.firstName} {conn.lastName}
                            </div>
                            {(conn.gender || conn.age) && (
                                <p className="text-xs text-gray-400 capitalize">
                                    {conn.gender || "Not specified"}{conn.age ? ` · ${conn.age}` : ""}
                                </p>
                            )}
                            <span className="badge badge-success badge-outline">Connected</span>

                            {conn.organization && (
                                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <FaBuilding className="shrink-0" /> {conn.organization}
                                </p>
                            )}

                            {conn.about && (
                                <p className="mt-1 text-sm text-center text-white/80 italic line-clamp-2">
                                    {conn.about}
                                </p>
                            )}

                            {conn.skills?.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                                    {conn.skills.slice(0, 4).map((skill, idx) => (
                                        <span key={idx} className="badge badge-primary badge-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                    {conn.skills.length > 4 && (
                                        <span className="badge badge-ghost badge-sm">+{conn.skills.length - 4}</span>
                                    )}
                                </div>
                            )}

                            {conn.education?.length > 0 && (
                                <p className="text-xs text-gray-400 flex items-center gap-1.5 text-center">
                                    <FaGraduationCap className="shrink-0" />
                                    {[conn.education[0].degree, conn.education[0].institution, conn.education[0].year].filter(Boolean).join(" · ")}
                                    {conn.education.length > 1 && ` (+${conn.education.length - 1} more)`}
                                </p>
                            )}

                            {(conn.linkedinUrl || conn.githubUrl || conn.leetcodeUrl || conn.codeforcesUrl) && (
                                <div className="flex justify-center gap-4 mt-2 text-xl text-primary">
                                    {conn.linkedinUrl && (
                                        <a href={conn.linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:scale-110 transition-transform">
                                            <FaLinkedin />
                                        </a>
                                    )}
                                    {conn.githubUrl && (
                                        <a href={conn.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub" className="hover:scale-110 transition-transform">
                                            <FaGithub />
                                        </a>
                                    )}
                                    {conn.leetcodeUrl && (
                                        <a href={conn.leetcodeUrl} target="_blank" rel="noopener noreferrer" title="LeetCode" className="hover:scale-110 transition-transform">
                                            <SiLeetcode />
                                        </a>
                                    )}
                                    {conn.codeforcesUrl && (
                                        <a href={conn.codeforcesUrl} target="_blank" rel="noopener noreferrer" title="Codeforces" className="hover:scale-110 transition-transform">
                                            <SiCodeforces />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Connections;
