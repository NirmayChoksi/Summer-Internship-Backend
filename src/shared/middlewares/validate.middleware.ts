import { RequestHandler } from "express";
import { z } from "zod";

interface ValidateSchemas {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
}

export const validate = (schemas: ValidateSchemas): RequestHandler => {
  return (req, res, next) => {
    console.log(req.url);
    const errors: Record<string, unknown> = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);

      if (!result.success) errors.body = z.treeifyError(result.error);
      else req.body = result.data as typeof req.body;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);

      if (!result.success) errors.params = z.treeifyError(result.error);
      else req.params = result.data as typeof req.params;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);

      if (!result.success) errors.query = z.treeifyError(result.error);
      else req.validatedQuery = result.data;
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });

      return;
    }

    next();
  };
};
