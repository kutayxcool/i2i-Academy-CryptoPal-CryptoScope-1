# CryptoScope

CryptoScope, kripto para alım-satımını simüle eden ve yapay zeka destekli piyasa analizi sunan bir platformdur. i2i Academy'nin CryptoPal ödevi kapsamında geliştirilmektedir.

## Mimari

```mermaid
flowchart LR
    User([Kullanıcı]) --> WebApp[CryptoScope Web App<br/>React + Vite]
    WebApp -->|REST API| Core[CryptoScope Core<br/>Spring Boot]
    Core --> Redis[(Redis<br/>oturum + anlık fiyat)]
    Core --> Postgres[(PostgreSQL<br/>kullanıcı, bakiye, işlem)]
    Core --> PriceFeed[PriceFeed<br/>Binance Live API]
    Core --> AI[MarketInsightService<br/>Google Gemini]
```

- **web-app/** — Frontend (React + Vite SPA)
- **core/** — CryptoScope Core (tek Spring Boot uygulaması: auth, piyasa verisi, trading, AI entegrasyonu)
- **docker-compose.yml** — Yerel PostgreSQL ve Redis ortamı

## Veritabanı Şeması

```mermaid
erDiagram
    users ||--o{ holdings : sahiptir
    users ||--o{ transactions : yapar

    users {
        uuid id PK
        varchar username
        varchar password_hash
        numeric balance
        timestamp created_at
    }
    holdings {
        uuid id PK
        uuid user_id FK
        varchar symbol
        numeric amount
    }
    transactions {
        uuid id PK
        uuid user_id FK
        varchar type
        varchar symbol
        numeric amount
        numeric price
        timestamp executed_at
    }
    price_history {
        uuid id PK
        varchar symbol
        numeric price
        timestamp recorded_at
    }
```

## Kurulum

1. `.env` dosyasını oluşturun (aşağıdaki değişkenleri doldurun)
2. `docker compose up -d` ile PostgreSQL ve Redis'i ayağa kaldırın
3. Backend'i çalıştırın:
```bash
   cd core
   ./mvnw spring-boot:run
```
4. Frontend'i çalıştırın:
```bash
   cd web-app
   npm install
   npm run dev
```
5. API dokümantasyonu: `http://localhost:8080/swagger-ui/index.html`

## Ortam Değişkenleri (.env)

```
POSTGRES_DB=cryptopal
POSTGRES_USER=cryptopal
POSTGRES_PASSWORD=cryptopal
REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY=
```

## Ekip

| Alan | Sorumlu |
|---|---|
| Frontend (Web App) | Esra |
| Core (Auth, Piyasa Verisi, Trading) | Tarık |
| External Data Provider, AI, Altyapı | Kutay |