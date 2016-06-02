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

import { applyPlugins } from './PluginsRegistry';
import { getRule } from './RulesRegistry';
import isNonEmptyString from './utils/isNonEmptyString';
import isPlainObject from './utils/isPlainObject';
import { Indexable, Nullable } from './utils/types';

export type Rule = {
  id: string;
  definitions: Definition[];
  dependencies: string[];
}

export type Definition = {
  style: StyleObject;
  selector: string;
  media: Nullable<string>;
}

export interface RuleModifier {
  /**
   * Allows a plugin to add a definition to the rule.
   * 
   * @param selector the selector corresponding to this definition (ex: '&:hover' )
   * @param media the media corresponding to this definition (ex: '@media screen and (max-width: 640px)' )
   * @param style the style of the new definition
   */
  addDefinition(selector: Nullable<string>, media: Nullable<string>, style: StyleObject): void;

  /**
   * Allows a plugin to add a dependency to the rule.
   * 
   * @param ruleId the id of the Rule dependency.
   */
  addDependency(ruleId: string): void;
}

export type StyleObject = Indexable<any>;

/**
 * Creates a Rule.
 * A rule can describe multiple CSS definitons.
 * 
 * @param id the unique id of the rule.
 * @param style an object describing css styles corresponding to the rule.
 */
export function createRule(id: string, style: StyleObject): Rule {
  const definitions: Definition[] = [];
  const dependencies: string[] = [];
  let currentSelector: string = '&';
  let currentMedia: Nullable<string> = null;
  
  function createDefinition(modifier: RuleModifier, style: StyleObject, index: number) {
    applyPlugins(modifier, style);
    if (Object.keys(style).length) {
      definitions.splice(index, 0, { style, media: currentMedia, selector: currentSelector });
    }
  }
  
  const ruleModifiders = {
    addDefinition(selector: Nullable<string>, media: Nullable<string>, style: StyleObject) {
      if (!isPlainObject(style)) {
        throw new Error('Expected style description to be a plain object');
      }      
      if (selector && typeof selector !== 'string') {
        throw new Error('Expected selector to be a string');
      }
      if (media && typeof media !== 'string') {
        throw new Error('Expected selector to be a string');
      }
      if (currentMedia && media) {
        throw new Error('Media query nesting is not allowed');
      }
      if (!media && !selector) {
        throw new Error('Expected definition to have a selector or a media');
      }

      const index = definitions.length;
      const previousSelector = currentSelector;
      const previousMedia = currentMedia;
      currentSelector = selector ? selector.replace('&', currentSelector) : currentSelector;
      currentMedia = media || currentMedia;
      
      createDefinition(ruleModifiders, style, index);

      currentSelector = previousSelector;
      currentMedia = previousMedia;
    },

    
    addDependency(ruleId: string) {
      if (!isNonEmptyString(ruleId) || !getRule(ruleId)) {
        throw new Error('the dependency should be an id returned by the RulesRegistry');
      }
      if (currentMedia || currentSelector !== '&') {
        throw new Error('dependencies can only be defined on top level rules');
      }
      dependencies.push(ruleId);
    },
  };
  

  createDefinition(ruleModifiders, style, 0);
  
  return { id, definitions, dependencies };
}
