import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
// routes config
import routes from '../../routes';
import { withCookies, Cookies } from 'react-cookie';


class LandingLayout extends Component {

  constructor(props)
  {
    super(props)

    this.setCookie = this.setCookie.bind(this)
  }

  setCookie()
  {

  }

  render() {
    return (
      <div className="app">
      <button className="btn btn-primary btn-lg btn-block" onClick={this.setCookie}>Start Escrow</button>
      </div>
    );
  }
}

export default withCookies(LandingLayout);
