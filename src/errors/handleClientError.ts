import { Error as MongooseError } from "mongoose";
import { IGenericErrorMessage } from "../interfaces/error";
import { IGenericErrorResponse } from "../interfaces/common";

const handleClientError = (error: any): IGenericErrorResponse => {
  let errors: IGenericErrorMessage[] = [];
  let message = "Something went wrong";
  const statusCode = 400;

  // Document not found case (manual throw)
  if (error?.message?.includes("not found")) {
    message = error.message;
    errors = [
      {
        path: "",
        message,
      },
    ];
  }

  // Foreign key-like reference error or constraint
  else if (error?.message?.includes("delete") && error?.message?.includes("failed")) {
    message = "Delete failed due to related record";
    errors = [
      {
        path: "",
        message,
      },
    ];
  }

  return {
    statusCode,
    message,
    errorMessages: errors,
  };
};

export default handleClientError;
