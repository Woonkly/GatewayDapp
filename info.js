var w3;
var contractwop;

window.addEventListener('load', async () => {
    

    if (window.web3) {

        w3 = new Web3(new Web3.providers.HttpProvider(netbesu));

    }
    // No web3 provider
    else {
        console.log('No web3 provider detected');
        alert('No web3 provider detected');
        rerturn;
    }
  
    
    contractwop =new w3.eth.Contract(abiwop, addresswop);
    contractwop.defaultAccount =defaultAccount ;
    refreshBalances();
});

document.addEventListener("DOMContentLoaded", function(){
    console.log("DOMContentLoaded");

  })


function refreshBalances(){
    var $bals=$('.balance');
    for(var i=0;i<$bals.length;i++){
        var td=$bals[i];
        getbalanceof(td);
    }


}


  function getbalanceof(td) {

    var $td=$(td);
    var acc=$td.attr("data-address");
    
    contractwop.methods.balanceOf(acc).call().then( ( info )=> {
      console.log("getbalance: ", info);
      td.innerHTML = info;
    }).catch( (error)=>{
        console.log("getbalance error: ", error);    
        td.innerHTML = "Error "+error;  
    });
  }
