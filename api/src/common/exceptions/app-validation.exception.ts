import { HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { AppException } from './app.exception';

export interface ValidationErrorDetail {
  field: string;
  errors: string[];
}

export class AppValidationException extends AppException {
  constructor(validationErrors: ValidationError[]) {
    const details = AppValidationException.formatErrors(validationErrors);
    super(
      'VALIDATION_ERROR',
      'Error de validación en la petición',
      HttpStatus.BAD_REQUEST,
      details,
    );
  }

  private static formatErrors(
    errors: ValidationError[],
  ): ValidationErrorDetail[] {
    const result: ValidationErrorDetail[] = [];

    const traverse = (errs: ValidationError[], parentPath = '') => {
      for (const err of errs) {
        const currentPath = parentPath
          ? `${parentPath}.${err.property}`
          : err.property;
        if (err.constraints) {
          result.push({
            field: currentPath,
            errors: Object.values(err.constraints),
          });
        }
        if (err.children && err.children.length > 0) {
          traverse(err.children, currentPath);
        }
      }
    };

    traverse(errors);
    return result;
  }
}
