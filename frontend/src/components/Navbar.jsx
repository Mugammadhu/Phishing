import { Link } from "react-router-dom"
import '../styles/navbar.css'
import { useState } from "react"
import { useCookies } from "react-cookie";

const Navbar = () => {
    const [active,setActive]=useState(1);
    // eslint-disable-next-line no-unused-vars
    const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);
    const [showSpinner,setShowSpinner]=useState(false)

    const handleLogout = () => {
        cookies.authToken && setShowSpinner(true);
      setTimeout(() => {
        removeCookie("authToken", { path: "/" });
        setShowSpinner(false);
      }, 1300);
    };
  return (
<nav className="navbar">
    <h2>DarkShield</h2>
<ul>
        <li>
            <Link to="/" className={active===1?"active":""}  onClick={() => setActive(1)}>Home</Link>
        </li>
        <li>
            <Link to="/tools" className={active===2?"active":""}  onClick={() => setActive(2)}>Tools</Link>
        </li>
        <li>
            <Link to="/contact" className={active===3?"active":""}  onClick={() => setActive(3)}>Contact</Link>
        </li>
        <li>
            <Link to="about" className={active===4?"active":""}  onClick={() => setActive(4)}>About</Link>
        </li>
    </ul>
    <button onClick={handleLogout}><div className={showSpinner ? "spinner":""}></div>Logout</button>
</nav>
  )
}

export default Navbar