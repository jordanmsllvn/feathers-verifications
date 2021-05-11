import { HooksObject } from "@feathersjs/feathers";
import * as hooks from "./hooks";
import { IFeathersVerificationsOptions } from "./types";

export default class FeathersVerifications {
  constructor(private options: IFeathersVerificationsOptions) {
    if (this.options.service.options) {
      this.options.service.options.multi = ["patch", "remove"];
    }
    this.injectBaseHooks();
  }

  private injectBaseHooks(): void {
    const serviceHooks: HooksObject = {
      before: {
        find: [hooks.checkValidity()],
        get: [hooks.disableExternal()],
        update: [hooks.disableExternal()],
        create: [
          hooks.disableExternal(),
          hooks.checkIsRegistered(this.options.verifications),
          hooks.stringifyData(),
          hooks.generateExpiration(this.options.verifications),
          hooks.generateVerificationToken()
        ],
        patch: [hooks.applyVerificationAction(this.options.verifications)],
        remove: [hooks.disableExternal()]
      },
      after: {
        create: [hooks.createVerificationAction(this.options.verifications)]
      },
      error: {}
    };

    this.options.service.hooks(serviceHooks);
  }
}
