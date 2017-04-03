import React, { Component } from 'react';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { values: { email: '', password: '' } };
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    this.props.login(
      this.state.values.email,
      this.state.values.password
    );
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
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={this.handlePasswordChange}
            value={this.state.values.password}
          />
          <button type="submit">Log in</button>
        </form>
      </div>
    );
  }
}

export default Login;
