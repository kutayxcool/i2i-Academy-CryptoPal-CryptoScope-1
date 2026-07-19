/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useState,
} from "react";

const AuthContext = createContext(null);

function getStoredText(
    key,
    fallbackValue = ""
) {
    return (
        localStorage.getItem(key)
        || fallbackValue
    );
}

function getInitialUser() {
    const storedBalance =
        localStorage.getItem("balance");

    const username =
        getStoredText(
            "username",
            "Guest"
        );

    return {
        userId:
            getStoredText("userId"),

        firstName:
            getStoredText(
                "firstName",
                username === "Guest"
                    ? ""
                    : username
            ),

        lastName:
            getStoredText("lastName"),

        username,

        balance:
            storedBalance !== null
                ? Number(storedBalance)
                : 0,

        token:
            getStoredText("token"),
    };
}

function storeAuthenticatedUser(
    authenticatedUser
) {
    localStorage.setItem(
        "userId",
        authenticatedUser.userId
    );

    localStorage.setItem(
        "firstName",
        authenticatedUser.firstName
    );

    localStorage.setItem(
        "lastName",
        authenticatedUser.lastName
    );

    localStorage.setItem(
        "username",
        authenticatedUser.username
    );

    localStorage.setItem(
        "balance",
        authenticatedUser.balance.toString()
    );

    localStorage.setItem(
        "token",
        authenticatedUser.token
    );
}

export function AuthProvider({
    children,
}) {
    const [user, setUser] =
        useState(getInitialUser);

    const login = (userData) => {
        const authenticatedUser = {
            userId:
                userData.userId || "",

            firstName:
                userData.firstName
                || userData.username
                || "",

            lastName:
                userData.lastName
                || "",

            username:
                userData.username
                || "Guest",

            balance:
                Number(
                    userData.balance
                ) || 0,

            token:
                userData.token || "",
        };

        storeAuthenticatedUser(
            authenticatedUser
        );

        setUser(
            authenticatedUser
        );
    };

    const updateBalance = (
        newBalance
    ) => {
        const numericBalance =
            Number(newBalance);

        localStorage.setItem(
            "balance",
            numericBalance.toString()
        );

        setUser(
            (currentUser) => ({
                ...currentUser,
                balance: numericBalance,
            })
        );
    };

    const logout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("username");
        localStorage.removeItem("balance");
        localStorage.removeItem("token");

        setUser({
            userId: "",
            firstName: "",
            lastName: "",
            username: "Guest",
            balance: 0,
            token: "",
        });
    };

    const fullName = [
        user.firstName,
        user.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <AuthContext.Provider
            value={{
                user: {
                    ...user,
                    fullName:
                        fullName
                        || user.username,
                },
                login,
                logout,
                updateBalance,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}