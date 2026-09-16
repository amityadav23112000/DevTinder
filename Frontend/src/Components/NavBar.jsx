import { useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { removeUserFromFeed } from "../utils/feedSlice";
import { FaFire, FaUsers, FaUserCircle, FaUserEdit, FaSignOutAlt, FaBars, FaMagic } from "react-icons/fa";
import Avatar from "./Avatar";

const navLinks = [
  { to: "/feed", label: "Feed", icon: <FaFire /> },
  { to: "/suggested", label: "Suggested", icon: <FaMagic /> },
  { to: "/connections", label: "Connections", icon: <FaUsers /> },
  { to: "/profile", label: "Profile", icon: <FaUserCircle /> },
  { to: "/edit-profile", label: "Edit Profile", icon: <FaUserEdit /> },
];

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandle = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      dispatch(removeUserFromFeed());
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const capitalize = (str) =>
    str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
      isActive ? "bg-white/20" : "hover:bg-white/10"
    }`;

  return (
    <div className="navbar shadow-md bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-3">
      <div className="flex-1 flex items-center gap-6">
        <Link to="/" className="text-2xl font-bold tracking-wide hover:text-yellow-300">
          DevTinder
        </Link>

        {/* Desktop nav links — all visible directly */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.icon} {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden lg:block font-medium">
            Welcome,&nbsp;
            <span className="font-semibold text-yellow-200">
              {capitalize(user.firstName)}{" "}
              {user.lastName ? capitalize(user.lastName) : ""}
            </span>
          </div>

          <div className="hidden md:block">
            <Avatar photoUrl={user.photoUrl} gender={user.gender} size="w-10 h-10" className="border-2 border-white" />
          </div>

          <button
            onClick={logoutHandle}
            className="hidden md:flex btn btn-sm rounded-full text-black gap-2 bg-red-500 hover:bg-red-400 border-none shadow-lg shadow-red-500/50 hover:scale-105 transition-transform"
          >
            <FaSignOutAlt /> Logout
          </button>

          {/* Mobile menu — collapses everything into a dropdown */}
          <div className="dropdown dropdown-end md:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-white">
              <FaBars className="text-xl" />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-200 text-base-content rounded-box w-52"
            >
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="flex items-center gap-2">
                    {link.icon} {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a onClick={logoutHandle} className="flex items-center gap-2 text-error">
                  <FaSignOutAlt /> Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
