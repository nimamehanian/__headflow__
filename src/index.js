import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Route, Redirect } from 'react-router-dom';
import { ConnectedRouter, routerMiddleware, routerReducer } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
// import { Raw } from 'slate';

import App from './components/App';
import appReducer from './components/App/reducer';
import Login from './components/Login';
import authReducer from './components/Login/reducer';
import { Auth, DB } from './firebase';
import initialUserData from './iud';
import './styles/manifest.styl';

const history = createHistory();
const middleware = routerMiddleware(history);

const mainStore = createStore(
  combineReducers({
    app: appReducer,
    auth: authReducer,
    routing: routerReducer,
  }),
  // Enable to access devTools in browser console
  window.devToolsExtension &&
  window.devToolsExtension(),
  applyMiddleware(thunk, middleware)
);

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
      // editorState: undefined,
    };
  }

  componentWillMount() {
    Auth.onAuthStateChanged((user) => {
      if (!user) {
        // Sets user to null
        this.setState({ user });
      }
      if (user) {
        const userRef = DB.ref(`users/${user.uid}`);
        const userDataRef = DB.ref(`userData/${user.uid}`);
        userRef.once('value', (data) => {
          if (!data.val()) {
            // user does not exist, so create entry
            userRef.set({
              email: user.email,
              displayName: user.displayName || null,
            });
            userDataRef.set(initialUserData)
              .then(() => this.setState({ user }));
          } else {
            // user DOES exist and is logging in
            this.setState({ user });
          }
        });
      }
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
              path="/dashboard"
              render={() => (this.state.user ?
                <App user={this.state.user} /> :
                <Redirect to="/login" />
              )}
            />
            <Route
              path="/login"
              render={() => (this.state.user ?
                <Redirect to="/dashboard" /> :
                <Login />
              )}
            />
            <Route
              path="/signup"
              render={route => (this.state.user ?
                <Redirect to="/dashboard" /> :
                <Login path={route.match.path} />
              )}
            />
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}

// Root.propTypes = {
//   store: PropTypes.objectOf(PropTypes.any).isRequired,
// };

render(
  <AppContainer><Root store={mainStore} /></AppContainer>,
  document.getElementById('app')
);

if (module.hot) {
  module.hot.accept('./index', () => render(
    <AppContainer><Root store={mainStore} /></AppContainer>,
    document.getElementById('app')
  ));
}
