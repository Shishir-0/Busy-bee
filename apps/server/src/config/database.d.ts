import mongoose from 'mongoose';
import type { DatabaseRepositories } from '../repositories/types.js';
export declare function initDatabase(): Promise<DatabaseRepositories>;
export declare function getRepositories(): DatabaseRepositories;
export declare function getDatabaseHealth(): {
    persistenceMode: "mongodb" | "in_memory";
    isConnectedToMongo: boolean;
    mongoReadyState: mongoose.ConnectionStates;
    lastError: string | null;
};
export declare function closeDatabase(): Promise<void>;
//# sourceMappingURL=database.d.ts.map