

var w3=null;
var wbesu=null;
var contractcrowd=null;
var contractwop=null;
var contractwwop=null;
var contractwwop2=null;


var wether=null;
var wbnb=null;

var contrethercrowd=null;
var contrbnbcrowd=null;

window.addEventListener('load', async () => {
    console.log("begin load");

  if (window.web3) {

      wbesu = new Web3(new Web3.providers.HttpProvider(besuurl));
      wether = new Web3(new Web3.providers.HttpProvider(etherurl));
      wbnb = new Web3(new Web3.providers.HttpProvider(bnburl));
  
  }else {// No web3 provider
      console.log('No web3 besu provider detected');
      alert('No besu web3 provider detected');
      rerturn;
  }
    
  contractwwop =new wbesu.eth.Contract(abiwwop, addresswwop);
  contractwwop.defaultAccount = accbesu;

  contrethercrowd =new wether.eth.Contract(abiCrowdsale, addresscrowd);
  contrethercrowd.defaultAccount = accether;

  contrbnbcrowd =new wbnb.eth.Contract(abiCrowdsale, addresscrowdbnb);
  contrbnbcrowd.defaultAccount = accbnb;
  



  // New web3 provider
  if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      w3 = new Web3(ethereum);
      try {
          // ask user for permission
          console.log('ask user for permission');
          try {
            // Request account access if needed
            await ethereum.enable();
            // Acccounts now exposed
           // return web3;
          } catch (error) {
            console.error(error);
          }

          
          // user approved permission
          console.log('user approved permission');
      } catch (error) {
          // user rejected permission
          alert('user rejected permission');
      }
  }
  // Old web3 provider
  else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      w3 = new Web3(web3.currentProvider);
      // no need to ask for permission
      alert('no need to ask for permission');
  }
  // No web3 provider
  else {
      alert('No web3 provider detected');
      return;
  }

  setContext((chainid)=>{

//    console.log("Chain ID:",chainid);

    //console.log("IDs:",chainIDbesu,chainIDpublic,chainIDbnb);

    contractwwop2 =new web3.eth.Contract(abiwwop, addresswwop);

    switch(chainid){
      case Number(chainIDpublic):
        contractwop =new web3.eth.Contract(abiWOP, addresswop);
        contractcrowd=new web3.eth.Contract(abiCrowdsale, addresscrowd);
        break;
      case Number(chainIDbnb):
        //console.log("Cahin ID BNB");
        contractwop =new web3.eth.Contract(abiWOP, addresswopbnb);
        contractcrowd=new web3.eth.Contract(abiCrowdsale, addresscrowdbnb);
        break;
      case Number(chainIDbesu):
    //    contractwop =new web3.eth.Contract(abiWOP, addresswop);
    //    contractcrowd=new web3.eth.Contract(abiCrowdsale, addresscrowd);
        break;
  
      default:      
        console.error("chainID unknown",chainid);
        showerror("chainID unknown "+chainid);
        return;
      }

      setContext(changeContext);
  });

  

  
  
  window.ethereum.on('accountsChanged', function (accounts) {
    // Time to reload your interface with accounts[0]!
    console.log("accountsChanged:",accounts);
    $( "#refreshall" ).trigger('click');
  })
  
  window.ethereum.on('networkChanged', function (networkId) {
    // Time to reload your interface with the new networkId
    console.log("networkChanged:",networkId);
  })

  

});




document.addEventListener("DOMContentLoaded", function(){
    console.log("DOMContentLoaded");

    $('.alert').on('close.bs.alert', function (e) {
      e.preventDefault();
      $(this).hide();

  });    

    $( "#refreshall" ).click(function(e) {

        e.preventDefault();
        setContext(changeContext);
        return false;
      });
    
    $( "#bcalculatewop" ).click(function(e) {
      showbuyerror("");
      var weis=$('#buycostether').val();
      var totalwei=$('#buyetherbalance').text();

      if(Number(weis)<1 || Number(weis)>Number(totalwei)){
        showbuyerror("invalid wei value!");
        return;
      }
      getTokenAmount(weis,'#buycostwop',null,showbuyerror,null);
      return false;
    });

    
    $( "#bbuywop" ).click(function(e) {
        showbuyerror("");
        var weis=$('#buycostether').val();
        var totalwei=$('#buyetherbalance').text();
        var acc=$('#buyaccount').text();

        if(Number(weis)<1 || Number(weis)>Number(totalwei)){
          showbuyerror("invalid wei value!");
          return;
        }



        contractcrowd.methods.getTokenAmount(weis).call().then( ( info )=> {
          console.log("bbuywop getTokenAmount: ", info);

          getTokenAmount(weis,'#buycostwop',acc,showbuyerror,processBuyWOP);

        }).catch( (error)=>{
            console.log("bbuywop getTokenAmount error: ", error);    
              showbuyerror("getTokenAmount error ");
        });
      
      return false;
    });








    $( "#bcalculatewei" ).click(function(e) {

      
      showsellerror("");
      var wops=$('#sellcostether').val();
      var totalwops=$('#sellwopbalance').text();
      var rate=$('#sellwoprate').text();

      if(Number(wops)<Number(rate) || Number(wops)>Number(totalwops)){
        showsellerror("invalid wop value!");
        return;
      }
      getWeiAmount(wops,'#sellcostwop',null,showsellerror,null);
      return false;
    });

    



    $( "#bsellwop" ).click(function(e) {
        showsellerror("");

        var sym=$('#selletherbalance')[0].innerHTML;

        var acc=$('#sellaccount').text();
        var wops=$('#sellcostether').val();
        var totalwops=$('#sellwopbalance').text();
        if(Number(wops)<1 || Number(wops)>Number(totalwops)){
              showsellerror("invalid wop value!");
              return;
        }


        setContext((chainID)=>{

            switch(chainID){
              case Number(chainIDbesu): //besu 2018
                  showinfo("Transaction has sended OK waiting for metamask confirm hash received");
                  $('#bsellwop').hide();
                  switch(sym){
                    case 'ETH':
                      getMyRate(contrethercrowd ,(rate)=>{
                        getMyCoins(contrethercrowd ,(bal)=>{

                          if( Number(wops)/Number(rate) > Number(bal) ){
                            console.log("ERROR exchangeForEthUser : No funds in ethers! withdraw: "+ (Number(wops)/Number(rate)) +" funds: "+bal  );    
                            showsellerror("ERROR exchangeForEthUser : No funds in ethers! withdraw: "+ (Number(wops)/Number(rate)) +" funds: "+bal);
                            return;
                          }

                          contractwwop2.methods.exchangeForEthUser(wops).send( {from: acc}).then( function(tx) {
                              console.log("Transaction exchangeForEthUser: ", tx);
                              $('#modalsell').modal('hide');
                              cargarGrilla(true);
                              setTimeout( ()=>{showinfo("OK: "+tx.blockHash);},1000);
                          }).catch( (error)=>{
                              console.log("exchangeForEthUser error: ", error);    
                              showsellerror("Error exchangeForEthUser wWOOP: "+error.code+" "+error.message);
                          });//exchangeForEthUser
                        });//getMyCoins
                      });//rate
                      break;

                    case 'BNB':
                      getMyRate(contrbnbcrowd ,(rate)=>{
                        getMyCoins(contrbnbcrowd ,(bal)=>{

                          if( Number(wops)/Number(rate) > Number(bal) ){
                            console.log("ERROR exchangeForBNBUser : No funds in bnb! withdraw: "+ (Number(wops)/Number(rate)) +" funds: "+bal  );    
                            showsellerror("ERROR exchangeForBNBUser : No funds in bnb! withdraw: "+ (Number(wops)/Number(rate)) +" funds: "+bal);
                            return;
                          }

                          contractwwop2.methods.exchangeForBNBUser(wops).send( {from: acc}).then( function(tx) {
                            console.log("Transaction exchangeForBNBUser: ", tx);
                            $('#modalsell').modal('hide');
                            cargarGrilla(true);
                            setTimeout( ()=>{showinfo("OK: "+tx.blockHash);},1000);
                          }).catch( (error)=>{
                              console.log("exchangeForBNBUser error: ", error);    
                              showsellerror("Error exchangeForBNBUser wWOOP: "+error.code+" "+error.message);
                          });//exchangeForBNBUser
                        });//getMyCoins
                      });//rate
                      break;
  
                  }//switch sym

                  return false;
              default://public network

                  getWeiAmount(wops,'#sellcostwop',acc,showsellerror,processSellWOP);
                  return false;
        
            }//switch
        });//setContext
    });//bselwop.click


    



  })//DOMContentLoaded


console.log ("public Current provider=>",window.web3.currentProvider);







//**********************************************functions  */

var GL_symbol="";

function setNetlogo(chainID){
  var nl=$("#netlabel");
  var ni=$("#netlogo");
  nl.text("");

  nl.hide();
  ni.hide();

  switch(chainID){
    case Number(chainIDbesu): //besu 2018
    GL_symbol="WOOP";
      nl.text("Woonkly Blockchain detected!");
      //ni.attr('src', "/img/besubanner.png");
      ni.attr('src', "/img/woonkly.jpg");
      nl.show();
      ni.show();
      break;

    case Number(chainIDpublic): 
    GL_symbol="ETH";
      nl.text("Ropsten ethereum detected!");
      ni.attr('src', "/img/etherbanner.png");
      nl.show();
      ni.show();
      break;

    case Number(chainIDbnb): 
    GL_symbol="BNB";
      nl.text("Binance testnet detected!");
      ni.attr('src', "/img/binancebanner.png");
      nl.show();
      ni.show();
      break;

    default:
      nl.text("Unknown network!");
      nl.show();
  }//switch
}//


function callApiRest(url,fOK,fERROR, post=null, type="GET") {
  var config=null;
  if(post){
       config={
        url: url,
        type: type,
        data:post,
        dataType:"json",
        success: function(result, status, xhr) {
          fOK(result, status, xhr);
        },
        error: function(xhr, status, error) {
            fERROR(xhr);
        }      
      };

  }else{
      config={
        url: url,
        type: type,
        dataType:"json",
        success: function(result, status, xhr) {
          fOK(result, status, xhr);
        },
        error: function(xhr, status, error) {
            fERROR(xhr);
        }      
      };
  }


  return $.ajax(config);
}

function changeContext(chainID){
  switch(chainID){
    case Number(chainIDbesu): //besu 2018
      cargarGrilla(true);
      break;
    default://public network
      cargarGrilla();
  }

  setNetlogo(chainID);
}//



function setContext(fcontext){
  w3.eth.net.getId().then( ( info )=> {
//    console.log("getId: ", info);
  fcontext(info);

    
  }).catch( (error)=>{
      console.log("getId error: ", error);    
  });

}













function processSellWOP(wop,account,fERROR,fOK){
  $('#modalsell').modal('hide');
  showinfo("Transacction has sended OK waiting for metamask confirm hash received");
  contractcrowd.methods.sellTokens(wop).send( {from: account, gas: 3000000}).then( function(tx) {
    console.log("Transaction sellTokens: ", tx);
    if(fOK){
      fOK(tx);
    }

  }).catch( (error)=>{
    console.log("sellTokens error: ", error);    
    if(fERROR) fERROR("Error call: "+error.message);

  });
}




function getWeiAmount(wop,idinput,account,fshowerror,fprocessSellWOP){
  $(idinput).val("0");
  contractcrowd.methods.getWeiAmount(wop).call().then( ( info )=> {
    console.log("getWeiAmount: ", info);
    $(idinput).val(info);

    if(fprocessSellWOP){
        
      fprocessSellWOP(wop,account,showerror,function(res){
        cargarGrilla();
        setTimeout( ()=>{showinfo("OK: "+res.blockHash);},1000);
      });
    }


  }).catch( (error)=>{
      console.log("getWeiAmount error: ", error);    
      if(fshowerror){
        fshowerror("getWeiAmount error ");
      }

  });

}//











function processBuyWOP(wei,account,fERROR,fOK){
  $('#modalbuy').modal('hide');
  showinfo("Transacction has sended OK waiting for metamask confirm hash received");
/*
  callApiRest("/apirest/pe",
  data=>console.log("callApiRest(/apirest/pe) OK",data),
  error=>console.log("callApiRest(/apirest/pe) ERROR",error)
  );
*/

  contractcrowd.methods.buyMyTokens().send( {from: account, gas: 3000000, value: wei}).then( function(tx) {
    console.log("Transaction buyMyTokens: ", tx);
    if(fOK){
      fOK(tx);
    }

  }).catch( (error)=>{
    console.log("buyMyTokens error: ", error);    
    if(fERROR) fERROR("Error call: "+error.message);

  });
}






function getTokenAmount(wei,idinput,account,fshowerror,fprocessBuyWOP){
  $(idinput).val("0");
  contractcrowd.methods.getTokenAmount(wei).call().then( ( info )=> {
    console.log("getTokenAmount: ", info);
    $(idinput).val(info);

    if(fprocessBuyWOP){
        
      fprocessBuyWOP(wei,account,showerror,function(res){
        //cargarGrilla();
        setTimeout( ()=>{
          cargarGrilla();
          setTimeout( ()=>{showinfo("OK: "+res.blockHash);},1000);
        },1500);
        
      });
    }


  }).catch( (error)=>{
      console.log("getTokenAmount error: ", error);    
      if(fshowerror){
        fshowerror("getTokenAmount error ");
      }

  });

}//





async function getbalance(blc, account ,element,fOK=null) {
  element.innerHTML ="...";
  element.innerHTML = await blc.eth.getBalance(account);


  blc.eth.getBalance(account, function(err, result) {
    if (err) {
      console.log("getBalance ERROR",err);
    } else {
      //console.log(web3.utils.fromWei(result, "ether") + " ETH")
      if(fOK){
        fOK(result);
      }
    }
  }); 
}//

function getbalanceof(contract,account ,element,fOK=null) {

  element.innerHTML ="...";
  contract.methods.balanceOf(account).call().then( ( info )=> {
    //console.log("getbalance: ", info);
    element.innerHTML = info;
    if(fOK){
      fOK(info);
    }
  }).catch( (error)=>{
      console.log("getbalance error: ", error);    
      element.innerHTML = "Error ";  
      showerror("Error balanceOf : Contract not exist in this network! ");
      viewActions(false);
  });
}



function getMyCoins(contract ,fOK) {

  contract.methods.getMyether().call().then( ( info )=> {
    if(fOK){
      fOK(info);
    }
  }).catch( (error)=>{
      console.log("getMyCoins error: ", error);    
      showerror("Error getMyCoins : Contract not exist in this network! ");
      viewActions(false);
  });
}


function getMyRate(contract ,fOK) {

  contract.methods.rate().call().then( ( info )=> {
    if(fOK){
      fOK(info);
    }
  }).catch( (error)=>{
      console.log("getMyRate error: ", error);    
      showerror("Error getMyRate : Contract not exist in this network! ");
      viewActions(false);
  });
}




function getRate(element) {

  element.innerHTML ="...";
  contractcrowd.methods.rate().call().then( ( info )=> {
    console.log("rate: ", info);
    element.innerHTML = info;
  }).catch( (error)=>{
      console.log("rate error: ", error);    
      element.innerHTML = "Error ";  
      showerror("Error getRate : "+error);
  });
}



function sellWOP(acc){

  $('#sellaccount').text(acc);
  getbalance(w3, acc ,$('#selletherbalance')[0]);
  getbalanceof(contractwop,acc ,$('#sellwopbalance')[0]);
  getRate($('#sellwoprate')[0]);

  $('#sellcostether').val("");
  $('#sellcostwop').val("0");

  showsellerror("");

  $('#modalsell').modal('show');
}


function retirewWOP(acc,esBNB=false){

  var sym=esBNB ? 'BNB' : 'ETH';

  $('#sellaccount').text(acc);

  $('#selletherbalance')[0].innerHTML=sym;
  getbalanceof(contractwwop,acc ,$('#sellwopbalance')[0]);
  $('#modalselllabel').text("Withdraw wWOOP to "+sym);
  $('#sellwoprate')[0].innerHTML="N/A";

  $('#modalsell > div > div > div.modal-body > form > h5').text("Set wWOOP amount");

  $('#modalsell > div > div > div.modal-body > form > div.table-responsive > table > tbody > tr:nth-child(1) > th').text("Enter wWOOP amount:");
  $('#modalsell > div > div > div.modal-body > form > div.table-responsive > table > tbody > tr:nth-child(2) > th').text("");
  $('#sellcostether').val("");
  $('#sellcostwop').hide();

  $('#bsellwop').show();
  $('#bsellwop').text("Withdraw");

  $('#bcalculatewei').hide();
  showsellerror("");

  $('#modalsell').modal('show');
}







function buyWOP(acc){
    $('#buyaccount').text(acc);
    $('#buyaccountm').text(acc);

    //getbalance(w3, acc ,$('#buyetherbalance')[0] );
    getbalance(w3, acc ,$('#buyetherbalance')[0],(bal)=>{
      $('#buyetherbalancem').html("<h6>"+web3.utils.fromWei(bal )+" "+GL_symbol+"</h6><small class=\"text-muted\"><i>("+bal+")</i></small>");
    });


    //getbalanceof(contractwop,acc ,$('#buywopbalance')[0]);
    getbalanceof(contractwwop,acc ,$('#buywopbalance')[0],(bal)=>{
      $('#buywopbalancem').html("<h6>"+web3.utils.fromWei(bal )+" wWOOP</h6><small class=\"text-muted\"><i>("+bal+")</i></small>");
    });



    getRate($('#buywoprate')[0]);
    getRate($('#buywopratem')[0]);

    $('#buycostether').val("");
    $('#buycostwop').val("0");

    showbuyerror("");

    $('#modalbuy').modal('show');


}//




function rmFilasGrilla(){
  $('#taccounts tbody tr').each(function() {
          if (!this.rowIndex) return; 
          this.remove();
 });
}//



function cargarGrilla(esPrivate=false){
  showerror("");
  showinfo("");
  rmFilasGrilla();



  web3.eth.getAccounts((err, res) => {                   

    if(contractwop) contractwop.defaultAccount = res[0];
    for(var i=0;i<res.length;i++){
      addfila( i+1, res[i],"","","",esPrivate);
    }

    $("#taccounts > thead > tr > th:nth-child(5)").hide();
    $("#taccounts > tbody > tr > td:nth-child(5)").hide();
  
    $("#taccounts > thead > tr > th:nth-child(2)").hide();
    $("#taccounts > tbody > tr > td:nth-child(2)").hide();
    

    $('#taccounts tbody tr').each(function() {
      if (!this.rowIndex) return; // skip first row    
      var acc=this.cells[2].innerHTML;//1

      if(esPrivate){
        this.cells[3].innerHTML="N/A";//2
        this.cells[4].innerHTML="N/A";//3
        //getbalanceof(contractwwop,acc ,this.cells[5]);//4
        getbalanceof(contractwwop,acc ,this.cells[5],(bal)=>{
          this.cells[5].innerHTML="<h6>"+web3.utils.fromWei(bal )+" wWOOPs</h6><small class=\"text-muted\"><i>("+bal+")</i></small>";
        });//2


      }else{
        getbalance(w3, acc ,this.cells[3],(bal)=>{
          this.cells[3].innerHTML="<h6>"+web3.utils.fromWei(bal )+" "+GL_symbol+"</h6><small class=\"text-muted\"><i>("+bal+")</i></small>";
        });//2
        getbalanceof(contractwop,acc ,this.cells[4],(bal)=>{
          //this.cells[4].innerHTML=web3.utils.fromWei(bal );
          this.cells[4].innerHTML="<h6>"+web3.utils.fromWei(bal )+" wWOOPs</h6><small class=\"text-muted\"><i>("+bal+")</i></small>";
        });//3
        //getbalanceof(contractwwop,acc ,this.cells[5]);//4
        getbalanceof(contractwwop,acc ,this.cells[5],(bal)=>{
          this.cells[5].innerHTML="<h6>"+web3.utils.fromWei(bal )+" wWOOPs</h6><small class=\"text-muted\"><i>("+bal+")</i></small>";
        });//2



        
      }

  });               
      if(esPrivate){
        showinfo("Metamask connected successfully!");    // (Besu (private network) hyperledger detected)
        
      }else{
        showinfo("Metamask connected successfully!");    // (Ethereum network detected)
      } 
    
  });
  

}







function addfila(id, account,ether,wop,wwop,esPrivate=false){

  if(!esPrivate){
    var buttons='<a class="btn btn-success buywop" href="#" title="Buy WOOPs"><i class="fa fa-money" aria-hidden="true"></i> Buy WOOPS</a>';
   // buttons+='<a class="btn btn-link sellwop" href="#" title="Sell WOPs"><i class="fa fa-external-link" aria-hidden="true"></i></a>';
  }else{
    var buttons='<a class="btn btn-success sellwopeth" href="#" title="WOOPs to eth"><i class="fa fa-external-link" aria-hidden="true"></i> Exchange to ETH </a>';
     buttons+='<br><br><a class="btn btn-success sellwopbnb" href="#" title="WOOPs to bnb"><i class="fa fa-external-link" aria-hidden="true"></i> Exchange to BNB </a>';
  }


    var html = '<tr>'
    //html+='<td></td>';
    html+='<td nowrap="nowrap">'+buttons+'</td>';       
    html+='<td style="text-align: center;">'+id+'</td>';              
    html+='<td style="text-align: left;">'+account+'</td>';       
    html+='<td style="text-align: center;">'+ether+'</td>';              
    html+='<td style="text-align: center;">'+wop+'</td>';              
    html+='<td style="text-align: center;">'+wwop+'</td>';              
    

   // html+='<input type="hidden"  value="'+cb+'">';
    html+='</tr>';       
    $('#taccounts tbody').append(html);

    if(!esPrivate){
              $("#taccounts .buywop").on("click",function() {

                $(this).closest('tr').find('td').each(
                  function (i) {
                      if(i==2) {//1
                        acc=$(this).text();
                        buyWOP(acc);  
                        return false;
                      }

                  });

                return false;
          });

      
    }else{

        $("#taccounts .sellwopeth").on("click",function() {

          $(this).closest('tr').find('td').each(
            function (i) {
                if(i==2) {//1
                  acc=$(this).text();
                  retirewWOP(acc);  
                  return false;
                }

            });
          return false;
        });

        $("#taccounts .sellwopbnb").on("click",function() {

          $(this).closest('tr').find('td').each(
            function (i) {
                if(i==2) {//1
                  acc=$(this).text();
                  retirewWOP(acc,true);  
                  return false;
                }

            });
          return false;
        });



    }



    
}//

function viewActions(view){
  if(view){
    $("#taccounts .buywop").show();
    $("#taccounts .sellwop").show();
  }else{
    $("#taccounts .buywop").hide();
    $("#taccounts .sellwop").hide();
  }
}


function showinfo(msg){
  if(msg!=""){
    $('#divinfo').show();
    $('#infomsg').text(msg);

  }else{
    $('#divinfo').hide();
    $('#infomsg').text("");
  }

}



function showerror(msg){
  if(msg!=""){
    $('#diverror').show();
    $('#errormsg').text(msg);

  }else{
    $('#diverror').hide();
    $('#errormsg').text("");
  }

}

function showbuyerror(msg){
  if(msg!=""){
    $('#divbuyerror').show();
    $('#errorbuymsg').text(msg);

  }else{
    $('#divbuyerror').hide();
    $('#errorbuymsg').text("");
  }

}

function showsellerror(msg){
  if(msg!=""){
    $('#divsellerror').show();
    $('#errorsellmsg').text(msg);

  }else{
    $('#divsellerror').hide();
    $('#errorsellmsg').text("");
  }

}
