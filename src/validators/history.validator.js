// src/validators/history.validator.js

export const historySchema = {
  mediaId: {
    required: true,
    type: "string"
  },
  progress: {
    required: true,
    type: "number",
    min: 0
  },
  duration: {
    required: true,
    type: "number",
    min: 1
  }
};
