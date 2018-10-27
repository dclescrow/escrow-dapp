import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './App.scss';

// Containers
import { DefaultLayout } from './containers'
// import { renderRoutes } from 'react-router-config';
class App extends Component {


  constructor(props)
  {
    super(props);


    this.state = {
        account: '0x0',
        loading:true,
        isConnected: false,
        web3Provider: null,
    };


  }

render(){
      return (
        <HashRouter>
          <Switch>
            <Route path="/" name="Home" component={DefaultLayout} />
          </Switch>
        </HashRouter>
      )

  }

}

export default App;
