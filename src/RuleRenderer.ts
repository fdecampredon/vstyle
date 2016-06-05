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

import styleToString from './styleToString';
import { Rule } from './Rule';
import { ClassNameGenerator } from './ClassNameGenerator';
import { Nullable } from './utils/types';

export type RuleRenderer = {
  index(): number;
  attach(sheet: CSSStyleSheet): void;
  connect(sheet: CSSStyleSheet, styleSheetIndex: number): number;
  renderToString(): string;
  setRuleOverrideCount(overrideCount: number): boolean;
  getRuleClassNames(overrideCount: number): string[];
  serialize(): RuleRendererState
}

export type RuleRendererState = {
  index: number;
  classNames: string[];
}

export function createRuleRenderer(
  rule: Rule, index: number, classNameGenerator: ClassNameGenerator,
  classNames = [classNameGenerator.nextClassName()]
): RuleRenderer {
  
  let attached = false;
  let overrideCount = classNames.length - 1;
  const cssRules: CSSStyleRule[] = [];

  function attach(sheet: CSSStyleSheet): void {
    if (attached) {
      return;
    }
    let currentMedia: Nullable<string> = null;
    let currentMediaRule: Nullable<CSSMediaRule> = null;
    for (const { selector, style, media } of rule.definitions) {
      if (currentMedia !== media) {
        if (media) {
          const index = sheet.insertRule(`${media}{}`, sheet.cssRules.length);
          currentMediaRule = sheet.cssRules[index] as CSSMediaRule;
        } else {
          currentMediaRule = null;
        }
        currentMedia = media;
      }
      const ruleText = `${createSelector(classNames, selector)}{${styleToString(style)}}`;
      const container = currentMediaRule ? currentMediaRule : sheet;
      const index = container.insertRule(ruleText, container.cssRules.length);
      cssRules.push(container.cssRules[index] as CSSStyleRule);
    }
    attached = true;
  }

  function connect(sheet: CSSStyleSheet, styleSheetIndex: number): number {
    let currentMedia: Nullable<string> = null;
    let currentMediaRule: Nullable<CSSMediaRule> = null;
    let currentMediaIndex = 0;
    for (const { media } of rule.definitions) {
      if (currentMedia !== media) {
        if (media) {
          currentMediaRule = sheet.cssRules[styleSheetIndex] as CSSMediaRule;
          currentMediaIndex = 0;
        } else {
          currentMediaRule = null;
          styleSheetIndex++;
        }
        currentMedia = media;
      }
      if (currentMediaRule) {
        cssRules.push(currentMediaRule.cssRules[currentMediaIndex] as CSSStyleRule);
        currentMediaIndex++;
      } else {
        cssRules.push(sheet.cssRules[styleSheetIndex] as CSSStyleRule);
        styleSheetIndex++;
      }
    }
    if (currentMediaRule) {
      styleSheetIndex++;
    }
    attached = true;
    return styleSheetIndex;
  }

  function renderToString(): string {
    let result = '';
    let currentMedia: Nullable<string> = null;
    for (const { selector, style, media } of rule.definitions) {
      if (currentMedia !== media) {
        if (currentMedia) {
          result += '}';
        }
        if (media) {
          result += `${media}{`;
        }
        currentMedia = media;
      }
      result += `${createSelector(classNames, selector)}{${styleToString(style)}}`;
    }
    if (currentMedia) {
      result += '}';
    }
    
    return result;
  }

  function setRuleOverrideCount(count: number): boolean {
    if (overrideCount < count) {
      for (let i = 0; i < (count - overrideCount); i++) {
        classNames.push(classNameGenerator.nextClassName());
      }
      if (attached) {
        for (let i = 0; i < rule.definitions.length; i++) {
          const cssRule = cssRules[i];
          const { selector } = rule.definitions[i];
          cssRule.selectorText = createSelector(classNames, selector);
        }
      }
      overrideCount = count;
      return true;
    }
    return false;
  }

  function getRuleClassNames(overrideCount: number): string[] {
    return classNames.slice(0, overrideCount + 1);
  }
  
  return {
    index: () => index,
    attach,
    connect,
    renderToString,
    setRuleOverrideCount,
    getRuleClassNames,
    serialize: () => ({ index, classNames }), 
  };
}

function createSelector(classNames: string[], selector: string) {
  return classNames
    .map((_, i) => selector.replace(/&/g, `.${classNames.slice(0, i + 1).join('.')}`))
    .join(',');
}
