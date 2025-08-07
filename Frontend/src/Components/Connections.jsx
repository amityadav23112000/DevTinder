import { useState ,useEffect} from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Connections = () => {

     const [connections, setConnections] = useState("");
    // This component represents the connections page where users can view their connections.
    // You can fetch and display the user's connections here.
    // For now, we'll just display a placeholder message.
    // You can replace this with actual data fetching logic.
    // Example: Fetch connections from an API or use hardcoded data
    const fetchConnections = async () => {
        try {
            // Simulating an API call to fetch connections
            const response = await axios.get(BASE_URL + '/user/connections' ,
                {
                    withCredentials: true // Include credentials for session management
                }
            ); // Replace with your actual API endpoint

            console.log('Fetched connections:', response.data);
            setConnections(response.data.data);
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    };
    useEffect(() => {
      fetchConnections();
    });

    return  (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Your Connections</h1>

      {connections.length === 0 ? (
        <p className="text-gray-600">No connections found.</p>
      ) : (
   <ul className="w-full max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-lg divide-y">
  {connections.map((conn, index) => (
    <li
      key={conn.userId}
      className="flex items-center px-6 py-4 hover:bg-blue-50 transition duration-300"
    >
      {/* Index Number */}
      <div className="text-sm font-bold text-blue-600 w-8">{index + 1}.</div>

      {/* Profile Image */}
      <img
        src={
          conn.photoUrl ||
          "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
        }
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover mr-4 ring ring-blue-200"
      />

      {/* Name */}
      <div className="flex-1 text-lg font-semibold capitalize text-gray-800">
        {conn.firstName} {conn.lastName}
      </div>

      {/* Optional Icon */}
      <div className="text-blue-400 text-xl font-bold">&rarr;</div>
    </li>
  ))}
</ul>



      )}
    </div>
  );
    }

export default Connections;