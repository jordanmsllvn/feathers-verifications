import { Service, Application } from "@feathersjs/feathers";
import { IVerificationRecord, IActionOptions } from "./types";
/**
 * Base class for verified action. All verified actions should extend this class.
 */
export default class VerifiedAction {
    protected service: Service<any>;
    protected application: Application;
    protected options: IActionOptions;
    constructor(service: Service<any>, application: Application, options?: IActionOptions);
    /**
     * Called after a new verification token has been created
     * @param verificationRecord - the registered verification {type, action} associated with the token.
     */
    create(verificationRecord: IVerificationRecord): Promise<void>;
    /**
     * Called when a verification service patch is called on a valid token. This should be used
     * to run logic like reseting password or adding verified flag to user etc
     * @param verificationRecord - the registered verification {type, action} associated with the token.
     * @param applyData - extra data supplied in the patch {data} property. as an example
     * could contain password, account info etc
     */
    apply(verificationRecord: IVerificationRecord, applyData: any): Promise<void>;
    /**
     * Called after verification has been applied.
     * Meant for internal use only. Overwrite at your own peril.
     * Runs cleanup etc. (like deleting the varification token after it's action has been apply)
     * @param verificationRecord - the registered verification {type, action} associated with the token.
     */
    _postApply(verificationRecord: IVerificationRecord): Promise<void>;
}
