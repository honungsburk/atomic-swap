import { NextFunction, Request, Response } from "express";

export type APIError = {
  status: number;
  name: string;
  message: string;
  timestamp: string;
  path: string;
};

export const createAPIError =
  (path: string) =>
  (status: number, name: string, message: string): APIError => {
    return {
      status,
      name,
      message,
      timestamp: new Date().toISOString(),
      path,
    };
  };

export const ErrorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  __: NextFunction
) => {
  const apiError = createAPIError(req.url);

  if (res.statusCode === 404) {
    return res
      .status(404)
      .json(apiError(404, "NOT_FOUND", "Resource was not found."));
  }

  return res
    .status(500)
    .json(apiError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error."));
};
