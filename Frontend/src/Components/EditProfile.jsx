import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSave, FaLinkedin, FaGithub, FaCamera, FaBuilding, FaGraduationCap, FaPlus, FaTrash, FaMagic } from 'react-icons/fa';
import { SiLeetcode, SiCodeforces } from 'react-icons/si';
import { BASE_URL } from '../utils/constants';
import { addUser } from '../utils/userSlice';
import Avatar from './Avatar';

const ABOUT_MAX_LENGTH = 500;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const RAW_TEXT_MAX_LENGTH = 1000; // matches the backend's cap

const EditProfile = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [about, setAbout] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [organization, setOrganization] = useState("");
  const [education, setEducation] = useState([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [codeforcesUrl, setCodeforcesUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [rawText, setRawText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  // Sync local form state once the logged-in user is available/updated
  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setAge(user.age ? String(user.age) : "");
    setGender(user.gender || "");
    setAbout(user.about || "");
    setSkillsInput((user.skills || []).join(", "));
    setOrganization(user.organization || "");
    setEducation(
      (user.education || []).map((e) => ({
        degree: e.degree || "",
        institution: e.institution || "",
        year: e.year ? String(e.year) : "",
      }))
    );
    setLinkedinUrl(user.linkedinUrl || "");
    setGithubUrl(user.githubUrl || "");
    setLeetcodeUrl(user.leetcodeUrl || "");
    setCodeforcesUrl(user.codeforcesUrl || "");
  }, [user]);

  const previewSkills = skillsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const addEducationRow = () => {
    setEducation([...education, { degree: "", institution: "", year: "" }]);
  };

  const updateEducationRow = (idx, field, value) => {
    setEducation(education.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const removeEducationRow = (idx) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  // Drop fully-empty rows and coerce year to a number before saving
  const cleanedEducation = education
    .filter((row) => row.degree.trim() || row.institution.trim() || row.year)
    .map((row) => ({
      degree: row.degree.trim(),
      institution: row.institution.trim(),
      year: row.year ? Number(row.year) : undefined,
    }));

  // Asks the backend to turn rough notes into an about/skills draft, then
  // drops the result straight into the normal fields below — nothing is
  // saved yet, the user still has to review and hit "Save Changes".
  const handleGenerate = async () => {
    setGenerateError("");
    setGenerating(true);
    try {
      const res = await axios.post(
        BASE_URL + "/profile/generate",
        { rawText },
        { withCredentials: true }
      );
      setAbout(res.data.about);
      setSkillsInput(res.data.skills.join(", "));
    }
    catch (err) {
      setGenerateError(err.response?.data?.error || "Couldn't generate a profile. Please try again.");
    }
    finally {
      setGenerating(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSaving(true);

    // Only include fields that actually have a value — an empty gender/age
    // would fail backend validation instead of just being "unset"
    const payload = {
      firstName,
      lastName,
      about,
      skills: previewSkills,
      organization,
      education: cleanedEducation,
      linkedinUrl,
      githubUrl,
      leetcodeUrl,
      codeforcesUrl,
    };
    if (gender) payload.gender = gender;
    if (age) payload.age = Number(age);

    try {
      const res = await axios.patch(BASE_URL + "/profile/edit", payload, {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
      setSuccessMsg("Profile updated successfully!");
    }
    catch (error) {
      setError(error.response?.data?.error || "Something went wrong. Please try again.");
    }
    finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setPhotoError("");
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("Image must be under 5MB.");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPhotoPreview(localPreviewUrl);
    setUploadingPhoto(true);

    try {
      // Step 1: ask the backend for a short-lived S3 upload URL
      const presignRes = await axios.post(
        BASE_URL + "/profile/photo/presign",
        { contentType: file.type },
        { withCredentials: true }
      );
      const { uploadUrl, key } = presignRes.data;

      // Step 2: upload the file straight to S3 — not through our backend
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // Step 3: tell the backend which key to attach to the profile
      const confirmRes = await axios.patch(
        BASE_URL + "/profile/photo",
        { photoKey: key },
        { withCredentials: true }
      );
      dispatch(addUser(confirmRes.data));
      URL.revokeObjectURL(localPreviewUrl);
      setPhotoPreview(null);
    }
    catch (err) {
      setPhotoError(err.response?.data?.message || "Photo upload failed. Please try again.");
    }
    finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content px-4 py-10">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        {/* Edit form */}
        <div className="card shadow-xl bg-base-200 border border-primary/20">
          <div className="card-body">
            <h2 className="card-title text-2xl text-base-content">Edit Profile</h2>

            <form className="flex flex-col gap-4" onSubmit={handleSave}>
              {/* AI Assistant — fills About + Skills below from rough notes */}
              <div className="bg-base-100 rounded-lg p-4 border border-primary/30">
                <label className="label">
                  <span className="label-text text-base-content flex items-center gap-2">
                    <FaMagic className="text-primary" /> AI Profile Assistant
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  maxLength={RAW_TEXT_MAX_LENGTH}
                  placeholder="e.g. I know Node.js, React, MongoDB and have built a RAG application."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {rawText.length}/{RAW_TEXT_MAX_LENGTH}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm gap-2"
                    disabled={generating || !rawText.trim()}
                    onClick={handleGenerate}
                  >
                    {generating ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FaMagic /> Generate with AI
                      </>
                    )}
                  </button>
                </div>
                {generateError && <p className="text-error text-sm mt-2">{generateError}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  This fills in About and Skills below — review and edit before saving.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text text-base-content">First Name</span>
                  </label>
                  <input
                    type="text"
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
                    className="input input-bordered w-full"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text text-base-content">Age</span>
                  </label>
                  <input
                    type="number"
                    min="18"
                    placeholder="e.g. 25"
                    className="input input-bordered w-full"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text text-base-content">Gender</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-base-content">Skills</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Node.js, React, MongoDB"
                  className="input input-bordered w-full"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt text-gray-400">Separate skills with commas</span>
                </label>
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-base-content">College / Company</span>
                </label>
                <label className="input input-bordered flex items-center gap-2 w-full">
                  <FaBuilding className="text-primary" />
                  <input
                    type="text"
                    placeholder="Where do you study or work?"
                    className="grow"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="label">
                    <span className="label-text text-base-content">Education</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs gap-1 text-primary"
                    onClick={addEducationRow}
                  >
                    <FaPlus /> Add
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {education.length === 0 && (
                    <p className="text-xs text-gray-400">No education entries yet.</p>
                  )}
                  {education.map((row, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-base-100 rounded-lg p-3">
                      <FaGraduationCap className="text-primary mt-3 shrink-0" />
                      <div className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr] gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Degree (e.g. B.Tech CSE)"
                          className="input input-bordered input-sm w-full"
                          value={row.degree}
                          onChange={(e) => updateEducationRow(idx, "degree", e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Institution"
                          className="input input-bordered input-sm w-full"
                          value={row.institution}
                          onChange={(e) => updateEducationRow(idx, "institution", e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Year"
                          className="input input-bordered input-sm w-full"
                          value={row.year}
                          onChange={(e) => updateEducationRow(idx, "year", e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-error mt-1"
                        onClick={() => removeEducationRow(idx)}
                        aria-label="Remove education entry"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-base-content">Coding Profiles</span>
                </label>
                <p className="text-xs text-gray-400 -mt-1 mb-2">
                  Only visible to developers you're connected with
                </p>
                <div className="flex flex-col gap-2">
                  <label className="input input-bordered flex items-center gap-2 w-full">
                    <FaLinkedin className="text-primary" />
                    <input
                      type="url"
                      placeholder="LinkedIn profile URL"
                      className="grow"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </label>
                  <label className="input input-bordered flex items-center gap-2 w-full">
                    <FaGithub className="text-primary" />
                    <input
                      type="url"
                      placeholder="GitHub profile URL"
                      className="grow"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </label>
                  <label className="input input-bordered flex items-center gap-2 w-full">
                    <SiLeetcode className="text-primary" />
                    <input
                      type="url"
                      placeholder="LeetCode profile URL"
                      className="grow"
                      value={leetcodeUrl}
                      onChange={(e) => setLeetcodeUrl(e.target.value)}
                    />
                  </label>
                  <label className="input input-bordered flex items-center gap-2 w-full">
                    <SiCodeforces className="text-primary" />
                    <input
                      type="url"
                      placeholder="Codeforces profile URL"
                      className="grow"
                      value={codeforcesUrl}
                      onChange={(e) => setCodeforcesUrl(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-base-content">About</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={4}
                  maxLength={ABOUT_MAX_LENGTH}
                  placeholder="Tell other developers about yourself..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt text-gray-400">
                    {about.length}/{ABOUT_MAX_LENGTH}
                  </span>
                </label>
              </div>

              {error && <p className="text-error text-sm">{error}</p>}
              {successMsg && <p className="text-success text-sm">{successMsg}</p>}

              <div className="card-actions mt-2">
                <button className="btn btn-primary w-full gap-2" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live preview */}
        <div className="md:sticky md:top-10">
          <p className="text-sm text-gray-400 mb-2 text-center">Preview</p>
          <div className="w-full max-w-md mx-auto bg-base-200 border border-primary/40 rounded-2xl shadow-lg p-6">
            <div className="flex justify-center mb-2">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-primary ring-offset-base-100 ring-offset-2"
                  />
                ) : (
                  <Avatar
                    photoUrl={user.photoUrl}
                    gender={gender}
                    size="w-32 h-32"
                    className="ring-4 ring-primary ring-offset-base-100 ring-offset-2"
                  />
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <span className="loading loading-spinner loading-md text-white"></span>
                  </div>
                )}
                <label className="btn btn-circle btn-sm btn-primary absolute bottom-0 right-0 cursor-pointer">
                  <FaCamera />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
            </div>
            {photoError && <p className="text-center text-error text-sm mb-2">{photoError}</p>}

            <h2 className="text-2xl font-semibold text-center capitalize text-primary mb-1">
              {firstName || "First"} {lastName}
            </h2>
            <p className="text-center text-sm text-gray-400 capitalize">
              {gender || "Not specified"}
            </p>
            {age && <p className="text-center text-sm text-gray-400">Age: {age}</p>}
            {organization && (
              <p className="flex items-center justify-center gap-2 text-center text-sm text-gray-400 mt-1">
                <FaBuilding /> {organization}
              </p>
            )}

            <p className="mt-3 text-sm text-center text-white/80 italic">
              {about || "No description available."}
            </p>

            {cleanedEducation.length > 0 && (
              <div className="mt-3 space-y-1">
                {cleanedEducation.map((row, idx) => (
                  <p key={idx} className="flex items-center justify-center gap-2 text-xs text-gray-400 text-center">
                    <FaGraduationCap className="shrink-0" />
                    {[row.degree, row.institution, row.year].filter(Boolean).join(" · ")}
                  </p>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {previewSkills.length > 0 ? (
                previewSkills.map((skill, idx) => (
                  <span key={idx} className="badge badge-primary font-medium shadow-sm">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="badge badge-ghost text-xs">No skills listed</span>
              )}
            </div>

            {(linkedinUrl || githubUrl || leetcodeUrl || codeforcesUrl) && (
              <div className="flex justify-center gap-4 mt-4 text-2xl text-primary">
                {linkedinUrl && <FaLinkedin />}
                {githubUrl && <FaGithub />}
                {leetcodeUrl && <SiLeetcode />}
                {codeforcesUrl && <SiCodeforces />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
