import { useNotifications } from "./NotificationProvider";
import Cross from "../Cross";

interface NotificationProps {
    id: string;
    children: React.ReactNode;
}

export default function Notification({ id, children }: NotificationProps) {
    const { dispatch } = useNotifications();

    const removeNotification = (id: string) =>
        dispatch({ type: "REMOVE_NOTIFICATION", payload: id });

    return (
        <div className="notification">
            <div>{children}</div>
            <button
                onClick={() => removeNotification(id)}
                className="notification-close"
            >
                <Cross />
            </button>
        </div>
    );
}
