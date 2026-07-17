import api from "./api";

export const askAi = (question) => {
  return api.post("/ai/chat", {
    question,
  });
};