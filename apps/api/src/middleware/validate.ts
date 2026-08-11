import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}
<<<<<<< HEAD

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Express 5 getter-only req.query — mutate in place instead of reassigning.
    const parsed = schema.parse(req.query);
    Object.assign(req.query, parsed);
    (req as any).validatedQuery = parsed;
    next();
  };
}
=======
>>>>>>> 3584043af0c48b61060f01fbc6bdfa6d9fc4cb46
