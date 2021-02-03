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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = __importDefault(require("@feathersjs/errors"));
var nanoid_1 = __importDefault(require("nanoid"));
/**
 * generate the secure verification token and attach it to creates
 */
exports.generateVerificationToken = function () { return function (context) {
    context.data.token = nanoid_1.default(32);
    return context;
}; };
/**
 * generate the expiration based on the 'life' param of the verification definition
 */
exports.generateExpiration = function (registeredVerifications) { return function (context) {
    var verificationDefinition = registeredVerifications.find(function (rv) { return rv.type === context.data.type; });
    if (!verificationDefinition)
        return context;
    context.data.expire = verificationDefinition.life
        ? Math.floor(Date.now() / 1000) + verificationDefinition.life
        : 0;
    return context;
}; };
/**
 * Checks the validity of a token on find
 */
exports.checkValidity = function () { return function (context) { return __awaiter(void 0, void 0, void 0, function () {
    var verification;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!context.params.query ||
                    !context.params.query.type ||
                    !context.params.query.token)
                    throw new errors_1.default.BadRequest("You must query with both 'token' and 'type' to check validity.");
                return [4 /*yield*/, context.service.find({
                        query: {
                            type: context.params.query.type,
                            token: context.params.query.token
                        }
                    })];
            case 1:
                verification = (_a.sent())[0];
                if (!verification)
                    throw new errors_1.default.Forbidden("This token/type combination doesn't exist.");
                if (verification.expires &&
                    verification.expires < Math.floor(Date.now() / 1000))
                    throw new errors_1.default.Forbidden("This token has expired");
                delete verification.data;
                context.result = verification;
                return [2 /*return*/, context];
        }
    });
}); }; };
/**
 * check if the attempted create is of a type that is registered
 *
 * @param registeredVerifications
 */
exports.checkIsRegistered = function (registeredVerifications) { return function (context) {
    var verification = registeredVerifications.find(function (rv) { return rv.type === context.data.type; });
    if (!verification)
        throw new errors_1.default.Forbidden("The verification of type '" + context.data.type + "' has not been registered.");
    return context;
}; };
/**
 * stringify the json object in data before create to make it compatible with all DBs
 */
exports.stringifyData = function () { return function (context) {
    if (context.data.data &&
        typeof context.data.data === "object" &&
        context.data.data.constructor === Object)
        context.data.data = JSON.stringify(context.data.data);
    return context;
}; };
/**
 * parse the json object for data so it can be used on apply action
 */
exports.unstringifyData = function () { return function (context) {
    try {
        context.result.data = JSON.parse(context.result.data);
    }
    catch (e) {
        context.result.data = context.result.data;
    }
    return context;
}; };
/**
 * disable a method for external calls
 */
exports.disableExternal = function () { return function (context) {
    if (context.params.provider)
        throw new errors_1.default.MethodNotAllowed("This method is not allowed.");
    return context;
}; };
/**
 * execute the action create method after a validation has been created
 *
 * @param registeredVerifications
 */
exports.createVerificationAction = function (registeredVerifications) { return function (context) { return __awaiter(void 0, void 0, void 0, function () {
    var result, verification, create, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                result = context.result;
                verification = registeredVerifications.find(function (rv) { return rv.type === result.type; });
                if (!verification) return [3 /*break*/, 5];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                create = verification.action.create(result);
                if (!create.then) return [3 /*break*/, 3];
                return [4 /*yield*/, create];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                throw e_1;
            case 5: return [2 /*return*/, context];
        }
    });
}); }; };
/**
 * execute the action apply method after a validation has been created with any additional patch data
 *
 * @param registeredVerifications
 */
exports.applyVerificationAction = function (registeredVerifications) { return function (context) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, type, token, data, vRecord, verification, apply, postApply, e_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = context.data, type = _a.type, token = _a.token, data = _a.data;
                return [4 /*yield*/, context.service.find({
                        query: { type: type, token: token }
                    })];
            case 1:
                vRecord = (_b.sent())[0];
                if (!vRecord)
                    throw new errors_1.default.Forbidden("This token/type combination doesn't exist");
                if (vRecord.expires < Math.floor(Date.now() / 1000))
                    throw new errors_1.default.Forbidden("This token has expired");
                verification = registeredVerifications.find(function (rv) { return rv.type === vRecord.type; });
                if (verification == undefined)
                    throw new errors_1.default.BadRequest("This validation type is no longer valid.");
                _b.label = 2;
            case 2:
                _b.trys.push([2, 7, , 8]);
                apply = verification.action.apply(vRecord, data);
                if (!apply.then) return [3 /*break*/, 4];
                return [4 /*yield*/, apply];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                postApply = verification.action._postApply(vRecord);
                if (!postApply.then) return [3 /*break*/, 6];
                return [4 /*yield*/, postApply];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                e_2 = _b.sent();
                throw e_2;
            case 8: return [2 /*return*/, context];
        }
    });
}); }; };
