import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import Web3 from 'web3';
import manaABI from '../../../data/manaABI.json';
import LANDRegistryABI from '../../../data/LANDRegistryABI.json'
import ESCROWABI from '../../../data/ESCROWABI.json'
import * as constAddreses from '../../../data/const_addresses'
import NumberFormat from 'react-number-format';

//import manaABI from '../../data/manaABI.json';
//import LANDRegistryABI from '../../data/LANDRegistryABI.json'
import {
  Card,
  CardBody,
  Col,
  FormGroup,
  Input,
  Row,
  Pagination,
  PaginationItem,
  PaginationLink
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
var h2color2 ={color:'black'}
var h2color2italic ={color:'black', fontStyle: 'italic'}
var iconColor ={color:'red'}
var highlightWhite ={color:'white'}


class Createescrow extends Component {

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

async createEscrow(event)
{
  console.log(this.state)
  if(!this.checkAccountValidation())
  {
    this.setState({accountsChanged:true})
  }
  else if(/*this.state.parcelOffersAllowed == 0 ||*/ this.state.showPrivateEscrow == this.acount || this.state.showPrivateEscrow == 0 || this.state.currentPrice ==0 || this.state.selectedParcels.length == 0)
  {
    this.setState({createEscrowFormError:true})
  }
  else
  {
    var currentPriceInWei = this.web3.utils.toWei(this.state.currentPrice,'ether')
    var tempOffers = false
    if(this.state.parcelOffersAllowed == 1)
    {
      tempOffers = true
    }
    else
    {
      tempOffers = false
    }
      tempOffers = false
    var tempPublic = false
    if(this.state.showPrivateEscrow == 1)
    {
      tempPublic = false
    }
    else
    {
      tempPublic = true
    }
    
    var tempBuyer = '0x0000000000000000000000000000000000000000'
    var tempBidder = '0x0000000000000000000000000000000000000000'
    if(this.state.showPrivateEscrow == 1)
    {
        tempBuyer = this.state.privateBuyerAddress
    }
    console.log(this.web3.utils.toWei(this.state.publicationFee))
    var assetIdArray = Array()
    for(var i = 0; i < this.state.selectedParcels.length; i++)
    {
      assetIdArray.push(this.state.selectedParcels[i].id)
    }
    console.log(this.state.selectedParcels)
    console.log(assetIdArray, this.state.currentPrice, tempOffers,tempPublic, tempBuyer)


    await this.ESCROWContract.methods.createNewEscrow(assetIdArray, this.web3.utils.toWei(this.state.currentPrice,'ether'), tempOffers, tempPublic, tempBuyer)
    .send({from:this.account})
    .on('transactionHash',(hash)=> this.setState({tx:hash, escrowTransactionStatus:"Pending"}))
    .then((receipt) => this.setState({escrowID: receipt.events.EscrowCreated.returnValues[0],parcelEscrow:true,escrowTransactionStatus:"Idle", escrowRedirect:false, escrowCreated:true}))
 
  }
}

updatePrice(event)
{
  var tempDue = null
  if(this.state.whitelisted)
  {
    var tempDue = parseInt(event.target.value,10)

  }
  else
  {
    var tempDue = parseInt(event.target.value,10) + parseInt(this.web3.utils.fromWei(this.state.publicationFee,'ether'),10)

  }
  this.setState({currentPrice: event.target.value,createEscrowFormError:false,totalEscrowPrice:tempDue})
}

handlePrivateBuyerAddress(event)
{
  this.setState({privateBuyerAddress: event.target.value, createEscrowFormError:false})
}

handlePrivateEscrow(event)
{
  console.log(event.target.value)
    if(event.target.value == '1')
    {
      this.setState({showPrivateEscrow:'1', createEscrowFormError:false})
    }
    else
    {
      this.setState({showPrivateEscrow:'2',createEscrowFormError:false})

    }
}

handleAllowOffers(event)
{
      this.setState({parcelOffersAllowed:event.target.value,createEscrowFormError:false})
}

handlePaginate(event)
{
  this.handlePageMove(event.target.id)
 }

 handlePageMove(newPage)
 {
  console.log(newPage)

  this.setState({loadingParcels:true})
   if(!this.cacheLoaded[newPage] || 1 == 2)
   {
    const { ownedParcelsArray, parcelsPerPage } = this.state;

    var indexOfLastTodo = newPage * parcelsPerPage
    var indexOfFirstTodo = indexOfLastTodo - parcelsPerPage;
    if(indexOfLastTodo > ownedParcelsArray.length)
    {
      indexOfLastTodo = ownedParcelsArray.length
      indexOfFirstTodo = ((newPage-1)*parcelsPerPage+1)
    }

    this.fetchDisplayData(ownedParcelsArray,indexOfFirstTodo,indexOfLastTodo,newPage)
   }
   else
   {
     this.setState({currentParcelPage: Number(newPage), loadingParcels:false})
   }
 }

 handleNextLink(event)
 {
  console.log(this.state.pageNumbersView)
  if(this.state.pageNumbers > this.state.pageNumbersView[this.state.pageNumbersView.length-1])
  {
    var tempArray = Array()
    tempArray = this.state.pageNumbersView.slice(1)
    tempArray.push(this.state.pageNumbersView[this.state.pageNumbersView.length-1] + 1)
    this.setState({pageNumbersView:tempArray})
  }
 }

 handlePreviousLink(event)
 {
  if(this.state.pageNumbersView[0] > 1)
  {
    var tempArray = Array()
    tempArray = this.state.pageNumbersView.slice(0,this.state.pageNumbersView.length-1)
    tempArray.unshift(this.state.pageNumbersView[0] - 1)
    this.setState({pageNumbersView:tempArray})
  }
 }

 dropDownSelected(event)
 {
   console.log(event.target.value)
   var parcelIndex = this.getIndex(event.target.value, this.state.ownedParcelsArray, 'xy')
   var multiplier = 1
   for(let i = 1; i <= this.state.pageNumbers; i++)
   {
      if(parcelIndex+1 <= i * this.state.parcelsPerPage)
      {
        console.log('Parcel is on Page ' + i)
        if(this.state.currentParcelPage != i)
        {
          /*
          this.toggleParcel(this.state.ownedParcelsArray[parcelIndex].xy, 
            this.state.ownedParcelsArray[parcelIndex].id, 
            this.state.ownedParcelsArray[parcelIndex].onSale, 
            this.state.ownedParcelsArray[parcelIndex].onEscrow
            )
            */

          this.handlePageMove(i)
        }
        break
      }
   }
 }
 
 getIndex(value, arr, prop) {
  for(var i = 0; i < arr.length; i++) {
      if(arr[i][prop] === value) {
          return i;
      }
  }
  return -1; //to handle the case where the value doesn't exist
}


  
  constructor(props) {
    super(props);
    this.createEscrow = this.createEscrow.bind(this)
    this.updatePrice = this.updatePrice.bind(this)
    this.handlePrivateEscrow = this.handlePrivateEscrow.bind(this) 
    this.handleAllowOffers = this.handleAllowOffers.bind(this)
    this.handlePrivateBuyerAddress = this.handlePrivateBuyerAddress.bind(this)
    this.handlePaginate = this.handlePaginate.bind(this)
    this.handleNextLink = this.handleNextLink.bind(this)
    this.handlePreviousLink = this.handlePreviousLink.bind(this)
    this.dropDownSelected = this.dropDownSelected.bind(this)

 
    //this.parcelSelected = this.parcelSelected.bind(this)

    this.escrowAddress = constAddreses.escrowAddress
    this.LANDaddress = constAddreses.mainNetLandAddress
    this.LANDProxyAddress = constAddreses.mainNetLandAddressProxy
    this.MANAaddress = constAddreses.mainNetManaAddress

    this.state = {
      isConnected: false,
      manaApproved: false,
      paused:false,
      landApproved: false,
      createEscrowFormError:false,
      escrowRedirect:false,
      parcelOwner:false,
      manaOwned: 0,
      accountsChanged:false,
      landOwned:0,
      currentPrice: 0,
      escrowCreated:false,
      publicationFee:0,
      escrowCreated:false,
      parcelEscrow: false,
      redirect:false,
      parcelID: null,
      escrowID: null,
      escrowTransactionStatus:'Idle',
      totalEscrowPrice: 0,
      parcelOffersAllowed: 0,
      showPrivateEscrow:0,
      whitelisted: false,
      privateBuyerAddress:'0x0',
      fetchedParcels:false,
      ownedParcelsArray: Array(),
      selectedParcels:Array(),
      displayParcelsArray:Array(),
      currentParcelPage:1,
      parcelsPerPage:8,
      tempStateLand:null,
      pageNumbers:0,
      escrowView:"Vertical",
      pageNumbersView:Array(),
      tx:'0x0',
      lands:[],
      loadingParcels:true,
      parcelIMG: 'https://via.placeholder.com/220x125'
    };
    this.x = props.match.params.x
    this.y = props.match.params.y
    this.account = '1'
    this.parcelOwner = '1'
    this.web3 = null
    this.metmaskWeb3 = null
    this.account = '0x0'
    this.EscrowContractEvents = null
    this.cacheLoaded = Array()

  }
  
  async loadWeb3Provder()
  {
    this.web3 = new Web3(Web3.givenProvider)//"https://ropsten.infura.io/v3/1cd23b2196174f83bb93f9ab7a7262f3")
    //this.web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/1cd23b2196174f83bb93f9ab7a7262f3'))
    this.metmaskWeb3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws"))

    if(this.web3 == null)
    {
      this.setState({loadingStatement:"Please enable a web3 browser"})
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

  async checkApprovals()
  {
    var tempApproval = 0
    var tempMana = 0
    await this.MANAContract.methods.allowance(this.account,this.escrowAddress).call(function(err,result){

      tempApproval = result
    })

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

    var tempFee = 0
    var tempWhiteList = false
    if(templandapproval>0)
    {
      await this.LANDContract.methods.balanceOf(this.account).call(function(err,result){
        tempLand = result
      })

      
          await this.ESCROWContract.methods.publicationFeeInWei().call(function(err,result){
      
            //console.log('publication fee = ' + result)
            tempFee = result
          })

          
          await this.ESCROWContract.methods.whitelistAddresses(this.account).call(function(err,result){
      
            //console.log('publication fee = ' + result)
            tempWhiteList = result
          })
          
          if(tempWhiteList)
          {
           // tempFee = 0
          }
          
    }
    else{
      this.setState({redirect:true})
    }

    // await this.LANDContract.methods.isApprovedForAll(this.account,this.escrowAddress).call(function(err,result){

    //   templandapproval = result
    // })

    //console.log(this.ESCROWContract)

    console.log(tempWhiteList)
    this.setState({landApproved:true,whitelisted:tempWhiteList ,landOwned:tempLand, manaApproved: true, manaOwned: tempMana, isConnected:true, publicationFee:tempFee})

  }

  showPrivateEscrow()
  {
    if(this.state.showPrivateEscrow == '1')
    {
      return(
        <div>
        <Row>
            <Col lg="12">
          <h5 className="display-6" style={h2color2}>Please enter private buyer's wallet address below</h5>
          </Col>      <div className="chart-wrapper mx-3" style={{ height: '10px' }}/>

          <Col lg="12">
          <Input type="text" id="privateEscrowBuyerId" onChange={this.handlePrivateBuyerAddress} placeholder="Enter Buyer's Address" required />
          <div style={h2color2italic}>Private escrow can only be accessed by the buyer you enter below</div>
          </Col>
          
        </Row>
        </div>
      )
    }
    else
    {
      return null
    }
  }

  checkEscrowFormErrors()
  {
    if(this.state.createEscrowFormError)
    {
      return(
        <div>
          <div className="chart-wrapper mx-3" style={{ height: '40px' }}></div>
          <div className="alert alert-danger fade show" role="alert">Please fill out entire escrow form</div>
        </div>
      )
    }
  }

  async getParcels()
  {
    var tempParcels = null
    var tempLandArray = Array()
    var tempParcelsOnEscrow = Array()
    var tempParcelsOnEscrowCount = 0

    //marketplace data

    

    //0x00778a211057c47a9f8885750bbf48226771bcdc = 7 parcels, 5 on sale
    //0x658298dd322011ed389295a90fef5c8b29a6c42c = 16 parcels
    //0x09217b071268aa902f7287f78b16fe84cccbbc43 = 56 parcels
    //0xac097c7e31a2add6244a0f36dba5776d04f5a3fc = 845 parcels
    // = 233 parcels
    //0x2c57b0fe10caea40c94540e6384d32a2f31307ea - my real account


    //ipfs
    //

    /*
    
    this.setState({fetchedParcels:true})
    await fetch('https://api.decentraland.org/v1/addresses/0xac097c7e31a2add6244a0f36dba5776d04f5a3fc/parcels')

      .then(response => response.json())

      .then(function(data) {
        tempParcels = data.data
      console.log(tempParcels)
      })

      for(var i=0; i < tempParcels.length; i++)
        {
        tempLandArray.push({
          "id": i,
          "x": tempParcels[i].x,
          "y": tempParcels[i].y,
          "xy": tempParcels[i].x + "," +tempParcels[i].y,
          "style":"",
          "selectedPosition":0,
          "onSale": this.checkParcelOnSale(tempParcels[i]),
          "onEscrow":null
        })
         }

     console.log(tempLandArray)
    const pageNumbers = [];
    var to = 10
    if(Math.ceil(tempLandArray.length / this.state.parcelsPerPage) < 10)
    {
      to = Math.ceil(tempLandArray.length / this.state.parcelsPerPage)
    }
    for (let i = 1; i <= to; i++) {
      pageNumbers.push(i);
    }

    var pageNums = 0
    for (let i = 1; i <= Math.ceil(tempLandArray.length / this.state.parcelsPerPage); i++) {
      pageNums = pageNums + 1
    }
    
    this.setState({pageNumbersView: pageNumbers, pageNumbers:pageNums})
    if(tempLandArray.length > 8)
   {
     console.log('more than 8, only fetch first 8')
     this.fetchDisplayData(tempLandArray,0,8,1)
   }
   else
   {
     console.log('only less than 8')
     await this.fetchDisplayData(tempLandArray,0,tempLandArray.length,1)
   }
          
          */


    ////////////  test data  ///////////////////////////////-
    
    

      this.setState({fetchedParcels:true})

      //this.account = '0x658298dd322011ed389295a90fef5c8b29a6c42c'
    await this.LANDContract.methods.landOf(this.account).call(function(err,txHash){
      console.log("land:["+JSON.stringify(txHash)+ "]")
      tempParcels = txHash
    })

    console.log(tempParcelsOnEscrow)
 
    var tempDisplay = Array()
    for(var i = 0; i < tempParcels[0].length; i++)
    {
        var tags = null
        var road = null
        var district = null
        var plaza = null
        var title = null
        await fetch('https://api.decentraland.org/v1/parcels/'+tempParcels[0][i]+'/'+tempParcels[1][i])
        .then(response => response.json())
        .then(function(data)
        {
          console.log(data.data)
         if(data.data.tags)
         {
           tags = data.data.tags
         }
        })

        
        if(tags.proximity)
        {
          console.log(tags.proximity)
          if(tags.proximity.road)
          {
            road = tags.proximity.road.distance
            console.log(road)
          }
          if(tags.proximity.district)
          {
            district = tags.proximity.district.distance
            console.log(district)
          }
          if(tags.proximity.plaza)
          {
            plaza = tags.proximity.plaza.distance
            console.log(plaza)
          }

        }

       

        tempLandArray.push({
          "id": i,
          "x": tempParcels[0][i],
          "y": tempParcels[1][i],
          "xy": tempParcels[0][i] + "," +tempParcels[1][i],
          "style":"",
          "selectedPosition":0,
          "onSale":false,
          "onEscrow":false,
          "road":road,
          "district":district,
          "plaza":plaza
        })
    }
    console.log(tempLandArray)
    const pageNumbers = [];
    var to = 10
    if(Math.ceil(tempParcels[0].length / this.state.parcelsPerPage) < 10)
    {
      to = Math.ceil(tempParcels[0].length / this.state.parcelsPerPage)
    }
    for (let i = 1; i <= to; i++) {
      pageNumbers.push(i);
    }

    var pageNums = 0
    for (let i = 1; i <= Math.ceil(tempParcels[0].length / this.state.parcelsPerPage); i++) {
      pageNums = pageNums + 1
    }
    
    this.setState({pageNumbersView: pageNumbers, pageNumbers:pageNums})
    if(tempLandArray.length > 8)
   {
     console.log('more than 8, only fetch first 8')
     this.fetchDisplayData(tempLandArray,0,8,1)
   }
   else
   {
     console.log('only less than 8')
     await this.fetchDisplayData(tempLandArray,0,tempLandArray.length,1)
   }

    



    ///////////////////////////////////////////////////////////////////////
    
  }

  async fetchDisplayData(allParcelsArray, i, end, page)
  {
    var tempParcelsOnEscrowCount = 0
    var tempLandArray = allParcelsArray
    var tempParcelsOnEscrow = Array()
    

    await this.ESCROWContract.methods.getAllOwnedParcelsOnEscrow(this.account).call(function(err,result){
      tempParcelsOnEscrowCount = result
    })
    console.log(tempParcelsOnEscrowCount)

    for(var t = 0; t < tempParcelsOnEscrowCount;t++)
    {
      await this.ESCROWContract.methods.getParcelAssetIdOnEscrow(this.account, t).call(function(err,result){
        tempParcelsOnEscrow.push(result)
      })
    }
    

    //var counter = 0
    for(i; i < end; i++)
    {
        
        var tempAssetId = null
        await this.LANDContract.methods.encodeTokenId(allParcelsArray[i].x, allParcelsArray[i].y).call(function(err,assetId){
          tempAssetId = assetId
        })
        
        //var sale = await this.checkParcelOnSale(allParcelsArray[i])
        tempLandArray[i].id = tempAssetId
        tempLandArray[i].onSale = false
        tempLandArray[i].onEscrow = this.checkParcelIsOpenEscrow(tempParcelsOnEscrow,tempAssetId)

      }

      this.cacheLoaded[page] = true
      console.log(tempLandArray)
      this.setState({fetchedParcels:true, ownedParcelsArray:tempLandArray, loadingParcels:false,currentParcelPage: Number(page)})
  }


  async checkParcelOnSale(parcel)
  {
    var tempData = parcel
    
    var tempData = null
    await fetch('https://api.decentraland.org/v1/parcels/'+parcel.x+'/'+parcel.y)

      .then(response => response.json())

      .then(function(data) {
        tempData = data.data
      })
        
       console.log(parcel)
       console.log(tempData.publication)
    if(tempData.publication == null)
    {
      return false
    }
    if(tempData.publication.status == "open")
    {
      return true
    }
    else
      {
        return false
      }
   
  }

  checkParcelIsOpenEscrow(arr, val) 
  {

      return arr.some(function(arrVal) {
    
        return val === arrVal;
    
      });
  }

  componentDidUpdate()
  {
     //console.log("Render update")
     //console.log(this.state)
     if(this.state.isConnected && (!this.state.manaApproved || !this.state.landApproved))
     {
        return(<Redirect to="/settings"/>)
     }
     if(!this.state.fetchedParcels)
     {
       this.getParcels()
     }
  }

  toggleParcel(xy, id,onSale, onEscrow)
  {
    console.log(xy)
    if(!onSale && !onEscrow)
    {
    console.log(xy + ',' + id)
    const tempParcels = this.state.ownedParcelsArray
    var tempSelected = this.state.selectedParcels
    var counter = xy
    var parcelIndex = this.getIndex(xy, this.state.ownedParcelsArray, 'xy')

    if(tempParcels[parcelIndex].style == "")
    {
      tempParcels[parcelIndex].style = "card-highlight card"
      tempSelected.push(tempParcels[parcelIndex])
      console.log(tempSelected)
      console.log(tempParcels)
    }
    else
    {
      tempParcels[parcelIndex].style = ""
      var tempParcelIndex = this.getIndex(xy, tempSelected, 'xy')
      tempSelected.splice(tempParcelIndex, 1); 
     }
     console.log(tempSelected)
    this.setState({ownedParcelsArray: tempParcels, selectedParcels:tempSelected,createEscrowFormError:false})
    }
  }

  parcelSelected(xy, id, onSale, onEscrow)
  {
   this.toggleParcel(xy,id,onSale,onEscrow)
  }


  getAvailabilityCheck(parcel)
  {
    if(parcel.onSale)
    {
      if(parcel.onEscrow)
      {
        return(<div>
          <div align="left"><i className="fa fa-exclamation-circle red fa-lg mt-4" style={iconColor}></i>
          <a href={"https://market.decentraland.org/parcels/"+parcel.x+"/"+parcel.y+"/detail"} target="blank" className="display-6"> Cancel Marketplace Sale</a></div>
          <div align="left"><i className="fa fa-exclamation-circle red fa-lg mt-4" style={iconColor}></i>
          <span class="display-6" style={iconColor}> Parcel in Escrow</span></div>
          </div>
        )
      }
      else
      {
        return(<div>
          <div align="left"><i className="fa fa-exclamation-circle red fa-lg mt-4" style={iconColor}></i>
          <a href={"https://market.decentraland.org/parcels/"+parcel.x+"/"+parcel.y+"/detail"} target="blank" className="display-6"> Cancel Marketplace Sale</a></div>
          <div style={{ height: '15px' }}></div>
          </div>
        )
      }
    }
    else if(parcel.onEscrow)
    {
      return(<div>
        <div align="left"><i className="fa fa-exclamation-circle red fa-lg mt-4" style={iconColor}></i>
        <span className="display-6" style={iconColor}> Parcel in escrow</span></div>
        <div style={{ height: '15px' }}></div>
        </div>
      )
    }
    else{
      return(<div style={{ height: '35px' }}></div>)
    }
  }

  getNoEscrowOverlay(onSale, onEscrow)
  {
    return(null)
  }

  getParcelsDropdown()
  {
    const {ownedParcelsArray} = this.state
    return(
      ownedParcelsArray.map((data,i)  =>(
          <option value={data.xy} key={data.xy}>Parcel {data.x},{data.y}</option>
      ))
    )

  }
  
  getHighlight(distance, type)
  {

    if(distance != null)
    {
      var highlight = null
      if(distance == 1)
      {
        highlight = "" + distance + " Parcel away"
      }

      else if(distance == 0)
      {
        highlight = "Adjacent"
      }

      else
      {
        highlight = "" + distance + " Parcels away"
      }

      return(
        <Row>
          <Col lg="12">
          <div style={highlightWhite}>{type}: {highlight}</div>
          </Col>
        </Row>
      )
    }
  }

  getHighlights(data)
  {
    return(
      <div>
          {this.getHighlight(data.road, "Road")}
          {this.getHighlight(data.district, "District")}
          {this.getHighlight(data.plaza, "Plaza")}
      </div>
    )
  }

  getOwnedParcels()
  {
    if(this.state.loadingParcels)
    {
      return(
        <Col align="center">
        <div><img src={require("../../../assets/img/brand/transactionpending.gif")}/></div>
        <div><h4>Loading Parcels...</h4></div>

        </Col>
      )
    }
    else
    {
      const { ownedParcelsArray, currentParcelPage, parcelsPerPage } = this.state;

      var indexOfLastTodo = currentParcelPage * parcelsPerPage
      var indexOfFirstTodo = indexOfLastTodo - parcelsPerPage
      if(indexOfLastTodo > ownedParcelsArray.length)
      {
        indexOfLastTodo = ownedParcelsArray.length
        indexOfFirstTodo = ((currentParcelPage-1)*parcelsPerPage)
      }
      var currentTodos = ownedParcelsArray.slice(indexOfFirstTodo, indexOfLastTodo)
      console.log(indexOfFirstTodo)
          //this.setState({loadingParcels:false})
            return(
              currentTodos.map((data,i) => (
              <Col lg="6" sm="6" key={data.xy} onClick={() => this.parcelSelected(data.xy,data.id, data.onSale, data.onEscrow)}>
              {this.getNoEscrowOverlay(data.onSale, data.onEscrow)}
                <Card style={{background:"black"}}  className={data.style}>
                    <div><img src= 
                  {'https://api.decentraland.org/v1/parcels/'+data.x+'/'+data.y+'/map.png?height=200&width=300&size=10&publications=true'} style={{width:"100%"}}/></div>
                    <div style={{padding:"10px"}}><h5 style={h2color}>Parcel {data.x},{data.y} <small> <a href={"https://market.decentraland.org/parcels/"+data.x+"/"+data.y+"/detail"} target="blank">View</a></small></h5></div>
                    <div style={{padding:"10px"}}>{this.getHighlights(data)}</div>
                    <div style={{padding:"10px"}}>{this.getAvailabilityCheck(data)}</div>
                </Card>
              </Col>
            
            ))
            )
    }
  }

  getItemizedEscrow()
  {
    return(
      <table>
        <tbody>
      {this.state.selectedParcels.map((data,i) => (
        <tr key={data.id}>
          <td><h6 style={h2color}>Parcel {data.x},{data.y}</h6></td>
      </tr>      
      ))}
      </tbody>
      </table>
      )
  }
  
  componentDidMount()
  {
    this.loadWeb3Provder()
  }

  getLoadingView()
  {
    return(
      <div className="animated fadeIn">
      <div style={{ height: '25px' }}>
    </div>
      <Row>
      <Col xs="12" sm="12" lg="12">
      {this.state.loadingStatement}
      </Col>
      </Row>
      </div>
    )
  }

  getEscrowPendingView()
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

  getAccountsChangedView()
  {
    return(
      <div className="animated fadeIn">
      <div style={{ height: '25px' }}>
      </div>
      <Row>
      <Col xs="12" sm="12" lg="12" align="center">
      <h3 className="display-4">Your Metamask account changed, please refresh</h3>
      </Col>
      </Row>
      <div style={{ height: '25px' }}></div>
      </div>
      )
  }

  getEscrowSellerView()
  {    
    return(<div className="animated fadeIn">
  <div style={{ height: '25px' }}>
  </div>
  <Row>
  <Col xs="12" sm="12" lg="12" align="center">     
  <Card>
  <CardBody>
    <Row>
      <Col lg="12" align="center">
      <h3 className="display-4">You are the seller of this parcel</h3>
      <div className="chart-wrapper" style={{ height: '40px' }}></div>
      </Col>
    </Row>
  </CardBody>
  </Card>
  </Col>
  </Row>
  </div>)
  }

  getActivePage(num)
  {
    if(num == this.state.currentParcelPage)
    {
      return " active"
    }
  }
  
  getEscrowInstructions()
  {
    return(<div>
    <h1 className="display-4" style={h2color2}>Start Escrow</h1>
    <div className="chart-wrapper mx-3" style={{ height: '20px' }}></div>
          <p style={h2color2}>1) Your LAND tokens will remain in your wallet until a buyer accepts your escrow.</p>
          <p style={h2color2}>2) You will not be able to place these parcels in other escrows. DCL Escrow does not hold MANA or LAND on your behalf. The transfer will occur when a buyer accepts your escrow.</p>
          <div>
          <div className="chart-wrapper mx-3" style={{ height: '40px' }}></div>
      </div>
      </div>
    
    )
  }

  getEscrowForm()
  {
    return(
      <div>

                                <FormGroup>
                        <Row>
                          
                          <Col>
                          <div>
                              <Row>
                                <Col lg="6">
                                <h3 className="display-6" style={h2color2}>Escrow Price</h3>
                                </Col>
                                <Col lg="6">
                                <Input type="text" id="escrowPrice" onChange={this.updatePrice} placeholder="Enter escrow price in MANA"  required />
                                </Col>
                              </Row>
                              <div className="chart-wrapper mx-3" style={{ height: '40px' }}></div>
                              <Row>
                                <Col lg="6">
                                  <h4 className="display-6" style={h2color2}>Private Escrow?</h4>
                                </Col>
                                <Col lg="6">
                                <select name="select" id="select" className="form-control" onChange={this.handlePrivateEscrow}>
                                <option value="0">Please select</option>
                                <option value="1">Yes</option>
                                <option value="2">No</option>
                                </select>
                                </Col>
                              </Row>
                              <div className="chart-wrapper mx-3" style={{ height: '20px' }}></div>
                              {this.showPrivateEscrow()}
                              
                              {/*}
                              <Row>
                                <Col lg="6">
                                  <h4 className="display-6" style={h2color2}>Allow Offers?</h4>
                                </Col>
                                <Col lg="6">
                                <select name="select" id="select" className="form-control" onChange={this.handleAllowOffers}>
                                <option value="0">Please select</option>
                                <option value="1">Yes</option>
                                <option value="2">No</option>
                                </select>
                                </Col>
                              </Row>
    */}
                            </div> 
                                </Col>
                        </Row>
                        
                        </FormGroup>
                        <div className="chart-wrapper" style={{ height: '10px' }}></div>
      </div>
    )
  }

  checkWhitelist()
  {
    if(this.state.whitelisted)
    {
      return(
        <div style={h2color2italic}>Congrats! You're on the whitelist. You will never be charged for escrow fees.</div>
      )
    }
    else
    {
      return(
        <div style={h2color2italic}>*** Escrow fees are {this.web3.utils.fromWei(this.state.publicationFee,'ether')} MANA. You will be charged if your escrow gets completed.</div>
      )
    }
  }

  getEscrowSubtotal()
  {
    return(
      <div>
                               <Row>
                          <Col lg="12">
                          <h5 style={h2color2}>Itemized Escrow Statement</h5>
                          <ColoredLine color="black"/>
                         
                            {this.getItemizedEscrow()}
                          
                          <ColoredLine color="black"/>
                          <div><h6 style={h2color2}>Total Parcels: {this.state.selectedParcels.length}</h6></div>
                          <div><h6 style={h2color2}>Total Estates: 0 </h6></div>
                          <div><h4 style={h2color}>Escrow Total : <NumberFormat value={this.state.totalEscrowPrice} displayType={'text'} thousandSeparator={true} /> MANA</h4></div>
                          {this.checkWhitelist()}

                          </Col>
                        </Row>
                        <div className="chart-wrapper" style={{ height: '40px' }}></div>
                        <Row>
                          <Col lg="12">
                          {this.checkEscrowFormErrors()}

                         <button className="btn btn-primary btn-lg btn-block" onClick={this.createEscrow}>Open Escrow</button>
                         
                      </Col>
                        </Row>
      </div>
    )
  }

  getPreviousPageLink(pageNumbers)
  {
    if(pageNumbers > 9)
    {
      return(
          <PaginationLink previous onClick={this.handlePreviousLink} />       
      )
    }
    else
    {
      return(null)
    }
  }

  getNexPageLink(pageNumbers)
  {
    //console.log(pageNumbers)
    if(pageNumbers > 9)
    {
      return(
          <PaginationLink next onClick={this.handleNextLink}/>       
      )
    }
    else
    {
      return(null)
    }
  }


  getCreateEscrowView()
  {
    console.log('create escrow viwew')

        //console.log('page numbers' + pageNumbers)
        //console.log(this.cacheLoaded)

        const {pageNumbers} = this.state
        

    return(
      <div className="animated fadeIn">
        <div style={{ height: '25px' }}>
        </div>

        <Row>
          <Col lg="6">
          <Card className="text-white bg-gray-100">
            <CardBody className="pb-0">

            {this.getEscrowInstructions()}

            {this.getEscrowForm()}

            {this.getEscrowSubtotal()}

            </CardBody>
            <div className="chart-wrapper mx-3" style={{ height: '40px' }}></div>
            </Card>
          </Col>

          <Col lg="6">

          
        <Row>
          <Col lg="12">
            <h3 style={h2color2}>Your Parcels ({this.state.landOwned})</h3>
          </Col>
          <Col lg="12">
          <Pagination>
          <PaginationItem>
              {this.getPreviousPageLink(pageNumbers)}
          

        </PaginationItem>
          {this.state.pageNumbersView.map(number =>{

              var numPageRows = Math.ceil(pageNumbers.length / 7)
            
              
              if(number == this.state.currentParcelPage)
                {
                  return(
                    <PaginationItem key={number} active>
                    <PaginationLink tag="button"  id={number} onClick={this.handlePaginate}>
                    {number}
                    </PaginationLink>
                  </PaginationItem>)
                }
                else{
                  return(
                  <PaginationItem key={number}>
                  <PaginationLink tag="button"  id={number} onClick={this.handlePaginate}>
                  {number}
                  </PaginationLink>
                </PaginationItem>)
    
               }            
            
            })}
            {this.getNexPageLink(pageNumbers)}
           
           </Pagination>
            </Col>
            <Col lg="12">
            <FormGroup>
      <Input type="select" name="parcelDropdown" id="parcelDropdown" onChange={this.dropDownSelected}>
            {this.getParcelsDropdown()}
            </Input>
            </FormGroup>
          </Col>
            </Row>
            <Row>
              <Col lg="12">
              <ColoredLine color="black"/>

        </Col>
            </Row>
            <Row>
        <Col lg="12">
          <Row>
            {this.getOwnedParcels()}
          </Row>
        </Col>
        </Row>
          </Col>
        </Row>

        </div>
    )
  }

  getEscrowCreatedView()
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
            <h4 style={h2color2} className="display-4">Escrow Created!</h4></div>
            <div className="chart-wrapper" style={{ height: '40px' }}></div>
            <div className="display-5"><strong>Copy and paste the below Escrow ID so others can access the Escrow</strong></div>
            <div className="chart-wrapper" style={{ height: '20px' }}></div>
            <div className="display-6">{this.state.escrowID}</div>
            <div className="chart-wrapper" style={{ height: '40px' }}></div>
            <div className="display-6"><Link to={"/escrows/"+this.state.escrowID}><h6 className="display-6">View your escrow</h6></Link></div>
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

    if(this.state.escrowRedirect)
    {
      return(
        <Redirect to={"/escrows/"+this.state.escrowID}/>
      )
    }
   else if(this.state.accountsChanged)
    {
      return(<div>{this.getAccountsChangedView()}</div>)
    }
    else if(this.state.paused)
    {
      return(<div>{this.getPausedView()}</div>)
    }

    else if(!this.state.isConnected)
    {
      return(<div>{this.getLoadingView()}</div>)
    }

    else if(this.state.escrowCreated)
    {
      return(<div>{this.getEscrowCreatedView()}</div>)
    }

    else if(this.state.escrowTransactionStatus == "Pending")
    {
      return(<div>{this.getEscrowPendingView()}</div>)
    }
    
   else if(!this.state.manaApproved || !this.state.landApproved)
   {

     return (<Redirect to='/settings' />)
   }

   else if(this.state.redirect)
   {
    return (<Redirect to='/settings' />)
   }
   else if(this.state.parcelEscrow)
   {
     return(<div>{this.getEscrowSellerView()}</div>)
   }
   else
   {
     return(<div>{this.getCreateEscrowView()}</div>)
   }
  }
}

export default Createescrow;
