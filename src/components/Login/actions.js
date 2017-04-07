import {
  LOGIN_REQUEST,
  LOGIN_RESOLVE,
  LOGIN_FAILURE
  // SIGNUP_REQUEST
  // SIGNUP_RESOLVE,
  // SIGNUP_FAILURE
} from './actionTypes';
import { Auth } from '../../firebase';

const loginRequest = () => ({ type: LOGIN_REQUEST });
const loginResolve = user => ({ type: LOGIN_RESOLVE, user });
const loginFailure = error => ({ type: LOGIN_FAILURE, error });
export const login = (email, password) => (
  (dispatch) => {
    dispatch(loginRequest());
    Auth
      .signInWithEmailAndPassword(email, password)
      .then(user => dispatch(loginResolve(user)))
      .catch(error => dispatch(loginFailure(error)));
  }
);

// const signupRequest = () => ({ type: SIGNUP_REQUEST });
// const signupResolve = user => ({ type: SIGNUP_RESOLVE, user });
// const signupFailure = error => ({ type: SIGNUP_FAILURE, error });
export const signup = (displayName, email, password) => (
  (dispatch) => {
    dispatch(loginRequest());
    Auth
      .createUserWithEmailAndPassword(email, password)
      .then(user => loginResolve(user))
      .catch(error => dispatch(loginFailure(error)));
  }
);
