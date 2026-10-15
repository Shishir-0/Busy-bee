import { env } from '../config/env.js';
export function internalAgentAuth(req, res, next) {
    const tokenHeader = req.headers['x-agent-token'];
    const authHeader = req.headers['authorization'];
    let token;
    if (typeof tokenHeader === 'string') {
        token = tokenHeader.trim();
    }
    else if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
    }
    if (!token || token !== env.AGENT_BACKEND_TOKEN) {
        const errorResponse = {
            error: {
                code: 'UNAUTHORIZED_AGENT_ACTION',
                message: 'Invalid or missing agent service authentication token.',
                requestId: req.id || 'unknown',
            },
        };
        res.status(401).json(errorResponse);
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map