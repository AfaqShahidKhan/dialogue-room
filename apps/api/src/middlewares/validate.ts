import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodTypeAny, z } from "zod";

/**
 * Validates req.body or req.query against a shared Zod schema.
 * Bodies are replaced with the parsed value; queries land on req.validatedQuery.
 */
export function validate<S extends ZodTypeAny>(
  schema: S,
  target: "body" | "query" = "body",
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(target === "body" ? req.body : req.query);
    if (!result.success) {
      next(result.error);
      return;
    }
    if (target === "body") req.body = result.data;
    else req.validatedQuery = result.data;
    next();
  };
}

export type Validated<S extends ZodTypeAny> = z.infer<S>;
