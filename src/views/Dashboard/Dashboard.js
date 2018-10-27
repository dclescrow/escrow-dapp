import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Web3 from 'web3';
import manaABI from '../../data/manaABI.json';
import LANDRegistryABI from '../../data/LANDRegistryABI.json'
import ESCROWABI from '../../data/ESCROWABI.json'
import { Link } from "react-router-dom";
import * as constAddreses from '../../data/const_addresses'
import { Mana } from 'decentraland-ui'
import NumberFormat from 'react-number-format';


import {
  Card,
  CardBody,
  Col,
  Row,
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


const dclBG = {"backgroundColor":"#202333"}
const dclText = {"color":"#e13a3e"}
const dclManaText = {"color":"#33ccdf"}


class Dashboard extends Component {

  updateEscrow = (user) => {

    this.setState({escrowID:user.target.value})

  }

  constructor(props) {
    super(props);

    this.updateEscrow = this.updateEscrow.bind(this)

    this.escrowAddress = constAddreses.escrowAddress
    this.LANDaddress = constAddreses.mainNetLandAddress
    this.LANDProxyAddress = constAddreses.mainNetLandAddressProxy
    this.MANAaddress = constAddreses.mainNetManaAddress

    this.state = {
      redirect:false,
      isConnected: false,
      manaApproved: false,
      landApproved: false,
      manaOwned: 0,
      landOwned:0,
      estatesOwned:0,
      paused:null,
      fetchedLand:false,
      fetchedEscrows:false,
      openEscrowCount:0,
      escrowCounter:0,
      openedEscrowsArray:Array(),
      lands:[],
      escrowID:"",
      loadingStatement:"Connecting to the Ethereum Network...Make sure you are logged into Metamask"
    };

    this.web3 = null
    this.account = '0x0'


    //DCL LAND 0x9aa1d5e2df63aa098e012510ff570a7357cbd95a
    //DCL MANA 0x2a8fd99c19271f4f04b1b7b9c4f7cf264b626edb
    //DCL LAND PROXY 0x7a73483784ab79257bb11b96fd62a2c3ae4fb75b

    //ESCROW LAND 0x12eba983d5de3e22a4c681d1c30029bd6a68321b
    //ESCROW MANA

    //GANACHE MANA    0xe9c3f8d7aee02b878c5010f53ed8241e19373b1c
    //GANACHE LAND    0x4340d23e45c6744ad4140c9166d279243699b05f
    //GANACHE ESCROW  0x1dbdfd48c0bb30e5ed55e5a18e93c3f3922e9067

    

    this.MANAContract = null
    this.LANDContract = null

  }

  async checkApprovals()
  {
    console.log('got here')
    var tempApproval = 0
    var tempMana = 0
    await this.MANAContract.methods.allowance(this.account,this.escrowAddress).call(function(err,result){

      console.log(result)
      tempApproval = result
    })

    console.log(tempApproval)

    if(tempApproval>0)
    {
      await this.MANAContract.methods.balanceOf(this.account).call(function(err,result){
        tempMana = result
      })
      tempMana = this.web3.utils.fromWei(tempMana, 'ether')
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

    await this.LANDContract.methods.isApprovedForAll(this.account,this.escrowAddress).call(function(err,result){

      templandapproval = result
    })

    console.log(this.ESCROWContract)

    var tempEscrows = 0
    await this.ESCROWContract.methods.getEscrowCountById(this.account).call(function(err,result){

       tempEscrows = result
     })

    
    this.setState({landApproved:true, landOwned:tempLand, manaApproved: true, manaOwned: tempMana, isConnected:true, escrowCounter:tempEscrows})

  }

  async loadWeb3Provder()
  {
    this.web3 = new Web3(Web3.givenProvider)//"https://ropsten.infura.io/v3/1cd23b2196174f83bb93f9ab7a7262f3")
    //this.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/1cd23b2196174f83bb93f9ab7a7262f3'))

    if(this.web3 == null)
    {
      console.log("oops");
    }
    console.log(this.web3)
      var localaccount = ''
      await this.web3.eth.getAccounts(function(err,result){
        localaccount = result[0]
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
        else
        {
          this.setState({loadingStatement:"Please sign in to Metamask"})
        }
        
      }
    }

  async getOpenedEscrows()
  {
      var tempEscrows = Array()
      var tempCount = 0
      console.log(this.state.escrowCounter)
      for(var i = 0; i < this.state.escrowCounter; i++)
      {
        await this.ESCROWContract.methods.getEscrowInfo(this.account,i).call(function(err,result){

          console.log(result)
          if(result[0] != '0x0000000000000000000000000000000000000000000000000000000000000000')
          {
          tempEscrows.push({
            "id":result[0],
            "seller":result[1],
            "buyer":result[2],
            "price": result[3],
            "offerPrice":result[4],
            "isPublic":result[5],
            "offersAllowed":result[6],
            "escrowPosition":result[7],
            "parcels":result[8]
          })
          tempCount = tempCount + 1
        }
        })
        console.log(tempCount)         
      }
      this.setState({openedEscrowsArray:tempEscrows, openEscrowCount: tempCount, fetchedEscrows:true})

  }

  componentDidMount()
  {
    console.log("Mounted component")
    this.loadWeb3Provder()
  }

  componentDidUpdate()
  {
     console.log("Render update")
     console.log(this.state.openedEscrowsArray)
     if(this.state.isConnected && (!this.state.manaApproved || !this.state.landApproved))
     {
        return(<Redirect to="/settings"/>)
     }
     if(!this.state.fetchedEscrows)
     {
       this.getOpenedEscrows()
     }
  }

  getEscrowstatus()
  {
    if(!this.state.fetchedEscrows)
    {
      return(
        <Col align="center">
        <div><img src={require("../../assets/img/brand/transactionpending.gif")}/></div>
        <div><h4>Loading Your Escrows...</h4></div>

        </Col>
      )
    }
    else
    {
      return(
      this.state.openedEscrowsArray.map((data) => (
        <Col xs="12" sm="12" lg="3" key={data.id}>
        <Card className="text-white bg-gray-900">    
          <CardBody className="pb-0">
          <div><h4>Parcels: {data.parcels}</h4></div>
          <div><h4>Estates: 0</h4></div>
          <div className="chart-wrapper" style={{ height: '40px' }}></div>
          {/* <div><h4>Latest Offer:</h4>
          <h6>{this.web3.utils.fromWei(data.offerPrice,'ether')} MANA</h6></div>
          <div className="chart-wrapper" style={{ height: '40px' }}></div> */}
          <div><h4 style={dclText}>Escrow Price:</h4>
          <h6 style={dclManaText}><NumberFormat value={this.web3.utils.fromWei(data.price,'ether')} displayType={'text'} thousandSeparator={true} /> MANA</h6></div>
          <div className="chart-wrapper" style={{ height: '40px' }}></div>
          <div col="3" className="mb-3 mb-xl-0 col-sm-4 col-md-2 col-xl">
          <Link to={"/escrows/"+data.id}><button className="btn-pill btn-primary btn-lg btn-block">View Escrow</button></Link>
          </div>
          <div className="chart-wrapper" style={{ height: '40px' }}></div>
         
          </CardBody>
        </Card>
      </Col>
      ))
      )
    }
  }

  getStartEscrowButon()
  {
    console.log(this.state.landOwned)
    if(this.state.landOwned == 0)
    {
      return(null)
    }
    else
    {
      return(
      <Col xs="12" sm="6" lg="6">
      
      <Card>
        <CardBody>
        <div className="chart-wrapper" style={{ height: '15px' }}>
          </div>
            <Link to={"/create"}><button className="btn btn-primary btn-lg btn-block">Start New Escrow</button></Link>
            <div className="chart-wrapper" style={{ height: '15px' }}>
          </div>
          </CardBody>
        </Card>
          
      </Col>)
    }
  }

  render()
  {
    if(this.state.paused)
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
   else if(!this.state.isConnected)
    {
      return(
        <div className="animated fadeIn">
        <div style={{ height: '25px' }}>
        </div>
        <Row>
        <Col xs="12" sm="12" lg="12" align="center">
        <h3 className="display-4">Loading Dashboard...</h3>
        <div><img src={require("../../assets/img/brand/transactionpending.gif")}/></div>
        </Col>
        </Row>
        <div style={{ height: '25px' }}></div>
        </div>
    
      )

    }
    
    
   else if(!this.state.manaApproved || !this.state.landApproved)
   {

     return (<Redirect to='/settings' />)
   }

   else if(this.state.redirect)
   {
    return (<Redirect to='/settings' />)
   }

    else
    {
      return(
        <div className="animated fadeIn">
      <div style={{ height: '25px' }}>
      </div>
      <Row>
          <Col lg="6">
          <Row>
            <Col lg="12">
            <Card className="text-white" style={dclBG}>
          <CardBody className="pb-0">
            <Row>
            <Col lg="4">
            <div className="text-value" style={dclManaText}><NumberFormat value={Math.round(this.state.manaOwned)} displayType={'text'} thousandSeparator={true} />
</div>
            <div>MANA Owned</div>
              </Col>
              <Col lg="4">
              <div className="text-value" style={dclText}><NumberFormat value={this.state.landOwned} displayType={'text'} thousandSeparator={true} />
</div>
            <div>LAND Owned</div>
              </Col>
              <Col lg="4">
              <div className="text-value" style={dclText}>N/A</div>
            <div>ESTATES COMING SOON</div>
              </Col>
            </Row>
          
          </CardBody>
          <div className="chart-wrapper mx-3" style={{ height: '40px' }}>
          </div>
        </Card>
        </Col>
          </Row>
      </Col>

      {this.getStartEscrowButon()}


      </Row>
      <Row>
        <Col lg="12">
        <h4>Your Open Escrows {"("+this.state.openEscrowCount+")"}</h4>
        <ColoredLine color="#e13a3e" /></Col>
        
      </Row>
      
       <Row>{
         this.getEscrowstatus()}   
</Row>

      </div>
      )
    }


  }

  
}

export default Dashboard;
