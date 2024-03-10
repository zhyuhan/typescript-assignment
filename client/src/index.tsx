import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/home";
import Root from "./routes/root";
import Settings from "./routes/settings";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "settings",
                element: <Settings />,
            },
        ],
    },
]);

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<RouterProvider router={router} />);
