import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    getAssetIcon,
    getAssetName,
    getAssetOrder,
} from "../constants/assetCatalog";

import {
    getMarketPrices,
} from "../services/marketService";

import "../styles/Auth.css";

const MARKET_PAGE_SIZE = 2;

function BrandLogo({
    compact = false,
}) {
    return (
        <div
            className={
                compact
                    ? "auth-brand auth-brand-compact"
                    : "auth-brand"
            }
        >
            <span className="auth-brand-mark">
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

            <span className="auth-brand-text">
                Crypto
                <strong>Scope</strong>
            </span>
        </div>
    );
}

function FeatureItem({
    title,
    description,
}) {
    return (
        <div className="auth-feature-item">
            <span className="auth-feature-icon">
                <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                >
                    <path
                        d="M4 10.5L8 14.5L16 5.5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                    />
                </svg>
            </span>

            <div>
                <strong>{title}</strong>
                <p>{description}</p>
            </div>
        </div>
    );
}

function normalizeMarketPrices(
    responseData
) {
    if (!Array.isArray(responseData)) {
        return [];
    }

    return responseData
        .map((marketPrice) => ({
            symbol:
                marketPrice.symbol,

            name:
                getAssetName(
                    marketPrice.symbol
                ),

            icon:
                getAssetIcon(
                    marketPrice.symbol
                ),

            price:
                Number(
                    marketPrice.price
                ),

            updatedAt:
                marketPrice.updatedAt,
        }))
        .filter(
            (marketPrice) =>
                marketPrice.symbol
                && Number.isFinite(
                    marketPrice.price
                )
        )
        .sort(
            (
                firstAsset,
                secondAsset
            ) =>
                getAssetOrder(
                    firstAsset.symbol
                )
                - getAssetOrder(
                    secondAsset.symbol
                )
        );
}

function formatMarketPrice(
    value
) {
    const numericValue =
        Number(value);

    if (!Number.isFinite(numericValue)) {
        return "Unavailable";
    }

    let maximumFractionDigits = 2;

    if (numericValue < 1) {
        maximumFractionDigits = 8;
    } else if (numericValue < 100) {
        maximumFractionDigits = 4;
    }

    return `$${numericValue.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits,
        }
    )}`;
}

function formatMarketUpdateTime(
    updatedAt
) {
    const date =
        new Date(updatedAt);

    if (Number.isNaN(date.getTime())) {
        return "Waiting for update";
    }

    return `Updated ${date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }
    )}`;
}

function AuthLayout({
    mode,
    eyebrow,
    title,
    subtitle,
    footerText,
    footerLinkText,
    footerLinkTo,
    children,
}) {
    const [
        marketPrices,
        setMarketPrices,
    ] = useState([]);

    const [
        marketError,
        setMarketError,
    ] = useState("");

    const [
        marketPage,
        setMarketPage,
    ] = useState(0);

    useEffect(() => {
        let isComponentActive = true;

        const loadMarketPrices =
            async () => {
                try {
                    const response =
                        await getMarketPrices();

                    if (!isComponentActive) {
                        return;
                    }

                    const normalizedPrices =
                        normalizeMarketPrices(
                            response.data
                        );

                    setMarketPrices(
                        normalizedPrices
                    );

                    setMarketError(
                        normalizedPrices.length > 0
                            ? ""
                            : "Market data is currently unavailable."
                    );
                } catch {
                    if (!isComponentActive) {
                        return;
                    }

                    setMarketError(
                        "Market data is currently unavailable."
                    );
                }
            };

        void loadMarketPrices();

        const refreshInterval =
            window.setInterval(
                () => {
                    void loadMarketPrices();
                },
                15000
            );

        return () => {
            isComponentActive = false;

            window.clearInterval(
                refreshInterval
            );
        };
    }, []);

    const totalMarketPages =
        Math.max(
            1,
            Math.ceil(
                marketPrices.length
                / MARKET_PAGE_SIZE
            )
        );

    const currentMarketPage =
        marketPage
        % totalMarketPages;

    const firstVisibleAssetIndex =
        currentMarketPage
        * MARKET_PAGE_SIZE;

    const visibleMarketAssets =
        marketPrices.slice(
            firstVisibleAssetIndex,
            firstVisibleAssetIndex
            + MARKET_PAGE_SIZE
        );

    const latestMarketUpdate =
        marketPrices.reduce(
            (
                latestValue,
                marketPrice
            ) => {
                const currentTime =
                    new Date(
                        marketPrice.updatedAt
                    ).getTime();

                if (
                    !Number.isFinite(
                        currentTime
                    )
                ) {
                    return latestValue;
                }

                return Math.max(
                    latestValue,
                    currentTime
                );
            },
            0
        );

    const showPreviousMarketPage = () => {
        setMarketPage(
            (currentPage) =>
                (
                    currentPage
                    - 1
                    + totalMarketPages
                )
                % totalMarketPages
        );
    };

    const showNextMarketPage = () => {
        setMarketPage(
            (currentPage) =>
                (
                    currentPage
                    + 1
                )
                % totalMarketPages
        );
    };

    return (
        <main className="auth-shell">
            <section className="auth-showcase">
                <div
                    className="auth-showcase-grid"
                    aria-hidden="true"
                />

                <div
                    className="auth-orb auth-orb-one"
                    aria-hidden="true"
                />

                <div
                    className="auth-orb auth-orb-two"
                    aria-hidden="true"
                />

                <div className="auth-showcase-content">
                    <Link
                        to="/"
                        className="auth-brand-link"
                        aria-label="CryptoScope home"
                    >
                        <BrandLogo />
                    </Link>

                    <div className="auth-showcase-copy">
                        <h1>
                            Navigate digital markets
                            with greater clarity.
                        </h1>

                        <p className="auth-showcase-description">
                            Follow live cryptocurrency
                            prices, manage your portfolio
                            and receive account-aware
                            insights from your AI
                            assistant.
                        </p>

                        <div className="auth-feature-list">
                            <FeatureItem
                                title="Live market data"
                                description="Track leading crypto assets with continuously refreshed Binance market prices."
                            />

                            <FeatureItem
                                title="Portfolio tracking"
                                description="Review balances, holdings and transaction history in one place."
                            />

                            <FeatureItem
                                title="AI-powered insights"
                                description="Ask questions using your current portfolio and market context."
                            />
                        </div>
                    </div>

                    <div className="auth-market-widget">
                        <div className="auth-market-widget-header">
                            <div className="auth-market-widget-copy">
                                <span>
                                    Market overview
                                </span>

                                <strong>
                                    Live market prices
                                </strong>

                                <small>
                                    {latestMarketUpdate > 0
                                        ? formatMarketUpdateTime(
                                            latestMarketUpdate
                                        )
                                        : "Connecting to market data"}
                                </small>
                            </div>

                            <div className="auth-market-navigation">
                                <button
                                    type="button"
                                    className="auth-market-arrow"
                                    onClick={
                                        showPreviousMarketPage
                                    }
                                    disabled={
                                        totalMarketPages
                                        <= 1
                                    }
                                    aria-label="Show previous market assets"
                                >
                                    <svg
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12.5 4.5L7 10L12.5 15.5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.8"
                                        />
                                    </svg>
                                </button>

                                <span className="auth-market-page-number">
                                    {currentMarketPage + 1}
                                    /
                                    {totalMarketPages}
                                </span>

                                <button
                                    type="button"
                                    className="auth-market-arrow"
                                    onClick={
                                        showNextMarketPage
                                    }
                                    disabled={
                                        totalMarketPages
                                        <= 1
                                    }
                                    aria-label="Show next market assets"
                                >
                                    <svg
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M7.5 4.5L13 10L7.5 15.5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.8"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {!marketError
                            && marketPrices.length
                            === 0 && (
                            <div className="auth-market-assets">
                                {[1, 2].map(
                                    (
                                        placeholder
                                    ) => (
                                        <div
                                            className="auth-market-asset auth-market-skeleton"
                                            key={
                                                placeholder
                                            }
                                        >
                                            <span className="auth-skeleton-circle" />

                                            <div className="auth-skeleton-lines">
                                                <span />
                                                <span />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {marketError && (
                            <div className="auth-market-empty">
                                <span className="auth-market-empty-icon">
                                    !
                                </span>

                                <div>
                                    <strong>
                                        Prices are
                                        unavailable
                                    </strong>

                                    <p>
                                        {marketError}
                                    </p>
                                </div>
                            </div>
                        )}

                        {!marketError
                            && visibleMarketAssets
                                .length > 0 && (
                            <div className="auth-market-assets">
                                {visibleMarketAssets.map(
                                    (asset) => (
                                        <article
                                            className="auth-market-asset"
                                            key={
                                                asset.symbol
                                            }
                                        >
                                            <div className="auth-market-asset-header">
                                                <span className="auth-coin-icon">
                                                    {
                                                        asset.icon
                                                    }
                                                </span>

                                                <div className="auth-market-asset-name">
                                                    <strong>
                                                        {
                                                            asset.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            asset.symbol
                                                        }
                                                    </span>
                                                </div>

                                                <span className="auth-price-live">
                                                    Live
                                                </span>
                                            </div>

                                            <strong className="auth-market-price">
                                                {formatMarketPrice(
                                                    asset.price
                                                )}
                                            </strong>
                                        </article>
                                    )
                                )}
                            </div>
                        )}

                        {totalMarketPages > 1 && (
                            <div className="auth-market-page-dots">
                                {[
                                    ...Array(
                                        totalMarketPages
                                    ).keys(),
                                ].map(
                                    (pageIndex) => (
                                        <button
                                            type="button"
                                            key={
                                                pageIndex
                                            }
                                            className={
                                                pageIndex
                                                    === currentMarketPage
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setMarketPage(
                                                    pageIndex
                                                )
                                            }
                                            aria-label={
                                                `Show market page ${pageIndex + 1}`
                                            }
                                        />
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="auth-form-side">
                <Link
                    to="/"
                    className="auth-mobile-brand-link"
                    aria-label="CryptoScope home"
                >
                    <BrandLogo compact />
                </Link>

                <div
                    className={
                        mode === "register"
                            ? "auth-card auth-card-register"
                            : "auth-card"
                    }
                >
                    <div className="auth-card-header">
                        <span className="auth-eyebrow">
                            {eyebrow}
                        </span>

                        <h2>{title}</h2>

                        <p>{subtitle}</p>
                    </div>

                    {children}

                    <p className="auth-footer">
                        {footerText}{" "}
                        <Link
                            to={footerLinkTo}
                        >
                            {footerLinkText}
                        </Link>
                    </p>
                </div>

                <p className="auth-form-copyright">
                    © 2026 CryptoScope
                </p>
            </section>
        </main>
    );
}

export default AuthLayout;