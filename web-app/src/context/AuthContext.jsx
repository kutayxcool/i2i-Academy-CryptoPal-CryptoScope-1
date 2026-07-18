import {
    createContext,
    useContext,
    useState,
} from "react";

const AuthContext = createContext(null);

function getInitialUser() {
    const storedBalance =
        localStorage.getItem("balance");

    return {
        userId:
            localStorage.getItem("userId") || "",
        username:
            localStorage.getItem("username") || "Guest",
        balance:
            storedBalance !== null
                ? Number(storedBalance)
                : 0,
        token:
            localStorage.getItem("token") || "",
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getInitialUser);

    const login = (userData) => {
        const authenticatedUser = {
            userId: userData.userId,
            username: userData.username,
            balance: Number(userData.balance),
            token: userData.token,
        };

        localStorage.setItem(
            "userId",
            authenticatedUser.userId
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

        setUser(authenticatedUser);
    };

    const updateBalance = (newBalance) => {
        const numericBalance = Number(newBalance);

        localStorage.setItem(
            "balance",
            numericBalance.toString()
        );

        setUser((currentUser) => ({
            ...currentUser,
            balance: numericBalance,
        }));
    };

    const logout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("balance");
        localStorage.removeItem("token");

        setUser({
            userId: "",
            username: "Guest",
            balance: 0,
            token: "",
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
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
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}