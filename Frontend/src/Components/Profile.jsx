import { useSelector } from "react-redux";

const Profile = () => {
  const user = useSelector((store) => store.user);
  const {
    firstName,
    lastName,
    email,
    age,
    gender,
    about,
    photoUrl,
    skills = [],
  } = user || {};

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-16 bg-base-100 text-base-content">
      <img
        src={
          photoUrl ||
          "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
        }
        alt="Profile"
        className="w-32 h-32 rounded-full object-cover border-4 border-primary"
      />
      <h1 className="mt-4 text-3xl font-bold text-primary capitalize">
        {firstName} {lastName}
      </h1>
      <p className="text-sm text-gray-500">{email}</p>

      <div className="mt-6 w-full max-w-lg space-y-4">
        <div>
          <span className="font-medium text-accent">Age:</span>{" "}
          {age || "N/A"}
        </div>
        <div className="capitalize">
          <span className="font-medium text-accent">Gender:</span>{" "}
          {gender || "Not specified"}
        </div>
        <div className="capitalize">
          <span className="font-medium text-accent">About:</span>{" "}
          {about || "No description available."}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-secondary">Skills</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.length > 0 ? (
              skills.map((skill, idx) => (
                <span key={idx} className="badge badge-outline badge-primary">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">No skills listed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

