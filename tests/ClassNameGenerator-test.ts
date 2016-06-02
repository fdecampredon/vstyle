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
import * as ClassNameGenerator from '../src/ClassNameGenerator';

tape.test('ClassNameGenerator', t => {
  const generator = ClassNameGenerator.createClassNameGenerator();
  t.deepEqual(
    [generator.nextClassName(), generator.nextClassName(), generator.nextClassName()], ['a', 'b', 'c'],
    '`generator.nextClassName` should generate class name in the alphebetical order'
  );
  
  t.equal(
    generator.getCurrCSSKey(), 3,
    '`generator.getCurrCSSKey` should return a number equals to the number of `nextClassName` call'
  );
  
  t.equal(
    ClassNameGenerator.createClassNameGenerator(3).nextClassName(),
    'd',
    'if the generator is created with a key as argument call to `nextClassName` should return subsequent key in the order '
  );
  
  t.end();
});
