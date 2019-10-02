import { Service, Application } from "@feathersjs/feathers";
import { IVerificationRecord, IActionOptions } from "./types";

const defaultOptions = {
  removeTokenOnVerify: true
};

/**
 * Base class for verified action. All verified actions should extend this class.
 */
export default class VerifiedAction {
  constructor(
    protected service: Service<any>,
    protected application: Application,
    protected options: IActionOptions = defaultOptions
  ) {
    this.options = { ...defaultOptions, ...this.options };
  }
  /**
   * Called after a new verification token has been created
   * @param verificationRecord - the registered verification {type, action} associated with the token.
   */
  public async create(verificationRecord: IVerificationRecord): Promise<void> {
    return;
  }

  /**
   * Called when a verification service patch is called on a valid token. This should be used
   * to run logic like reseting password or adding verified flag to user etc
   * @param verificationRecord - the registered verification {type, action} associated with the token.
   * @param applyData - extra data supplied in the patch {data} property. as an example
   * could contain password, account info etc
   */
  public async apply(
    verificationRecord: IVerificationRecord,
    applyData: any
  ): Promise<void> {
    return;
  }

  /**
   * Called after verification has been applied.
   * Meant for internal use only. Overwrite at your own peril.
   * Runs cleanup etc. (like deleting the varification token after it's action has been apply)
   * @param verificationRecord - the registered verification {type, action} associated with the token.
   */
  public async _postApply(
    verificationRecord: IVerificationRecord
  ): Promise<void> {
    if (this.options.removeTokenOnVerify) {
      this.service.remove(null, {
        query: {
          token: verificationRecord.token,
          type: verificationRecord.type
        }
      });
    }
    return;
  }
}
