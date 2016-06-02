/* Copyright (c) 2015 js-next (https://github.com/js-next/react-style)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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

const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const allowedCharactersLength = allowedCharacters.length;

export type ClassNameGenerator = {
  /**
   * Generates a unique class name
   */
  nextClassName(): string;
  
  /**
   * Returns the state of the ClassNameGenerator.
   */
  getCurrCSSKey(): number;
}

/**
 * Creates a ClassNameGenerator.
 * A generator will create up to 140608 unique classNames.
 * 
 * @param currCSSKey current state of a previously created class name generator. Usefull for server side rendering scenario. 
 */
export function createClassNameGenerator(currCSSKey = 0): ClassNameGenerator {
  return {
    nextClassName() {
      const key1unit = allowedCharactersLength * allowedCharactersLength;
      const key1pos = Math.floor(currCSSKey / key1unit);
      const key1 = allowedCharacters[key1pos - 1];
      const key2pos = Math.floor((currCSSKey -
        (key1 ? key1pos * key1unit : 0)) / allowedCharactersLength);
      const key2 = allowedCharacters[key2pos - 1];
      const key3 = allowedCharacters[(currCSSKey -
        (key1 ? (key1pos * key1unit) : 0) -
        (key2 ? key2pos * allowedCharactersLength : 0))];
      let key = '';
      if (key1) {
        key += key1;
      }
      if (key2) {
        key += key2;
      }
      if (key3) {
        key += key3;
      }
      currCSSKey++;

      return key;
    },
    getCurrCSSKey: () => currCSSKey,
  };
}
