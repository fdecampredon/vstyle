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

'use strict';

import { registerRule }  from './RulesRegistry';
import isPlainObject from './utils/isPlainObject';
import isNonEmptyString from './utils/isNonEmptyString';
import { StyleObject } from './Rule';
import { Indexable, Nullable } from './utils/types';

/**
 * Creates and register a new Rule.
 *
 * @param [id] the id of the rule, if not provided this id will be generated.
 * @param style the object reprensenting the style associated with the rule.
 * 
 * @returns the id of the newly created rule.
 */
export const createRule: 
  ((style: StyleObject) => string) &
  ((id: Nullable<string>, style: StyleObject) => string)
= function createRule(...args: any[]) {
  let [id, style]: [Nullable<string>, StyleObject] = args as any;
  if (!style && isPlainObject(id)) {
    style = id as any;
    id = null;
  }
  
  if (id && !isNonEmptyString(id)) {
    throw new Error(`StyleSheet.createRule(...): expect string but given : ${id}`);
  }
  if (!isPlainObject(style)) {
    throw new Error(`StyleSheet.createRule(...): expect plain object but given : ${style}`);
  }

  return registerRule(id, style);
};

/**
 * Creates a StyleSheet.
 * 
 * @param [id] the id of the style sheet, if not provided this id will be generated,
 * @param styles the object reprensenting the styles of the style sheet rules.
 * 
 * @returns and object with all property corresponding to a number that you can use 
 * with the `renderStyles` method of a `StyleRenderer`
 */
export const create: 
  ((styles: Indexable<StyleObject>) => Indexable<string>) &
  ((id: Nullable<string>, styles: Indexable<StyleObject>) => Indexable<string>)
=
function create(...args: any[]) {
  let [id, styles]: [Nullable<string>, Indexable<StyleObject>] = args as any;
  if (id && !styles && typeof id === 'object') {
    styles = id as any;
    id = null;
  }
  if (id && !isNonEmptyString(id)) {
    throw new Error(`StyleSheet.create(...): expect string but given : ${id}`);
  }
  if (!isPlainObject(styles)) {
    throw new Error(`StyleSheet.create(...): expect plain object but given : ${styles}`);
  }

  const styleSheet = {};

  for (const styleName in styles) {
    if (styles.hasOwnProperty(styleName)) {
      styleSheet[styleName] = createRule(id && `${id}_${styleName}`, styles[styleName]);
    }
  }
  return styleSheet;
};
