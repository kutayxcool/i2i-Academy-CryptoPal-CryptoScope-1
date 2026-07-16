import api from "./api";

export const getPortfolio = () => {
  return api.get("/portfolio");
};

export const getTransactions = () => {
  return api.get("/transactions");
};