import type { Request } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { UserDocument } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      /** Parsed + validated query (Express 5's req.query getter is read-only). */
      validatedQuery?: unknown;
      /** Set by the authenticate middleware (full Mongoose user doc, never sent raw). */
      user?: UserDocument;
    }
  }
}

/** Use in authenticated route handlers where req.user is guaranteed to be set. */
export type AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, string>,
> = Request<P, ResBody, ReqBody, ReqQuery> & {
  user: UserDocument;
};

export {};
