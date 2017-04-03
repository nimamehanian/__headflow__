import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Route, Redirect } from 'react-router-dom';
import { ConnectedRouter, routerMiddleware, routerReducer } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import App from './components/App';
import appReducer from './components/App/reducer';
import Login from './components/Login';
import { Auth } from './firebase';
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

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
  }

  componentWillMount() {
    Auth.onAuthStateChanged((user) => {
      console.log('auth state changed:', user);
      this.setState({ user });
    });
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <ConnectedRouter history={history}>
          <div>
            <Route
              exact
              path="/"
              render={() => <div><h1>Hello, Headflow!</h1></div>}
            />
            <Route
              path="/login"
              render={() => (this.state.user ?
                <Redirect to="/dashboard" /> :
                <Login />
              )}
            />
            <Route
              path="/dashboard"
              render={() => (this.state.user ?
                <App user={this.state.user} /> :
                <Redirect to="/login" />
              )}
            />
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.objectOf(PropTypes.any).isRequired,
};

render(
  <Root store={mainStore} />,
  document.getElementById('app')
);
