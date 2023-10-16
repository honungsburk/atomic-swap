import { NextFunction, Request, Response } from "express";

export const MissingRouteMiddleware = (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new Error("Not found");
  res.status(404);

  next(error);
};
