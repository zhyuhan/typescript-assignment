import { NavLink } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
    return (
        <nav className="navbar">
            <h1 className="nav-brand">Notification task</h1>

            <ul>
                <li className="nav-link">
                    <NavLink to="/">Main</NavLink>
                </li>
                <li className="nav-link">
                    <NavLink to="/settings">Settings</NavLink>
                </li>
            </ul>
        </nav>
    );
}
