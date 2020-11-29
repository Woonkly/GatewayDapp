

var w3=null;
var wbesu=null;
var contractcrowd=null;
var contractwop=null;
var contractwwop=null;
var contractwwop2=null;

window.addEventListener('load', async () => {
    console.log("begin load");

  if (window.web3) {

      wbesu = new Web3(new Web3.providers.HttpProvider(besuurl));
  
  }else {// No web3 provider
      console.log('No web3 besu provider detected');
      alert('No besu web3 provider detected');
      rerturn;
  }
    
  contractwwop =new wbesu.eth.Contract(abiwwop, addresswwop);
  contractwwop.defaultAccount = accbesu;

  



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


  contractwop =new web3.eth.Contract(abiWOP, addresswop);
  contractcrowd=new web3.eth.Contract(abiCrowdsale, addresscrowd);

  contractwwop2 =new web3.eth.Contract(abiwwop, addresswwop);

  
  
  window.ethereum.on('accountsChanged', function (accounts) {
    // Time to reload your interface with accounts[0]!
    console.log("accountsChanged:",accounts);
    $( "#refreshall" ).trigger('click');
  })
  
  window.ethereum.on('networkChanged', function (networkId) {
    // Time to reload your interface with the new networkId
    console.log("networkChanged:",networkId);
  })

  setContext(changeContext);

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
        /*  
          haswWOP(info,(error)=>{
            showbuyerror(error);

          } ,(balance)=>{
            getTokenAmount(weis,'#buycostwop',acc,showbuyerror,processBuyWOP);
    
          }) ;   
      */

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
        var acc=$('#sellaccount').text();
        var wops=$('#sellcostether').val();
        var totalwops=$('#sellwopbalance').text();
        if(Number(wops)<1 || Number(wops)>Number(totalwops)){
              showsellerror("invalid wop value!");
              return;
        }


        setContext((chainID)=>{
            switch(chainID){
              case 2018: //besu
                  showinfo("Transacction has sended OK waiting for metamask confirm hash received");
                  $('#bsellwop').hide();
                  contractwwop2.methods.transfer(accbesu,wops).send( {from: acc}).then( function(tx) {
                      console.log("Transaction transfer: ", tx);
              
                      //document.getElementById('transfer').innerHTML = "Transaction: "+tx.blockHash;
                      $('#modalsell').modal('hide');
                      
                   
                      cargarGrilla(true);
                      setTimeout( ()=>{showinfo("OK: "+tx.blockHash);},1000);
              
                
                  }).catch( (error)=>{
                      console.log("Sell wop transfer error: ", error);    
                      //document.getElementById('transfererr').innerHTML = "Error "+error.code+" "+error.message;  
                      showsellerror("Error withdraw wWOP: "+error.code+" "+error.message);
              
                  });//transfer
        

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
    case 2018: //besu
      cargarGrilla(true);
      break;
    default://public network
      cargarGrilla();
  }
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

  callApiRest("/apirest/pe",
  data=>console.log("callApiRest(/apirest/pe) OK",data),
  error=>console.log("callApiRest(/apirest/pe) ERROR",error)
  );


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





async function getbalance(blc, account ,element) {
  element.innerHTML ="...";
  element.innerHTML = await blc.eth.getBalance(account);
}

function getbalanceof(contract,account ,element) {

  element.innerHTML ="...";
  contract.methods.balanceOf(account).call().then( ( info )=> {
    //console.log("getbalance: ", info);
    element.innerHTML = info;
  }).catch( (error)=>{
      console.log("getbalance error: ", error);    
      element.innerHTML = "Error ";  
      showerror("Error balanceOf : Contract not exist in this network! ");
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


function retirewWOP(acc){

  $('#sellaccount').text(acc);

  $('#selletherbalance')[0].innerHTML="N/A";
  getbalanceof(contractwwop,acc ,$('#sellwopbalance')[0]);
  $('#modalselllabel').text("Withdraw wWOP to set available  in Ethereum");
  $('#sellwoprate')[0].innerHTML="N/A";

  $('#modalsell > div > div > div.modal-body > form > h5').text("Set wWOP amount");

  $('#modalsell > div > div > div.modal-body > form > div.table-responsive > table > tbody > tr:nth-child(1) > th').text("Enter wWOP amount:");
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
    getbalance(w3, acc ,$('#buyetherbalance')[0]);
    getbalanceof(contractwop,acc ,$('#buywopbalance')[0]);
    getRate($('#buywoprate')[0]);

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

    contractwop.defaultAccount = res[0];
    for(var i=0;i<res.length;i++){
      addfila( i+1, res[i],"","","",esPrivate);
    }

    $('#taccounts tbody tr').each(function() {
      if (!this.rowIndex) return; // skip first row    
      var acc=this.cells[1].innerHTML;

      if(esPrivate){
        this.cells[2].innerHTML="N/A";
        this.cells[3].innerHTML="N/A";
        getbalanceof(contractwwop,acc ,this.cells[4]);
      }else{
        getbalance(w3, acc ,this.cells[2]);
        getbalanceof(contractwop,acc ,this.cells[3]);
        getbalanceof(contractwwop,acc ,this.cells[4]);
      }

  });               
      if(esPrivate){
        showinfo("Metamask connected succefully! (Besu (private network) hyperledger detected)");    
        
      }else{
        showinfo("Metamask connected succefully! (Ethereum network detected)");    
      } 
    
  });
  

}







function addfila(id, account,ether,wop,wwop,esPrivate=false){
             
    var html = '<tr>'
    //html+='<td></td>';
    html+='<td style="text-align: center;">'+id+'</td>';              
    html+='<td style="text-align: left;">'+account+'</td>';       
    html+='<td style="text-align: center;">'+ether+'</td>';              
    html+='<td style="text-align: center;">'+wop+'</td>';              
    html+='<td style="text-align: center;">'+wwop+'</td>';              
    if(!esPrivate){
      var buttons='<a class="btn btn-link buywop" href="#" title="Buy WOPs"><i class="fa fa-money" aria-hidden="true"></i></a>';
     // buttons+='<a class="btn btn-link sellwop" href="#" title="Sell WOPs"><i class="fa fa-external-link" aria-hidden="true"></i></a>';
    }else{
      var buttons='<a class="btn btn-link sellwop" href="#" title="Sell WOPs"><i class="fa fa-external-link" aria-hidden="true"></i></a>';
    }
    html+='<td nowrap="nowrap">'+buttons+'</td>';       

   // html+='<input type="hidden"  value="'+cb+'">';
    html+='</tr>';       
    $('#taccounts tbody').append(html);

    if(!esPrivate){
              $("#taccounts .buywop").on("click",function() {

                $(this).closest('tr').find('td').each(
                  function (i) {
                      if(i==1) {
                        acc=$(this).text();
                        buyWOP(acc);  
                        return false;
                      }

                  });

                return false;
          });

/*          
          $("#taccounts .sellwop").on("click",function() {

            $(this).closest('tr').find('td').each(
              function (i) {
                  if(i==1) {
                    acc=$(this).text();
                    sellWOP(acc);  
                    return false;
                  }

              });
            return false;
          });
*/
      
    }else{

        $("#taccounts .sellwop").on("click",function() {

          $(this).closest('tr').find('td').each(
            function (i) {
                if(i==1) {
                  acc=$(this).text();
                  retirewWOP(acc);  
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
