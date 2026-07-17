export const mockUser = {
  username: "Guest",
  balance: 12500,
};

export const mockMarketPrices = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 64250.75,
    change: 2.4,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3420.3,
    change: -1.1,
  },
];

export const mockPortfolio = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    quantity: 0.35,
    price: 64934.85,
    change: 2.8,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    quantity: 2.15,
    price: 3423.96,
    change: -0.19,
  },
];

export const mockStarterMessages = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello 👋 I can help you review your portfolio, recent transactions and market trends.",
  },
];