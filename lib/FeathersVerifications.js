"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var hooks = __importStar(require("./hooks"));
var FeathersVerifications = /** @class */ (function () {
    function FeathersVerifications(options) {
        this.options = options;
        this.injectBaseHooks();
    }
    FeathersVerifications.prototype.injectBaseHooks = function () {
        var serviceHooks = {
            before: {
                find: [hooks.checkValidity()],
                get: [hooks.disableExternal()],
                update: [hooks.disableExternal()],
                create: [
                    hooks.disableExternal(),
                    hooks.checkIsRegistered(this.options.verifications),
                    hooks.stringifyData(),
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
    };
    return FeathersVerifications;
}());
exports.default = FeathersVerifications;
