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

import { getRule } from './RulesRegistry';
import flatten from './utils/flatten';
import { RecursiveArray, Indexable } from './utils/types';
import { Rule } from './Rule';

export type Basic = string | boolean | null | undefined | number;

export default function resolveStyles(styles: RecursiveArray<Basic> | Basic, resolveMap: Indexable<boolean> = {}) {
  let flatStyles = flatten(Array.isArray(styles) ? styles : [styles]);
  resolveMap = resolveMap || {};
  const rules: Rule[] = [];
  for (let i = flatStyles.length - 1; i >= 0; i--) {
    const ruleId = flatStyles[i];
    if (ruleId) {
      if (typeof ruleId !== 'string') {
        throw new Error('TODO');
      }
      if (!resolveMap[ruleId]) {
        resolveMap[ruleId] = true;
        const rule = getRule(ruleId);
        if (!rule) {
          throw new Error('TODO');
        }
        rules.push(rule);
        
        if (rule.dependencies) {
          rules.push.apply(rules, resolveStyles(rule.dependencies, resolveMap).reverse());
        }
      }
    }
  }
  return rules.reverse();
}
