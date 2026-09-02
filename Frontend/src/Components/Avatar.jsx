import { FaMale, FaFemale, FaUserCircle } from "react-icons/fa";

const GENDER_ICON = {
  male: FaMale,
  female: FaFemale,
};

// Renders the user's uploaded photo, or a gender-appropriate icon placeholder
// when they haven't uploaded one.
const Avatar = ({ photoUrl, gender, size = "w-32 h-32", className = "" }) => {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="Profile"
        className={`${size} rounded-full object-cover ${className}`}
      />
    );
  }

  const Icon = GENDER_ICON[gender] || FaUserCircle;
  return (
    <div className={`${size} rounded-full bg-base-300 flex items-center justify-center ${className}`}>
      <Icon className="text-primary w-3/5 h-3/5" />
    </div>
  );
};

export default Avatar;
