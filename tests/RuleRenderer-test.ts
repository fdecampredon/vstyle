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
import { createRuleRenderer } from '../src/RuleRenderer';
import { createClassNameGenerator } from '../src/ClassNameGenerator';

const cssom: any = require('cssom');
cssom.CSSMediaRule.prototype.insertRule = cssom.CSSStyleSheet.prototype.insertRule;

test('RuleRenderer createRuleRenderer', t => {
  const nextClassName = t.spy(() => 'a');
  createRuleRenderer({} as any, 2, { nextClassName } as any);
  t.calledOnce(nextClassName, 'should generate a class name if none are provided');
  
  nextClassName.reset();
  createRuleRenderer({} as any, 2, { nextClassName } as any, ['foo']);
  t.notCalled(nextClassName, 'should not generate a class name if className are provided');
  
  t.end();
});

const rule = {
  id: 'test',
  dependencies: ([] as string[]),
  definitions: [
    {
      selector: '&',
      media: null,
      style: {
        fontSize: '13px',
        backgroundColor: 'blue',
      },
    },
    {
      selector: '&:hover',
      media: null,
      style: {
        backgroundColor: 'red',
      },
    },
    {
      selector: '&',
      media: '@media screen and (max-width: 700px)',
      style: {
        backgroundColor: 'yellow',
      },
    },
    {
      selector: '&:hover',
      media: '@media screen and (max-width: 700px)',
      style: {
        backgroundColor: 'blue',
      },
    },
    {
      selector: '&:firstChild',
      media: null,
      style: {
        fontFamily: 'arial',
      },
    },
    {
      selector: '&:firstChild',
      media: '@media screen and (max-width: 700px)',
      style: {
        fontFamily: 'helvetica',
      },
    },
  ],
};

test('RuleRenderer attach', t => {
  const renderer = createRuleRenderer(rule, 1, createClassNameGenerator());
  const styleSheet: CSSStyleSheet = new cssom.CSSStyleSheet();
  styleSheet.insertRule('p {font-size: 12px;}', 0);
  renderer.attach(styleSheet);
  
  t.equal(
    styleSheet.toString().replace(/\s/g, ''),
    [
      'p {font-size: 12px;}',
      '.a {font-size: 13px; background-color: blue;}',
      '.a:hover{background-color: red;}',
      '@media screen and (max-width: 700px){',
        '.a{background-color: yellow;}',
        '.a:hover{background-color: blue;}',
      '}',
      '.a:firstChild{ font-family: arial; }',
      '@media screen and (max-width: 700px){',
        '.a:firstChild{font-family: helvetica;}',
      '}',
    ].join('').replace(/\s/g, ''),
    'should render the style corresponding to the renderer rule at the end of the stylesheet'
  );
  t.end();
});

test('RuleRenderer renderToString()', t => {
  const renderer = createRuleRenderer(rule, 1, createClassNameGenerator());

  t.equal(
    renderer.renderToString().replace(/\s/g, ''),
    [
      '.a {font-size: 13px; background-color: blue;}',
      '.a:hover{background-color: red;}',
      '@media screen and (max-width: 700px){',
        '.a{background-color: yellow;}',
        '.a:hover{background-color: blue;}',
      '}',
      '.a:firstChild{ font-family: arial; }',
      '@media screen and (max-width: 700px){',
        '.a:firstChild{font-family: helvetica;}',
      '}',
    ].join('').replace(/\s/g, ''),
    'should return css text reprensentation of the rule'
  );
  t.end();
});

test('RuleRenderer setOverrideCount', t => {
  let renderer = createRuleRenderer(rule, 1, createClassNameGenerator());
  renderer.setRuleOverrideCount(1);

  t.equal(
    renderer.renderToString().replace(/\s/g, ''),
    [
      '.a, .a.b {font-size: 13px; background-color: blue;}',
      '.a:hover, .a.b:hover{background-color: red;}',
      '@media screen and (max-width: 700px){',
        '.a, .a.b{background-color: yellow;}',
        '.a:hover, .a.b:hover{background-color: blue;}',
      '}',
      '.a:firstChild, .a.b:firstChild{ font-family: arial; }',
      '@media screen and (max-width: 700px){',
        '.a:firstChild, .a.b:firstChild{font-family: helvetica;}',
      '}',
    ].join('').replace(/\s/g, ''),
    'should add a className to the RuleRenderer for override'
  );

  renderer = createRuleRenderer(rule, 1, createClassNameGenerator());
  const styleSheet: CSSStyleSheet = new cssom.CSSStyleSheet();
  styleSheet.insertRule('p {font-size: 12px;}', 0);
  renderer.attach(styleSheet);
  renderer.setRuleOverrideCount(1);
  
  t.equal(
    styleSheet.toString().replace(/\s/g, ''),
    [
      'p {font-size: 12px;}',
      '.a, .a.b {font-size: 13px; background-color: blue;}',
      '.a:hover, .a.b:hover{background-color: red;}',
      '@media screen and (max-width: 700px){',
        '.a, .a.b{background-color: yellow;}',
        '.a:hover, .a.b:hover{background-color: blue;}',
      '}',
      '.a:firstChild, .a.b:firstChild{ font-family: arial; }',
      '@media screen and (max-width: 700px){',
        '.a:firstChild, .a.b:firstChild{font-family: helvetica;}',
      '}',
    ].join('').replace(/\s/g, ''),
    'should update the selector of rules if attached'
  );
  t.end();
});

test('RuleRenderer attach', t => {
  let renderer = createRuleRenderer(rule, 1, createClassNameGenerator());
  const styleSheet: CSSStyleSheet = cssom.parse([
    'p {font-size: 12px;}',
    '.a {font-size: 13px; background-color: blue;}',
    '.a:hover{background-color: red;}',
    '@media screen and (max-width: 700px){',
      '.a{background-color: yellow;}',
      '.a:hover{background-color: blue;}',
    '}',
    '.a:firstChild{ font-family: arial; }',
    '@media screen and (max-width: 700px){',
      '.a:firstChild{font-family: helvetica;}',
    '}',
  ].join('\n'));

  renderer.connect(styleSheet, 1);
  renderer.setRuleOverrideCount(1);
  
  t.equal(
    styleSheet.toString().replace(/\s/g, ''),
    [
      'p {font-size: 12px;}',
      '.a, .a.b {font-size: 13px; background-color: blue;}',
      '.a:hover, .a.b:hover{background-color: red;}',
      '@media screen and (max-width: 700px){',
        '.a, .a.b{background-color: yellow;}',
        '.a:hover, .a.b:hover{background-color: blue;}',
      '}',
      '.a:firstChild, .a.b:firstChild{ font-family: arial; }',
      '@media screen and (max-width: 700px){',
        '.a:firstChild, .a.b:firstChild{font-family: helvetica;}',
      '}',
    ].join('').replace(/\s/g, ''),
    'should connect renderer to existing cssRules in the stylesheet'
  );
  t.end();
});

test('RuleRenderer serialize', t => {
  const renderer = createRuleRenderer(rule, 3, createClassNameGenerator());
  renderer.setRuleOverrideCount(3);
  t.deepEqual(renderer.serialize(), { index: 3, classNames: ['a', 'b', 'c', 'd'] },
    'should return a json reprensentation of the renderer state');
  t.end();
});

test('RuleRenderer getRuleClassNames', t => {
  const renderer = createRuleRenderer(rule, 3, createClassNameGenerator());
  renderer.setRuleOverrideCount(3);
  t.deepEqual(renderer.getRuleClassNames(2), ['a', 'b', 'c'],
    'should return class names of the renderer of the given override count');
  t.end();
});
