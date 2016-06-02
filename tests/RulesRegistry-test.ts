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

import { test } from './sinon-tape';
import { registerRule, getRule } from '../src/RulesRegistry';
import * as Rule from '../src/Rule';

test('RulesRegistry', t => {
  
  console.log('hello1');
  const createRule = t.stub(Rule, 'createRule');
  
  t.equals(registerRule('id1', {}), 'id1', '`registerRule` should return an index starting with 1 for each registered rule');
  t.notCalled(createRule, '`registerRule` should not create rule right away');
  
  t.throws(
    () => registerRule('id1', {}),
    'registerRule should throws if we try to register 2 rules with the same id'
  );

  t.ok(
    typeof registerRule('', {}) === 'string',
    'resiter rule should generate an id if not provided'
  );

  const rule = {};
  createRule.reset();
  createRule.returns(rule);
  registerRule('id3', {});
  
  t.equals(getRule('id3'), rule,
    '`getRule` should create the rule and return it if it has not been created');
  getRule('id3');
  t.calledOnce(createRule, '`getRule` should not recreated the rule if it has already been created');
  
  t.equals(getRule('id4'), undefined, '`getRule` should return `undefined` if the is no rule associated to the given id');
  t.end();
});
