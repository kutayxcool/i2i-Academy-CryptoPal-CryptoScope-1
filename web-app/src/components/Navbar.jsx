import {
    useState,
} from "react";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";

import "./Navbar.css";

function formatCurrency(value) {
    const numericValue =
        Number(value);

    if (!Number.isFinite(numericValue)) {
        return "0.00";
    }

    return numericValue.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}

function createInitials(user) {
    const firstName =
        user.firstName?.trim() || "";

    const lastName =
        user.lastName?.trim() || "";

    if (firstName || lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase();
    }

    return user.username
        ?.slice(0, 2)
        .toUpperCase()
        || "CS";
}

function BrandMark() {
    return (
        <span className="navbar-brand-mark">
            <svg
                viewBox="0 0 36 36"
                aria-hidden="true"
            >
                <path
                    d="M18 3.5L29.8 10.3V23.7L18 30.5L6.2 23.7V10.3L18 3.5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                />

                <path
                    d="M12.5 18C12.5 14.9 14.9 12.5 18 12.5C20.1 12.5 22 13.7 22.9 15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2.3"
                />

                <path
                    d="M23.5 18C23.5 21.1 21.1 23.5 18 23.5C15.9 23.5 14 22.3 13.1 20.5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2.3"
                />
            </svg>
        </span>
    );
}

function NavigationIcon({
    type,
}) {
    if (type === "portfolio") {
        return (
            <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path
                    d="M3 5.5C3 4.7 3.7 4 4.5 4H15.5C16.3 4 17 4.7 17 5.5V15C17 15.8 16.3 16.5 15.5 16.5H4.5C3.7 16.5 3 15.8 3 15V5.5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                />

                <path
                    d="M13 9H17V12.5H13C12 12.5 11.3 11.8 11.3 10.8C11.3 9.8 12 9 13 9Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                />
            </svg>
        );
    }

    if (type === "ai") {
        return (
            <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path
                    d="M10 2.5L11.4 6.7L15.5 8L11.4 9.4L10 13.5L8.6 9.4L4.5 8L8.6 6.7L10 2.5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                />

                <path
                    d="M15.5 12.5L16.2 14.6L18.3 15.3L16.2 16L15.5 18L14.8 16L12.7 15.3L14.8 14.6L15.5 12.5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.4"
                />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
        >
            <rect
                x="3"
                y="3"
                width="5"
                height="5"
                rx="1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
            />

            <rect
                x="12"
                y="3"
                width="5"
                height="5"
                rx="1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
            />

            <rect
                x="3"
                y="12"
                width="5"
                height="5"
                rx="1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
            />

            <rect
                x="12"
                y="12"
                width="5"
                height="5"
                rx="1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
            />
        </svg>
    );
}

function Navbar() {
    const navigate =
        useNavigate();

    const {
        user,
        logout,
    } = useAuth();

    const [
        isProfileOpen,
        setIsProfileOpen,
    ] = useState(false);

    const displayName =
        user.fullName
        || [
            user.firstName,
            user.lastName,
        ]
            .filter(Boolean)
            .join(" ")
        || user.username;

   const closeProfileMenu = () => {
       setIsProfileOpen(false);
   };

    const handleLogout = () => {
        setIsProfileOpen(false);
        logout();
        navigate("/");
    };

    return (
        <header className="navbar">
            <div className="navbar-container">
                <NavLink
                    to="/dashboard"
                    className="navbar-brand"
                    onClick={closeProfileMenu}
                    aria-label="CryptoScope dashboard"
                >
                    <BrandMark />

                    <span className="navbar-brand-text">
                        Crypto
                        <strong>Scope</strong>
                    </span>
                </NavLink>

               <nav className="navbar-navigation">
                    <NavLink
                        to="/dashboard"
                        onClick={closeProfileMenu}
                        className={({ isActive }) =>
                            isActive
                                ? "navbar-link active"
                                : "navbar-link"
                        }
                    >
                        <NavigationIcon type="dashboard" />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/portfolio"
                        onClick={closeProfileMenu}
                        className={({ isActive }) =>
                            isActive
                                ? "navbar-link active"
                                : "navbar-link"
                        }
                    >
                        <NavigationIcon type="portfolio" />
                        Portfolio
                    </NavLink>

                    <NavLink
                        to="/ai-chat"
                        onClick={closeProfileMenu}
                        className={({ isActive }) =>
                            isActive
                                ? "navbar-link active"
                                : "navbar-link"
                        }
                    >
                        <NavigationIcon type="ai" />
                        AI Assistant
                    </NavLink>
                </nav>

                <div className="navbar-actions">
                    <div className="navbar-balance">
                        <span>Available balance</span>

                        <strong>
                            $
                            {formatCurrency(
                                user.balance
                            )}
                        </strong>
                    </div>

                    <div className="navbar-profile">
                        <button
                            type="button"
                            className="navbar-profile-button"
                            onClick={() =>
                                setIsProfileOpen(
                                    (currentValue) =>
                                        !currentValue
                                )
                            }
                            aria-expanded={isProfileOpen}
                        >
                            <span className="navbar-avatar">
                                {createInitials(user)}
                            </span>

                            <span className="navbar-profile-copy">
                                <strong>
                                    {displayName}
                                </strong>

                                <small>
                                    @{user.username}
                                </small>
                            </span>

                            <svg
                                className={
                                    isProfileOpen
                                        ? "navbar-chevron open"
                                        : "navbar-chevron"
                                }
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path
                                    d="M5.5 7.5L10 12L14.5 7.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                />
                            </svg>
                        </button>

                        {isProfileOpen && (
                            <div className="navbar-profile-menu">
                                <div className="navbar-profile-summary">
                                    <span className="navbar-avatar large">
                                        {createInitials(user)}
                                    </span>

                                    <div>
                                        <strong>
                                            {displayName}
                                        </strong>

                                        <span>
                                            @{user.username}
                                        </span>
                                    </div>
                                </div>

                                <div className="navbar-menu-balance">
                                    <span>
                                        Trading balance
                                    </span>

                                    <strong>
                                        $
                                        {formatCurrency(
                                            user.balance
                                        )}
                                    </strong>
                                </div>

                                <button
                                    type="button"
                                    className="navbar-logout-button"
                                    onClick={handleLogout}
                                >
                                    <svg
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M8 4H4.5C3.7 4 3 4.7 3 5.5V14.5C3 15.3 3.7 16 4.5 16H8"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeWidth="1.6"
                                        />

                                        <path
                                            d="M11.5 6.5L15 10L11.5 13.5M7 10H15"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.6"
                                        />
                                    </svg>

                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}

export default Navbar;