import { FaUser, FaEnvelope, FaTransgender, FaTimes, FaHeart, FaBuilding, FaGraduationCap } from "react-icons/fa";
import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removeUserFromFeed } from "../utils/feedSlice";
import Avatar from "./Avatar";

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
    organization,
    education = [],
  } = user;
  const dispatch = useDispatch();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSendRequest = async(status,user) => {
    setSending(true);
    setError("");
    try{
    await axios.post( BASE_URL +"/request/send/"+  status+"/"+ user._id,
      {},
      {
        withCredentials: true, // Include credentials for session management
      }
    );
    dispatch(removeUserFromFeed(user._id));
  }
    catch(error){
      setError(error.response?.data?.message || "Something went wrong. Please try again.");
      setSending(false);
    }

  };

  return (
    <div className="w-full max-w-lg mx-auto bg-base-200 border border-primary/40 rounded-2xl shadow-lg hover:shadow-primary/40 transition duration-300 p-8">
      {/* Profile Image */}
      <div className="flex justify-center mb-6">
        <Avatar
          photoUrl={photoUrl}
          gender={gender}
          size="w-40 h-40"
          className="ring-4 ring-primary ring-offset-base-100 ring-offset-4"
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
        {organization && (
          <p>
            <FaBuilding className="inline mr-1" />
            {organization}
          </p>
        )}
      </div>

      {/* About */}
      <p className="mt-4 text-base text-center text-white/80 italic capitalize">
        {about || "No description available."}
      </p>

      {/* Education */}
      {education.length > 0 && (
        <p className="mt-2 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <FaGraduationCap className="shrink-0" />
          {[education[0].degree, education[0].institution, education[0].year].filter(Boolean).join(" · ")}
          {education.length > 1 && ` (+${education.length - 1} more)`}
        </p>
      )}

      {/* Skills */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {skills.length > 0 ? (
          skills.map((skill, idx) => (
            <span
              key={idx}
              className="badge badge-primary badge-lg font-medium shadow-sm"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="badge badge-ghost badge-lg">No skills listed</span>
        )}
      </div>

      {/* Error */}
      {error && <p className="mt-3 text-center text-error text-sm">{error}</p>}

      {/* Buttons */}
      <div className="flex justify-between mt-8 gap-4">
        <button
          className="btn btn-outline btn-error btn-lg rounded-full w-1/2 gap-2 hover:scale-105 transition-transform"
          disabled={sending}
          onClick={() =>handleSendRequest("ignore",user)}
        >
          <FaTimes /> Ignore
        </button>
        <button
          className="btn btn-success btn-lg rounded-full w-1/2 gap-2 hover:scale-105 transition-transform"
          disabled={sending}
          onClick={() => handleSendRequest("interested",user)}
        >
          {sending ? <span className="loading loading-spinner loading-sm"></span> : <><FaHeart /> Interested</>}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
