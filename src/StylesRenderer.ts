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

import { createClassNameGenerator } from './ClassNameGenerator';
import resolveStyles, { Basic } from './resolveStyles';
import { getRule } from './RulesRegistry';
import { RuleRendererState, RuleRenderer, createRuleRenderer } from './RuleRenderer';
import { Indexable, RecursiveArray, Nullable } from './utils/types';

export type StylesRenderer = {
  renderStyles(...styles: (RecursiveArray<Basic> | Basic )[]): string;
  attach(styleElement: HTMLStyleElement): void;
  renderToString(): string;
  serialize(): StylesRendererState;
}

export type StylesRendererState = {
  rules: { rendererState: RuleRendererState, ruleId: string }[];
  classNameGeneratorKey: number;
}

export function createStylesRenderer(state?: StylesRendererState): StylesRenderer {
  let sheet: Nullable<CSSStyleSheet> = null;
  const orderedRules: string[] = state ? state.rules.map(({ ruleId }) => ruleId) : [];
  const classNameGenerator = createClassNameGenerator(state && state.classNameGeneratorKey);
  const renderers: Indexable<RuleRenderer> = {};

  if (state) {
    state.rules.forEach(({ ruleId, rendererState: { classNames, index } }) => {
      const rule = getRule(ruleId);
      if (!rule) {
        throw new Error(
          'Some rules defined in the serialized state of your styles renderer have not been registered'
        );
      }
      renderers[ruleId] = createRuleRenderer(rule, index,  classNameGenerator, classNames);
    });
  }
  
  function renderStyles(...styles: (RecursiveArray<Basic> | Basic )[]): string {
    const rules = resolveStyles(styles);
    const classNames: string[] = [];
    let overrideCount = 0;
    let maxRenderedIndex = -1;

    for (const rule of rules) {
      let renderer = renderers[rule.id];
      if (!renderer) {
        renderer = renderers[rule.id] = createRuleRenderer(rule, orderedRules.length, classNameGenerator);
        orderedRules.push(rule.id);
      }
      
      const index = renderer.index();
      if (index < maxRenderedIndex) {
        overrideCount++;
      } else {
        maxRenderedIndex = index;
      }
      
      renderer.setRuleOverrideCount(overrideCount);
      if (sheet) {
        renderer.attach(sheet);
      }
      classNames.push(...renderer.getRuleClassNames(overrideCount));
    }
    return classNames.join(' ');
  }
  
  function attach(styleElement: HTMLStyleElement): void {
    if (!styleElement.sheet) {
      styleElement.appendChild(document.createTextNode(' '));
    }
    sheet = styleElement.sheet as CSSStyleSheet;
    if (state) {
      let styleSheetIndex = 0;
      for (const id of orderedRules) {
        styleSheetIndex = renderers[id].connect(sheet, styleSheetIndex);
      }
    } else {
      for (const id of orderedRules) {
        renderers[id].attach(sheet);
      }
    }
  }
  
  function renderToString(): string {
    return orderedRules
      .map(id => renderers[id].renderToString())
      .join('');
  }
  
  function serialize(): StylesRendererState {
    return {
      rules: orderedRules.map(ruleId => ({
        ruleId,
        rendererState: renderers[ruleId].serialize(),
      })),
      classNameGeneratorKey: classNameGenerator.getCurrCSSKey(),
    };
  }

  return {
    renderStyles,
    attach,
    renderToString,
    serialize,
  };
}
