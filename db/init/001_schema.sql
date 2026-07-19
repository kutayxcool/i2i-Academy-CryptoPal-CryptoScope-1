CREATE TABLE users (
    id UUID PRIMARY KEY,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
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


CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(4) NOT NULL, -- 'BUY' veya 'SELL'
    symbol VARCHAR(20) NOT NULL,
    amount NUMERIC(30,12) NOT NULL,
    price NUMERIC(30,8) NOT NULL,
    executed_at TIMESTAMP NOT NULL
);

CREATE TABLE price_history (
    id UUID PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price NUMERIC(30,8) NOT NULL,
    recorded_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_price_history_symbol_recorded_at
    ON price_history(symbol, recorded_at DESC);

    CREATE TABLE agenda_notes (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL
            REFERENCES users(id)
            ON DELETE CASCADE,
        note_date DATE NOT NULL,
        title VARCHAR(120) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    );

    CREATE INDEX idx_agenda_notes_user_date
        ON agenda_notes(user_id, note_date);

    CREATE INDEX idx_agenda_notes_user_created
        ON agenda_notes(user_id, created_at DESC);