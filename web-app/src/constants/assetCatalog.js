export const ASSET_CATALOG = {
  BTC: {
    name: "Bitcoin",
    icon: "₿",
    order: 1,
  },
  ETH: {
    name: "Ethereum",
    icon: "Ξ",
    order: 2,
  },
  BNB: {
    name: "BNB",
    icon: "BNB",
    order: 3,
  },
  SOL: {
    name: "Solana",
    icon: "SOL",
    order: 4,
  },
  XRP: {
    name: "XRP",
    icon: "XRP",
    order: 5,
  },
  ADA: {
    name: "Cardano",
    icon: "ADA",
    order: 6,
  },
  DOGE: {
    name: "Dogecoin",
    icon: "Ð",
    order: 7,
  },
  AVAX: {
    name: "Avalanche",
    icon: "A",
    order: 8,
  },
  DOT: {
    name: "Polkadot",
    icon: "DOT",
    order: 9,
  },
  LINK: {
    name: "Chainlink",
    icon: "⬡",
    order: 10,
  },
};

export function getAssetName(symbol) {
  return ASSET_CATALOG[symbol]?.name
    || symbol;
}

export function getAssetIcon(symbol) {
  return ASSET_CATALOG[symbol]?.icon
    || symbol;
}

export function getAssetOrder(symbol) {
  return ASSET_CATALOG[symbol]?.order
    || Number.MAX_SAFE_INTEGER;
}