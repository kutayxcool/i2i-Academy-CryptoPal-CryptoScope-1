import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState({
        username: localStorage.getItem("username") || "Guest",
        balance: Number(localStorage.getItem("balance")) || 12500,
        token: localStorage.getItem("token") || "",
    });

    const login = (userData) => {
        localStorage.setItem("username", userData.username);
        localStorage.setItem("balance", userData.balance);
        localStorage.setItem("token", userData.token);

        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("balance");
        localStorage.removeItem("token");

        setUser({
            username: "Guest",
            balance: 12500,
            token: "",
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}