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

import * as tape from 'tape';
import styleToString from '../src/styleToString';

tape.test('styleToString', function (t) {
  t.equals(styleToString({ borderColor: 'blue' }), 'border-color:blue;', '`styleToString` should hyphenate style name');
  t.equals(
    styleToString({ borderColor: ['blue', 'white', 'red'] }),
    'border-color:blue;border-color:white;border-color:red;',
    '`styleToString` should render multiple time the same style with each values if the style value is an array'
  );
  t.equals(
    styleToString({ WebkitBorderRadius: '2px', MozBorderRadius: '2px', msBorderRadius: '2px' }),
    '-webkit-border-radius:2px;-moz-border-radius:2px;-ms-border-radius:2px;',
    '`styleToString` should correctly render prefixed style name'
  );
  t.end();
});
