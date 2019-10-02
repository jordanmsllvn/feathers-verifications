import { IFeathersVerificationsOptions } from "./types";
import FeathersVerifications from "./FeathersVerifications";

export default function init(
  options: IFeathersVerificationsOptions
): FeathersVerifications {
  return new FeathersVerifications(options);
}

export { default as VerifiedAction } from "./VerifiedAction";
