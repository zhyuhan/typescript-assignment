import { useNotifications } from "./NotificationProvider";
import Cross from "../Cross";

interface NotificationProps {
    id: string;
    children: React.ReactNode;
}

export default function Notification({ id, children }: NotificationProps) {
    const { dispatch, addToClearQueue } = useNotifications();

    const preserveNotification = (id: string) => {
        dispatch({ type: "PRESERVE_NOTIFICATION", payload: id });
    };
    const unpreserveNotification = (id: string) => {
        addToClearQueue(id);
    };
    const dismissNotification = (id: string) => {
        dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
    };

    return (
        <div
            className="notification"
            onMouseEnter={() => preserveNotification(id)}
            onMouseLeave={() => unpreserveNotification(id)}
        >
            {children}
            <button
                onClick={() => dismissNotification(id)}
                className="notification-close"
            >
                <Cross />
            </button>
        </div>
    );
}
