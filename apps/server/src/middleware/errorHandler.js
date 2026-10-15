import { ZodError } from 'zod';
export function errorHandler(err, req, res, _next) {
    const requestId = req.id || 'unknown';
    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
        }));
        const response = {
            error: {
                code: 'VALIDATION_ERROR',
                message: 'The request contains invalid or missing fields.',
                details,
                requestId,
            },
        };
        res.status(400).json(response);
        return;
    }
    // Handle custom status errors
    const status = typeof err.status === 'number' ? err.status : 500;
    const code = err.code || (status === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');
    const message = err.message || 'An unexpected internal error occurred.';
    // Log error without leaking stack traces to client
    console.error(`[Error] [${requestId}] ${code}: ${message}`);
    if (status === 500 && err.stack) {
        console.error(err.stack);
    }
    const response = {
        error: {
            code,
            message,
            requestId,
        },
    };
    res.status(status).json(response);
}
//# sourceMappingURL=errorHandler.js.map