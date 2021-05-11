"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const hooks = __importStar(require("./hooks"));
class FeathersVerifications {
    constructor(options) {
        this.options = options;
        if (this.options.service.options) {
            this.options.service.options.multi = ["patch", "remove"];
        }
        this.injectBaseHooks();
    }
    injectBaseHooks() {
        const serviceHooks = {
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
exports.default = FeathersVerifications;
