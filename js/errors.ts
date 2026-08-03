export class TransformSyntaxError extends SyntaxError {
  readonly name = 'SyntaxError';
  readonly type = 'SyntaxError';
  readonly code = 'TRANSFORM_SYNTAX_ERROR';

  constructor(
    message: string,
    readonly filename: string,
    readonly loc: { line: number; column: number },
    readonly codeFrame: string,
  ) {
    super(message);
    Error.captureStackTrace?.(this, TransformSyntaxError);
  }
}
