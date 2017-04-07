import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { values: { email: '', password: '' } };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNameChange(event) {
    this.setState({
      values: {
        ...this.state.values,
        name: event.target.value,
      },
    });
  }

  handleEmailChange(event) {
    this.setState({
      values: {
        ...this.state.values,
        email: event.target.value,
      },
    });
  }

  handlePasswordChange(event) {
    this.setState({
      values: {
        ...this.state.values,
        password: event.target.value,
      },
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.props.path === '/signup') {
      this.props.signup(this.state.values);
    } else {
      this.props.login(
        this.state.values.email,
        this.state.values.password
      );
    }
  }

  render() {
    return (
      <div className="login-container">
        <form onSubmit={this.handleSubmit} className="login-form">
          <h1>headflow</h1>
          <input
            name="email"
            type="text"
            placeholder="Email"
            onChange={this.handleEmailChange}
            value={this.state.values.email}
            tabIndex="0"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={this.handlePasswordChange}
            value={this.state.values.password}
          />
          <button type="submit">
            {this.props.path === '/signup' ? 'Sign up' : 'Log in'}
          </button>
          {this.props.path === '/signup' ?
            <span>
              <p className="post-action-btn-text">By signing up, I agree to the<br />
                <Link to="/tos">Terms of Service</Link> and&nbsp;
                <Link to="/privacy">Privacy Policy</Link>.
              </p>
              <p className="post-action-btn-text">
                Have an account?&nbsp;
                <Link to="/login">Log in</Link>.
              </p>
            </span>
            :
            <span>
              <p className="post-action-btn-text">
                <Link to="/forgot">Forgot your password?</Link>
              </p>
              <p className="post-action-btn-text">
                Don&apos;t have an account?&nbsp;
                <Link to="/signup">Sign up</Link>.
              </p>
            </span>
          }
        </form>
      </div>
    );
  }
}

export default Login;

// {/* TODO Fix this conditional */}
// {this.props.path === '/signup' ?
//   <input
//     name="name"
//     type="text"
//     placeholder="Full Name"
//     onChange={this.handleNameChange}
//     value={this.state.values.name}
//     tabIndex="0"
//   /> : null
// }
