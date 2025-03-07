/* eslint-disable react/prop-types */
import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { useCookies } from "react-cookie";
import Home from "./components/Home";
import Notfound from "./components/Notfound";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Contact from "./components/Contact";

const App = () => {
  const [cookies] = useCookies(["authToken"]);
  const authToken = cookies.authToken;

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={authToken ? <Home /> : <Login />} />
        <Route path="/tools" element={authToken ? <Home /> : <Login />} />
        <Route path="/contact" element={authToken ? <Contact /> : <Login />} />
        <Route path="/about" element={authToken ? <About /> : <Login />} />

        {/* login and signup*/}

        <Route path="/login" element={authToken ? <Home /> : <Login />} />
        <Route path="/signup" element={authToken ? <Home /> : <Signup />} />

        {/* 404 Page */}
        <Route path="*" element={<Notfound />} />
      </Routes>
    </div>
  );
};

export default App;
