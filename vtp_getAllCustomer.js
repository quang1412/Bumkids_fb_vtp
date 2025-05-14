let auth = "Bearer eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIwOTY2NjI4OTg5IiwiU1NPSWQiOiIxZmQzZTljNi1lZmUzLTQzYTMtOTljNS1iZmZmNjU0ZDIwMDMiLCJpbnRlcm5hbCI6ZmFsc2UsIlVzZXJJZCI6ODU2NzgyNywiRnJvbVNvdXJjZSI6MywiVG9rZW4iOiI3ODIwOTYyMTYyNkE3MUIxMENGOThGN0NDMDZERjEyMCIsInNlc3Npb25JZCI6IkE4QzQ4OTI2NzkwQ0IzNUYzNUJBNEFEOEM4MTY2RjUyIiwiZXhwIjoxNzQ3Mzc0OTk5LCJsc3RDaGlsZHJlbiI6IiIsIlBhcnRuZXIiOjc3MDk4ODYsImRldmljZUlkIjoiZXQ4ajFhejFpdHFpcnFqd3BoMGNiaSIsInZlcnNpb24iOjF9.6AHttQALQNjTtlDxspiYgZJ-Yrpe3oQ7fKO3Vl4o4ODhkij-9W3QvzsM1SeaCqtiNoU5NmNu3gswQshAVpz4rw";
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
