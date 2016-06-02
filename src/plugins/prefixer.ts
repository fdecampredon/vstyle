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

import { Plugin } from '../PluginsRegistry';

const prefixAll = require('inline-style-prefix-all');
const assign = require('object-assign');

const prefixerPlugin: Plugin  = (_, style) => {
  const copy = {};
  for (const prop in style) {
    if (style.hasOwnProperty(prop)) {
      const value = style[prop];
      if (value && (typeof value !== 'object' || !Array.isArray(value))) {
        copy[prop] = value;
      }
    }
  }
  assign(style, prefixAll(copy));
};

export default prefixerPlugin;
