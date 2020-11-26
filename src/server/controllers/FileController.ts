import { NextFunction, Request, Response, Router } from 'express';
import BaseController from './BaseController';
import { IController } from '../../common/interfaces';
import * as HttpStatus from 'http-status-codes';
import { Logger, IFileService, MatchLevel } from '@ethereum-sourcify/core';
import { param, validationResult } from 'express-validator';
import { isValidAddress, isValidChain } from '../../common/validators/validators';
import { NotFoundError, ValidationError } from '../../common/errors'
import * as bunyan from 'bunyan';

export default class FileController extends BaseController implements IController {
    router: Router;
    fileService: IFileService;
    logger: bunyan;

    constructor(fileService: IFileService) {
        super();
        this.router = Router();
        this.fileService = fileService;
        this.logger = Logger("FileController");
    }

    createEndpoint(retrieveMethod: (chain: string, address: string, match: MatchLevel) => Promise<any[]>, match: MatchLevel, successMessage: string) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                return next(new ValidationError(validationErrors.array()));
            }
            let retrieved: any[];
            try {
                retrieved = await retrieveMethod(req.params.chain, req.params.address, match);
                if (retrieved.length === 0) return next(new NotFoundError("Files have not been found!"));
    
            } catch (err) {
                return next(new NotFoundError(err.message));
            }
            this.logger.info({
                chainId: req.params.chain,
                address: req.params.address
            },
                successMessage);
            return res.status(HttpStatus.OK).json(retrieved);
        }
    }

    registerRoutes = (): Router => {
        [
            { prefix: "/tree/any", method: this.createEndpoint(this.fileService.getTree, "any", "getTree any match success") },
            { prefix: "/any", method: this.createEndpoint(this.fileService.getContents, "any", "getContents any match success") },
            { prefix: "/tree", method: this.createEndpoint(this.fileService.getTree, "full_match", "getTree full_match success") },
            { prefix: "", method: this.createEndpoint(this.fileService.getContents, "full_match", "getContents full_match success") }

        ].forEach(pair => this.router.route(pair.prefix + "/:chain/:address").get([
            param("chain").custom(isValidChain),
            param("address").custom(isValidAddress)
        ], 
            this.safeHandler(pair.method)
        ));
        return this.router;
    }
}
