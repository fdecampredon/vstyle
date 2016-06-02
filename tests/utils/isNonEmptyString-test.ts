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
import isNonEmptyString from '../../src/utils/IsNonEmptyString';

tape.test('isPlainObject', t => {
  t.equal(isNonEmptyString({}), false, 'it should not accept object');
  t.equal(isNonEmptyString(true), false, 'it should not accept booolean');
  t.equal(isNonEmptyString(3), false, 'it should not accept number');
  t.equal(isNonEmptyString(''), false, 'it should accept plain empty string');
  t.equal(isNonEmptyString('foo'), true, 'it should accept non empty string');
  t.end();
});
