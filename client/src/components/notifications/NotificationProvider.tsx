import { createContext, useContext, useEffect, useReducer } from "react";
import { useBroadcast, useSSE } from "../../utils/hooks";
import {
    loadNotificationOptions,
    loadNotifications,
    saveNotificationOptions,
    saveNotifications,
} from "../../utils/storage";
import type { Notification, NotificationOptions } from "../../types";
import NotificationContainer from "./NotificationContainer";

interface State {
    notifications: Notification[];
    options: NotificationOptions;
}

type Action =
    | { type: "ADD_NOTIFICATION"; payload: Notification }
    | { type: "REMOVE_NOTIFICATION"; payload: string }
    | { type: "PRESERVE_NOTIFICATION"; payload: string }
    | { type: "UPDATE_OPTIONS"; payload: NotificationOptions };

const timeouts = new Map<string, number>();

const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case "ADD_NOTIFICATION": {
            // show the most recent `count` notifications
            const notifications = [
                ...state.notifications,
                action.payload,
            ].slice(-state.options.count);

            saveNotifications(notifications);
            return {
                ...state,
                notifications,
            };
        }
        case "REMOVE_NOTIFICATION": {
            if (timeouts.has(action.payload)) {
                clearTimeout(timeouts.get(action.payload));
                timeouts.delete(action.payload);
            }

            const notifications = state.notifications.filter(
                (notification) => notification.msg_id !== action.payload
            );

            saveNotifications(notifications);
            return {
                ...state,
                notifications,
            };
        }
        case "PRESERVE_NOTIFICATION":
            if (timeouts.has(action.payload)) {
                clearTimeout(timeouts.get(action.payload));
                timeouts.delete(action.payload);
            }
            return state;
        case "UPDATE_OPTIONS":
            saveNotificationOptions(action.payload);
            return {
                ...state,
                options: action.payload,
            };
        default:
            return state;
    }
};

const DEFAULT_OPTIONS: NotificationOptions = {
    count: 3,
    position: "top-right",
    duration: 2,
};

const initialState: State = {
    notifications: loadNotifications(),
    options: loadNotificationOptions() || DEFAULT_OPTIONS,
};

const NotificationsContext = createContext<{
    notifications: Notification[];
    options: NotificationOptions;
    dispatch: React.Dispatch<Action>;
    addToClearQueue: (id: string) => void;
}>({
    ...initialState,
    dispatch: () => null,
    addToClearQueue: () => null,
});

interface NotificationsProviderProps {
    children: React.ReactNode;
}

const SERVER_ENDPOINT = "http://localhost:9000/events";

export function NotificationProvider({ children }: NotificationsProviderProps) {
    const { message, broadcast } = useBroadcast<Action>("notifications");
    const notification = useSSE<Notification>(SERVER_ENDPOINT);
    const [state, dispatch] = useReducer(reducer, initialState);

    const addToClearQueue = (id: string) => {
        timeouts.set(
            id,
            setTimeout(() => {
                dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
            }, state.options.duration * 1000)
        );
    };

    // listen for messages from other tabs
    useEffect(() => {
        if (!message) return;

        dispatch(message);

        if (message.type === "ADD_NOTIFICATION") {
            const notification = message.payload as Notification;
            addToClearQueue(notification.msg_id);
        }
    }, [message]);

    // listen for notifications from the server
    useEffect(() => {
        if (!notification) return;

        dispatch({ type: "ADD_NOTIFICATION", payload: notification });
        addToClearQueue(notification.msg_id);

        // broadcast the notification to other tabs
        broadcast({
            type: "ADD_NOTIFICATION",
            payload: notification,
        });
    }, [notification]);

    return (
        <NotificationsContext.Provider
            value={{
                ...state,
                dispatch: (action: Action) => {
                    dispatch(action);
                    broadcast(action);
                },
                addToClearQueue,
            }}
        >
            {children}
            <NotificationContainer />
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationsContext);
}
