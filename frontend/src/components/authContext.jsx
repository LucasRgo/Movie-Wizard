import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = React.createContext();

const normalizeApiBaseUrl = (rawBaseUrl) => {
    const value = (rawBaseUrl || "").trim().replace(/\/$/, "");
    if (!value || value === "backend:") {
        return "";
    }
    return value;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

const getCsrfToken = () => Cookies.get("csrftoken") || "";
const getApiUrl = (path) => `${API_BASE_URL}${path}`;

const parseJsonIfPossible = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        return null;
    }

    return response.json();
};

const buildErrorMessage = async (response, fallbackMessage) => {
    const payload = await parseJsonIfPossible(response);
    if (typeof payload === "string" && payload.trim()) {
        return payload;
    }
    if (payload?.detail) {
        return payload.detail;
    }
    if (Array.isArray(payload?.non_field_errors) && payload.non_field_errors.length > 0) {
        return payload.non_field_errors[0];
    }
    if (typeof payload?.error === "string" && payload.error) {
        return payload.error;
    }
    if (payload && typeof payload === "object") {
        for (const value of Object.values(payload)) {
            if (Array.isArray(value) && value.length > 0) {
                return String(value[0]);
            }
            if (typeof value === "string" && value) {
                return value;
            }
        }
    }
    return fallbackMessage;
};

const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(getApiUrl("/api/user/"), {
                method: "GET",
                headers: {
                    Accept: "application/json",
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
            throw new Error(await buildErrorMessage(response, "Invalid username or password."));
        }

        await fetchCurrentUser();
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
            throw new Error(await buildErrorMessage(response, "Registration failed."));
        }

        // Reuse the login flow so auth state is established consistently
        // across environments where register auto-login may vary.
        await login(userData);
        return true;
    };

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
