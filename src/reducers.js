import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import appReducer from './components/App/reducers';

const reducers = combineReducers({
  app: appReducer,
  routing: routerReducer,
});

export default reducers;
