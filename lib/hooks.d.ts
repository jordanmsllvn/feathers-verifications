import { HookContext } from "@feathersjs/feathers";
import { IVerificationDefinition } from "./types";
/**
 * generate the secure verification token and attach it to creates
 */
export declare const generateVerificationToken: () => (context: HookContext<any>) => HookContext<any>;
/**
 * generate the expiration based on the 'life' param of the verification definition
 */
export declare const generateExpiration: (registeredVerifications: IVerificationDefinition[]) => (context: HookContext<any>) => HookContext<any>;
/**
 * Checks the validity of a token on find
 */
export declare const checkValidity: () => (context: HookContext<any>) => Promise<HookContext<any>>;
/**
 * check if the attempted create is of a type that is registered
 *
 * @param registeredVerifications
 */
export declare const checkIsRegistered: (registeredVerifications: IVerificationDefinition[]) => (context: HookContext<any>) => HookContext<any>;
/**
 * stringify the json object in data before create to make it compatible with all DBs
 */
export declare const stringifyData: () => (context: HookContext<any>) => HookContext<any>;
/**
 * parse the json object for data so it can be used on apply action
 */
export declare const unstringifyData: () => (context: HookContext<any>) => HookContext<any>;
/**
 * disable a method for external calls
 */
export declare const disableExternal: () => (context: HookContext<any>) => HookContext<any>;
/**
 * execute the action create method after a validation has been created
 *
 * @param registeredVerifications
 */
export declare const createVerificationAction: (registeredVerifications: IVerificationDefinition[]) => (context: HookContext<any>) => Promise<HookContext<any>>;
/**
 * execute the action apply method after a validation has been created with any additional patch data
 *
 * @param registeredVerifications
 */
export declare const applyVerificationAction: (registeredVerifications: IVerificationDefinition[]) => (context: HookContext<any>) => Promise<HookContext<any>>;
