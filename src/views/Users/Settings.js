import React, { Component } from 'react';
import Web3 from 'web3';
import manaABI from '../../data/manaABI.json';
import LANDRegistryABI from '../../data/LANDRegistryABI.json'
import * as constAddreses from '../../data/const_addresses'
import ESCROWABI from '../../data/ESCROWABI.json'
import {
  Card,
  CardBody,
  Col,
  Row,
} from 'reactstrap';

class Settings extends Component {
  
  constructor(props) {
    super(props);

    this.handleManaApproval = this.handleManaApproval.bind(this)
    this.handleLandApproval = this.handleLandApproval.bind(this)

    this.escrowAddress = constAddreses.escrowAddress
    this.LANDaddress = constAddreses.mainNetLandAddress
    this.LANDProxyAddress = constAddreses.mainNetLandAddressProxy
    this.MANAaddress = constAddreses.mainNetManaAddress

    console.log(this.MANAaddress)

    this.state = {
      isConnected: false,
      manaApproved: false,
      landApproved: false,
      message:"waiting",
      getManaApprovalStatus:'Idle',
      getLandApprovalStatus:'Idle'
    }

    this.web3 = null
    this.metmaskWeb3 = null
    this.account = '0x0'

    //user2 address 0xd53acf9e917f0887ca2aa4672671b32afa6f96dd
//user1 address 0xa7cc9ed655fe5f1a8a84b3c6759acd3d93f9a4b7

//DCL SELLER 0x86e6442307c77fd84c4ca0aa7c7bb11586624a1d
//DCL BUYER 0x557dde09b2c9e35148e346e0d170bb4f00910427
//DCL LOAD CONTRACTS  0xbbc3e602896042c485c9845cb1712158694b0885
    
    //DCL LAND ROPSTEN        0x9aa1d5e2df63aa098e012510ff570a7357cbd95a
    //DCL MANA ROPSTEN        0x2a8fd99c19271f4f04b1b7b9c4f7cf264b626edb
    //DCL LAND PROXY ROPSTEN  0x7a73483784ab79257bb11b96fd62a2c3ae4fb75b

    //ESCROW LAND 0x12eba983d5de3e22a4c681d1c30029bd6a68321b
    //ESCROW MANA


    
        //GANACHE MANA    0xe9c3f8d7aee02b878c5010f53ed8241e19373b1c
    //GANACHE LAND    0x4340d23e45c6744ad4140c9166d279243699b05f
    //GANACHE ESCROW  0x1dbdfd48c0bb30e5ed55e5a18e93c3f3922e9067


    this.MANAContract = null
    this.LANDContract = null
    this.ESCROWContract = null
    this.EscrowContractEvents = null


    this.h2color = {color:'#ff4130'}
    this.h2color2 ={color:'black'}

  }

  async getAllApprovals()
  {

    this.web3 = new Web3(Web3.givenProvider)//"https://ropsten.infura.io/v3/1cd23b2196174f83bb93f9ab7a7262f3")
    this.metmaskWeb3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws"))

    if(this.web3 == null)
    {
      console.log("oops");
    }
      var localaccount = ''
      await this.web3.eth.getAccounts(function(err,result){
        localaccount = result[0]
        console.log(localaccount)
      })

      this.account = localaccount

      if(this.account != null)
      {
        this.MANAContract = new this.web3.eth.Contract(manaABI, this.MANAaddress)
        this.LANDContract = new this.web3.eth.Contract(LANDRegistryABI, this.LANDProxyAddress)
        this.ESCROWContract = new this.web3.eth.Contract(ESCROWABI, this.escrowAddress)

      //   this.EscrowContractEvents = new this.metmaskWeb3.eth.Contract(ESCROWABI, this.escrowAddress);
      // this.EscrowContractEvents.events.EscrowCreated(({ filter: { seller: this.account } }))
      // .on("data", (event)=> this.setState({message:event}))
      // .on("error", console.error)

        this.setState({isConnected:true})
        this.getMApproval()
        this.getLApproval()
        console.log('testing if this can be reached')
      }
      else
      {
        this.setState({isConnected:false})
        
      }
    }

  async getMApproval()
    {
        var tempApproval = 0
        await this.MANAContract.methods.allowance(this.account,this.escrowAddress).call(function(err,result){
    
          console.log(result)
          tempApproval = result
        })

      if(tempApproval>0)
      {
        console.log("mana approved")
        this.setState({manaApproved:true, getManaApprovalStatus:"Idle"})
      }
      else{
        console.log("mana not approved")
        this.setState({manaApproved:false, getManaApprovalStatus:"Idle"})
      }
    }

     async getLApproval()
      {

        var templandapproval = false
        await this.LANDContract.methods.isApprovedForAll(this.account,this.escrowAddress).call(function(err,result){
    
          templandapproval = result
        })
    
        if(templandapproval)
        {
          this.setState({landApproved:true})
        }
      }

  handleManaApproval(event) {

    this.getManaApproval()

  }

  handleLandApproval(event) {

    this.getLandApproval()

  }

  async getManaApproval(event)
  {
    console.log('async get mana')
    //await this.MANAContract.methods.approve(this.escrowAddress, '99999999999999999999999999999999999999999')

    await this.MANAContract.methods.approve(this.escrowAddress, '999999999999999999999999999999999999999999')
    .send({from: this.account})
    .on('transactionHash',(hash)=> this.setState({tx:hash, getManaApprovalStatus:"Pending"}))
    .then((receipt) => this.setState({getManaApprovalStatus:'Idle', manaApproved:true}))


    //await this.MANAContract.methods.approve(this.escrowAddress,'1000000000000000000000000000000').send({from: this.account},function(err,txHash){
      //console.log(txHash)
      //empApproval = result
    //})
  }
  
  async getLandApproval()
  {
    await this.LANDContract.methods.setApprovalForAll(this.escrowAddress,true)
    .send({from: this.account})
    .on('transactionHash', (hash)=> this.setState({tx:hash, getLandApprovalStatus:"Pending"}))
    .then((receipt) => this.setState({getLandApprovalStatus:'Idle', landApproved:true}))
  }

componentDidUpdate()
{
  console.log(this.state)
  if(!this.state.fetchedHistory)
  {
    this.getActivityHistory()
  }
}


componentDidMount()
{
    if(!this.state.isConnected)
    {
        this.getAllApprovals()
    }
}

getManaTransactionPending()
{
  if(this.state.getManaApprovalStatus === 'Pending')
  {
    return(
      <div><img alt="ok" src={require("../../assets/img/brand/transactionpending.gif")} style={{height:'35%', width:'35%' }}/></div>
    )
  }
  else{
    return(
      <div></div>
    )
  }
}

getLandTransactionPending()
{
  if(this.state.getLandApprovalStatus === 'Pending')
  {
    return(
      <div><img alt="ok" src={require("../../assets/img/brand/transactionpending.gif")} style={{height:'35%', width:'35%' }}/></div>
    )
  }
  else{
    return(
      <div></div>
    )
  }
}

getManaButton()
{
  if(this.state.manaApproved)
  {
    return(<button disabled="" className="btn btn-danger btn-block disabled">Appoved</button>)
  }
  else{
    if(this.state.getManaApprovalStatus === "Pending")
    {
      return(this.getManaTransactionPending())
    }
    else{
      return(<button className="btn btn-outline-danger btn-block"  onClick={this.handleManaApproval}>Enable</button>
      )
    }
    
  }
}

getLandButton()
{
  if(this.state.landApproved)
  {
    return(<button disabled="" className="btn btn-danger btn-block disabled">Appoved</button>)
  }
  else{
    if(this.state.getLandApprovalStatus === "Pending")
    {
      return(this.getLandTransactionPending())
    }
    else
    {
      return(<button className="btn btn-outline-danger btn-block"  onClick={this.handleLandApproval}>Enable</button>)
    }
    
  }
}

getApprovalsView()
{
  return(

      
      <Col xs="12" sm="12" lg="6" align="center">     
      <Card>
      <CardBody>
        <Row className="align-items-center">
          <Col lg="4" align="center" valign="center">
          {this.getManaButton()}
          </Col>
          <Col lg="8">
          <div><h6>Allow DCL to transfer MANA on your behalf</h6></div></Col> 
        </Row>
        <div className="chart-wrapper" style={{ height: '40px' }}></div>
        <Row className="align-items-center">
          <Col lg="4" align="center" valign="center">
          {this.getLandButton()}
          </Col>
          <Col lg="8">
          <div><h6>Allow DCL to transfer LAND on your behalf</h6></div></Col> 
        </Row>
        <div className="chart-wrapper" style={{ height: '40px' }}></div>
        {/* <Row>
          <Col lg="12">
          <div><a href="https://faucet.decentraland.today" target="blank">Get free Ropsten MANA</a></div></Col>
        </Row> */}
        <Row>
          <Col lg="12">
          <div>*** Your mana and land stay within your wallet until an escrow is accepted by both parties. Once accepted, our smart contract handles the transfer of MANA & LAND between parties, and we never hold your tokens. ***</div>
          </Col>
        </Row>
      </CardBody>
      </Card>
      </Col>
  )
}

getActivityHistory()
{
  /*
  var tempData = null
  fetch('http://api.etherscan.io/api?module=account&action=txlist&address=0x2C57b0FE10CAEA40c94540E6384D32A2f31307EA&startblock=0&endblock=99999999&sort=asc&apikey=K4XTTQPAINQH97P9PBECQ4NHGA8829N59H')

    .then(function(response)
    {
      response => response.body
    })

    .then(function(data) {
      const reader = data.getReader()
    })
    */
}

getActivityLog()
{
  return(

      <Col xs="12" sm="12" lg="6" align="center">     
      <Card>
      <CardBody>
        <Row className="align-items-center">
        <Col lg="12">
          <h4 className="display-4" style={this.h2color2}>Activity Log</h4>
          <div style={{ height: '25px' }}>
          <div>(Coming soon)</div>
        </div>
        </Col>
        </Row>
      </CardBody>
      </Card>
      </Col>
  )
}


  render() 
        {
        if(!this.state.isConnected)
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
        else{

          return(
            <div className="animated fadeIn">
            <div style={{ height: '25px' }}>
            </div>
            <Row>
            {this.getApprovalsView()}
            {this.getActivityLog()}
            </Row>
            </div>
          )
        }


        }
}

export default Settings;
