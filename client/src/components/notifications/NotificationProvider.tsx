import { createContext, useContext, useReducer } from "react";
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
        case "ADD_NOTIFICATION":
            return {
                ...state,
                // show the most recent `count` notifications
                notifications: [action.payload, ...state.notifications].slice(
                    0,
                    state.options.count
                ),
            };
        case "REMOVE_NOTIFICATION":
            // we should clear the timeout
            // if the user manually removes the notification
            if (timeouts.has(action.payload)) {
                clearTimeout(timeouts.get(action.payload));
                timeouts.delete(action.payload);
            }
            return {
                ...state,
                notifications: state.notifications.filter(
                    (notification) => notification.msg_id !== action.payload
                ),
            };
        case "UPDATE_OPTIONS":
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
    notifications: [],
    options: DEFAULT_OPTIONS,
};

const NotificationsContext = createContext<{
    notifications: Notification[];
    options: NotificationOptions;
    dispatch: React.Dispatch<Action>;
}>({
    ...initialState,
    dispatch: () => null,
});

interface NotificationsProviderProps {
    children: React.ReactNode;
}

const SERVER_ENDPOINT = "http://localhost:9000/events";

export function NotificationProvider({ children }: NotificationsProviderProps) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const eventSource = new EventSource(SERVER_ENDPOINT);
    eventSource.onmessage = (event) => {
        const notification = JSON.parse(event.data) as Notification;
        dispatch({ type: "ADD_NOTIFICATION", payload: notification });

        // remove the notification after `duration` seconds
        timeouts.set(
            notification.msg_id,
            setTimeout(() => {
                dispatch({
                    type: "REMOVE_NOTIFICATION",
                    payload: notification.msg_id,
                });
            }, state.options.duration * 1000)
        );
    };

    return (
        <NotificationsContext.Provider value={{ ...state, dispatch }}>
            {children}
            <NotificationContainer />
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationsContext);
}
