import { Request, Response, NextFunction} from "express";

export type ResponseHandler = (req: Request, res: Response, next: NextFunction) => void;

export class ResourceNotFoundError extends Error {}