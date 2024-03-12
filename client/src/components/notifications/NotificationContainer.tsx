import { useNotifications } from "./NotificationProvider";
import Notification from "./Notification";
import type { NotificationPosition } from "../../types";
import "../../styles/notifications.css";

const DEFAULT_PADDING = "2rem";

function getPositionStyles(position: NotificationPosition) {
    switch (position) {
        case "top-left":
            return { top: DEFAULT_PADDING, left: DEFAULT_PADDING };
        case "top-right":
            return { top: DEFAULT_PADDING, right: DEFAULT_PADDING };
        case "bottom-left":
            return {
                bottom: DEFAULT_PADDING,
                left: DEFAULT_PADDING,
            };
        case "bottom-right":
            return {
                bottom: DEFAULT_PADDING,
                right: DEFAULT_PADDING,
            };
    }
}

export default function NotificationContainer() {
    const { notifications, options } = useNotifications();

    return (
        <div
            className={`notification-container${
                options.position === "bottom-left" ||
                options.position === "bottom-right"
                    ? " reverse"
                    : ""
            }`}
            style={getPositionStyles(options.position)}
        >
            {notifications.map(({ msg_id, msg }) => (
                <Notification key={msg_id} id={msg_id}>
                    {msg}
                </Notification>
            ))}
        </div>
    );
}
