import type {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";



type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<void>;


/**
 * Wraps an async Express route controller function to catch unhandled Promise rejections and pass them to next().
 *
 * @param handler - Asynchronous Express request handler function
 * @returns Standard Express RequestHandler with automated error forwarding
 */
export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
    return (req, res, next) => {
        void handler(req, res, next).catch(next);
    };
}