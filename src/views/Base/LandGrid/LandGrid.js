import React, { Component } from 'react';
import axios from 'axios'
import Web3 from 'web3';
import InfiniteScroll from "react-infinite-scroll-component";
import { Link } from "react-router-dom";

//import manaABI from '../../data/manaABI.json';
//import LANDRegistryABI from '../../data/LANDRegistryABI.json'
import {BigNumber} from 'bignumber.js';
import {
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
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities'

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

const API = 'https://api.decentraland.org/v1/';

const DEFAULT_QUERY = '0xe010b3bcbb3d077a82985194800227914393360a';
const API_PART_ONE = 'addresses'
const API_PART_TWO = 'parcels'


class LandGrid extends Component {
  
  constructor(props) {
    super(props);
    this.account = props.account;
    this.landContract = props.landContract;
    this.lands = [];
    this.state = {
      isConnected: false,
      manaApproved: false,
      landApproved: false,
      manaOwned: 0,
      landOwned:0,
      fetchedLand:false,
      lands:[],
      displayedLands:[],
      firstbatch:false,
      firstBatchAmount:8,
    };

    this.batchPostion = 8
    this.batchPostion2 = 8
    this.displayedLands= []
    this.numLands = 0
    this.hasMore = true
    //this.getAllLand()
    //this.returnLandTable()

  }

  

  async getAllLand()
  {
  
   var dclLand = new Array()
  
  
    await this.landContract.methods.landOf(this.account).call(function(err,txHash){
      this.lands = txHash
      var looper = Object.keys(txHash).length
      console.log(txHash[0].length)
      var i
      for(i = 0; i < txHash[0].length; i++)
      {
          console.log(txHash[0].data)
          console.log(txHash[0][i] + ',' +txHash[1][i])
          dclLand.push({
            "id": txHash[0][i] + ',' + txHash[1][i],
            "x":txHash[0][i],
            "y":txHash[1][i],
            "public": false,
            "hasEscrow":false,
          })
      }

    })

    var escrowLands = new Array()
    // await this.landContract.methods.landOf(this.account).call(function(err,txHash){
    //   this.lands = txHash
    //   var looper = Object.keys(txHash).length
    //   console.log(txHash[0].length)
    //   var i
    //   for(i = 0; i < txHash[0].length; i++)
    //   {
    //       console.log(txHash[0].data)
    //       console.log(txHash[0][i] + ',' +txHash[1][i])
    //       dclLand.push({
    //         "id": txHash[0][i] + ',' + txHash[1][i],
    //         "x":txHash[0][i],
    //         "y":txHash[1][i],
    //         "public": false,
    //         "hasEscrow":false,
    //       })
    //   }

    // })


    console.log(JSON.parse(JSON.stringify(dclLand)))
    //this.returnLandTable()
    this.setState({lands:dclLand,  landOwned:dclLand.length})
  }

  returnLandTable()
  {
    var templand = []
    fetch(API + API_PART_ONE + '/' + DEFAULT_QUERY + '/' + API_PART_TWO)
    .then((response) => response.json())
    .then((response)=>
    {
      var temp = response.data
      console.log(temp)
      //this.displayedLands = temp.splice(this.state.firstBatchindex, this.state.firstBatchAmount)
      console.log(temp.length)
     // this.setState({lands:temp, displayedLands: temp.slice(0,8), landOwned:temp.length})
    }
    
  )//(response) => this.setState({lands: response.data, landOwned: response.data.length, fetchedLand:true}))
  this.getAllLand()
  }  

  componentDidMount()
  {
    //this.returnLandTable()
    this.getAllLand()
  
  }

  componentDidUpdate()
  {
    console.log(this.state.lands)
    console.log(this.batchPostion)
  }

  fetchMoreData = () => {
    // a fake async api call like which sends
    // 20 more records in 1.5 secs
    console.log('here man')
    this.batchPostion = this.batchPostion + 8
    var tempdata = this.state.lands.slice(0,this.batchPostion)
    this.setState({displayedLands:tempdata})

  };

  displayPublicEscrowsOnly()
  {
    this.state.lands.map(function(data, i) {
      console.log('new parcel')
    if(data.public)
      {
        return(
        <Col xs="12" sm="12" lg="3" key={data.id}>
        <Card className="text-white bg-gray-900">
        {/* <img src={'https://via.placeholder.com/200x200'}/> */}
        <a href={"https://market.decentraland.org/parcels/"+ data.x + "/"+ data.y + "/detail"} target="blank"><img src={'https://api.decentraland.org/v1/parcels/'+data.x+'/'+data.y+'/map.png?height=110&width=230&size=10&publications=true'}/></a>
          <CardBody className="pb-0">
          <div>Parcel {data.x},{data.y}</div>
          <div className="chart-wrapper" style={{ height: '40px' }}></div>
          <div col="3" className="mb-3 mb-xl-0 col-sm-4 col-md-2 col-xl">
          <Link to={"/parcel/"+data.x+"/"+data.y}><button className="btn-pill btn-primary btn-lg btn-block">Open Escrow</button></Link>
          </div>
          <div className="chart-wrapper" style={{ height: '40px' }}></div>
         
          </CardBody>
        </Card>
      </Col>)
      }
      else{
        return(
          <Col xs="12" sm="12" lg="3" key={data.id}>
          <Card className="text-white bg-gray-900">
          {/* <img src={'https://via.placeholder.com/200x200'}/> */}
          <a href={"https://market.decentraland.org/parcels/"+ data.x + "/"+ data.y + "/detail"} target="blank"><img src={'https://api.decentraland.org/v1/parcels/'+data.x+'/'+data.y+'/map.png?height=110&width=230&size=10&publications=true'}/></a>
            <CardBody className="pb-0">
            <div>Parcel {data.x},{data.y}</div>
            <div className="chart-wrapper" style={{ height: '40px' }}></div>
            <div col="3" className="mb-3 mb-xl-0 col-sm-4 col-md-2 col-xl">
            <Link to={"/parcel/"+data.x+"/"+data.y}><button className="btn-pill btn-primary btn-lg btn-block">Close Escrow</button></Link>
            </div>
            <div className="chart-wrapper" style={{ height: '40px' }}></div>
           
            </CardBody>
          </Card>
        </Col>)
      }
    })
  }

  getPB(data)
  {
    if(data.public)
    {
      return('Close')
    }
    else{

    }
  }

  render() {

    return (

    //    <InfiniteScroll
    //   dataLength={this.state.landOwned}
    //   next={this.fetchMoreData}
    //   hasMore={this.hasMore}
    //   loader={<h4>Loading...</h4>}
    //   endMessage={
    //     <p style={{textAlign: 'center'}}>
    //       <b>Yay! You have seen it all</b>
    //     </p>
    //   }
    // >
    <Row>
      {this.state.lands.map((data) => (
      <Col xs="12" sm="12" lg="3" key={data.id}>
          <Card className="text-white bg-gray-900">
          {/* <img src={'https://via.placeholder.com/200x200'}/> */}
          <a href={"https://market.decentraland.org/parcels/"+ data.x + "/"+ data.y + "/detail"} target="blank"><img src={'https://api.decentraland.org/v1/parcels/'+data.x+'/'+data.y+'/map.png?height=110&width=230&size=10&publications=true'}/></a>
            <CardBody className="pb-0">
            <div>Parcel {data.x},{data.y}</div>
            <div className="chart-wrapper" style={{ height: '40px' }}></div>
            <div col="3" className="mb-3 mb-xl-0 col-sm-4 col-md-2 col-xl">
            <Link to={"/parcel/"+data.x+"/"+data.y}><button className="btn-pill btn-primary btn-lg btn-block">{this.getPB(data)} Escrow</button></Link>
            </div>
            <div className="chart-wrapper" style={{ height: '40px' }}></div>
           
            </CardBody>
          </Card>
        </Col>
      ))}
        </Row>
   //</InfiniteScroll>
    )
  }
}

export default LandGrid;
