import api from "./api";

export const getMarketPrices = () => {
  return api.get("/market/prices");
};