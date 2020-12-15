import { NextFunction, Request, Response } from "express";
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);
  switch (true) {
    case typeof err === "string":
      const is404 = err.toLowerCase().endsWith("not found");
      const statusCode = is404 ? 404 : 400;
      return req.flash("error", err) && res.redirect("back");
    case err.name === "ValidationError":
      return req.flash("error", err.message) && res.redirect("back");
    case err.name === "UnauthorizedError":
      return req.flash("error", err.message) && res.redirect("back");
    default:
      return req.flash("error", err.message) && res.redirect("back");
  }
}
