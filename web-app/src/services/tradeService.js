import api from "./api";

export const buyCrypto = (data) => {
  return api.post("/trades/buy", data);
};

export const sellCrypto = (data) => {
  return api.post("/trades/sell", data);
};