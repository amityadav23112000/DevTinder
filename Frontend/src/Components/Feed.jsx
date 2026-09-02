import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import UserCard from "./UserCard.jsx";

const Feed = () => {
    const feed = useSelector((store) => store.feed);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(!feed);
    const [error, setError] = useState("");

    const getFeedData = async () => {
        if (feed) return; // Feed already loaded, no need to refetch
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(BASE_URL + "/user/feed", {
                withCredentials: true,
            });
            dispatch(addFeed(res.data));
        }
        catch (err) {
            if (err.response?.status === 404) {
                // No users left to show — not an error, just an empty feed
                dispatch(addFeed([]));
            } else {
                setError("Couldn't load your feed. Please try again.");
            }
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getFeedData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-gray-400">Finding developers for you...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-error">{error}</p>
                <button className="btn btn-primary btn-sm" onClick={getFeedData}>
                    Retry
                </button>
            </div>
        );
    }

    if (!feed || feed.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
                <FaUserFriends className="text-5xl text-gray-400" />
                <h2 className="text-xl font-semibold text-base-content">You're all caught up!</h2>
                <p className="text-gray-400 max-w-sm">
                    No more developers to show right now. Check back later for new profiles.
                </p>
            </div>
        );
    }

    return (
        <div className="flex justify-center p-4">
            <div className="relative w-full max-w-lg">
                {feed[1] && (
                    <div className="absolute inset-x-0 top-2 scale-95 opacity-40 -z-10">
                        <UserCard user={feed[1]} />
                    </div>
                )}
                <div key={feed[0]._id} className="relative animate-card-in">
                    <UserCard user={feed[0]} />
                </div>
            </div>
        </div>
    );
};

export default Feed;
