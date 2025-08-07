import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
 // Assuming UserCard is a component to display user information
import UserCard from "./UserCard.jsx";

const Feed=()=>{
    const feed = useSelector((store) => store.feed);
    // Assuming feed contains posts or updates to display
    const dispatch = useDispatch();
   

    const getFeedData = async () => {
        if(feed)return; // If feed data is already present, no need to fetch again
        try{
            const res= await axios.get( BASE_URL+ "/user/feed",
                {
                    withCredentials: true // Include credentials for session management
                }
            );
            
            dispatch(addFeed(res.data));
        }
        catch(error) {
                     console.log('Error fetching feed data:', error);
        }
    };

    useEffect(() => {
        getFeedData();
    },[]);

    if(!feed) {
        return <div className="flex justify-center items-center h-screen">No feed data available.</div>;
    }
    return (
        feed &&  <div className="flex flex-wrap gap-4 justify-center p-4">
           <UserCard user={feed[0]} />
    </div>
         
   
     
    );
}

export default Feed;