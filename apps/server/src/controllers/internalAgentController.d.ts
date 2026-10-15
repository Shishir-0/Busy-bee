import { Request, Response, NextFunction } from 'express';
export declare function getAgentNegotiationContext(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function ingestObservation(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function authorizeAgentAction(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function confirmMerchantOffer(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function endSession(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=internalAgentController.d.ts.map