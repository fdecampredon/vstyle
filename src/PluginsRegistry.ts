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

/**
 * The PluginsRegistry allows to register plugins that will be able to transform
 * the style of a rules, add css definitions or dependencies.
 */

import { RuleModifier, StyleObject } from './Rule';

export type Plugin = (ruleModifier: RuleModifier, style: StyleObject) => void;

const plugins: Plugin[] = [];

/**
 * Register a plugin.
 *
 */
export function registerPlugin(plugin: Plugin): void {
  if (typeof plugin !== 'function') {
    throw new Error('Expected the plugin to be a function');
  }
  
  if (plugins.indexOf(plugin) === -1) {
    plugins.push(plugin);
  }
}

/**
 * Applies all plugins to a rule.
 */
export function applyPlugins(ruleModifier: RuleModifier, style: StyleObject) {
  for (const plugin of plugins) {
    plugin(ruleModifier, style);
  }
}
