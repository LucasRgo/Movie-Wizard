import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = React.createContext();
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const getCsrfToken = () => Cookies.get("csrftoken") || "";
const getApiUrl = (path) => `${API_BASE_URL}${path}`;

const parseJsonIfPossible = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        return null;
    }

    return response.json();
};

const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [lastAction, setLastAction] = useState(null);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(getApiUrl("/api/user/"), {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCsrfToken(),
                },
                credentials: "include",
            });

            if (response.ok) {
                const data = await parseJsonIfPossible(response);
                if (data) {
                    setUser(data);
                    setIsLoggedIn(true);
                } else {
                    setUser(null);
                    setIsLoggedIn(false);
                    console.warn("Non-JSON response received from /api/user/.");
                }
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            if (error?.name !== "AbortError") {
                console.error("Error fetching current user:", error);
            }
            setUser(null);
            setIsLoggedIn(false);
        } finally {
            setIsInitialized(true);
        }
    };

    const login = async (credentials) => {
        const response = await fetch(getApiUrl("/api/login/"), {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken(),
            },
            credentials: "include",
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            setIsLoggedIn(false);
            throw new Error("Invalid username or password.");
        }

        setLastAction("login");
        return true;
    };

    const logout = async () => {
        const response = await fetch(getApiUrl("/api/logout/"), {
            method: "POST",
            headers: {
                Accept: "application/json",
                "X-CSRFToken": getCsrfToken(),
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Unable to log out.");
        }

        setUser(null);
        setIsLoggedIn(false);
        setLastAction("logout");
    };

    const register = async (userData) => {
        const response = await fetch(getApiUrl("/api/register/"), {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken(),
            },
            credentials: "include",
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error("Registration failed.");
        }

        setLastAction("register");
        return true;
    };

    useEffect(() => {
        if (lastAction === "login" || lastAction === "register") {
            fetchCurrentUser();
        }
    }, [lastAction]);

    useEffect(() => {
        if (!isInitialized) {
            fetchCurrentUser();
        }
    }, [isInitialized]);

    if (!isInitialized) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
