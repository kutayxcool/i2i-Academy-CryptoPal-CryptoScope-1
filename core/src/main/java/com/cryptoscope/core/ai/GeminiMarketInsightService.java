package com.cryptoscope.core.ai;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GeminiMarketInsightService implements MarketInsightService {

    private static final String URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

    private final HttpClient client = HttpClient.newHttpClient();
    private final String apiKey;

    public GeminiMarketInsightService(String apiKey) {
        this.apiKey = apiKey;
    }

    @Override
    public String generateInsight(UserContext context, String userQuestion) {
        String prompt = buildPrompt(context, userQuestion);

        try {
            String requestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + escapeJson(prompt) + "\"}]}]}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(URL))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return extractText(response.body());
        } catch (Exception e) {
            throw new RuntimeException("Gemini'den yanit alinamadi", e);
        }
    }

    private String buildPrompt(UserContext context, String userQuestion) {
        StringBuilder sb = new StringBuilder();
        sb.append("Sen CryptoScope uygulamasinin yapay zeka asistanisin. ");
        sb.append("Kullanicinin hesap bilgilerine gore soruyu kisa ve net cevapla.\n\n");
        sb.append("Kullanici adi: ").append(context.getUsername()).append("\n");
        sb.append("Bakiye: ").append(context.getBalance()).append(" USD\n");
        sb.append("Sahip olunan kriptolar: ").append(context.getHoldings()).append("\n");
        sb.append("Son islemler: ").append(context.getRecentTransactions()).append("\n");
        sb.append("Guncel fiyatlar: ").append(context.getCurrentPrices()).append("\n\n");
        sb.append("Kullanicinin sorusu: ").append(userQuestion);
        return sb.toString();
    }

    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "");
    }

    private String extractText(String json) {
        Pattern pattern = Pattern.compile("\"text\":\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            String raw = matcher.group(1);
            return raw.replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\");
        }
        throw new RuntimeException("Yanit ayristirilamadi: " + json);
    }
}