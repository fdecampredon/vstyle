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
import isPlainObject from '../../src/utils/isPlainObject';
import { runInNewContext } from 'vm';

tape.test('isPlainObject', t => {
  class Test {
    prop = 1;
  }
  
  const sandbox = { fromAnotherRealm: false };
  runInNewContext('fromAnotherRealm = {}', sandbox);

  t.equal(isPlainObject('hello'), false, 'it should not accept string');
  t.equal(isPlainObject(true), false, 'it should not accept booolean');
  t.equal(isPlainObject(3), false, 'it should not accept number');
  t.equal(isPlainObject(new Test()), false, 'it should not accept object created from class');
  t.equal(isPlainObject(new Date()), false, 'it should not accept date');
  t.equal(isPlainObject([1, 2, 3]), false, 'it should not accept array');
  t.equal(isPlainObject(null), false, 'it should not accept null');
  t.equal(isPlainObject(undefined), false, 'it should not accept undefined');
  t.equal(isPlainObject({ x: 1, y: 2 }), true, 'it should accept plain objects');
  t.equal(isPlainObject(sandbox.fromAnotherRealm), true, 'it should return true even if the object com from another realm');
  t.end();
});
