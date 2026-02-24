// src/middlewares/validate.middleware.js

export const validate = (schema) => {
  return (req, res, next) => {

    const errors = [];

    for (const field in schema) {
      const rules = schema[field];
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} es requerido`);
        continue;
      }

      if (value !== undefined && rules.type) {
        if (rules.type === "number" && typeof value !== "number") {
          errors.push(`${field} debe ser número`);
        }

        if (rules.type === "string" && typeof value !== "string") {
          errors.push(`${field} debe ser string`);
        }
      }

      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} debe ser mayor o igual a ${rules.min}`);
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} debe ser menor o igual a ${rules.max}`);
      }
    }

    if (errors.length > 0) {
      const error = new Error(errors.join(", "));
      error.status = 400;
      return next(error);
    }

    next();
  };
};
