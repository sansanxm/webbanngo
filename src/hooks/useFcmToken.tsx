import { useEffect, useState } from "react";
import { getToken, isSupported } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

const useFcmToken = () => {
    const [token, setToken] = useState("");
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState("");

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== "undefined" && "serviceWorker" in navigator) {
                    const supported = await isSupported();
                    if (supported && messaging) {
                        // Check if permission is already granted
                        const permission = Notification.permission;
                        setNotificationPermissionStatus(permission);

                        if (permission === "granted") {
                            const currentToken = await getToken(messaging, {
                                vapidKey: "BM2e_8iCq2R7kI0c7Gz7Xw8Rz7kI0c7Gz7Xw8Rz7kI0c7Gz7Xw8Rz7kI0c7Gz7Xw8R" // Replace with actual key if available, or remove if using default
                                // Note: It's better to use valid VAPID key from Firebase Console -> Project Settings -> Cloud Messaging -> Web Configuration
                            });
                            if (currentToken) {
                                setToken(currentToken);
                            } else {
                                console.log("No registration token available. Request permission to generate one.");
                            }
                        }
                    }
                }
            } catch (error) {
                console.log("An error occurred while retrieving token:", error);
            }
        };

        retrieveToken();
    }, []);

    return { token, notificationPermissionStatus };
};

export default useFcmToken;
