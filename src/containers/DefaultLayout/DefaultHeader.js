import React, { Component } from 'react';
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink } from 'reactstrap';
import PropTypes from 'prop-types';
import Web3 from 'web3';

import { AppAsideToggler, AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import logo from '../../assets/img/brand/icon2.png'
import sygnet from '../../assets/img/brand/icon2.png'
import { Blockie } from 'decentraland-ui'

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {

  constructor(props) {
    super(props)

    this.state = {
      account: null
    }
    
    this.web3 = null

    this.getAccounts()

  }

  async getAccounts()
  {
    this.web3 = new Web3(Web3.givenProvider)//"https://ropsten.infura.io/v3/1cd23b2196174f83bb93f9ab7a7262f3")
    if(this.web3 == null)
    {
      console.log("oops");
    }
      var localaccount = ''
      await this.web3.eth.getAccounts(function(err,result){
        localaccount = result[0]
        console.log(localaccount)
      })
      if(localaccount == '')
      {
        this.setState({account: '0x0'}) 
      }
      else{
        this.setState({account: localaccount})    
      }
  }
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        
        <AppSidebarToggler className="d-md-down-none" display="lg" />
        <AppNavbarBrand
          full={{ src: logo, width: 40, height: 40, alt: 'DCL Logo' }}
          minimized={{ src: sygnet, width: 30, height: 30, alt: 'DCL Logo' }}
        />
        <Nav className="ml-auto" navbar>
    
          <AppHeaderDropdown direction="down">
          <a href={"https://market.decentraland.org/address/"+this.state.account +"/parcels"}><Blockie seed={this.state.account} /></a>
            {/* <DropdownToggle nav>
            
            </DropdownToggle> */}
            {/* <DropdownMenu right style={{ right: 'auto' }}>
              <DropdownItem header tag="div" className="text-center"><strong>Account</strong></DropdownItem>
              <DropdownItem><i className="fa fa-bell-o"></i> Updates<Badge color="info">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-envelope-o"></i> Messages<Badge color="success">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-tasks"></i> Tasks<Badge color="danger">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-comments"></i> Comments<Badge color="warning">42</Badge></DropdownItem>
              <DropdownItem header tag="div" className="text-center"><strong>Settings</strong></DropdownItem>
              <DropdownItem><i className="fa fa-user"></i> Profile</DropdownItem>
              <DropdownItem><i className="fa fa-wrench"></i> Settings</DropdownItem>
              <DropdownItem><i className="fa fa-usd"></i> Payments<Badge color="secondary">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-file"></i> Projects<Badge color="primary">42</Badge></DropdownItem>
              <DropdownItem divider />
              <DropdownItem><i className="fa fa-shield"></i> Lock Account</DropdownItem>
              <DropdownItem><i className="fa fa-lock"></i> Logout</DropdownItem>
            </DropdownMenu> */}
          </AppHeaderDropdown>
        </Nav>
        {/*<AppAsideToggler className="d-lg-none" mobile />*/}
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
