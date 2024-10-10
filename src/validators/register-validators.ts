import { body } from "express-validator";

export default [
  body("email").notEmpty().withMessage("Email is required").trim().isEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .trim()
    .isLength({ min: 6, max: 15 }),
  body("firstName").notEmpty().withMessage("First name is required").trim(),
  body("lastName").notEmpty().withMessage("Last name is required").trim(),
];
