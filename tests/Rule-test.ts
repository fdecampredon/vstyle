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
import { createRule, RuleModifier } from '../src/Rule';
import * as PluginsRegistry from '../src/PluginsRegistry';
import * as RulesRegistry from '../src/RulesRegistry';

test('Rule.createRule', t => {
  const applyPlugins = t.stub(PluginsRegistry, 'applyPlugins');
  const style = {};
  createRule('id', style);
  
  t.calledWith(
    applyPlugins,
    [
      {
        addDefinition: t.match.typeOf('function'),
        addDependency: t.match.typeOf('function'),
      },
      style,
    ],
    'it should apply plugins'
  );

  t.deepEquals(
    createRule('id', { fontSize: 0 }),
    {
      id: 'id',
      definitions: [{
        selector: '&',
        media: null,
        style: {
          fontSize: 0,
        },
      }],
      dependencies: [],
    },
    'it should add a definition from given style if style object is not empty'
  );

  t.deepEquals(
    createRule('id', {}),
    {
      id: 'id',
      definitions: [],
      dependencies: [],
    },
    'it should not add a definition if style object is empty'
  );
  t.end();
});

test('RuleModifier.addDependency', t => {
  const applyPlugins = t.stub(PluginsRegistry, 'applyPlugins');
  const getRule = t.stub(RulesRegistry, 'getRule');
  applyPlugins
    .yieldsTo('addDependency', 1);
  
  t.throws(
    () => { createRule('id', {}); },
    'it should throw if plugins try to add a dependency that is not a string'
  );
  
  applyPlugins.reset();
  applyPlugins
    .yieldsTo('addDependency', '1');
 
  getRule
    .returns(undefined);
    
  t.throws(
    () => { createRule('id', {}); },
    'it should throw if plugins try to add a dependency that an index, but not corresponding to a rule in the Rulesregistry'
  );
  
  applyPlugins.reset();
  applyPlugins
    .onFirstCall().yieldsTo('addDefinition', '&:hover', '', {})
    .onSecondCall().yieldsTo('addDependency', '1');

  getRule
    .returns({});
  
  t.throws(
    () => { createRule('id', {}); },
    'it should throw if plugins try to add a dependency from a nested definition'
  );
  
  applyPlugins.reset();
  applyPlugins
    .yieldsTo('addDependency', '1');
 
  getRule
    .returns({});
     
  t.deepEquals(
    createRule('id', {}),
    {
      id: 'id',
      definitions: [],
      dependencies: ['1'],
    },
    'it should add a the dependencies to the rule'
  );
  
  t.end();  
});

test('RuleModifier.addDefinition', t => {
  let applyPlugins = t.stub(PluginsRegistry, 'applyPlugins');
  applyPlugins
    .yieldsTo('addDefinition', 1, 'media', {});
  
  t.throws(
    () => { createRule('id', {}); },
    'it should throw if plugins try to add a definiton with selector that is no a string'
  );

  applyPlugins.reset();
  applyPlugins
    .yieldsTo('addDefinition', '&:hover', 1, {});
  
  t.throws(
    () => { createRule('id', {}); },
    'it should throw if plugins try to add a definiton with a media that is no a string'
  );
  
  applyPlugins.reset();
  applyPlugins
    .yieldsTo('addDefinition', ':hover', null, 1);
  
  t.throws(
    () => { createRule('id', {}); },
    'it should throw if plugins try to add a definiton with style that is not a plain object'
  );

  applyPlugins.reset();
  applyPlugins
    .yieldsTo('addDefinition', null, null, {});
  
  t.throws(
    () => { createRule('id', {}); },
    'it should throw if plugins try to add a definiton without either a selector or a media'
  );

  const style = {};
  applyPlugins.reset();
  applyPlugins
    .onFirstCall()
    .yieldsTo('addDefinition', ':hover', null, style);
  
  createRule('id', {});
    
  t.ok(
    applyPlugins.calledTwice && applyPlugins.secondCall.args[1] === style,
    'it should reapply plugins on the style passed by addDefinition'
  );
  
  applyPlugins.reset();
  applyPlugins
    .onFirstCall()
    .yieldsTo('addDefinition', '&:first-child', null, { fontSize: 2 })
    .onSecondCall()
    .yieldsTo('addDefinition', '&:hover', null, { fontSize: 1 });
  
  t.deepEquals(
    createRule('id', {}),
    {
      id: 'id',
      definitions: [{
        media: null,
        selector: '&:first-child',
        style: {
          fontSize: 2,
        },
      }, {
        media: null,
        selector: '&:first-child:hover',
        style: {
          fontSize: 1,
        },
      }],
      dependencies: [],
    },
    'it should compose selector when the definition is added from a nested definitions'
  );
  
  applyPlugins.reset();
  applyPlugins
    .onFirstCall()
    .yieldsTo('addDefinition', '&:first-child', null, {})
    .onSecondCall()
    .yieldsTo('addDefinition', '&:hover', null, { fontSize: 1 });
  
  t.deepEquals(
    createRule('id', {}),
    {
      id: 'id',
      definitions: [{
        media: null,
        selector: '&:first-child:hover',
        style: {
          fontSize: 1,
        },
      }],
      dependencies: [],
    },
    'it should ditch empty definition, but keep selector context'
  );

  applyPlugins.reset();
  applyPlugins
    .onFirstCall()
    .yieldsTo('addDefinition', '', '@media screen and (max-width: 700px)', { fontSize: 2 })
    .onSecondCall()
    .yieldsTo('addDefinition', '&:hover', null, { fontSize: 1 });
  
  t.deepEquals(
    createRule('id', {}),
    {
      id: 'id',
      definitions: [{
        media: '@media screen and (max-width: 700px)',
        selector: '&',
        style: {
          fontSize: 2,
        },
      }, {
        media: '@media screen and (max-width: 700px)',
        selector: '&:hover',
        style: {
          fontSize: 1,
        },
      }],
      dependencies: [],
    },
    'it should keep media context when the definition is added from a nested definitions'
  );
  
  applyPlugins.reset();
  applyPlugins
    .onFirstCall()
    .yieldsTo('addDefinition', null, '@media screen and (max-width: 700px)', {})
    .onSecondCall()
    .yieldsTo('addDefinition', '&:hover', null, { fontSize: 1 });
  
  t.deepEquals(
    createRule('id', {}),
    {
      id: 'id',
      definitions: [{
        media: '@media screen and (max-width: 700px)',
        selector: '&:hover',
        style: {
          fontSize: 1,
        },
      }],
      dependencies: [],
    },
    'it should ditch empty definition, but keep media context context'
  );

  applyPlugins.reset();
  applyPlugins
    .onFirstCall()
    .yieldsTo('addDefinition', null, '@media screen and (max-width: 700px)', { fontSize: 2 })
    .onSecondCall()
    .yieldsTo('addDefinition', null, '@media screen and (min-width: 700px)', { fontSize: 1 });
  
  t.throws(
    () => createRule('id', {}),
    'it should throws if we try to nest media'
  );
  
  let callCount = 0;
  applyPlugins.restore();
  applyPlugins = t.stub(PluginsRegistry, 'applyPlugins', (modifier: RuleModifier) => {
    callCount++;
    switch (callCount) {
      case 1:
        modifier.addDefinition('&:first-child', '', { backgroundColor: 'white' });
        modifier.addDefinition('&:last-child', '', { backgroundColor: 'blue' });
        break;
      case 2:
        modifier.addDefinition('&:hover', '', { backgroundColor: 'grey' });
        break;
      case 3:
        break;
      case 4:
        modifier.addDefinition('&:hover', '', { backgroundColor: 'green' });
        break;
      default:
        return;
    }
  });
  
  t.deepEquals(
    createRule('id', { backgroundColor: 'yellow' }),
    {
      id: 'id',
      definitions: [{
        media: null,
        selector: '&',
        style: { backgroundColor: 'yellow' },
      }, {
        media: null,
        selector: '&:first-child',
        style: { backgroundColor: 'white' },
      }, {
        media: null,
        selector: '&:first-child:hover',
        style: { backgroundColor: 'grey' },
      }, {
        media: null,
        selector: '&:last-child',
        style: { backgroundColor: 'blue' },
      }, {
        media: null,
        selector: '&:last-child:hover',
        style: { backgroundColor: 'green' },
      }],
      dependencies: [],
    },
    'it should keep the order in which definitions have been added'
  );
  
  callCount = 0;
  applyPlugins.restore();
  applyPlugins = t.stub(PluginsRegistry, 'applyPlugins', (modifier: RuleModifier, style: any) => {
    callCount++;
    if (callCount === 1) {
      delete style.backgroundColor;
      modifier.addDefinition('&:hover', '', { backgroundColor: 'blue' });
    }
  });
  
  t.deepEquals(
    createRule('id', { backgroundColor: 'purple' }),
    {
      id: 'id',
      definitions: [{
        media: null,
        selector: '&:hover',
        style: { backgroundColor: 'blue' },
      }],
      dependencies: [],
    },
    'it should not add a definition if all the props the style definition are deleted by plugins'
  );
  
  t.end();  
});
