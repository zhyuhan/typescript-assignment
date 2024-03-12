import { Outlet } from "react-router-dom";
import { NotificationProvider } from "../components/notifications/NotificationProvider";
import Navbar from "../components/Navbar";
import "../styles/main.css";

export default function Root() {
    return (
        <NotificationProvider>
            <Navbar />

            <main className="content">
                <Outlet />
            </main>
        </NotificationProvider>
    );
}
