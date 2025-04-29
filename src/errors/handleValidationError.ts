import { Error as MongooseError } from "mongoose";
import { IGenericErrorResponse } from "../interfaces/common";

const handleValidationError = (
  error: MongooseError.ValidationError
): IGenericErrorResponse => {
  const errors = Object.values(error.errors).map((err) => ({
    path: err.path,
    message: err.message,
  }));

  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorMessages: errors,
  };
};

export default handleValidationError;
