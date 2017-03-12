import React from 'react';
import { render } from 'react-dom';
import Root from './root';
import store from './store';
import './styles/manifest.styl';

render(<Root store={store} />, document.getElementById('app'));
