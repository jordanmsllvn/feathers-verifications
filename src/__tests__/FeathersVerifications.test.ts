import { Mock } from "ts-mockery";
import { Service, Application } from "@feathersjs/feathers";
import {
  IFeathersVerificationsOptions,
  IVerificationDefinition
} from "../types";
import FeathersVerifications from "../FeathersVerifications";
import VerifiedAction from "../VerifiedAction";

const mockService = Mock.of<Service<any>>();
const mockApp = Mock.of<Application>();
Mock.extend(mockService).with({ hooks: (): any => true });
const mockVerificationDefinitons: IVerificationDefinition[] = [
  {
    type: "type1",
    action: new VerifiedAction(mockService, mockApp, {
      removeTokenOnVerify: true
    }),
    life: 1000
  },
  { type: "type2", action: new VerifiedAction(mockService, mockApp), life: 0 },
  { type: "type3", action: new VerifiedAction(mockService, mockApp) }
];

test("FeathersVerification runs without errors", () => {
  const options: IFeathersVerificationsOptions = {
    service: mockService,
    verifications: mockVerificationDefinitons
  };
  const instance = new FeathersVerifications(options);
  expect(instance).toBeDefined();
});
