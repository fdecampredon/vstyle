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

import { createRule, StyleObject, Rule } from './Rule';
import { Indexable, Nullable } from './utils/types';
import generateId from './utils/generateId';

const rules: Indexable<Rule | (() => Rule) > = {};

/**
 * Retrieves a rule for a given id.
 */
export function getRule(ruleId: string): Nullable<Rule> {
  const rule = rules[ruleId];
  return typeof rule === 'function' ? rule() : rule;
}

/**
 * Creates and registers a new Rule.
 * 
 * @param id the id of the rule
 * @param style the object describing the styles associated to the rule.
 * 
 * @returns the id of the create rule.
 */
export function registerRule(ruleId: Nullable<string>, style: StyleObject): string {
  if (ruleId && rules[ruleId]) {
    throw new Error(`you are trying to register 2 rules with the same id: '${ruleId}'`);
  }
  const id = ruleId || generateId(style);
  // We does not need to create the rule right away, that allows plugins like extends
  // to use rules from the currently defined stylesheet.
  // also if the id has been generated it's safe to reuse the same rule if it already exists,
  // because it means that the rule is deep equals
  rules[id] = rules[id] || (() => (rules[id] = createRule(id, style)));
  return id;
}
