import React from 'react';
import ReactDOM from 'react-dom';
import { createStylesRenderer } from '../..';
import configureStylesRenderer from './configureStylesRenderer';
import App from './App';

const stylesRenderer = createStylesRenderer(window.STYLES_RENDERER_STATES);
stylesRenderer.attach(document.getElementById('style'));

ReactDOM.render(
    <App stylesRenderer={stylesRenderer} />,
    document.getElementById('content')
);
