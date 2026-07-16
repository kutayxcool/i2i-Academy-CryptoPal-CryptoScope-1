CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    balance NUMERIC(18,2) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE holdings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    amount NUMERIC(30,12) NOT NULL,
    CONSTRAINT uk_holdings_user_symbol UNIQUE (user_id, symbol)
);

-- Asagidakiler taslak, Tarik'in transaction entity'si netlesince guncellenecek:

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(4) NOT NULL, -- 'BUY' veya 'SELL'
    symbol VARCHAR(20) NOT NULL,
    amount NUMERIC(30,12) NOT NULL,
    price NUMERIC(18,2) NOT NULL,
    executed_at TIMESTAMP NOT NULL
);

CREATE TABLE price_history (
    id UUID PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price NUMERIC(18,2) NOT NULL,
    recorded_at TIMESTAMP NOT NULL
);