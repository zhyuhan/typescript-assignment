import { createContext, useContext, useEffect, useReducer } from "react";
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
            const notifications = state.notifications.filter(
                (notification) => notification.msg_id !== action.payload
            );

            saveNotifications(notifications);
            return {
                ...state,
                notifications,
            };
        }
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
    removeFromClearQueue: (id: string) => void;
}>({
    ...initialState,
    dispatch: () => null,
    addToClearQueue: () => null,
    removeFromClearQueue: () => null,
});

interface NotificationsProviderProps {
    children: React.ReactNode;
}

const SERVER_ENDPOINT = "http://localhost:9000/events";

export function NotificationProvider({ children }: NotificationsProviderProps) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const addToClearQueue = (id: string) => {
        timeouts.set(
            id,
            setTimeout(() => {
                dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
            }, state.options.duration * 1000)
        );
    };

    const removeFromClearQueue = (id: string) => {
        if (timeouts.has(id)) {
            clearTimeout(timeouts.get(id));
            timeouts.delete(id);
        }
    };

    useEffect(() => {
        // listen for notifications from the server
        const eventSource = new EventSource(SERVER_ENDPOINT);
        eventSource.onmessage = (event) => {
            const notification = JSON.parse(event.data) as Notification;

            dispatch({ type: "ADD_NOTIFICATION", payload: notification });

            // remove the notification after `duration` seconds
            addToClearQueue(notification.msg_id);
        };

        // clean up
        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <NotificationsContext.Provider
            value={{
                ...state,
                dispatch,
                addToClearQueue,
                removeFromClearQueue,
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
