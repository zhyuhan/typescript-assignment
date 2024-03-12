import { useState } from "react";
import { NotificationOptions } from "../types";

const DEFAULT_OPTIONS: NotificationOptions = {
    count: 3,
    position: "top-right",
    duration: 5,
};

export default function Settings() {
    const [options, setOptions] =
        useState<NotificationOptions>(DEFAULT_OPTIONS);

    return (
        <form className="settings">
            <div className="setting">
                <label htmlFor="notification-count">Notification count</label>
                <div className="value">
                    <input
                        id="notification-count"
                        type="number"
                        value={options.count}
                        onChange={(event) =>
                            setOptions({
                                ...options,
                                count: parseInt(event.target.value),
                            })
                        }
                    />
                </div>
            </div>

            <div className="setting">
                <label htmlFor="notification-position">
                    Notification position
                </label>
                <fieldset id="notification-position" className="value">
                    <div>
                        <label htmlFor="top-left">Position 1</label>
                        <input
                            type="radio"
                            id="top-left"
                            name="position"
                            value="top-left"
                            checked={options.position === "top-left"}
                            onChange={(event) =>
                                setOptions({
                                    ...options,
                                    position: event.target
                                        .value as NotificationOptions["position"],
                                })
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="top-right">Position 2</label>
                        <input
                            type="radio"
                            id="top-right"
                            name="position"
                            value="top-right"
                            checked={options.position === "top-right"}
                            onChange={(event) =>
                                setOptions({
                                    ...options,
                                    position: event.target
                                        .value as NotificationOptions["position"],
                                })
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="bottom-left">Position 3</label>
                        <input
                            type="radio"
                            id="bottom-left"
                            name="position"
                            value="bottom-left"
                            checked={options.position === "bottom-left"}
                            onChange={(event) =>
                                setOptions({
                                    ...options,
                                    position: event.target
                                        .value as NotificationOptions["position"],
                                })
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="bottom-right">Position 4</label>
                        <input
                            type="radio"
                            id="bottom-right"
                            name="position"
                            value="bottom-right"
                            checked={options.position === "bottom-right"}
                            onChange={(event) =>
                                setOptions({
                                    ...options,
                                    position: event.target
                                        .value as NotificationOptions["position"],
                                })
                            }
                        />
                    </div>
                </fieldset>
            </div>

            <div className="setting">
                <label htmlFor="notification-duration">
                    Notification disappear time
                </label>
                <div className="value">
                    <input
                        id="notification-duration"
                        type="number"
                        value={options.duration}
                        onChange={(event) =>
                            setOptions({
                                ...options,
                                duration: parseInt(event.target.value),
                            })
                        }
                    />
                </div>
            </div>
        </form>
    );
}
