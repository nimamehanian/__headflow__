import { connect } from 'react-redux';
import { login as loginAction } from './actions';
// import { LOGIN_WITH_EMAIL } from './actionTypes';
import Login from './Login';

// const mapStateToProps = state => ({
//   user: state.user,
// });

const mapDispatchToProps = dispatch => ({
  login(email, password) {
    dispatch(loginAction(email, password));
  },
});

const LoginContainer = connect(
  // mapStateToProps,
  null,
  mapDispatchToProps
)(Login);

export default LoginContainer;
