import type { Notification, NotificationOptions } from "../types";

export function loadNotificationOptions(
    defaultOptions: NotificationOptions
): NotificationOptions {
    const options = localStorage.getItem("notification-options");
    return options ? JSON.parse(options) : defaultOptions;
}

export function saveNotificationOptions(options: NotificationOptions) {
    localStorage.setItem("notification-options", JSON.stringify(options));
}

export function loadNotifications(): Notification[] {
    const notifications = localStorage.getItem("notifications");
    return notifications ? JSON.parse(notifications) : [];
}

export function saveNotifications(notification: Notification[]) {
    localStorage.setItem("notifications", JSON.stringify(notification));
}
