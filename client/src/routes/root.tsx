import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/main.css";

export default function Root() {
    return (
        <>
            <Navbar />
            <main className="content">
                <Outlet />
            </main>
        </>
    );
}
