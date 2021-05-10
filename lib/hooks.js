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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = __importDefault(require("@feathersjs/errors"));
const nanoid_1 = __importDefault(require("nanoid"));
/**
 * generate the secure verification token and attach it to creates
 */
exports.generateVerificationToken = () => (context) => {
    context.data.token = nanoid_1.default(32);
    return context;
};
/**
 * generate the expiration based on the 'life' param of the verification definition
 */
exports.generateExpiration = (registeredVerifications) => (context) => {
    const verificationDefinition = registeredVerifications.find(rv => rv.type === context.data.type);
    if (!verificationDefinition)
        return context;
    context.data.expires = verificationDefinition.life
        ? Math.floor(Date.now() / 1000) + verificationDefinition.life
        : 0;
    return context;
};
/**
 * Checks the validity of a token on find
 */
exports.checkValidity = () => (context) => __awaiter(void 0, void 0, void 0, function* () {
    if (!context.params.query ||
        !context.params.query.type ||
        !context.params.query.token)
        throw new errors_1.default.BadRequest(`You must query with both 'token' and 'type' to check validity.`);
    const verification = (yield context.service.find({
        query: {
            type: context.params.query.type,
            token: context.params.query.token
        }
    }))[0];
    if (!verification)
        throw new errors_1.default.Forbidden(`This token/type combination doesn't exist.`);
    if (verification.expires &&
        verification.expires < Math.floor(Date.now() / 1000))
        throw new errors_1.default.Forbidden(`This token has expired`);
    delete verification.data;
    context.result = verification;
    return context;
});
/**
 * check if the attempted create is of a type that is registered
 *
 * @param registeredVerifications
 */
exports.checkIsRegistered = (registeredVerifications) => (context) => {
    const verification = registeredVerifications.find(rv => rv.type === context.data.type);
    if (!verification)
        throw new errors_1.default.Forbidden(`The verification of type '${context.data.type}' has not been registered.`);
    return context;
};
/**
 * stringify the json object in data before create to make it compatible with all DBs
 */
exports.stringifyData = () => (context) => {
    if (context.data.data &&
        typeof context.data.data === "object" &&
        context.data.data.constructor === Object)
        context.data.data = JSON.stringify(context.data.data);
    return context;
};
/**
 * parse the json object for data so it can be used on apply action
 */
exports.unstringifyData = () => (context) => {
    try {
        context.result.data = JSON.parse(context.result.data);
    }
    catch (e) {
        context.result.data = context.result.data;
    }
    return context;
};
/**
 * disable a method for external calls
 */
exports.disableExternal = () => (context) => {
    if (context.params.provider)
        throw new errors_1.default.MethodNotAllowed("This method is not allowed.");
    return context;
};
/**
 * execute the action create method after a validation has been created
 *
 * @param registeredVerifications
 */
exports.createVerificationAction = (registeredVerifications) => (context) => __awaiter(void 0, void 0, void 0, function* () {
    const result = context.result;
    const verification = registeredVerifications.find(rv => rv.type === result.type);
    if (verification) {
        try {
            const create = verification.action.create(result);
            yield create;
        }
        catch (e) {
            throw e;
        }
    }
    return context;
});
/**
 * execute the action apply method after a validation has been created with any additional patch data
 *
 * @param registeredVerifications
 */
exports.applyVerificationAction = (registeredVerifications) => (context) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, token, data } = context.data;
    const vRecord = (yield context.service.find({
        query: { type, token }
    }))[0];
    if (!vRecord)
        throw new errors_1.default.Forbidden("This token/type combination doesn't exist");
    if (vRecord.expires < Math.floor(Date.now() / 1000))
        throw new errors_1.default.Forbidden(`This token has expired`);
    const verification = registeredVerifications.find(rv => rv.type === vRecord.type);
    if (verification == undefined)
        throw new errors_1.default.BadRequest(`This validation type is no longer valid.`);
    try {
        const apply = verification.action.apply(vRecord, data);
        yield apply;
        const postApply = verification.action._postApply(vRecord);
        yield postApply;
    }
    catch (e) {
        throw e;
    }
    return context;
});
