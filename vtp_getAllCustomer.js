let auth = "";
let stop = 0

let loop = function(offset = 0, limit = 10){
    //console.clear()
    $.ajax({
        url:'https://io.okd.viettelpost.vn/order/v1.0/sender/receivers?ofs='+offset+'&size='+limit,
        dataType: "json",
        headers: { 'authorization': auth},
        error: function(res){
            console.log(res);
        },
        success: function(res){ 
           console.table(res.data)
            offset += limit;
            if(res.data.length && !stop) setTimeout(_ => {loop(offset)}, 1000)
        }
    });   
}
//loop();
