var w3=null;
var contractcrowd=null;
var contractwop=null;

var wether=null;
var wbnb=null;
var contrethercrowd=null;
var contrbnbcrowd=null;
var contrbnbwop=null;


window.addEventListener('load', async () => {
    console.log("begin load");


    if (window.web3) {
        wether = new Web3(new Web3.providers.HttpProvider(etherurl));
        wbnb = new Web3(new Web3.providers.HttpProvider(bnburl));
    
    }else {// No web3 provider
        console.log('No web3 besu provider detected');
        alert('No besu web3 provider detected');
        rerturn;
    }

    contrethercrowd =new wether.eth.Contract(abiCrowdsaleEth, addresscrowd);
    contrethercrowd.defaultAccount = accether;
  
    contrbnbcrowd =new wbnb.eth.Contract(abiCrowdsale, addresscrowdbnb);
    contrbnbcrowd.defaultAccount = accbnb;

    contrbnbwop =new wbnb.eth.Contract(abiWOP, addresswopbnb);
    contrbnbwop.defaultAccount = accbnb;
    
    

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

            //console.log("IDs:",chainIDbesu,chainIDpublic,chainIDbnb);
        
            switch(chainid){
                
              case Number(chainIDpublic):
                //contractwop =new web3.eth.Contract(abiWOP, addresswopbnb);
                contractwop =contrbnbwop;
                contractcrowd=new web3.eth.Contract(abiCrowdsaleEth, addresscrowd);

                getbalancebnb( addressprovbnb ,(bal)=>{
                  console.log("getbalancebnb: " ,bal);
                  if(Number(bal)<30000){
                    showerror("ERROR no BNBs funds from provider!");
                    console.log("getbalancebnb ERROR no BNBs funds from provider!");        
                    $( "#bbuywop" ).hide();
                  }
                });

                getBNBbalanceof(addressprovbnb ,(bal)=>{
                    getMyRate(contractcrowd ,(rate)=>{
                        console.log("getBNBbalanceof getMyRate: ",rate ,bal);        
                        if(Number(rate) > Number(bal) ){
                            showerror("ERROR no WOOPs funds from provider!");
                            console.log("getBNBbalanceof getMyRate ERROR no WOOPs funds from provider!");        
                            $( "#bbuywop" ).hide();
                        }
                    });
                });

                break;
                                
              case Number(chainIDbnb):
                //console.log("Cahin ID BNB");
                contractwop =new web3.eth.Contract(abiWOP, addresswopbnb);
                contractcrowd=new web3.eth.Contract(abiCrowdsale, addresscrowdbnb);
                break;
          
              default:      
                console.error("chainID unknown",chainid);
                showerror("chainID unknown "+chainid);
                $( "#bbuywop" ).hide();
                return;
              }
        
              setContext(changeContext);
    });//setContent



    window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        console.log("accountsChanged:",accounts);
        $( "#refreshall" ).trigger('click');
      })
      
      window.ethereum.on('networkChanged', function (networkId) {
        // Time to reload your interface with the new networkId
        console.log("networkChanged:",networkId);
        //$( "#refreshall" ).trigger('click');
        location.reload();
      })
    

});//    addEventListener('load'


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
        e.preventDefault();
        showerror("");
        var weis=$('#buycostether').val();
        if(Number(weis)<=0 ){
          showerror("Invalid wei value!");
          return;
        }

        weis=web3.utils.toWei($('#buycostether').val() , $('#unitcmb option').filter(':selected').val()) ;

        //var totalwei=$('#buyetherbalance').text();
  
        getTokenAmount(weis,'#buycostwop',null,showerror,null);
        return false;
    });



    $( "#bbuywop" ).click(function(e) {
        e.preventDefault();
        showerror("");
        var weis=$('#buycostether').val();

        if(Number(weis)<=0 ){
          showerror("Invalid wei value!");
          return;
        }

        weis=web3.utils.toWei($('#buycostether').val() , $('#unitcmb option').filter(':selected').val()) ;


        var totalwei=$('#buyetherbalance').text();
        var acc=$('#buyaccount').text();

        /*
        if(Number(weis)<1 || Number(weis)>Number(totalwei)){
          showerror("Invalid wei value!");
          return;
        }
        */
       if(Number(weis)>Number(totalwei)){
          showerror("You don't have enough funds to spend: "+web3.utils.fromWei(weis, 'ether')+", "+web3.utils.fromWei(totalwei, 'ether')+" available.");
          return;
        }



        contractcrowd.methods.getTokenAmount(weis).call().then( ( info )=> {
          console.log("bbuywop getTokenAmount: ", info);

          getTokenAmount(weis,'#buycostwop',acc,showerror,processBuyWOP);

        }).catch( (error)=>{
            console.log("bbuywop getTokenAmount error: ", error);    
            showerror("getTokenAmount error ");
        });
      
      return false;
    });
    
  



});//    addEventListener("DOMContentLoaded"    

















//************************************************************************************* */



var GL_symbol="";

function setNetlogo(chainID){
  var nl=$("#netlabel");
  var ni=$("#netlogo");
  nl.text("");

  nl.hide();
  ni.hide();

  switch(chainID){

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



function changeContext(chainID){
    web3.eth.getAccounts((err, res) => {
        if(contractwop) contractwop.defaultAccount = res[0];

        switch(chainID){
            //      case Number(chainIDbesu): //besu 2018
                    //cargarGrilla(true);
            //        break;
            default://public network
            buyWOP(res[0]);
        }
            

    });//getaccounts
  
    setNetlogo(chainID);
    $('#ethervalue').text(GL_symbol);
  }//
  

function setContext(fcontext){
    w3.eth.net.getId().then( ( info )=> {
    fcontext(info);
  
      
    }).catch( (error)=>{
        console.log("getId error: ", error);    
    });
}//




function processBuyWOP(wei,account,fERROR,fOK){

    
    showinfo('Transacction has sended OK waiting for metamask confirm hash received');
    setWaiting($("#divinfo"));
  
    contractcrowd.methods.buyMyTokens().send( {from: account, gas: 3000000, value: wei}).then( function(tx) {
      console.log("Transaction buyMyTokens: ", tx);
      if(fOK){
        fOK(tx);
      }
  
    }).catch( (error)=>{
      console.log("buyMyTokens error: ", error);    
      if(fERROR) fERROR("Error call: "+error.message);
  
    });
}//
  
  

function getTokenAmount(wei,idinput,account,fshowerror,fprocessBuyWOP){
    $(idinput).val("0");
    contractcrowd.methods.getTokenAmount(wei).call().then( ( info )=> {
        console.log("getTokenAmount: ", info);

        var tks=web3.utils.fromWei(info, 'ether');
        $(idinput).val(tks);

        getBNBbalanceof(addressprovbnb ,(bal)=>{
          getbalancebnb( addressprovbnb ,(bnb)=>{
            console.log("getTokenAmount getBNBbalanceof : ",info ,bal);        
            if( (Number(info) > Number(bal) || Number(bnb)<30000 ) && GL_symbol=="ETH" ){
                showerror("ERROR no WOOPs funds or BNBs from provider!");
                console.log("getTokenAmount getBNBbalanceof  ERROR no WOOPs funds/bnb from provider!");        
                $( "#bbuywop" ).hide();
                return;
            }

            if(fprocessBuyWOP){
          
                fprocessBuyWOP(wei,account,showerror,function(res){
    
                    setTimeout( ()=>{
                        setWaiting($("#divinfo"),false);
                        $( "#refreshall" ).trigger('click');
                        showinfo("OK: "+res.blockHash);
                    },500);
                    
                });
            }//if(fprocessBuyWOP
          });//getbalancebnb
        });//getBNBbalanceof

  
  
  
    }).catch( (error)=>{
        console.log("getTokenAmount error: ", error);    
        if(fshowerror){
          fshowerror("getTokenAmount error ");
        }
  
    });
  
}//
  
  

function buyWOP(acc){
    $('#buyaccount').text(acc);
    $('#buyaccountm').text(acc);

    getbalance(w3, acc ,$('#buyetherbalance')[0],(bal)=>{
      $('#buyetherbalancem').html("<h6>"+web3.utils.fromWei(bal )+" "+GL_symbol+"</h6><small class=\"text-muted\"><i>("+bal+" wei)</i></small>");
    });


    getbalanceof(contractwop,acc ,$('#buywopbalance')[0],(bal)=>{
      $('#buywopbalancem').html("<h6>"+web3.utils.fromWei(bal )+" WOOP</h6><small class=\"text-muted\"><i>("+bal+" wei unit)</i></small>");
    });



    getRate($('#buywoprate')[0]);
    getRate($('#buywopratem')[0]);

    $('#buycostether').val("");
    $('#buycostwop').val("0");

    showerror("");
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


function getbalancebnb( account ,fOK=null) {
    wbnb.eth.getBalance(account, function(err, result) {
        if (err) {
            console.log("getbalancebnb ERROR",err);
            return;
        } 
        if(fOK){
            fOK(result);
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

    });
}//


function getBNBbalanceof(account ,fOK=null) {
    contrbnbwop.methods.balanceOf(account).call().then( ( info )=> {
      //console.log("getbalance: ", info);
      if(fOK){
        fOK(info);
      }
    }).catch( (error)=>{
        console.log("getBNBbalanceof error: ", error);    
        showerror("Error getBNBbalanceof : Contract not exist in this network! ");

    });
}//



  
function getMyRate(contract ,fOK) {
  
    contract.methods.rate().call().then( ( info )=> {
      if(fOK){
        fOK(info);
      }
    }).catch( (error)=>{
        console.log("getMyRate error: ", error);    
        showerror("Error getMyRate : Contract not exist in this network! ");

    });
}//
  
  



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
  




function setWaiting($parent,on=true){
if(on){
    $parent.prepend('<span class="spinner-border spinner-border-sm" id="waiting"></span>');
    return;
}

$("#waiting").remove();

}//



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
  
  