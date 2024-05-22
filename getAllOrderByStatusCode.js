var dvId = window.localStorage.deviceId;
var token = dvId && JSON.parse(window.localStorage['vtp-token']).tokenKey;
var defaultStatus = [-100,-101,-102,-108,-109,-110,100,101,102,103,104,105,107,200,201,202,300,301,302,303,320,400,500,501,502,503,504,505,506,507,508,509,515,550,551,570];

!window.statusData && fetch('https://api.viettelpost.vn/api/supperapp/get-list-status-category-code-v2').then(res => res.json()).then(json => {
    if(json.status == 200){
        window.statusData = json.data;
        console.warn(window.statusData);
    } else {
        throw new Error('error');
    }
}).catch(e => alert(e.message));

function orderStratusToText(code){
    if(!window.statusData || !code){
        return 'error!';
    }
    let text = window.statusData.filter(function(e){
        let arr = e.ORDER_STATUS.split(',');
        return (!!~arr.indexOf(code.toString()) && e.NAME != 'Tất cả')
    })
    return text[0]?.NAME;
}

function getOrderByStatus(data = {'status': defaultStatus, 'pageIndex': 1, 'pageSz': 100, 'from': '', 'to': ''}){ 
    return new Promise((resolve, reject) => {
        var xmlhttp = new XMLHttpRequest();    
        var theUrl = "https://api.viettelpost.vn/api/supperapp/get-list-order-by-status-v2";
        xmlhttp.open("POST", theUrl);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.setRequestHeader("Token", token);
        xmlhttp.onload = () => {
          if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
            const response = JSON.parse(xmlhttp.responseText)
            resolve(response)
          }
        }

        xmlhttp.send(JSON.stringify({
          "PAGE_INDEX": data.pageIndex || 1,
          "PAGE_SIZE": data.pageSz || 100,
          "INVENTORY": null,
          "TYPE": 0,
          "DATE_FROM": data.from || "22/04/2024",
          "DATE_TO": data.to || "22/05/2024",
          "ORDER_PAYMENT": "",
          "IS_FAST_DELIVERY": false,
          "REASON_RETURN": null,
          "ORDER_STATUS": data.status,
          "deviceId": dvId
        }));
    })
}
function getAll(data = {'status': defaultStatus, 'pageSz': 100, 'pageIndex': 1}){
    let array = [];
    getOrderByStatus(data).then(arr => {
        arr?.data?.data?.LIST_ORDER.forEach(order => {
            let {ORDER_NUMBER, ORDER_SYSTEMDATE, PRODUCT_NAME, MONEY_TOTAL, ORDER_STATUS, RECEIVER_FULLNAME, RECEIVER_PHONE} = order
            let statusText = orderStratusToText(ORDER_STATUS) + ' - ' + ORDER_STATUS;
            array.push({ORDER_NUMBER, ORDER_SYSTEMDATE, PRODUCT_NAME, MONEY_TOTAL, statusText, RECEIVER_FULLNAME, RECEIVER_PHONE});
        })
        console.warn(arr)
        if(arr?.data?.totalElements > (data.pageSz * data.pageIndex) ){
            console.warn({...data, pageIndex: data.pageIndex+1})
            setTimeout(getAll({...data, pageIndex: data.pageIndex+1}), 3000);
        }
    }).then(_ => {
        console.table(array)
    })
}
getAll({'status': "102,202,300,310,320,400,509,506,507,101,201,107,508,550,551,503,502,515",'pageSz': 100, 'pageIndex': 1, 'from': '01/01/2024', 'to':'01/02/2024' });
//getAll({'pageSz': 100, 'pageIndex': 1, 'from': '22/04/2024', 'to':'22/05/2024' });
