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
import * as PluginsRegistry from '../src/PluginsRegistry';

test('PluginsRegistry', t => {
  t.throws(() => PluginsRegistry.registerPlugin({} as any),
    '`PluginsRegistry.registerPlugin` should throw an error if the plugin is not a function');
  
  const plugin1 = t.spy();
  const plugin2 = t.spy();
  t.doesNotThrow(() => {
    PluginsRegistry.registerPlugin(plugin1);
    PluginsRegistry.registerPlugin(plugin2);
  }, '`PluginsRegistry.registerPlugin` should not throw an error if the plugin is a function');
  
  const fakeRuleModifier = {};
  const fakeStyle = {};
  
  PluginsRegistry.applyPlugins(fakeRuleModifier as any, fakeStyle);
  t.calledWithExactly(plugin1, [fakeRuleModifier, fakeStyle],
    '`PluginsRegistry.applyPlugins` should call all the plugins with the rule modifier and the style passed as argument');
  t.calledWithExactly(plugin1, [fakeRuleModifier, fakeStyle],
    '`PluginsRegistry.applyPlugins` should call all the plugins with the rule modifier and the style passed as argument');
  t.calledBefore(plugin1, plugin2,
    '`PluginsRegistry.applyPlugins` should call plugins in the order of registration');
  t.end();
});
