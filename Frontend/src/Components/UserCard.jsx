import { FaUser, FaEnvelope, FaTransgender } from "react-icons/fa";
import { useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  const {

    firstName,
    lastName,
    skills = [],
    email,
    photoUrl,
    age,
    about,
    gender,
  } = user;
  const dispatch = useDispatch();

  const handleSendRequest = async(status,user) => {
    try{
    const res = await axios.post( BASE_URL +"/request/send/"+  status+"/"+ user._id,
      {},
      {
        withCredentials: true, // Include credentials for session management
      }
    );
    dispatch(removeUserFromFeed(user._id));
    if(res.status === 200){
      console.log("Request sent successfully");

    }
  }
    catch(error){
      console.error("Error sending request:", error);
    }

  };

  return (
    <div className="w-full max-w-md mx-auto bg-base-200 border border-primary/40 rounded-2xl shadow-lg hover:shadow-primary/40 transition duration-300 p-6">
      {/* Profile Image */}
      <div className="flex justify-center mb-4">
        <img
          src={
            photoUrl ||
            "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          }
          alt="User Profile"
          className="w-28 h-28 rounded-full object-cover ring ring-primary ring-offset-base-100 ring-offset-2"
        />
      </div>

      {/* Name & Gender */}
      <h2 className="text-2xl font-semibold text-center capitalize text-primary mb-1">
        {firstName} {lastName}
      </h2>
      <p className="text-center text-sm text-gray-400 flex items-center justify-center gap-2">
        <FaTransgender /> {gender || "Not specified"}
      </p>

      {/* Age & Email */}
      <div className="text-center text-sm text-gray-400 mt-1 flex flex-col items-center gap-1">
        {age && (
          <p>
            <FaUser className="inline mr-1" />
            Age: {age}
          </p>
        )}
        {email && (
          <p>
            <FaEnvelope className="inline mr-1" />
            {email}
          </p>
        )}
      </div>

      {/* About */}
      <p className="mt-3 text-sm text-center text-white/80 italic capitalize">
        {about || "No description available."}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {skills.length > 0 ? (
          skills.map((skill, idx) => (
            <span
              key={idx}
              className="badge badge-outline badge-primary px-3 py-1 text-xs"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="badge badge-ghost text-xs">No skills listed</span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-6 gap-4">
        <button
          className="btn btn-outline btn-error w-1/2"
          onClick={() =>handleSendRequest("ignore",user)}
        >
          Ignore
        </button>
        <button
          className="btn btn-primary w-1/2"
          onClick={() => handleSendRequest("interested",user)}
        >
          Interested
        </button>
      </div>
    </div>
  );
};

export default UserCard;
