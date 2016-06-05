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
import adler32 from './utils/adler32';
import warning from './utils/warning';

export type StylesRenderer = {
  renderStyles(...styles: (RecursiveArray<Basic> | Basic )[]): string;
  attach(styleElement: HTMLStyleElement): void;
  renderToString(): string;
  serialize(): StylesRendererState;
}

export type StylesRendererState = {
  rules: { rendererState: RuleRendererState, ruleId: string }[];
  classNameGeneratorKey: number;
  checkSum: string;
}

export function createStylesRenderer(state?: StylesRendererState): StylesRenderer {
  let sheet: Nullable<CSSStyleSheet> = null;
  let stringValue: Nullable<string> = null;

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
        stringValue = null;
      }
      
      const index = renderer.index();
      if (index < maxRenderedIndex) {
        overrideCount++;
      } else {
        maxRenderedIndex = index;
      }
      
      if (renderer.setRuleOverrideCount(overrideCount)) {
        stringValue = null;
      }
      if (sheet) {
        renderer.attach(sheet);
      }
      classNames.push(...renderer.getRuleClassNames(overrideCount));
    }
    return classNames.join(' ');
  }
  
  function attach(styleElement: HTMLStyleElement): void {
    sheet = styleElement.sheet as CSSStyleSheet;
    if (state) {
      if (adler32(styleElement.textContent || '') !== state.checkSum) {
        warning(
          'VStyle attempted to reuse the styles inside the provided style element ' +
          'but the checksum was invalid.');
        styleElement.textContent = '';
        sheet = styleElement.sheet as CSSStyleSheet;
      } else {
        let styleSheetIndex = 0;
        for (const id of orderedRules) {
          styleSheetIndex = renderers[id].connect(sheet, styleSheetIndex);
        }
        return;
      }
    } 

    if (!state && sheet.cssRules.length) {
      warning(
        'The style element already contains styles, but no serialized state ' +
        'has been provided to `createStylesRenderer`');
      styleElement.textContent = '';
      sheet = styleElement.sheet as CSSStyleSheet;
    }

    for (const id of orderedRules) {
      renderers[id].attach(sheet);
    }
  }
  
  function renderToString(): string {
    if (!stringValue) {
      stringValue = orderedRules
        .map(id => renderers[id].renderToString())
        .join('');
    }
    return stringValue;
  }
  
  function serialize(): StylesRendererState {
    return {
      rules: orderedRules.map(ruleId => ({
        ruleId,
        rendererState: renderers[ruleId].serialize(),
      })),
      classNameGeneratorKey: classNameGenerator.getCurrCSSKey(),
      checkSum: adler32(renderToString()),
    };
  }

  return {
    renderStyles,
    attach,
    renderToString,
    serialize,
  };
}
