import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import mainStore from './store';
import App from './components/App';

const routes = {
  path: '/',
  component: App,
  childRoutes: [],
};

const history = syncHistoryWithStore(browserHistory, mainStore);

const Root = ({ store }) => (
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>
);

Root.propTypes = {
  store: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Root;
