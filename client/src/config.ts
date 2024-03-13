import type { NotificationOptions } from "./types";

export const BROADCAST_CHANNEL = "notifications";
export const SERVER_ENDPOINT = "http://localhost:9000/events";

export const DEFAULT_NOTIFICATION_OPTIONS: NotificationOptions = {
    count: 5,
    position: "top-right",
    duration: 3,
};
