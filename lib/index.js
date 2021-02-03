"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var FeathersVerifications_1 = __importDefault(require("./FeathersVerifications"));
function init(options) {
    return new FeathersVerifications_1.default(options);
}
exports.default = init;
var VerifiedAction_1 = require("./VerifiedAction");
exports.VerifiedAction = VerifiedAction_1.default;
