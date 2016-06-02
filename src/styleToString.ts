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

import { StyleObject } from './Rule';
import { Indexable } from './utils/types';

const _uppercasePattern = /([A-Z])/g;
const msPattern = /^ms-/;
const cache: Indexable<string> = {};

function hyphenateStyleName(str: string) {
  if (!cache.hasOwnProperty(str)) {
    cache[str] = str.replace(_uppercasePattern, '-$1').replace(msPattern, '-ms-').toLowerCase();
  }
  return cache[str];
}

/**
 * Transforms a style object into valid css style.
 * 
 * @param style
 * 
 * @returns a string containing css style corresponding to the given object
 */
export default function styleToString(style: StyleObject): string | null {
  let result = '';
  for (const prop in style) {
    if (style.hasOwnProperty(prop)) {
      const value = style[prop];
      if (Array.isArray(value)) {
        for (const styleValue of value) {
          result += hyphenateStyleName(prop) + ':' + styleValue + ';';
        }
      } else {
        result += hyphenateStyleName(prop) + ':' + value + ';';
      }
    }
  }
  return result || null;
}
