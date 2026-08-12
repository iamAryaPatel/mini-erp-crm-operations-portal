import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '../utils/api-response';

export function validate(schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      sendError(res, 'Validation failed', 422, details);
      return;
    }

    req[source] = value;
    next();
  };
}
