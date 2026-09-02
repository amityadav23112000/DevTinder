import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaTransgender, FaEdit, FaLinkedin, FaGithub, FaBuilding, FaGraduationCap } from "react-icons/fa";
import { SiLeetcode, SiCodeforces } from "react-icons/si";
import Avatar from "./Avatar";

const Profile = () => {
  const user = useSelector((store) => store.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const {
    firstName,
    lastName,
    email,
    age,
    gender,
    about,
    photoUrl,
    skills = [],
    organization,
    education = [],
    linkedinUrl,
    githubUrl,
    leetcodeUrl,
    codeforcesUrl,
  } = user;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-base-200 border border-primary/40 rounded-2xl shadow-lg p-8">
        <div className="flex justify-center">
          <Avatar
            photoUrl={photoUrl}
            gender={gender}
            size="w-36 h-36"
            className="ring-4 ring-primary ring-offset-base-100 ring-offset-4"
          />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-center capitalize text-primary">
          {firstName} {lastName}
        </h1>

        <div className="mt-2 flex flex-col items-center gap-1 text-sm text-gray-400">
          <p className="flex items-center gap-2">
            <FaEnvelope /> {email}
          </p>
          <p className="flex items-center gap-2 capitalize">
            <FaTransgender /> {gender || "Not specified"}
          </p>
          {age && (
            <p className="flex items-center gap-2">
              <FaUser /> Age: {age}
            </p>
          )}
          {organization && (
            <p className="flex items-center gap-2">
              <FaBuilding /> {organization}
            </p>
          )}
        </div>

        <p className="mt-4 text-base text-center text-white/80 italic">
          {about || "No description available."}
        </p>

        {education.length > 0 && (
          <div className="mt-3 space-y-1">
            {education.map((edu, idx) => (
              <p key={idx} className="flex items-center justify-center gap-2 text-sm text-gray-400 text-center">
                <FaGraduationCap className="shrink-0" />
                {[edu.degree, edu.institution, edu.year].filter(Boolean).join(" · ")}
              </p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {skills.length > 0 ? (
            skills.map((skill, idx) => (
              <span key={idx} className="badge badge-primary badge-lg font-medium shadow-sm">
                {skill}
              </span>
            ))
          ) : (
            <span className="badge badge-ghost badge-lg">No skills listed</span>
          )}
        </div>

        {(linkedinUrl || githubUrl || leetcodeUrl || codeforcesUrl) && (
          <div className="flex justify-center gap-5 mt-6 text-2xl text-primary">
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:scale-110 transition-transform">
                <FaLinkedin />
              </a>
            )}
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub" className="hover:scale-110 transition-transform">
                <FaGithub />
              </a>
            )}
            {leetcodeUrl && (
              <a href={leetcodeUrl} target="_blank" rel="noopener noreferrer" title="LeetCode" className="hover:scale-110 transition-transform">
                <SiLeetcode />
              </a>
            )}
            {codeforcesUrl && (
              <a href={codeforcesUrl} target="_blank" rel="noopener noreferrer" title="Codeforces" className="hover:scale-110 transition-transform">
                <SiCodeforces />
              </a>
            )}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Link to="/edit-profile" className="btn btn-outline btn-primary gap-2">
            <FaEdit /> Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
