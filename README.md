# CryptoPal

CryptoPal, kripto para alim-satimini simule eden ve yapay zeka destekli
piyasa analizi sunan bir platformdur. i2i Academy odevi kapsaminda
gelistirilmektedir.

## Mimari

- **web-app/** — Frontend (SPA)
- **core/** — CryptoPal Core (tek Spring Boot uygulamasi: auth, piyasa
  verisi, trading, AI entegrasyonu)
- **docker-compose.yml** — Yerel PostgreSQL ve Redis ortami

## Kurulum

1. `.env` dosyasini olusturun (asagidaki degiskenleri doldurun)
2. `docker compose up -d` ile PostgreSQL ve Redis'i ayaga kaldirin
3. `core/` altinda Spring Boot uygulamasini calistirin
4. `web-app/` altinda frontend'i calistirin

## Ortam Degiskenleri (.env)

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
| Frontend (Web App) | Kisi 1 |
| Core (Auth, Piyasa Verisi, Trading) | Kisi 2 |
| External Data Provider, AI, Altyapi | Kisi 3 |
