export interface Notification {
    msg_id: string;
    msg: string;
    time: string;
}

export type NotificationPosition =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

export interface NotificationOptions {
    count: number;
    position: NotificationPosition;
    duration: number;
}
