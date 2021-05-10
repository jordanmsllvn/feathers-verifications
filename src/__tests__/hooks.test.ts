import { Mock } from "ts-mockery";
import { HookContext, Service, Application } from "@feathersjs/feathers";
import { IVerificationDefinition } from "../types";
import * as hooks from "../hooks";

import VerifiedAction from "../VerifiedAction";

const mockService = Mock.of<Service<any>>();
const mockApp = Mock.of<Application>();
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

test("generateVerificationToken attaches a generated token to the data", () => {
  const mockContext = Mock.of<HookContext>({ data: {} });
  const newContext = hooks.generateVerificationToken()(mockContext);
  expect(newContext.data.token).toBeDefined();
});

test("generateExpiration sets expiration to 'life' seconds in future when 'life' is defined", () => {
  const mockContext = Mock.of<HookContext>({ data: { type: "type1" } });
  const newContext = hooks.generateExpiration(mockVerificationDefinitons)(
    mockContext
  );
  expect(newContext.data.expires).toBeGreaterThanOrEqual(
    Math.floor(Date.now() / 1000) + 1000
  );
  expect(newContext.data.expires).toBeLessThan(
    Math.floor(Date.now() / 1000) + 1050
  );
});

test('generateExpiration sets expiration to 0 if "life" is set to 0', () => {
  const mockContext = Mock.of<HookContext>({ data: { type: "type2" } });
  const newContext = hooks.generateExpiration(mockVerificationDefinitons)(
    mockContext
  );
  expect(newContext.data.expires).toEqual(0);
});

test('generateExpiration sets expiration to 0 if "life" is undefined', () => {
  const mockContext = Mock.of<HookContext>({ data: { type: "type3" } });
  const newContext = hooks.generateExpiration(mockVerificationDefinitons)(
    mockContext
  );
  expect(newContext.data.expires).toEqual(0);
});

test("checkIsRegistered properly throws if a specified type is unregistered", () => {
  const mockContext = Mock.of<HookContext>({ data: { type: "type100" } });
  expect(() => {
    hooks.checkIsRegistered(mockVerificationDefinitons)(mockContext);
  }).toThrow();
});

test("checkIsRegistered properly continues if a specified type is registered", () => {
  const mockContext = Mock.of<HookContext>({ data: { type: "type1" } });
  const resultContext = hooks.checkIsRegistered(mockVerificationDefinitons)(
    mockContext
  );
  expect(resultContext).toBeDefined();
});

test("stringifyData properly stringifies data", () => {
  const mockContext = Mock.of<HookContext>({
    data: { data: { test: "test" } }
  });
  const resultContext = hooks.stringifyData()(mockContext);
  expect(resultContext.data.data).toEqual(
    expect.stringContaining('{"test":"test"}')
  );
});

test("stringifyData quietly skips if data isnt defined", () => {
  const mockContext = Mock.of<HookContext>({ data: {} });
  const resultContext = hooks.stringifyData()(mockContext);
  expect(resultContext.data.data).toBeUndefined();
});

test("stringifyData quietly skips if data isnt an object", () => {
  const mockContext = Mock.of<HookContext>({ data: {} });
  const resultContext = hooks.stringifyData()(mockContext);
  expect(resultContext.data.data).toBeUndefined();
});

test("unstringifyData properly parses result data when object", () => {
  const mockContext = Mock.of<HookContext>({
    result: { data: '{"test":"test"}' }
  });
  const resultContext = hooks.unstringifyData()(mockContext);
  expect(resultContext.result.data).toMatchObject({ test: "test" });
});

test("unstringifyData skips parsing result data when not an object", () => {
  const mockContext = Mock.of<HookContext>({ result: { data: "test" } });
  const resultContext = hooks.unstringifyData()(mockContext);
  const mockContextB = Mock.of<HookContext>({ result: { data: 2 } });
  const resultContextB = hooks.unstringifyData()(mockContextB);
  expect(resultContext.result.data).toBe("test");
  expect(resultContextB.result.data).toBe(2);
});

test("disableExternal properly throws on external calls", () => {
  const mockContext = Mock.of<HookContext>({ params: { provider: "rest" } });
  expect(() => hooks.disableExternal()(mockContext)).toThrow();
});

test("disableExternal properly allows internal calls", () => {
  const mockContext = Mock.of<HookContext>({ params: { provider: undefined } });
  expect(hooks.disableExternal()(mockContext)).toBeDefined();
});

test("createVerificationAction sucessfully executes action's create method", async () => {
  const mockContext = Mock.of<HookContext>({ result: { type: "type1" } });
  const mockCreate = jest.spyOn(mockVerificationDefinitons[0].action, "create");
  await hooks.createVerificationAction(mockVerificationDefinitons)(mockContext);
  expect(mockCreate).toHaveBeenCalled();
});

test("applyVerificationAction sucessfully executes action's apply method", async () => {
  Mock.extend(mockService).with({
    async remove(): Promise<void> {
      return;
    }
  });
  const mockContext = Mock.of<HookContext>({
    data: { type: "type1" },
    service: {
      async find(): Promise<IVerificationDefinition[]> {
        return [mockVerificationDefinitons[0]];
      }
    }
  });
  const mockApply = jest.spyOn(mockVerificationDefinitons[0].action, "apply");
  await hooks.applyVerificationAction(mockVerificationDefinitons)(mockContext);
  expect(mockApply).toHaveBeenCalled();
});

test("applyVerificationAction sucessfully executes action's postApply method", async () => {
  Mock.extend(mockService).with({
    async remove(): Promise<void> {
      return;
    }
  });
  const mockContext = Mock.of<HookContext>({
    data: { type: "type1" },
    service: {
      async find(): Promise<IVerificationDefinition[]> {
        return [mockVerificationDefinitons[0]];
      }
    }
  });
  const mockPostApply = jest.spyOn(
    mockVerificationDefinitons[0].action,
    "_postApply"
  );
  await hooks.applyVerificationAction(mockVerificationDefinitons)(mockContext);
  expect(mockPostApply).toHaveBeenCalled();
});
