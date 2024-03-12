export interface Notification {
    msg_id: string;
    msg: string;
    time: string;
}

export interface NotificationOptions {
    count: number;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    duration: number;
}
