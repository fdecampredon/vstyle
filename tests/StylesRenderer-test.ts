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

import { test, Test } from './sinon-tape';
import { createStylesRenderer } from '../src/StylesRenderer';
import * as ClassNameGenerator from '../src/ClassNameGenerator';
import * as RuleRenderer from '../src/RuleRenderer';
import * as RulesRegistry from '../src/RulesRegistry';

function createRuleRenderersStub(t: Test) {
  const getRule = t.stub(RulesRegistry, 'getRule');
  getRule
    .withArgs('rule1')
    .returns({ id: 'rule1' });
  getRule
    .withArgs('rule2')
    .returns({ id: 'rule2' });
  getRule
    .withArgs('rule3')
    .returns({ id: 'rule3' });

  const ruleRendererAttach = t.spy();
  const ruleRendererConnect = t.spy();
  const ruleRendererSetRuleOverrideCount = t.spy();
    
  const createRuleRenderer = t.stub(RuleRenderer, 'createRuleRenderer', (rule: any, index: number) => {
    return {
      index: () => index,
      attach: ruleRendererAttach,
      connect: ruleRendererConnect,
      setRuleOverrideCount: ruleRendererSetRuleOverrideCount,
      getRuleClassNames: () => [`className${index}`],
      renderToString: () => `className${index}`,
      serialize: () => ({ index }),
    };
  });

  return { ruleRendererAttach, ruleRendererConnect,  ruleRendererSetRuleOverrideCount, createRuleRenderer };
}

test('StylesRenderer createStylesRenderer', (t) => {
  const createRuleRenderer = t.stub(RuleRenderer, 'createRuleRenderer');
  const createClassNameGenerator = t.spy(ClassNameGenerator, 'createClassNameGenerator');
  const getRule = t.stub(RulesRegistry, 'getRule');

  createStylesRenderer();
  t.calledWithExactly(createClassNameGenerator, [undefined], 'should create a ClassNameGenerator');
  t.notCalled(createRuleRenderer, 'should not create any renderer if not state are provided');

  getRule.returns({});
  const state = {
    classNameGeneratorKey: 2,
    rules: [
      { ruleId: '1', rendererState: { classNames: ['a', 'b'], index: 1 } },
      { ruleId: '2', rendererState: { classNames: ['c', 'd'], index: 2 } },
    ],
  };
  createStylesRenderer(state);
  t.calledWith(createClassNameGenerator, [2], 'should pass currCSSKey state to classNameGeneratorKey if state is provided');
  t.ok(
    createRuleRenderer.calledTwice &&
    createRuleRenderer.calledWith({}, 1, t.match.object, ['a', 'b']) &&
    createRuleRenderer.calledWith({}, 2, t.match.object, ['c', 'd']),
    'should create a renderer for each rules defined in state'
  );

  getRule.reset();  
  getRule.returns(undefined);
  t.throws(() => createStylesRenderer(state), 'should throws if rule registry does not contains rule defined in state');
  t.end();
});

test('StylesRenderer renderStyles', (t) => {
  const getRule = t.stub(RulesRegistry, 'getRule');
  getRule
    .withArgs('rule1')
    .returns({ id: 'rule1' });
  getRule
    .withArgs('rule2')
    .returns({ id: 'rule2' });
  getRule
    .withArgs('rule3')
    .returns({ id: 'rule3' });

  const ruleRendererAttach = t.spy();
  const ruleRendererSetRuleOverrideCount = t.spy();
    
  const createRuleRenderer = t.stub(RuleRenderer, 'createRuleRenderer', (rule: any, index: number) => {
    return {
      index: () => index,
      attach: ruleRendererAttach,
      setRuleOverrideCount: ruleRendererSetRuleOverrideCount,
      getRuleClassNames: () => ['className' + index],
    };
  });
  
  const styleRenderer = createStylesRenderer();

  styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']);

  t.ok(
    createRuleRenderer.calledThrice &&
    createRuleRenderer.calledWith({ id: 'rule1' }, 0, t.match.object) &&
    createRuleRenderer.calledWith({ id: 'rule2' }, 1, t.match.object) &&
    createRuleRenderer.calledWith({ id: 'rule3' }, 2, t.match.object),
    'should create a new rule renderer for each new rule encountered'
  );
  
  styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']);
  t.calledThrice(createRuleRenderer, 'should not create a rule renderer if one already exists for the given rule');

  ruleRendererSetRuleOverrideCount.reset();
  styleRenderer.renderStyles(['rule3', 'rule2', 'rule1']);
  t.ok(
    ruleRendererSetRuleOverrideCount.calledThrice &&
    ruleRendererSetRuleOverrideCount.calledWithExactly(0) &&
    ruleRendererSetRuleOverrideCount.calledWithExactly(1) &&
    ruleRendererSetRuleOverrideCount.calledWithExactly(2),
    'should set renderers override count if imcompatible order if encountered'
  );

  t.notCalled(ruleRendererAttach, 'should not attach rule renderers if the styles renderer is not attached');
  styleRenderer.attach({ sheet: {} } as any);
  ruleRendererAttach.reset();
  styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']);
  t.calledThrice(ruleRendererAttach, 'should try to attach the rules renderers if the styles renderer is attached');

  t.equal(styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']), 'className0 className1 className2',
    'should return a composition of rules renderers class names');
  
  t.end();
});

test('StylesRenderer renderStyles', (t) => {
  const { ruleRendererAttach, ruleRendererSetRuleOverrideCount, createRuleRenderer } = createRuleRenderersStub(t);
  const styleRenderer = createStylesRenderer();

  styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']);

  t.ok(
    createRuleRenderer.calledThrice &&
    createRuleRenderer.calledWith({ id: 'rule1' }, 0, t.match.object) &&
    createRuleRenderer.calledWith({ id: 'rule2' }, 1, t.match.object) &&
    createRuleRenderer.calledWith({ id: 'rule3' }, 2, t.match.object),
    'should create a new rule renderer for each new rule encountered'
  );
  
  styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']);
  t.calledThrice(createRuleRenderer, 'should not create a rule renderer if one already exists for the given rule');

  ruleRendererSetRuleOverrideCount.reset();
  styleRenderer.renderStyles(['rule3', 'rule2', 'rule1']);
  t.ok(
    ruleRendererSetRuleOverrideCount.calledThrice &&
    ruleRendererSetRuleOverrideCount.calledWithExactly(0) &&
    ruleRendererSetRuleOverrideCount.calledWithExactly(1) &&
    ruleRendererSetRuleOverrideCount.calledWithExactly(2),
    'should set renderers override count if imcompatible order if encountered'
  );

  t.notCalled(ruleRendererAttach, 'should not attach rule renderers if the styles renderer is not attached');
  styleRenderer.attach({ sheet: {} } as any);
  ruleRendererAttach.reset();
  styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']);
  t.calledThrice(ruleRendererAttach, 'should try to attach the rules renderers if the styles renderer is attached');

  t.equal(styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']), 'className0 className1 className2',
    'should return a composition of rules renderers class names');
  
  t.end();
});

test('StylesRenderer attach', t => {
  const { ruleRendererAttach, ruleRendererConnect, createRuleRenderer } = createRuleRenderersStub(t);
  let styleRenderer = createStylesRenderer();
  styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']);
  styleRenderer.attach({ sheet: {} } as any);
  t.calledThrice(ruleRendererAttach, 'should attach every rule renderer');

  ruleRendererAttach.reset();
  const state = {
    classNameGeneratorKey: 2,
    rules: [
      { ruleId: 'rule1', rendererState: { classNames: ['a', 'b'], index: 1 } },
      { ruleId: 'rule2', rendererState: { classNames: ['c', 'd'], index: 2 } },
    ],
  };
  styleRenderer = createStylesRenderer(state);
  styleRenderer.attach({ sheet: {} } as any);
  t.ok(ruleRendererAttach.notCalled && ruleRendererConnect.calledTwice,
    'should connect every rule renderer if it contains prerendered state');

  t.end();
});

test('StylesRenderer renderToString', t => {
  const { createRuleRenderer } = createRuleRenderersStub(t);
  let styleRenderer = createStylesRenderer();
  styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']);
  t.equal(styleRenderer.renderToString(), 'className0className1className2',
    'should return a concatanation of all renderers sting representation');

  t.end();
});

test('StylesRenderer serialize', t => {
  const { createRuleRenderer } = createRuleRenderersStub(t);
  let styleRenderer = createStylesRenderer();
  styleRenderer.renderStyles(['rule1', 'rule2', 'rule3']);
  t.deepEqual(styleRenderer.serialize(), {
    rules: [
      { ruleId: 'rule1', rendererState: { index: 0 } },
      { ruleId: 'rule2', rendererState: { index: 1 } },
      { ruleId: 'rule3', rendererState: { index: 2 } },
    ],
    classNameGeneratorKey: 0,
  }, 'should return a serialized version of the styles renderer state');

  t.end();
});
