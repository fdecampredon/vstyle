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

const extendsPlugin: Plugin = ({ addDependency }, style) => {
  if (style.hasOwnProperty('extends')) {
    let dependencies = style['extends'];
    if (typeof dependencies === 'function') {
      dependencies = dependencies();
    }
    if (!Array.isArray(dependencies)) {
      dependencies = [dependencies];
    }
    dependencies.forEach((dep: string) => addDependency(dep));
    delete style['extends'];
  }
};

export default extendsPlugin;
