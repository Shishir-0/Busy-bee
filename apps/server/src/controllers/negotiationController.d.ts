import { Request, Response, NextFunction } from 'express';
export declare function createNegotiation(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listNegotiations(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getNegotiation(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createSession(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function issueSessionToken(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getNegotiationOffers(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getNegotiationEvidence(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function calculateRecommendation(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function streamNegotiationEvents(req: Request, res: Response): void;
//# sourceMappingURL=negotiationController.d.ts.map