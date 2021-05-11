import { HooksObject, Service } from "@feathersjs/feathers";
import VerifiedAction from "./VerifiedAction";

/**
 * Top Level options passed in from outside the library
 */
export interface IFeathersVerificationsOptions {
  service: Service<any>;
  verifications: IVerificationDefinition[];
  hooks?: HooksObject;
}

/**
 * Definition of each individual verification passed into the FeathersVerificationsOptions
 */
export interface IVerificationDefinition {
  type: string;
  action: VerifiedAction;
  life?: number;
}

/**
 * Fields in the database table
 */
export interface IVerificationRecord {
  id?: string;
  type: string;
  token: string;
  data?: string | object;
  expires: number;
}

/**
 * The data structure for the patch data coming from the user (TODO: should be put in a typeguard validation with errors back to the user)
 */
export interface IPatchData {
  type: object;
  token: string;
  data: object;
}

/**
 * Options that define to configure action default behavior
 */
export interface IActionOptions {
  removeTokenOnVerify?: boolean;
}
