import { Auth } from '../../firebase';

const loginRequest = () => (
  console.log('loginRequest')
);

const loginResolve = user => (
  console.log('loginResolve', user)
);

const loginFailure = error => (
  console.log('loginFailure', error)
);

export const login = (email, password) => (
  (dispatch) => {
    console.log('loginAction', email, password);
    dispatch(loginRequest());
    Auth
      .signInWithEmailAndPassword(email, password)
      .then(user => dispatch(loginResolve(user)))
      .catch(error => dispatch(loginFailure(error)));
  }
);

export const noop = () => {};
