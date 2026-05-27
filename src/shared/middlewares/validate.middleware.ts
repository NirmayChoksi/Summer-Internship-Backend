import { NextFunction, Request, Response } from "express";
import { ParsedQs } from "qs";
import { z } from "zod";

interface ValidateSchemas {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}

export function validate(schemas: ValidateSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, unknown> = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) errors.body = z.treeifyError(result.error);
      else req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) errors.params = z.treeifyError(result.error);
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) errors.query = z.treeifyError(result.error);
      else req.query = result.data as ParsedQs;
    }

    if (Object.keys(errors).length > 0) {
      res
        .status(400)
        .json({ success: false, error: "Validation failed", details: errors });
      return;
    }

    next();
  };
}
