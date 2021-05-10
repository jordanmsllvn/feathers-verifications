"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = {
    removeTokenOnVerify: true
};
/**
 * Base class for verified action. All verified actions should extend this class.
 */
class VerifiedAction {
    constructor(service, application, options = defaultOptions) {
        this.service = service;
        this.application = application;
        this.options = options;
        this.options = Object.assign(Object.assign({}, defaultOptions), this.options);
    }
    /**
     * Called after a new verification token has been created
     * @param verificationRecord - the registered verification {type, action} associated with the token.
     */
    create(verificationRecord) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    /**
     * Called when a verification service patch is called on a valid token. This should be used
     * to run logic like reseting password or adding verified flag to user etc
     * @param verificationRecord - the registered verification {type, action} associated with the token.
     * @param applyData - extra data supplied in the patch {data} property. as an example
     * could contain password, account info etc
     */
    apply(verificationRecord, applyData) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    /**
     * Called after verification has been applied.
     * Meant for internal use only. Overwrite at your own peril.
     * Runs cleanup etc. (like deleting the varification token after it's action has been apply)
     * @param verificationRecord - the registered verification {type, action} associated with the token.
     */
    _postApply(verificationRecord) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.options.removeTokenOnVerify) {
                this.service.remove(null, {
                    query: {
                        token: verificationRecord.token,
                        type: verificationRecord.type
                    }
                });
            }
            return;
        });
    }
}
exports.default = VerifiedAction;
