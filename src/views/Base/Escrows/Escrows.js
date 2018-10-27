import React, { Component } from 'react';
import { Redirect, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios'
import Web3 from 'web3';
import InfiniteScroll from "react-infinite-scroll-component";
import manaABI from '../../../data/manaABI.json';
import LANDRegistryABI from '../../../data/LANDRegistryABI.json'
import * as constAddreses from '../../../data/const_addresses'
import ESCROWABI from '../../../data/ESCROWABI.json'
import {BigNumber} from 'bignumber.js';
import NumberFormat from 'react-number-format';

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Form,
  FormGroup,
  FormText,
  FormFeedback,
  Input,
  Progress,
  Label,
  Row,
  Table,
} from 'reactstrap';



const ColoredLine = ({ color }) => (
  <hr
      style={{
          color: color,
          backgroundColor: color,
          height: 2
      }}
  />
);

var h2color = {color:'#ff4130'}
var parcelLink = {color:'#ff4130', "textDecoration":"underline"}
var noMana = {color:'#ff0000'}

var h2color2 ={color:'black'}
const dclManaText = {"color":"#33ccdf"}


class Escrows extends Component {

  updateEscrow = (user) => {

    this.setState({escrowID:user.target.value})

  }

  onDismiss() {
    this.setState({ visible: false });
  }
  
  constructor(props) {
    super(props);
    this.onDismiss = this.onDismiss.bind(this)
    this.closeEscrow = this.closeEscrow.bind(this)
    this.acceptEscrow = this.acceptEscrow.bind(this)

    this.escrowAddress = constAddreses.escrowAddress
    this.LANDaddress = constAddreses.mainNetLandAddress
    this.LANDProxyAddress = constAddreses.mainNetLandAddressProxy
    this.MANAaddress = constAddreses.mainNetManaAddress

    this.BN = null

    this.state = {
      address: props.address,
      isConnected: false,
      escrowCompleted:false,
      paused:false,
      manaApproved: false,
      landApproved: false,
      manaOwned: 0,
      landOwned:0,
      redirect:false,
      allEscrows:false,
      visible: true,
      allEscrowsLoaded:false,
      escrowInfoLoaded:false,
      publicationFee:0,
      loading:true,
      escrowID:null,
      currentPrice:0,
      currentEscrow: null,
      escrowCompleted:false,
      escrowClosed:false,
      escrowParcels:Array(),
      escrowOwner:null,
      accountsChanged:false,
      receipt:null,
      tx:null,
      parcelIMG: 'https://via.placeholder.com/500x450'
    }

    this.escrowID = props.match.params.id
    this.escrowOwner = '0x0'
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

  acceptEscrow(event)
  {
    console.log('accept escrow')
    // using the promise
    if(!this.checkAccountValidation())
    {
      console.log('do not complete transaction')
      this.setState({accountsChanged:true})
    }
  else
  {
    this.ESCROWContract.methods.acceptEscrow(this.escrowID)
    .send({from: this.account})
    .on('transactionHash',(hash)=> this.setState({tx:hash, escrowTransactionStatus:"Pending"}))
    .on('receipt', (receipt) => this.setState({escrowTransactionStatus:"Idle", receipt:receipt, parcelEscrow:false, loading:false, escrowClosed:true, redirect:true, escrowCompleted: true,showPrivateEscrow:0, parcelOffersAllowed:0}))
  }
}

  async checkAccountValidation()
  {
        var localaccount = ''
        await this.web3.eth.getAccounts(function(err,result){
          localaccount = result[0]
          console.log(localaccount)
        })
        if(localaccount == '')
        {
          console.log('metamask account is null')
          return false
        }
        else
        {
          if(this.account == localaccount)
          {
            console.log('metamask account is the same')
            return true
          }
          else
          {
            console.log('metamask has changed')
            return false
          }
        }
  }

  closeEscrow(event)
  {
      if(!this.checkAccountValidation())
      {
        console.log('do not complete transaction')
        this.setState({accountsChanged:true})
      }
    else
    {
      console.log(this.state.currentPrice)
      this.ESCROWContract.methods.removeEscrow(this.escrowID)
      .send({from: this.account})
      .on('transactionHash',(hash)=> this.setState({tx:hash, escrowTransactionStatus:"Pending"}))
      .then((receipt) => this.setState({escrowTransactionStatus:'Idle', parcelEscrow:false, loading:false, redirect:false, escrowClosed: true,showPrivateEscrow:0, parcelOffersAllowed:0}))
    }
}

  async checkApprovals()
  {
    var tempApproval = 0
    var tempMana = 0
    await this.MANAContract.methods.allowance(this.account,this.escrowAddress).call(function(err,result){

      console.log(result)
      tempApproval = result
    })

    if(tempApproval>0)
    {
      await this.MANAContract.methods.balanceOf(this.account).call(function(err,result){
        tempMana = result
      })
     
     // var tMana = this.web3.utils.fromWei(BigNumber(tempMana))
    }
    else
    {
      this.setState({redirect:true})
    }

    var templandapproval = 0
    var tempLand = 0
    await this.LANDContract.methods.isApprovedForAll(this.account,this.escrowAddress).call(function(err,result){

      templandapproval = result
    })

    if(templandapproval>0)
    {
      await this.LANDContract.methods.balanceOf(this.account).call(function(err,result){
        tempLand = result
      })
    }
    else{
      this.setState({redirect:true})
    }

    var tempFee = 0
    await this.ESCROWContract.methods.publicationFeeInWei().call(function(err,result){

      tempFee = result
    })

    if(this.escrowID == null)
    {
        this.setState({allEscrows:true, loading:false,landApproved:true, landOwned:tempLand, manaApproved: true, manaOwned: tempMana, isConnected:true, publicationFee:tempFee})
    }
    else
    {
      this.setState({allEscrows:false,landApproved:true, landOwned:tempLand, manaApproved: true, manaOwned: tempMana, isConnected:true, publicationFee:tempFee})
    }
  
  }

  async loadWeb3Provder()
  {
    this.web3 = new Web3(Web3.givenProvider)//"https://ropsten.infura.io/v3/1cd23b2196174f83bb93f9ab7a7262f3")
    this.BN = this.web3.utils.BN


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
      if(localaccount == '')
      {
        this.setState({loadingStatement:"Please sign in to Metamask"})
      }
      else{
        this.account = localaccount
        if(this.account != null)
        {
          this.MANAContract = new this.web3.eth.Contract(manaABI, this.MANAaddress)
          this.LANDContract = new this.web3.eth.Contract(LANDRegistryABI, this.LANDProxyAddress)
          this.ESCROWContract = new this.web3.eth.Contract(ESCROWABI, this.escrowAddress)

          this.EscrowContractEvents = new this.metmaskWeb3.eth.Contract(ESCROWABI, this.escrowAddress);
      this.EscrowContractEvents.events.EscrowSuccessful(({ filter: { _to: this.account } }))
      .on("data", (event)=> this.setState({escrowTransactionStatus:"Idle", parcelEscrow:false, loading:false, escrowClosed:true, redirect:false, escrowCompleted: true,showPrivateEscrow:0, parcelOffersAllowed:0}))
      .on("error", console.error)

      var contractPaused = false
      await this.ESCROWContract.methods.paused().call(function(err,result){
        contractPaused = result
      })
      if(contractPaused)
        {
          this.setState({paused:true})
        }
        else
        {
          this.checkApprovals()

        }
        }
        
      }

  }

  async getSingleEscrow()
  {
    console.log(this.escrowID)
    var templandapproval = null
   //if(!this.web3.utils.isHex(this.escrowID) || (this.escrowID.length >= 2 && this.escrowID.substring(1,2) != '0x') || (this.escrowID.legnth < 5))
   if(this.escrowID.length < 41 || !this.web3.utils.isHex(this.escrowID)) 
   {
      this.setState({redirect:true})
    }
    else
    {
    await this.ESCROWContract.methods.escrowByEscrowId(this.escrowID).call(function(err,result){
      templandapproval = result
    })
    console.log(templandapproval)

    var tempAssetLength = 0
    await this.ESCROWContract.methods.getAssetByEscrowIdLength(this.escrowID).call(function(err,result){
      tempAssetLength = result
    })
    
    var tempAssetIdArray = Array()
    for(var i = 0; i < tempAssetLength; i++)
    {
      var tempAssetId = null
      await this.ESCROWContract.methods.getSingleAssetByEscrowIdLength(this.escrowID,i).call(function(err,result){
        tempAssetId = result
      })

      var tempCoordinates = null
      await this.LANDContract.methods.decodeTokenId(tempAssetId).call(function(err,result){
        tempCoordinates = result
      })
      tempAssetIdArray.push(
        {
          "x":tempCoordinates[0],
          "y":tempCoordinates[1],
          "assetId":tempAssetId
        }
      )

    }
    this.setState({loading:false, currentEscrow:templandapproval, escrowParcels:tempAssetIdArray})
  }
  }

componentDidUpdate()
{
    console.log('render update')
    console.log(this.state)
    if(!this.state.isConnected)
    {
      return(<Redirect to="/settings"/>)
    }
    else
    {
      if(!this.state.allEscrows)
      {
        if(this.state.loading)
        {
          console.log('fetching single escrow')
          this.getSingleEscrow()
        }
      }
    }    
}

getEscrowButton()
{
  if(this.state.currentEscrow[1] == this.account)
  {
    return(
      <button className="btn btn-primary btn-lg btn-block" onClick={this.closeEscrow}>Close Escrow</button>
    )
  }
  else
  {
    if((Math.round(this.web3.utils.fromWei(this.state.manaOwned,'ether')) - this.web3.utils.fromWei(this.state.currentEscrow[3],'ether')) >=0)
    {
      return(
        <button className="btn btn-primary btn-lg btn-block" onClick={this.acceptEscrow}>{"Accept & Confirm Escrow"}</button>
      )
    }
    else
    {
      return(<h5 className="display-5" style={noMana}>Not enough MANA to complete this escrow</h5>)
    }
  }
}

getPrivateBuyerAddress()
{
  return(<div><h6 style={h2color2} className="display-6">Buyer Address: {this.state.currentEscrow[2]}</h6></div>)
}

getPrivateEscrow()
{
  if(this.state.currentEscrow[6])
  {
    return(<h4 className="display-6" style={h2color2}>No</h4>)
  }
  else
  {
    return(<div><h4 className="display-6" style={h2color2}>Yes</h4></div>)
  }
}

getAllowOffers()
{
  if(this.state.currentEscrow[5])
  {
    return(<h4 className="display-6" style={h2color2}>Latest Offer</h4>)
  }
  else
  {
      
    return(<h4 className="display-6" style={h2color2}>No</h4>)
  }
    

}

componentDidMount()
{
  console.log('addrss is ' + this.state.address)
  console.log(this.escrowID)
  this.loadWeb3Provder()
}

getAlert()
{
  if(this.account == this.state.currentEscrow[1])
  {
    return(
    <Alert color="info" isOpen={this.state.visible} toggle={this.onDismiss}>
                  <h6 style={h2color2}>You are the owner of this escrow</h6>
                </Alert>)
  }
  else{
    return(null)
  }
}

getItemizedEscrow()
{

  return(
    <table>
      <tbody>
    {this.state.escrowParcels.map((data,i) => (
      <tr key={data.assetId}>
        <td><a href={"https://market.decentraland.org/parcels/"+data.x+"/"+ data.y+"/detail"} target="blank"><h6 style={parcelLink}>Parcel {data.x},{data.y}</h6></a></td>
    </tr>      
    ))}
    </tbody>
    </table>
    )
}

showPrivateEscrow()
{
  if(this.state.currentEscrow[1] == this.account)
  {
    if(this.state.currentEscrow[6])
    {
      return(<div><Row><Col lg="6">
      <h4 className="display-6" style={h2color2}>Private Escrow?</h4>
    </Col>
    <Col lg="6">
    {this.getPrivateEscrow()}
    </Col>
    </Row>
    </div>
    )
    }
    else
    {
      return(<div><Row><Col lg="6">
      <h4 className="display-6" style={h2color2}>Private Escrow?</h4>
    </Col>
    <Col lg="6">
    {this.getPrivateEscrow()}
    </Col>
    </Row>
  
    <Row>
      <Col lg="12">
      {this.getPrivateBuyerAddress()}
      </Col>
    </Row>
    </div>
    )
    }

  }
  else{
    return(null)
  }
}

getConnectingView()
{
  return(
    <div className="animated fadeIn">
    <div style={{ height: '25px' }}>
    </div>
    <Row>
    <Col xs="12" sm="12" lg="12" align="center">
    <h3 className="display-4">Loading...</h3>
    <div><img src={require("../../../assets/img/brand/transactionpending.gif")}/></div>
    </Col>
    </Row>
    <div style={{ height: '25px' }}></div>
    </div>

  )
}

getLoadingView()
{
  return(
    <div className="animated fadeIn">
    <div style={{ height: '25px' }}>
    </div>
    <Row>
    <Col xs="12" sm="12" lg="12" align="center">
    <h3 className="display-4">Loading Escrow Info...</h3>
    <div><img src={require("../../../assets/img/brand/transactionpending.gif")}/></div>
    </Col>
    </Row>
    <div style={{ height: '25px' }}></div>
    </div>

  )
}

getTransactionPendingView()
{
  return(
    <div className="animated fadeIn">
    <div style={{ height: '25px' }}>
    </div>
    <Row>
    <Col xs="12" sm="12" lg="12" align="center">
    <h3 className="display-4">Your Escrow <a href={"http://ropsten.etherscan.io/tx/"+this.state.tx} target={"blank"}>transaction</a> is pending...</h3>
    <div><img src={require("../../../assets/img/brand/transactionpending.gif")}/></div>
    </Col>
    </Row>
    <div style={{ height: '25px' }}></div>
    </div>
    )
}

getSearchEscrowView()
{
  return(
    <div className="animated fadeIn">
    <div style={{ height: '25px' }}>
    </div>
    <Row>
    <div style={{ height: '25px' }}>
    </div>
      <Col lg="3">
      <div style={{ height: '25px' }}>
    </div>
      </Col>
      <Col lg="6">
    <Card>
    <CardHeader>
      <strong>Search for Escrow</strong>
    </CardHeader>
    <CardBody>
      <Row>
        <Col xs="12">
        
          <FormGroup>
            <Row>
              <Col>
              <Input type="text" id="escrowID" placeholder="Enter escrow number" onChange={this.updateEscrow} required />
              </Col>
            </Row>
            <div className="chart-wrapper" style={{ height: '40px' }}></div>
            <Row>
              <Col>
             <Link to={"/escrows/"+this.state.escrowID} ><button className="btn btn-primary btn-lg btn-block">Search Escrow</button></Link>
             
              </Col>
            </Row>
          </FormGroup>
          
        </Col>
      </Row>
    </CardBody>
  </Card>
  </Col>
  <Col lg="3">
      <div style={{ height: '25px' }}>
    </div>
      </Col>
  </Row>
  </div>
  )
}

getOffersView()
{
   if(this.account == this.state.currentEscrow[1])
   {
    if(this.state.currentEscrow[5])
    {
      if(this.state.currentEscrow[4] == 0)
      {
        return(<div><Row><Col lg="6">
        <h4 className="display-6" style={h2color2}>Latest Offer</h4>
          </Col>
          <Col lg="6">
          <h4 className="display-6" style={h2color2}>None</h4>
          </Col>
        </Row>
        </div>)
      }
      else
      {
        
      return(<div><Row><Col lg="6">
      <h4 className="display-6" style={h2color2}>Latest Offer</h4>
    </Col>
    <Col lg="6">
    <h3 className="display-6" style={dclManaText}><NumberFormat value={this.web3.utils.fromWei(this.state.currentEscrow[4],'ether')} displayType={'text'} thousandSeparator={true} /> MANA</h3>
    </Col>
    </Row>
    <Row>
        <Col lg="6">
        <h6 className="display-6" style={h2color2}>Make Counter Offer</h6>
        </Col>

        <Col lg="6">
        <Input type="text" id="counterOffer" onChange={this.handlePrivateBuyerAddress} placeholder="Enter Counter Offer" required />

        </Col>

    </Row>
    <div style={{ height: '25px' }}></div>
        <Row>
        <Col lg="6">
        <button className="btn btn-danger btn-lg btn-block" onClick={this.closeEscrow}>Submit Counter Offer</button>

        </Col>

        <Col lg="6">
        <button className="btn btn-success btn-lg btn-block" onClick={this.closeEscrow}>Accept Offer</button>

        </Col>

    </Row>
    </div>
    )
      }
    }
    else
    {
      return(<div><Row><Col lg="6">
      <h4 className="display-6" style={h2color2}>Offers Allowed?</h4>
    </Col>
    <Col lg="6">
    <h4 className="display-6" style={h2color2}>No</h4>
    </Col>
    </Row>
    </div>
    )
    }
  }
}

showLatestOffer()
{
  if(this.state.currentEscrow[4] == 0)
  {
    return( <h4 className="display-6" style={h2color2}>None</h4> )
  }
  else
  {
    return( <h4 className="display-6" style={h2color2}>{this.state.currentEscrow[4]}</h4> )

  }
}

showOffers()
{
  if(this.state.currentEscrow[5])
  {
      return(<div><Row><Col lg="6">
      <h4 className="display-6" style={h2color2}>Latest Offer</h4>
        </Col>
        <Col lg="6">
        {this.showLatestOffer()}
        </Col>
      </Row>
  <Row>
      <Col lg="6">
      <h6 className="display-6" style={h2color2}>Make Counter Offer</h6>
      </Col>

      <Col lg="6">
      <Input type="text" id="counterOffer" onChange={this.handlePrivateBuyerAddress} placeholder="Enter Counter Offer" required />

      </Col>

  </Row>
  <div style={{ height: '25px' }}></div>
      <Row>
      <Col lg="6">
      <button className="btn btn-danger btn-lg btn-block" onClick={this.closeEscrow}>Submit Counter Offer</button>

      </Col>

      <Col lg="6">
      <button className="btn btn-success btn-lg btn-block" onClick={this.closeEscrow}>Accept Offer</button>

      </Col>

  </Row>

      </div>)
  }
  else
  {
    return(null)
  }

}

showEscrowFee()
{
  if(this.account == this.state.currentEscrow[1])
  {
    return(null)
  }
  else
  {
    return(<Row>
      <Col lg="12">
      <div className="chart-wrapper mx-3" style={{ height: '20px' }}></div>
      
    <div style={h2color2}>*** Escrow fees are {this.web3.utils.fromWei(this.state.publicationFee,'ether')} MANA. You will be charged upon creation of escrow.</div>
      </Col>
    </Row>)
  }
}

getEscrowDetails()
{
  if(this.account == this.state.currentEscrow[1])
  {
    return( 
      <div>
        <Row>
                    <Col lg="6">
                    <h3 className="display-6" style={h2color}>Escrow Price</h3>
                    </Col>
                    <Col lg="6">
                    <h3 className="display-6" style={h2color}><NumberFormat value={this.web3.utils.fromWei(this.state.currentEscrow[3],'ether')} displayType={'text'} thousandSeparator={true} /> MANA</h3>
                    </Col>
            </Row>
            </div>
            )
  }
  else
  {
    return(
      <div>
      <Row>
      <Col lg="6">
      <h3 className="display-6" style={dclManaText}>Your Mana</h3>
      </Col>
      <Col lg="6">
      <h3 className="display-6" style={dclManaText}><NumberFormat value={Math.round(this.web3.utils.fromWei(this.state.manaOwned,'ether'))} displayType={'text'} thousandSeparator={true} /> MANA</h3>
      </Col>
</Row>
<Row>
      <Col lg="6">
      <h4 className="display-6" style={h2color}>Escrow Price</h4>
      </Col>
      <Col lg="6">
      <h4 className="display-6" style={h2color}><NumberFormat value={this.web3.utils.fromWei(this.state.currentEscrow[3],'ether')} displayType={'text'} thousandSeparator={true} /> MANA</h4>
      </Col>
</Row>
{this.showOffers()}
<Row>
      <Col lg="12">
      {this.showEscrowFee()}</Col>
</Row>

<ColoredLine color="black"/>
<Row>
      <Col lg="6">
      <h4 className="display-6" style={h2color2}>Mana after escrow</h4>
      </Col>
      <Col lg="6">
      <h4 className="display-6" style={h2color2}><NumberFormat value={(Math.round(this.web3.utils.fromWei(this.state.manaOwned,'ether')) - this.web3.utils.fromWei(this.state.publicationFee,'ether')- this.web3.utils.fromWei(this.state.currentEscrow[3],'ether')) } displayType={'text'} thousandSeparator={true} /> MANA</h4>
      </Col>
</Row>
</div>
    )
  }
}

getEscrowView()
{
  return(
    <div className="animated fadeIn">
    <div style={{ height: '25px' }}>
    </div>
    <Row>
      <Col lg="12">
      {this.getAlert()}
      
    </Col>
      <Col lg="12">
      <Card className="text-white bg-gray-100">
        <CardBody className="pb-0">

        <Row>
          <Col lg="6">
          <div>
            <h1 className="display-4" style={h2color2}>Opened Escrow</h1>
          </div>
          <div className="chart-wrapper mx-3" style={{ height: '40px' }}></div> 
          <Row>
            <Col lg="12">
            <div><h5 style={h2color2}>Escrow ID:</h5></div>
              <div><h6 style={h2color2}>{this.escrowID}</h6></div>
              </Col>
          </Row>
          <div className="chart-wrapper mx-3" style={{ height: '40px' }}></div> 

          {this.getEscrowDetails()}

            <div className="chart-wrapper mx-3" style={{ height: '20px' }}></div>
            {this.showPrivateEscrow()}
                 
                 <div className="chart-wrapper mx-3" style={{ height: '20px' }}></div>
 
                  {this.getOffersView()}

                  <div className="chart-wrapper mx-3" style={{ height: '20px' }}></div>
            

                  <Row>

          </Row>

          </Col>

          <Col lg="6">
          <Row>
            <Col lg="12">
          <h5 style={h2color2}>Itemized Escrow Statement</h5>
              <ColoredLine color="black"/>
             {this.getItemizedEscrow()}
               
              
              <ColoredLine color="black"/>
              <div><h6 style={h2color2}>Total Parcels: {this.state.escrowParcels.length}</h6></div>
              <div><h6 style={h2color2}>Total Estates: 0 </h6></div>
              <div className="chart-wrapper" style={{ height: '40px' }}></div>
            </Col>
              <Col lg="12">
              <div className="chart-wrapper mx-3" style={{ height: '20px' }}></div>
              {this.getEscrowButton()}
             <div className="chart-wrapper mx-3" style={{ height: '40px' }}></div>
          </Col>
          </Row>
          </Col>

        </Row>
        </CardBody>
      </Card>
      </Col>
    </Row>


    </div>
  )
}

getEscrowCompletedView()
{
    return(
      <div className="animated fadeIn">
      <div style={{ height: '25px' }}>
      </div>
      <Row>
        <Col lg="12" align="center">
        <Card>
          <CardBody>
            <div>
          <h4 style={h2color2} className="display-4">Escrow Completed!</h4></div>
          <div className="display-6">(It might take a few seconds for the transaction to be picked up by the node)</div>
          <div className="display-5">The LAND tokens have been transferred to your wallet.</div>
          <div className="display-5">They are now available on your dashboard.</div>
          <div className="display-6"><a href={"https://market.decentraland.org/address/" + this.account +"/parcels"}>View your Parcels on Decentraland</a></div>
            </CardBody>
            </Card>
        </Col></Row>
        </div>
    )
  
}

getEscrowClosedView()
{
    return(
      <div className="animated fadeIn">
      <div style={{ height: '25px' }}>
      </div>
      <Row>
        <Col lg="12" align="center">
        <Card>
          <CardBody>
            <div>
          <h4 style={h2color2} className="display-4">Escrow Closed</h4></div>
          <div className="display-5">Your parcels are now available for other escrows.</div>
            </CardBody>
            </Card>
        </Col></Row>
        </div>
    )
  
}

getInvalidEscrowView()
{
  return(
    <div className="animated fadeIn">
    <div style={{ height: '25px' }}>
    </div>
    <Row>
      <Col lg="12" align="center">
      <Card>
        <CardBody>
        <h4 style={h2color2} className="display-4">Invalid Escrow ID</h4>
          </CardBody>
          </Card>
      </Col></Row>
      </div>
  )
}

  getNotAuthorizedView()
  {
    return(
      <div className="animated fadeIn">
      <div style={{ height: '25px' }}>
      </div>
      <Row>
        <Col lg="12" align="center">
        <Card>
          <CardBody>
          <h4 style={h2color2} className="display-4">You are not authorized for this escrow.</h4>
            </CardBody>
            </Card>
        </Col></Row>
        </div>
    )
  }

  getEscowEndedView()
  {
    return(
      <div className="animated fadeIn">
      <div style={{ height: '25px' }}>
      </div>
      <Row>
        <Col lg="12" align="center">
        <Card>
          <CardBody>
          <h4 style={h2color2} className="display-4">This escrow has been closed.</h4>
            </CardBody>
            </Card>
        </Col></Row>
        </div>
    )
  }
    getNotAuthorizedView()
    {
      return(
        <div className="animated fadeIn">
        <div style={{ height: '25px' }}>
        </div>
        <Row>
          <Col lg="12" align="center">
          <Card>
            <CardBody>
            <h4 style={h2color2} className="display-4">You are not authorized for this escrow.</h4>
              </CardBody>
              </Card>
          </Col></Row>
          </div>
      )
    }

  getPausedView()
  {
    return(
      <div className="animated fadeIn">
      <div style={{ height: '25px' }}>
      </div>
      <Row>
      <Col xs="12" sm="12" lg="12" align="center">
      <h3 className="display-4">DCL Escrow under maintenance...</h3>
      </Col>
      </Row>
      <div style={{ height: '25px' }}></div>
      </div>
  
    )
  }

  render() {
    if(this.state.redirect)
    {
      return (<Redirect to='/dashboard' />)
    }
    if(this.state.accountsChanged)
    {
      return(<div>{this.getAccountsChangedView()}</div>)
    }
    else if(this.state.paused)
    {
      return(<div>{this.getPausedView()}</div>)
    }
     else if(!this.state.isConnected)
      {
        return(<div>{this.getConnectingView()}</div>)
      }
      else{

          if(this.state.loading)
          {
            return(<div>{this.getLoadingView()}</div>)
          }
          else{

           if(this.state.escrowCompleted)
            {
                return(<div>{this.getEscrowCompletedView()}</div>)
            }

            else if(this.state.escrowClosed)
            {
                return(<div>{this.getEscrowClosedView()}</div>)
            }
            else{
            
              if(this.state.escrowTransactionStatus == "Pending")
              {
                return(<div>{this.getTransactionPendingView()}</div>)
              }

              else{

                  if(this.state.allEscrows)
                  {
                    return(<div>{this.getSearchEscrowView()}</div>)
                  }
                  else
                  {
                    if(this.state.currentEscrow != null)
                    {
                      if(this.state.currentEscrow[1] == '0x0000000000000000000000000000000000000000' )
                      {
                        return(<div>{this.getEscowEndedView()}</div>)
                      }
                                        
                    else if(!this.state.currentEscrow[6])
                    {
                        if(this.account == this.state.currentEscrow[1] || this.account == this.state.currentEscrow[2])
                        {
                          return(<div>{this.getEscrowView()}</div>)
                        }
                        else{
                          return(<div>{this.getNotAuthorizedView()}</div>)
                        }

                    }
                    else{
                      return(<div>{this.getEscrowView()}</div>)
                    }  
                  }
                  else
                  {
                    return(<div>{this.getInvalidEscrowView()}</div>)
                  }

              
                  }
              }   
            }
          }
      }
    }  
}

export default Escrows;
