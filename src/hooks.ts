import errors from "@feathersjs/errors";
import { HookContext } from "@feathersjs/feathers";
import nanoid from "nanoid";
import { IVerificationDefinition, IVerificationRecord } from "./types";

/**
 * generate the secure verification token and attach it to creates
 */
export const generateVerificationToken = () => (
  context: HookContext
): HookContext => {
  context.data.token = nanoid(32);
  return context;
};

/**
 * generate the expiration based on the 'life' param of the verification definition
 */
export const generateExpiration = (
  registeredVerifications: IVerificationDefinition[]
) => (context: HookContext): HookContext => {
  const verificationDefinition = registeredVerifications.find(
    rv => rv.type === context.data.type
  );
  if (!verificationDefinition) return context;
  context.data.expire = verificationDefinition.life
    ? Math.floor(Date.now() / 1000) + verificationDefinition.life
    : 0;
  return context;
};

/**
 * Checks the validity of a token on find
 */
export const checkValidity = () => async (
  context: HookContext
): Promise<HookContext> => {
  if (
    !context.params.query ||
    !context.params.query.type ||
    !context.params.query.token
  )
    throw new errors.BadRequest(
      `You must query with both 'token' and 'type' to check validity.`
    );
  const verification: IVerificationRecord = (await context.service.find({
    query: {
      type: context.params.query.type,
      token: context.params.query.token
    }
  }))[0];
  if (!verification)
    throw new errors.Forbidden(`This token/type combination doesn't exist.`);
  if (
    verification.expires &&
    verification.expires < Math.floor(Date.now() / 1000)
  )
    throw new errors.Forbidden(`This token has expired`);
  delete verification.data;
  context.result = verification;
  return context;
};

/**
 * check if the attempted create is of a type that is registered
 *
 * @param registeredVerifications
 */
export const checkIsRegistered = (
  registeredVerifications: IVerificationDefinition[]
) => (context: HookContext): HookContext => {
  const verification = registeredVerifications.find(
    rv => rv.type === context.data.type
  );
  if (!verification)
    throw new errors.Forbidden(
      `The verification of type '${context.data.type}' has not been registered.`
    );
  return context;
};

/**
 * stringify the json object in data before create to make it compatible with all DBs
 */
export const stringifyData = () => (context: HookContext): HookContext => {
  if (
    context.data.data &&
    typeof context.data.data === "object" &&
    context.data.data.constructor === Object
  )
    context.data.data = JSON.stringify(context.data.data);
  return context;
};

/**
 * parse the json object for data so it can be used on apply action
 */
export const unstringifyData = () => (context: HookContext): HookContext => {
  try {
    context.result.data = JSON.parse(context.result.data);
  } catch (e) {
    context.result.data = context.result.data;
  }
  return context;
};

/**
 * disable a method for external calls
 */
export const disableExternal = () => (context: HookContext): HookContext => {
  if (context.params.provider)
    throw new errors.MethodNotAllowed("This method is not allowed.");
  return context;
};

/**
 * execute the action create method after a validation has been created
 *
 * @param registeredVerifications
 */
export const createVerificationAction = (
  registeredVerifications: IVerificationDefinition[]
) => async (context: HookContext): Promise<HookContext> => {
  const result: IVerificationRecord = context.result;

  const verification = registeredVerifications.find(
    rv => rv.type === result.type
  );

  if (verification) {
    try {
      const create = verification.action.create(result);
      if (create.then) await create;
    } catch (e) {
      throw e;
    }
  }

  return context;
};

/**
 * execute the action apply method after a validation has been created with any additional patch data
 *
 * @param registeredVerifications
 */
export const applyVerificationAction = (
  registeredVerifications: IVerificationDefinition[]
) => async (context: HookContext): Promise<HookContext> => {
  const {
    type,
    token,
    data
  }: { type: string; token: string; data: object } = context.data;

  const vRecord: IVerificationRecord = (await context.service.find({
    query: { type, token }
  }))[0];

  if (!vRecord)
    throw new errors.Forbidden("This token/type combination doesn't exist");

  if (vRecord.expires < Math.floor(Date.now() / 1000))
    throw new errors.Forbidden(`This token has expired`);

  const verification:
    | IVerificationDefinition
    | undefined = registeredVerifications.find(rv => rv.type === vRecord.type);

  if (verification == undefined)
    throw new errors.BadRequest(`This validation type is no longer valid.`);

  try {
    const apply = verification.action.apply(vRecord, data);
    if (apply.then) await apply;
    const postApply = verification.action._postApply(vRecord);
    if (postApply.then) await postApply;
  } catch (e) {
    throw e;
  }

  return context;
};
