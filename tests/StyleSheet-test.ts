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
import * as RulesRegistry from '../src/RulesRegistry';
import * as StyleSheet from '../src/StyleSheet';

test('StyleSheet createRule', t => {
  const registerRule = t.stub(RulesRegistry, 'registerRule');

  t.throws(function () {
    StyleSheet.createRule(1 as any, {});
  }, 'should throw an error if the id is not a non empty string');

  t.throws(function () {
    StyleSheet.createRule( 'id', 3 as any);
  }, 'should throw an error if the style representation is not a plain object');

  registerRule.returns('ruleId');
  const style = {};
  t.equals(StyleSheet.createRule('ruleId', style), 'ruleId', '`createRule` should returns the id of the created rule');
  t.calledWithExactly(registerRule, ['ruleId', style],
    'should register a new rule with id and style description passed as arguments');

  registerRule.reset();
  StyleSheet.createRule(style);
  t.calledWithExactly(registerRule, [null, style],
    'should pass undefined if id is not provied'
  );

  t.end();
  registerRule.restore();
});

test('StyleSheet create', t => {
  const registerRule = t.stub(RulesRegistry, 'registerRule', (id: any) => id );

  t.throws(function () {
    StyleSheet.create(1 as any, {});
  }, 'should throw an error if the id is not a non empty string');

  t.throws(function () {
    StyleSheet.create('id', 3 as any);
  }, 'should throw an error if the styles representations are not a plain object');

  
  const style = {
    'a': { textAlign: 'center' },
    'b': { fontSize: 13 },
  };
  
  t.deepEqual(StyleSheet.create('ruleId', style), { a: 'ruleId_a', b: 'ruleId_b' },
    'should returns an object containing id of each rule created');
  t.calledWith(registerRule, ['ruleId_a', { textAlign: 'center' }],
    'should register a new rule for each key of the styles descriptions');
  t.calledWith(registerRule, ['ruleId_b', { fontSize: 13 }],
    'should register a new rule for each key of the styles descriptions');
  t.calledTwice(registerRule);

  t.end();
});
