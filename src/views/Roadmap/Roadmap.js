import React, { Component } from 'react';

import {
  Card,
  CardBody,
  Col,
  Row,
} from 'reactstrap';

class Roadmap extends Component {
  
  constructor(props) {
    super(props);

  }


componentDidUpdate()
{
  console.log(this.state)
}


componentDidMount()
{
    if(!this.state.isConnected)
    {
        this.getAllApprovals()
    }
}

  render() 
        {
            return(
          <div className="animated fadeIn">
          <div style={{ height: '25px' }}>
        </div>
          <Row>
          <Col xs="12" sm="12" lg="12">
          Connecting to the Ethereum Network...Make sure you are logged into Metamask
          </Col>
          </Row>
          </div>
            )
        }
}

export default Roadmap;
