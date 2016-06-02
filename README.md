# VStyle

> This library is still experimental, and have not been used in production project.

VStyle is a library for managing styles with JavaScript.

Inspired by :
* [Vjeux](http://blog.vjeux.com/) [CSS in JS](https://speakerdeck.com/vjeux/react-css-in-js) presentation.
* [JSS](https://github.com/jsstyles/jss).
* [Aphrodite](https://github.com/Khan/aphrodite/).
* [react-native](https://github.com/facebook/react-native).


## Goals 

VStyle has been developped with 2 goals in mind: 
* Allows developper to take advantage of (almost) all CSS features.
* Keeping all of CSS in JS benefits.

## Features

* Define your styles with JavaScript
* Server-side rendering
* support media-query, pseudo selectors etc...
* Deterministic styles resolution
* Autoprefixer
* A plugin system that allows you to transform rules at creation time

### Installation
You can install VStyle through npm
```
npm install --save vstyle
```

## React integration

A react integration called `react-vstyle` can be found in this [repository](https://github.com/fdecampredon/react-vstyle).

## Overview

### StyleSheet

To manage styles with VStyle you must start by creating a StyleSheet : 

```javascript 
import { StyleSheet } from 'vstyle';

const styles = StyleSheet.create({
  myBaseStyle: {
    fontFamily: 'arial',
  },
  myButtonStyle: {
    backgroundColor: 'blue',
    color: 'red',
  },
});
```

### StyleRenderer

Then you create a `StylesRenderer` : 

```javascript
import { createStylesRenderer } from 'vstyle';

const stylesRenderer =  createStylesRenderer();

// styles renderer has to be attached to a 'style' element in the dom
stylesRenderer.attach(document.getElementsByTagName('style')[0]);
```

Then you can start consuming the styles of your `StyleSheet` using the `renderStyles` method of the `StylesRenderer` : 

```javascript

const classNames = stylesRenderer.renderStyle(styles.myBaseStyle, styles.myButtonStyle);

<MyElement className={classNames} />
```

### Server Side rendering

You can prerender the CSS of your application on the server.
To do so you should use the `renderToString`, and `serialize` method of the  `StylesRenderer`,
and rehydrate the `StylesRenderer` on the client.

```javascript
// server.js
import { createStylesRenderer } from 'vstyle';

const stylesRenderer = createStylesRenderer();

// ... render some styles

const css = stylesRenderer.renderToString();
const stylesRendererState = stylesRenderer.serialize();

return `
  <html>
    <head>
      <style id="vstyle-style">${css}</style>
    </head>
    <body>
      ...
      <script>
        const stylesRenderer = createStylesRenderer(${serialize(stylesRendererState)});
        stylesRenderer.attach(document.getElementById('vstyle-style');
        ...
      </script>
    </body>
  </html>
`;
```

## Plugins

Plugins allows you to modify `Rule` at creation time.
A set of official plugins are provided with VStyle for commons usages.

### The default unit plugin

This plugin automaticly appends a unit suffix to `number` values of your rules : 
```javascript
import { registerPlugin, StyleSheet } from 'vstyle';
import defaultUnitPlugin from 'vstyle/lib/plugins/default-unit';

registerPlugin(defaultUnitPlugin());

const styles = StyleSheet.create({
  button: {
    width: 100,
  },
});
```
This plugin takes has argument an options object :
```javascript
{
  unit: string = 'px',
  [index: string]: string,
}
```
By default it uses `px` for each property, but you can specify a different unit, or per property unit : 
```javascript 
registerPlugin(defaultUnitPlugin({ 
  unit: 'cm',
  fontSize: 'rem',
}));
```

### The extends plugin

This plugin let you specify dependencies for your `Rule`, when this rule will be used by an element, dependencies will
be automaticly be prepend to the resulting class names.
```javascript
import { registerPlugin, StyleSheet } from 'vstyle';
import extendsPlugin from 'vstyle/lib/plugins/extends';

registerPlugin(extendsPlugin);

const styles1 = StyleSheet.create({
  rule1: {
    fontSize: 10,
  },
  rule2: {
    extends: () => styles1.rule1,
    color: 'blue',
  },
});

const styles2 = StyleSheet.create({
  rule3: {
    extends: styles1.rule1
    width: 100,
  },
  rule4: {
    extends: () => [styles1.rule1, styles2.rule3],
    width: 100,
  },
});
```

### The media query plugin
This plugin let you use media queries in your rules definitions : 

```javascript
import { registerPlugin, StyleSheet } from 'vstyle';
import mediaQueryPlugin from 'vstyle/lib/plugins/media-query';

registerPlugin(mediaQueryPlugin);

const styles = StyleSheet.create({
  button: {
    fontSize: 12,
    '@media (max-width: 600px)': {
      fontSize: 14,
    },
  },
});
```

### The nested selector plugin
This plugin let you use nested selector in your rule definition :

```javascript
import { registerPlugin, StyleSheet } from 'vstyle';
import nestedSelectorPlugin from 'vstyle/lib/plugins/nested-selector';

registerPlugin(mediaQueryPlugin);

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'blue',
    '&:hover, &:active, &:focus': {
      backgroundColor: 'red',
    },
  },
});
```

### The prefixer plugin

This plugin apply the [inline-style-prefix-all](https://github.com/rofrischmann/inline-style-prefix-all)
autoprefixer on your rules.

```javascript
import { registerPlugin, StyleSheet } from 'vstyle';
import prefixer from 'vstyle/lib/plugins/prefixer';

registerPlugin(prefixer);

const styles = StyleSheet.create({
  myContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
});
```

## API

### StyleSheet

#### `StyleSheet.create([id: string], styleDefinition: Object): StyleSheet`

Creates a new `StyleSheet`.

Parameters :
* `id`: optional id of the `StyleSheet` if not provided it will be generated by creating a hash from
the stringified style representation.
* `style`: the style representation of the `StyleSheet`, each property represent a rule that can be applied to an element.

#### `StyleSheet.createRule([id: string], styleDefinition: Object): string`

Creates a single `Rule`.

Parameters :
* `id`: optional id of the `Rule` if not provided it will be generated by creating a hash from
the stringified style representation.
* `style`: the style representation of the `Rule`.

### StylesRenderer

#### `createStylesRenderer([serializedState: Object]): StylesRenderer`

Creates a new styles renderer.  

Parameters :
* `serializedState`: the serialized state of previous `StylesRenderer` instance obtained trough the `serialize` 
method of the styles renderer, usefull for server side rendering.

#### `StylesRenderer.renderStyles(...styles: any[]): string`

Returns class names to apply to an element corresponding to the styles passed as arguments.
`renderStyles` will insert the css corresponding to given styles to the attached style element if necessary.

Parameters :
* `styles`: the styles to render.It should be an array of styles id retrived through `StyleSheet.create` or `StyleSheet.createRule`.
Falsy values (`false`, `undefined`, `null`, `0`, `''`) will be ignored, also the given array will be flattened.

#### `StylesRenderer.attach(styleElement: HTMLStyleElement): void`

Attaches a `StylesRenderer` to a style element.

#### `StylesRenderer.renderToString(): string`

Returns a string representation of the CSS rendered by the `stylesRenderer`.

#### `StylesRenderer.serialize(): StylesRendererState`

Returns a serialized version of the `StylesRenderer` state.

### Plugins

#### `registerPlugin(plugin: Plugin): void`

Register a plugin that will apply transformation on created `Rule`.
A plugin is a function with the following signature: 

#### `plugin(ruleModifier: RuleModifier, style: Object): void`

Parameters:
* `ruleModifier` an object with the following type : 
```typescript
type RuleModifier = {
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
```
* `style` : the style object of the corresponding rule, you can mutate this object to obtain the desired behavior.

> plugins will be applied in order of registration.
