import api from "./api";

export const askAi = (message) => {
  return api.post("/ai/chat", {
    message,
  });
};