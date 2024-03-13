import { createContext, useContext, useEffect, useReducer } from "react";
import {
    BROADCAST_CHANNEL,
    SERVER_ENDPOINT,
    DEFAULT_NOTIFICATION_OPTIONS,
} from "../../config";
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
        case "UPDATE_OPTIONS": {
            saveNotificationOptions(action.payload);

            // remove extra notifications if the count has decreased
            if (action.payload.count < state.notifications.length) {
                const notificationsToRemove = state.notifications.slice(
                    0,
                    -action.payload.count
                );
                notificationsToRemove.forEach(({ msg_id }) => {
                    if (timeouts.has(msg_id)) {
                        clearTimeout(timeouts.get(msg_id));
                        timeouts.delete(msg_id);
                    }
                });
            }

            return {
                ...state,
                notifications: state.notifications.slice(-action.payload.count),
                options: action.payload,
            };
        }
        default:
            return state;
    }
};

const existingOptions = loadNotificationOptions(DEFAULT_NOTIFICATION_OPTIONS);

// remove notifications that have expired
const existingNotifications = loadNotifications().filter(({ time }) => {
    const now = Math.floor(Date.now() / 1000);
    const createdAt = new Date(time).getTime();
    return now - createdAt < existingOptions.duration;
});
saveNotifications(existingNotifications);

const initialState: State = {
    notifications: existingNotifications,
    options: existingOptions,
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

export function NotificationProvider({ children }: NotificationsProviderProps) {
    const { message, broadcast } = useBroadcast<Action>(BROADCAST_CHANNEL);
    const notification = useSSE<Notification>(SERVER_ENDPOINT);
    const [state, dispatch] = useReducer(reducer, initialState);

    const dispatchAndBroadcast = (action: Action) => {
        dispatch(action);
        broadcast(action);
    };

    const addToClearQueue = (id: string) => {
        timeouts.set(
            id,
            setTimeout(() => {
                dispatchAndBroadcast({
                    type: "REMOVE_NOTIFICATION",
                    payload: id,
                });
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
                dispatch: dispatchAndBroadcast,
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
