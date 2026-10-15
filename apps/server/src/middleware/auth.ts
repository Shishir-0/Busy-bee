import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import type { ApiErrorEnvelope } from '../../../../packages/shared/src/contracts.js';

export function internalAgentAuth(req: Request, res: Response, next: NextFunction): void {
  const tokenHeader = req.headers['x-agent-token'];
  const authHeader = req.headers['authorization'];

  let token: string | undefined;

  if (typeof tokenHeader === 'string') {
    token = tokenHeader.trim();
  } else if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (!token || token !== env.AGENT_BACKEND_TOKEN) {
    const errorResponse: ApiErrorEnvelope = {
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
