import { useEffect, useState } from "react";

export function useBroadcast<T>(channelName: string): {
    message: T | null;
    broadcast: (message: T) => void;
} {
    const [message, setMessage] = useState<T | null>(null);
    const [channel, setChannel] = useState<BroadcastChannel | null>(null);

    useEffect(() => {
        const bc = new BroadcastChannel("notifications");

        bc.onmessage = (event) => {
            setMessage(event.data);
        };

        setChannel(bc);

        return () => {
            bc.close();
        };
    }, [channelName]);

    return {
        message,
        broadcast: (message: T) => {
            channel?.postMessage(message);
        },
    };
}

export function useSSE<T>(url: string): T | null {
    const [message, setMessage] = useState<T | null>(null);

    useEffect(() => {
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            setMessage(JSON.parse(event.data));
        };

        return () => {
            eventSource.close();
        };
    }, [url]);

    return message;
}
