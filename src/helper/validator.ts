import Joi = require("joi");

export const registerValidator = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  confirm_password: Joi.ref("password"),
});

export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const postValidator = Joi.object({
  slug: Joi.string().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
  categories: Joi.array(),
});

export const categoryValidator = Joi.object({
  name: Joi.string().required(),
});
