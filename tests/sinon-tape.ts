/*
 * Copyright 2016 François de Campredon <francois.de.campredon@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as tape from 'tape';
import * as sinon from 'sinon';

export type TestSignature = ((cb: TestCase) => tape.Test) &
  ((options: Options, cb: TestCase) => tape.Test) &
  ((name: string, cb: TestCase) => tape.Test) &
  ((name: string, options: Options, cb: TestCase) => tape.Test)

function assert(test: any, assertion: boolean, options: any) {
  return test._assert(assertion, options);
}

function defined<T>(smthing: T | undefined | null, smthingElse: T): T {
  return smthing == null ? smthingElse : smthing;
}

export const spyTestMethod = {

  called(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, spy.called, {
      message: defined(msg, 'should have been called'),
      operator: 'called',
      expected: true,
      actual: false,
      extra: extra,
    });
  },
  
  notCalled(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, !spy.called, {
      message: defined(msg, 'should not have been called'),
      operator: 'notCalled',
      expected: false,
      actual: true,
      extra: extra,
    });
  },

  calledOnce(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, spy.calledOnce, {
      message: defined(msg, 'should have been called once'),
      operator: 'calledOnce',
      expected: true,
      actual: false,
      extra: extra,
    });
  },

  notCalledOnce(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, !spy.calledOnce, {
      message: defined(msg, 'should not have been called once'),
      operator: 'notCalledOnce',
      expected: false,
      actual: true,
      extra: extra,
    });
  },

  calledTwice(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, spy.calledTwice, {
      message: defined(msg, 'should have been called twice'),
      operator: 'calledTwice',
      expected: true,
      actual: false,
      extra: extra,
    });
  },

  notCalledTwice(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, !spy.calledTwice, {
      message: defined(msg, 'should not have been called'),
      operator: 'notCalledTwice',
      expected: false,
      actual: true,
      extra: extra,
    });
  },

  calledThrice(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, spy.calledThrice, {
      message: defined(msg, 'should have been called'),
      operator: 'calledThrice',
      expected: true,
      actual: false,
      extra: extra,
    });
  },

  notCalledThrice(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, !spy.calledThrice, {
      message: defined(msg, 'should not have been called'),
      operator: 'notCalledThrice',
      expected: false,
      actual: true,
      extra: extra,
    });
  },

  calledBefore(this: any, spy1: sinon.SinonSpy, spy2: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, spy1.calledBefore(spy2), {
      message: defined(msg, 'should have been called before'),
      operator: 'calledBefore',
      expected: true,
      actual: false,
      extra: extra,
    });
  },

  calledAfter(this: any, spy1: sinon.SinonSpy, spy2: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, spy1.calledAfter(spy2), {
      message: defined(msg, 'should have been called after'),
      operator: 'calledAfter',
      expected: true,
      actual: false,
      extra: extra,
    });
  },

  calledWithNew(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, (spy as any).calledWithNew(), {
      message: defined(msg, 'should have been called with new'),
      operator: 'calledWithNew',
      expected: true,
      actual: false,
      extra: extra,
    });
  },
  
  notCalledWithNew(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, !((spy as any).calledWithNew()), {
      message: defined(msg, 'should have been called with new'),
      operator: 'notCalledWithNew',
      expected: false,
      actual: true,
      extra: extra,
    });
  },

  calledOn(this: any, spy: sinon.SinonSpy, obj: any, msg?: string, extra?: any): void {
    assert(this, spy.calledOn(obj), {
      message: defined(msg, 'should have been called on'),
      operator: 'calledOn',
      expected: obj,
      actual: spy.thisValues,
      extra: extra,
    });
  },
  
  alwaysCalledOn(this: any, spy: sinon.SinonSpy, obj: any, msg?: string, extra?: any): void {
    assert(this, spy.alwaysCalledOn(obj), {
      message: defined(msg, 'should always have been called on'),
      operator: 'alwaysCalledOn',
      expected: obj,
      actual: spy.thisValues,
      extra: extra,
    });
  },

  notCalledOn(this: any, spy: sinon.SinonSpy, obj: any, msg?: string, extra?: any): void {
    assert(this, !spy.calledOn(obj), {
      message: defined(msg, 'should not have been called on'),
      operator: 'notCalledOn',
      notExpected: obj,
      actual: spy.thisValues,
      extra: extra,
    });
  },
  
  calledWith(this: any, spy: sinon.SinonSpy, call: any[], msg?: string, extra?: any): void {
    assert(this, spy.calledWith(...call), {
      message: defined(msg, 'should have been called with'),
      operator: 'calledWith',
      expected: call,
      actual: spy.args,
      extra: extra,
    });
  },

  alwaysCalledWith(this: any, spy: sinon.SinonSpy, call: any[], msg?: string, extra?: any): void {
    assert(this, spy.alwaysCalledWith(...call), {
      message: defined(msg, 'should always have been called with'),
      operator: 'alwaysCalledWith',
      expected: call,
      actual: spy.args,
      extra: extra,
    });
  },
  
  neverCalledWith(this: any, spy: sinon.SinonSpy, call: any[], msg?: string, extra?: any): void {
    assert(this, spy.neverCalledWith(...call), {
      message: defined(msg, 'should never have been called with'),
      operator: 'neverCalledWith',
      notExpected: call,
      actual: spy.args,
      extra: extra,
    });
  },
  
  calledWithExactly(this: any, spy: sinon.SinonSpy, call: any[], msg?: string, extra?: any): void {
    assert(this, spy.calledWithExactly(...call), {
      message: defined(msg, 'should have been called exactly with'),
      operator: 'calledWithExactly',
      expected: call,
      actual: spy.args,
      extra: extra,
    });
  },

  alwaysCalledWithExactly(this: any, spy: sinon.SinonSpy, call: any[], msg?: string, extra?: any): void {
    assert(this, spy.alwaysCalledWithExactly(...call), {
      message: defined(msg, 'should always have been called exactly with'),
      operator: 'alwaysCalledWithExactly',
      expected: call,
      actual: spy.args,
      extra: extra,
    });
  },
  
  calledWithMatch(this: any, spy: sinon.SinonSpy, call: any[], msg?: string, extra?: any): void {
    assert(this, spy.calledWithMatch(...call), {
      message: defined(msg, 'should have been called with'),
      operator: 'calledWithMatch',
      expected: call,
      actual: spy.args,
      extra: extra,
    });
  },
  
  alwaysCalledWithMatch(this: any, spy: sinon.SinonSpy, call: any[], msg?: string, extra?: any): void {
    assert(this, spy.alwaysCalledWithMatch(...call), {
      message: defined(msg, 'should always have been called with'),
      operator: 'alwaysCalledWithMatch',
      expected: call,
      actual: spy.args,
      extra: extra,
    });
  },

  neverCalledWithMatch(this: any, spy: sinon.SinonSpy, call: any[], msg?: string, extra?: any): void {
    assert(this, spy.neverCalledWithMatch(...call), {
      message: defined(msg, 'should never have been called with'),
      operator: 'neverCalledWithMatch',
      notExpected: call,
      actual: spy.args,
      extra: extra,
    });
  },
  
  returned(this: any, spy: sinon.SinonSpy, returnValue: any, msg?: string, extra?: any): void {
    assert(this, spy.returned(returnValue), {
      message: defined(msg, 'should have returned'),
      operator: 'returned',
      expected: returnValue,
      actual: spy.returnValues,
      extra: extra,
    });
  },

  alwaysReturned(this: any, spy: sinon.SinonSpy, returnValue: any, msg?: string, extra?: any): void {
    assert(this, (spy as any).alwaysReturned(returnValue), {
      message: defined(msg, 'should always have returned'),
      operator: 'returned',
      expected: returnValue,
      actual: spy.returnValues,
      extra: extra,
    });
  },
  
  neverReturned(this: any, spy: sinon.SinonSpy, returnValue: any, msg?: string, extra?: any): void {
    assert(this, !spy.returned(returnValue), {
      message: defined(msg, 'should not have returned'),
      operator: 'neverReturned',
      notExpected: returnValue,
      actual: spy.returnValues,
      extra: extra,
    });
  },
  
  threw(this: any, spy: sinon.SinonSpy, type?: string | Function, msg?: string, extra?: any): void {
    assert(this, spy.threw(type), {
      message: defined(msg, 'should have threw'),
      operator: 'threw',
      expected: type || true,
      actual: type ? spy.exceptions : false,
      extra: extra,
    });
  },
  
  alwaysThrew(this: any, spy: sinon.SinonSpy, type?: string | Function, msg?: string, extra?: any): void {
    assert(this, spy.alwaysThrew(type), {
      message: defined(msg, 'should have threw'),
      operator: 'alwaysThrew',
      expected: type || true,
      actual: type ? spy.exceptions : false,
      extra: extra,
    });
  },
  
  neverThrew(this: any, spy: sinon.SinonSpy, msg?: string, extra?: any): void {
    assert(this, !spy.threw(), {
      message: defined(msg, 'should not have threw'),
      operator: 'notThrew',
      expected: false,
      actual: true,
      extra: extra,
    });
  },
};

export type Test =
  typeof tape.Test.prototype &
  sinon.SinonStatic & {
    test: TestSignature;
    skip: TestSignature;
    only: TestSignature;
  } & 
  typeof spyTestMethod;

export type TestCase = (test: Test) => void; 
export type Options = tape.Options;

function extend<T, U, V, W, Z>(t: T, u: U, v: V, w: W, z: Z): T & U & V & W & Z {
  const res = {};
  [t, u, v, w, z].forEach(obj => {
    Object.keys(obj).forEach(key => {
      res[key] = obj[key];
    });
  });
  return res as any;
}

function getTestArgs(args: any[]) {
  let name = '(anonymous)';
  let options: Options = {};
  let cb: TestCase = () => void(0);
  
  for (const arg of args) {
      const t = typeof arg;
      if (t === 'string') {
          name = arg;
      } else if (t === 'object') {
          options = arg || options;
      } else if (t === 'function') {
          cb = arg;
      }
  }
  return { name, options, cb };
};

function monkeyStub(sandbox: sinon.SinonSandbox) {
  const result = ((...args: any[]) => {
    const stub: sinon.SinonStub = (sandbox.stub as any)(...args);
    const reset = stub.reset;
    stub.reset = () => {
      reset.call(stub);
      if (stub.resetBehavior) {
        stub.resetBehavior();
      }
    };
    return stub;
  });
  return result as sinon.SinonStubStatic;
}

function patchTest(args: any[], func: typeof tape.test | typeof tape.skip | typeof tape.only) {
  const { name, options, cb } = getTestArgs(args);
  return func(name, options, (t: tape.Test) => {
    const sandbox = sinon.sandbox.create();
    const t2: Test = extend(sinon, sandbox, t, { test, skip, only }, spyTestMethod);
    t2.stub = monkeyStub(sandbox);
    t2.on('end', () => sandbox.restore());
    return cb(t2);
  });
}

export const test: TestSignature = function test(...args: any[])  {
  return patchTest(args, tape.test);
};

export const skip: TestSignature = function skip(...args: any[]): tape.Test  {
  return patchTest(args, tape.skip);
};

export const only: TestSignature = function skip(...args: any[]): tape.Test  {
  return patchTest(args, tape.only);
};

export const createHarness = tape.createHarness;
export const createStream = tape.createStream;
export const onFinish = tape.onFinish;
