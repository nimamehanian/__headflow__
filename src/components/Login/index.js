import { connect } from 'react-redux';
import {
  login as loginAction,
  signup as signupAction
} from './actions';
import Login from './Login';

const mapStateToProps = state => ({
  isAttemptingLogin: state.isAttemptingLogin,
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  login(email, password) {
    dispatch(loginAction(email, password));
  },

  signup({ name, email, password }) {
    dispatch(signupAction(name, email, password));
  },
});

const LoginContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);

export default LoginContainer;
