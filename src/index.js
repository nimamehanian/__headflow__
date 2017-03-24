import React, { PropTypes } from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Route } from 'react-router-dom';
import { ConnectedRouter, routerMiddleware, routerReducer } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import App from './components/App';
import appReducer from './components/App/reducers';
import './styles/manifest.styl';

const history = createHistory();
const middleware = routerMiddleware(history);

const mainStore = createStore(
  combineReducers({
    app: appReducer,
    routing: routerReducer,
  }),
  // Enable to access devTools in browser console
  // window.devToolsExtension &&
  // window.devToolsExtension(),
  applyMiddleware(thunk, middleware)
);

const Root = ({ store }) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <Route exact path="/" render={() => <div><h1>Hello, Headflow!</h1></div>} />
        <Route exact path="/dashboard" component={App} />
      </div>
    </ConnectedRouter>
  </Provider>
);

Root.propTypes = {
  store: PropTypes.objectOf(PropTypes.any).isRequired,
};

render(
  <Root store={mainStore} />,
  document.getElementById('app')
);
