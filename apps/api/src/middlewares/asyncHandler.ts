import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/** Wraps an async controller so rejections reach the global error handler. */
export function asyncHandler<Req extends Request = Request>(
  fn: AsyncRequestHandler<Req>,
): RequestHandler {
  return (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };
}
