import React, { Component } from 'react';
import {  Card, CardBody, CardFooter, CardHeader, Col, Row, Collapse, Fade } from 'reactstrap';
import { AppSwitch } from '@coreui/react'

class LandCard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Col xs="12" sm="12" lg="3">
      <Card className="card-accent-warning">
          <CardBody>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut
            laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
            ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
          </CardBody>
      </Card>
      </Col>
    );
  }
}

export default LandCard;
