import Body from "./Body.jsx";
import Home from "./Home.jsx";
import Signup from "./Signup.jsx";
import Login from "./Login.jsx";
import Feed from "./Feed.jsx";
import { BrowserRouter, Route ,Routes } from "react-router-dom";
import { Provider } from "react-redux";
import appStore from "../utils/appStore.js";
import UserCard from "./UserCard.jsx";
import Profile from "./Profile.jsx";
import EditProfile from "./EditProfile.jsx";
import Connections from "./Connections.jsx";



function App() {

 return (
  <>
    <Provider store= {appStore}>
    <BrowserRouter  basename="/">
    <Routes>
      <Route path="/" element={<Body/>} >
        <Route index element={<Home/>} />
        <Route path="/feed" element={<Feed/>} />
       <Route path="/signup" element={<Signup/>}/>
       <Route path="/login" element={<Login/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/edit-profile" element={<EditProfile/>} />
         <Route path="/connections" element={<Connections/>} />
          
       </Route>
    </Routes>
    </BrowserRouter>
    </Provider>
    </>
 )
};

export default App
