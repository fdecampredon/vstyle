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
import resolveStyles from '../src/resolveStyles';
import * as RulesRegistry from '../src/RulesRegistry';
import { Rule } from '../src/Rule';

test('resolveStyles', t => {
  const stub = t.stub(RulesRegistry, 'getRule');
  const rule1 = { id: 'rule1' } as Rule;
  const rule2 = { id: 'rule2' } as Rule;
  const rule3 = { id: 'rule3' } as Rule;

  stub.returns(undefined);
  stub.withArgs('1').returns(rule1);
  stub.withArgs('2').returns(rule2);
  stub.withArgs('3').returns(rule3);

  t.throws(
    () => { resolveStyles([1]); },
    'it should throw if passed argument contains an non falsy value that is not a string '
  );

  t.throws(
    () => { resolveStyles(['10']); },
    'it should throw if passed argument contains an id that is not associated to a rule in the registry'
  );
  
  t.deepEquals(
    resolveStyles(['1', '2', '3']),
    [rule1, rule2, rule3],
    'it should returns an array of rules corresponding to the array of index passed as arguments'  
  );
  
  t.deepEquals(
    resolveStyles('1'),
    [rule1],
    'it should returns a single rule if the argument is not an array'  
  );
  
  t.deepEquals(
    resolveStyles([[['1'], ['2']], ['3']]),
    [rule1, rule2, rule3],
    'it should flatten the input array'  
  );
  
  t.deepEquals(
    resolveStyles([0, false, undefined, null, '', '3']),
    [rule3],
    'it should ignore falsy value'  
  );
  
  t.deepEquals(
    resolveStyles(['1', '3', '2', '3']),
    [rule1, rule2, rule3],
    'it should dedupe rules'
  );
  
  rule3.dependencies = ['2'];
  
  t.deepEquals(
    resolveStyles(['1', '3']),
    [rule1, rule2, rule3],
    'it should resolves rules dependencies'  
  );
  
  rule1.dependencies = ['3', '2'];
  rule2.dependencies = ['3'];
  rule3.dependencies = ['1'];
  
  t.deepEquals(
    resolveStyles(['1', '2', '3']),
    [rule2, rule1, rule3],
    'it should dedupe rules in dependencies'
  );
  
  t.end();
});
