import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { removeUserFromFeed} from "../utils/feedSlice";

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

  return (
    <div className="navbar shadow-md bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-3">
      <div className="flex-1">
        <Link to="/" className="text-2xl font-bold tracking-wide hover:text-yellow-300">
          DevTinder
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden md:block font-medium">
            Welcome,&nbsp;
            <span className="font-semibold text-yellow-200">
              {capitalize(user.firstName)}{" "}
              {user.lastName ? capitalize(user.lastName) : ""}
            </span>
          </div>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-circle avatar border-2 border-white hover:scale-105 transition duration-200">
              <div className="w-10 rounded-full">
                <img alt="User avatar" src={user.photoUrl} />
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white text-black rounded-box w-52"
            >
              <li>
                <Link to="/profile" className="justify-between hover:text-indigo-600">
                  Profile
                  <span className="badge badge-info text-white">New</span>
                </Link>
              </li>
              <li><Link to ="/feed" className="hover:text-indigo-600">Feed</Link></li>
              <li><Link to ="/connections" className="hover:text-indigo-600">Connections</Link></li>
              <li><a onClick={logoutHandle} className="hover:text-red-600">Logout</a></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
