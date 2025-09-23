// ==UserScript==
// @name         Bumkids Ext by Quang.TD
// @author       Quang.TD
// @version      2025.9.20
// @description  try to take over the world!
// @namespace    bumkids_ext
// @icon         https://www.google.com/s2/favicons?sz=64&domain=viettelpost.vn

// @downloadURL  https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main0506/script.js
// @updateURL    https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main0506/script.js

// @require      https://code.jquery.com/jquery-3.7.1.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.14.1/jquery-ui.min.js

// @match        *viettelpost.vn/*
// @match        *.facebook.com/*
// @match        *.messenger.com/*

// @connect      bumm.kids
// @connect      api.viettelpost.vn
// @connect      io.okd.viettelpost.vn
// @connect      script.google.com
// @connect      script.googleusercontent.com

// @grant        GM_log
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_addElement
// @grant        GM_notification
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_webRequest
// @grant        GM_setClipboard
// @grant        window.onurlchange
// @grant        GM_registerMenuCommand

// ==/UserScript==

const _myPhone = '0966628989', _myFbName = 'Trịnh Hiền', _myFbUsername = 'hien.trinh.5011', _myFbUid = '100003982203068', _samplePhoneNo = '0900000000',
      UrlParams = new URLSearchParams(window.location.search),
      $ = (window.$ || window.jQuery);

const isFBpage = window.location.host === 'www.facebook.com';
const isMessPage = window.location.host === 'www.messenger.com' || window.location.pathname.includes('/messages/');
const isViettelPage = window.location.host === 'viettelpost.vn'

function Delay(ms = 1000) { return new Promise(resolve => setTimeout(resolve, ms)) }
//var csv is the CSV file with headers
function csvJSON(csv = '{}'){
    csv = csv.replace('Dấu thời gian', 'time');
    let lines = csv.split("\n");
    let result = [];
    let headers = lines[0].split(",");
    for(let i = 1; i < lines.length; i++){
        let obj = {};
        let currentline = lines[i].split("\",\"");
        for(let j = 0; j < headers.length; j++){
            let label = headers[j].replaceAll('\"','');
            let value = currentline[j]?.replaceAll('\"','');
            if(value) obj[label] = value;
        }
        result.push(obj);
    }
    return result;
}
function randomInteger(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min};
function isVNPhone(number) { return (/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/).test(number) }
function customEvent(n){
    if(n == 'mouseover'){
        let event = new MouseEvent('mouseover', { 'bubbles': true, 'cancelable': true});
        return event;
    } else {
        let event = document.createEvent('Event');
        event.initEvent(n, true, false);
        return event;
    }
}
function getFormatedDate(i = 0) {
    const date = new Date(new Date().getTime() + i * 24 * 60 * 60 * 1000);
    const yyyy = date.getFullYear();
    let mm = date.getMonth() + 1; // Months start at 0!
    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedToday = dd + '/' + mm + '/' + yyyy;
    return formattedToday;
}
function makeid(length = 12) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

/*** Sync and reload all pages ***/
(isMessPage || isFBpage) && GM_addValueChangeListener('do_reload_page', function(){
    window.confirm('Đã cập nhật dữ liệu mới! \nEnter để tải lại trang!') && window.location.reload();
});

(isMessPage || isFBpage) && GM_registerMenuCommand("Đồng bộ lại" , async _ => {
    await Customer_Mng.sync
    GM_setValue('do_reload_page', new Date().getTime());
});

function getSelectedText() {
  let selectedText = '';
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
  } else if (document.selection && document.selection.createRange) { // For older IE versions
    selectedText = document.selection.createRange().text;
  }
  return selectedText;
}

var keyState = {};
function keyHandler(e){ keyState[e.code] = e.type === "keydown" }
document.addEventListener("keydown",keyHandler);
document.addEventListener("keyup",keyHandler);

/***********************************************************************************************************************************
Facebook
************************************************************************************************************************************/

// ADD CSS STYLE
(function(){
    if(!isFBpage && !isMessPage) return !1;

    GM_addStyle('div[role="button"]:is([aria-label="Thêm bạn bè"], [aria-label="Theo dõi"]){display:none;}');
    GM_addStyle('div[aria-label="Công cụ soạn cuộc trò chuyện"] > div:first-child >div {display: none; }');
    GM_addStyle('div[aria-label="Công cụ soạn cuộc trò chuyện"] div[aria-label="Chọn biểu tượng cảm xúc"] {display: none; }');
    GM_addStyle('input:is([aria-label="Tìm kiếm"], [aria-label="Tìm kiếm trên Messenger"]) ~ span > div[aria-label="Xóa"] {display: none; }');
    GM_addStyle('body * {transition: unset !important; }');

    GM_addStyle('@keyframes blinker { 50% { opacity: 0; } }' +

                'div[style*="--chat-composer"]:is(.__fb-dark-mode, .__fb-light-mode) > div > div[role="none"] > div {  height: calc(100vh - 200px); }' +
                //'div[aria-label="Xem trước liên kết"] div[role="button"]:not([aria-label="Nhắn tin"]) {display:none;}' +
                'div[aria-label="Xem trước liên kết"]:has(a[href*="hien.trinh"]){ display:none; }'+

                'div[role="article"][aria-label*="dưới tên Trịnh Hiền"] span[lang] * {color: palegreen; }' +
                'div[role="article"]:has(div[aria-label="Gỡ Yêu thích"]) span[lang] * {color: var(--reaction-love, #DD2334); }' +
                'div[role="article"]:has(div[aria-label="Gỡ Thương thương"]) span[lang] * {color: var(--reaction-support, #887000); }' +

                '');
})();

const SHEET = {
    url: 'https://script.google.com/macros/s/AKfycbw-DXz_EwNkDlDni_bQjtXgNan9JHlEVOAt0NlB3crMd5RnEu8LgsVX0y_v2P9xsi4_Ug/exec',
    get: function(data){
        const params = new URLSearchParams(data);
        const queryString = params.toString();
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: this.url + '?' + queryString,
                method: "GET",
                synchronous: true,
                dataType: "json",
                onload: function (res) {
                    console.log(res)
                    return resolve(JSON.parse(res.response));
                },
                onerror: function(error) {
                    return reject(error.message || 'Lỗi viettelReqGet');
                }
            })
        })
    },
    post: function(data){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: this.url,
                method: "POST",
                synchronous: true,
                headers: { },
                data: JSON.stringify(data),
                onload: (res) => {
                    console.log(res.responseText);
                    return res.status == 200 ? resolve(res.responseText) : reject(new Error(res.responseText));
                },
                onerror: (e) => {
                    alert(e.message || 'Lỗi viettel \nMã lỗi: #178');
                    return reject(e);
                }
            })
        })
    },
    getCustomer: function(uid){
        return this.get({act: 'getCustomer', data: uid});
    },
    setCustomer: function(data){
        return this.post({act: 'setCustomer', data: data});
    },
}

// VIETTEL
const VIETTEL = {
    init: function(){
        if(isViettelPage){
            this.deviceId = window.localStorage.deviceId;
            GM_setValue('vtp_deviceId', this.deviceId);
            this.token = this.deviceId && JSON.parse(window.localStorage['vtp-token']).tokenKey;
            GM_setValue('vtp_tokenKey', this.token);
            if(this.deviceId && this.token) {
                $.post('https://bumm.kids/iframe/facebook_order.php', {token: `${this.deviceId}; ${this.token}`}).then(res => GM_log(res))
            };
        }
        else if(isFBpage || isMessPage){
            this.deviceId = GM_getValue('vtp_deviceId', null);
            GM_addValueChangeListener('vtp_deviceId', (key, oldValue, newValue, remote) => {
                if(remote) this.deviceId = newValue;
            });
            this.token = GM_getValue('vtp_tokenKey', null);
            GM_addValueChangeListener('vtp_tokenKey', (key, oldValue, newValue, remote) => {
                if(remote) this.token = newValue;
            });
        }
    },
    getReq: function(url){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: url,
                method: "GET",
                synchronous: true,
                headers: { 'Authorization': 'Bearer ' + this.token, 'token': this.token },
                onload: function (response) {
                    return resolve(JSON.parse(response.responseText))
                },
                onerror: function(reponse) {
                    return reject(reponse.message || 'Lỗi viettelReqGet');
                }
            })
        })
    },
    postReq: function(url, json){
        //let deviceId = this.deviceId, token = this.token;
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url:  url,
                method: "POST",
                synchronous: true,
                headers: { "Token": this.token, "Content-Type": "application/json" },
                data: JSON.stringify({...json, "deviceId": this.deviceId}),
                onload: (response) => {
                    let res = JSON.parse(response.responseText);
                    return res.status == 200 ? resolve(res) : reject(new Error(res.message));
                },
                onerror: (e) => {
                    alert(e.message || 'Lỗi viettel \nMã lỗi: #178');
                    return reject(e);
                }
            })
        })
    },
    getListOrders: function(key, from = -30, to = 0){
        return new Promise((resolve, reject) => {
            if(!key) return reject(new Error('Chưa có sdt'));
            let url = 'https://api.viettelpost.vn/api/supperapp/get-list-order-by-status-v2';
            let json = {
                "PAGE_INDEX": 1,
                "PAGE_SIZE": 10,
                "INVENTORY": null,
                "TYPE": 0,
                "DATE_FROM": getFormatedDate(from),
                "DATE_TO": getFormatedDate(to),
                "ORDER_PROPERTIES": key,
                "ORDER_PAYMENT": "",
                "IS_FAST_DELIVERY": false,
                "REASON_RETURN": null,
                "ORDER_STATUS": "-100,-101,-102,-108,-109,-110,100,101,102,103,104,105,107,200,201,202,300,301,302,303,320,400,500,501,502,503,504,505,506,507,508,509,515,550,551,570,516,517",
            };
            this.postReq(url, json ).then(resolve).catch(e => {
                alert(e.message || 'Lỗi viettel \nMã lỗi: #202');
                reject(e);
            });
        })
    },
    getKyc: function(phone){
        return new Promise((resolve, reject) => {
            this.getReq('https://io.okd.viettelpost.vn/order/v1.0/kyc/'+phone).then(resolve).catch(e => {
                alert(e.message || 'Lỗi viettel \nMã lỗi: #202');
                reject(e);
            });
        })
    },
    getOrderPrint: function(id){
        return new Promise((resolve, reject) => {
            if(!id) return reject(new Error('Chưa có sdt'));
            let url = 'https://api.viettelpost.vn/api/setting/encryptLinkPrintV2';
            let json = {
                "TYPE": 100,
                "ORDER_NUMBER": id + "," + (new Date().getTime() + (360000000)),
                "IS_SHOW_POSTAGE": 0,
                "PRINT_COPY": 1,
            };
            this.postReq(url, json).then(res => {
                if(res.error) return reject(res.message);
                let link = res?.data?.enCryptUrl;
                GM_log(json)
                return resolve(link);

            }).catch(e => {
                alert(e || 'Lỗi viettel \nMã lỗi: #202');
                reject(e);
            });
        })
    },
    getOrderInfo: function(id){
        return new Promise((resolve, reject) => {
            this.getReq('https://api.viettelpost.vn/api/setting/getOrderDetailForWeb?OrderNumber='+id).then(resolve).catch(e => {
                alert(e.message || 'Lỗi viettel \nMã lỗi: #202');
                reject(e);
            });
        })
    },
    getPhoneAddr(phone){
        return new Promise((resolve, reject) => {
            this.getReq('https://io.okd.viettelpost.vn/order/v1.0/sender/receivers?ofs=0&size=10&q='+phone).then(resolve).catch(e => {
                alert(e.message || 'Lỗi viettel \nMã lỗi: #202');
                reject(e);
            });
        })
    }
};
VIETTEL.init();

// GOOGLE SHEET
const GGSHEET = {
    query: function( sheet = 'log', range = 'A:A', queryStr = 'SELECT *'){
        return new Promise((resolve, reject) => {
            let ggsid = '1KAhQCGOIInG3Et77PfY03V_Nn4fWvi0z1ITh1BKFkmk';
            let tq = encodeURIComponent(queryStr);
            let url = `https://docs.google.com/spreadsheets/d/${ggsid}/gviz/tq?tqx=out:csv&headers=1&sheet=${sheet}&range=${range}&tq=${tq}&time=${new Date().getTime()}`;
            //console.log(url)
            GM_xmlhttpRequest({
                url: url,
                method: "GET",
                synchronous: true,
                headers: {"Content-Type": "text/html; charset=utf-8"},
                onload: function (res) {
                    let json = csvJSON(res.response);
                    return resolve(json);
                },
                onerror: function(res) {
                    GM_log("error: ", res.message);
                    return reject(res.message);
                }
            });
        });
    },
    formSubmit: function(url){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: url,
                method: "GET",
                synchronous: false,
                headers: {"Content-Type": "text/html; charset=utf-8"},
                onload: function (res) {
                    res.readyState == 4 && res.status == 200 && resolve(res);
                },
                onerror: function(res) {
                    alert('⚠ Google sheet form submit fail!! \nURL:' + url);
                    return reject('GG Log error: ' + res.message);
                }
            })
        })
    },
    log: function(type = 'test', data = []){
        let id = '1FAIpQLSdnt9BSiDQEirKx0Q3ucZFxunOgQQxp4SB7B6Gd8nNMFGzEyw';
        let fields = [2075359581, 1542826863, 2077606435, 1093369063, 2124435966, 450302808, 2118396800, 839689225, 2086451399, 1329285789];
        return new Promise((resolve, reject) => {
            if(!type || !data.length) { return reject('input is invalid!') };
            let url = `https://docs.google.com/forms/d/e/${id}/formResponse?entry.${fields[0]}='${type}&${data.map((d, i) => (`entry.${fields[i+1]}='${encodeURIComponent(d)}`)).join('&')}`;
            this.formSubmit(url)
                .then(res => resolve(res))
                .catch(err => reject(err.message));
        })
    },
}

// FB CUSTOMER MANAGER
const Customer_Mng = {
    ggFormId: '1FAIpQLScdh4nIuwIG7wvbarsXyystgnSkTcIzgIBBlcA9ya8DDZvwXA',
    ggFormEntry:{ uid: 736845047, name: 64482577, phone: 1863958217, addr: 143609329, img: 1145058745, e2ee: 1693043917, attr1: 1173103552, attr2: 398324750, attr3: 696385383, attr4: 2084291905, attr5: 1174020264, attr6: 1243517720, attr7: 1831851967, attr9: 1146378854 },
    //sheetName: 'customers',
    //sheetRange: 'A:O',
    storageKey: 'GMcustomer',
    int: async function(){
        this.dataStorage = await GM_getValue(this.storageKey, []);
        GM_addValueChangeListener(this.storageKey, (key, oldValue, newValue, remote) => { remote && (this.dataStorage = newValue) });
    },
    sync: async function(){
        this.dataStorage = await GGSHEET.query('customers', 'A:Z', "SELECT A, B, C, D, E, F, G WHERE B <> '' AND Z <> 'duplicate'");
        GM_setValue(this.storageKey, this.dataStorage);
        window.prompt(`${this.dataStorage.length} customers syncing done! \n\nE.g.: `, JSON.stringify(this.dataStorage[0]));
    },
    get: async function(uid){
        if(!uid || uid == _myFbUid) throw new Error('Uid không hợp lệ');

        let matchs = this.dataStorage.filter(i => (i.uid == uid));
        if(!matchs.length){
            matchs = await SHEET.getCustomer(uid);
        }
        return matchs;
    },
    set: async function(info){
        try{
            this.dataStorage = this.dataStorage.filter(i => i.uid != info.uid); // del old id;
            this.dataStorage.push(info);
            GM_setValue(this.storageKey, this.dataStorage);

            let res = await SHEET.setCustomer(info);
            return res;
        } catch(err){
            alert(err.message);
        };
    }
};
(isMessPage || isFBpage) && Customer_Mng.int();

// FB CSS
(function(){
    if(!isFBpage && !isMessPage) return !1;

    GM_addStyle(
        'div.infoCard { --ifc-highlight-color: coral; --ifc-bg-gradient: linear-gradient(to right, #ece9e6, #ffffff); --ifc-toolbar-bg: rgba(220, 220, 220, 0.40); --ifc-text-color: #333; }'+
        'html.__fb-dark-mode div.infoCard { --ifc-highlight-color: yellow; --ifc-bg-gradient: linear-gradient(to right, #859398, #283048); --ifc-toolbar-bg: rgba(0, 0, 0, 0.20); --ifc-text-color: white; }'+

        'div.infoCard {min-height: 115px; display: flex;flex-direction: column; justify-content: space-between; color: var(--ifc-text-color); backdrop-filter: brightness(1.5) blur(10px);box-shadow: 0 12px 28px 0 var(--shadow-1), 0 2px 4px 0 var(--shadow-1);font-weight: bolder;position: absolute;bottom: calc(100% + 8px);left: 10px;width: calc(100% - 30px);max-height: unset;max-width: 350px;border: 2px solid #d3d3d32b;border-radius: 8px;padding: 8px;filter: blur(0px);transition: all 1.5s ease-in-out;overflow: hidden;opacity: 1;}'+

        'div.infoCard div.cardBg { background: var(--ifc-bg-gradient); z-index: -1; opacity: 0.5; }'+

        'div.infoCard table td {white-space: nowrap;  padding-right: 10px;}'+
        'div.infoCard table td:last-child {white-space: nowrap;  width: 100%;}'+
        'div.infoCard table td.long_text {  overflow: clip;  direction: rtl;  max-width: 150px;  display: block;  white-space: normal;  text-wrap: nowrap;  text-overflow: ellipsis;  }'+

        'div.infoCard ::selection { color: red; background: yellow;}'+

        'div[aria-label^="Biểu ngữ Tin nhắn đã ghim"] > div { flex-direction: row-reverse; text-align: right; }'+
        'div:has(div[role="main"][aria-label^="Cuộc trò chuyện với"]) div.infoCard { left: 27px; top: 64px; right: unset; bottom: unset; }'+

        'div.infoCard div.toolBar { text-align: center; background-color: var(--ifc-toolbar-bg); border-radius: 6px; display: flex; justify-content: space-around; }'+
        'div.infoCard div.toolBar a { color: initial; padding: 5px; flex: 1; }'+

        'div[aria-label="Nhắn tin"][role="button"] { border: 2px dashed red; border-radius: 6px; }'+
        'div[role="list"] div[role="listitem"] span:hover { -webkit-line-clamp: 10 !important; }'
    );

})();

// FB INFO CARD
(function() {
    if(!isFBpage && !isMessPage) return !1;
// overflow: clip;  direction: rtl;  max-width: 160px;  display: block;  white-space: normal;  text-wrap: nowrap;  text-overflow: ellipsis;
    class InfoCard{
        constructor(info, container){
            this.container = container;

            this.customer = {...info};
            let e2ee = (window.location.pathname.includes('e2ee') ? window.location.pathname.match(/\d{3,}/g)?.pop() : '');
            if(e2ee) this.customer.e2ee = e2ee;

            let card = GM_addElement(container, 'div', { class: 'infoCard', 'id': 'ifc'+this.customer.uid });
            let bg = GM_addElement(card, 'div', { class: 'cardBg', style: 'position: absolute; top: 0; right: 0; bottom: 0; left: 0; ' });
            let quangplus = GM_addElement(card, 'small', {style: 'opacity: .5; position: absolute; top: 5px; right: 5px;'});
            quangplus.innerHTML = '<a href="https://fb.com/trinhdacquang" target="_blank" style="color: inherit;">© QuangPlus</a>';

            //if(isMessPage) card.classList.add('bottom');

            this.table = GM_addElement(card, 'table', { style: 'padding-bottom: 5px;' });

            let toolBar = GM_addElement(card, 'div', { class: 'toolBar' });

            this.btn_1 = GM_addElement(toolBar, 'a');
            this.btn_1.innerText = 'Tìm sđt'; this.btn_1.onclick = _ => this.phoneFinder();

            let btn_2 = GM_addElement(toolBar, 'a');
            btn_2.innerText = 'Sửa sđt'; btn_2.onclick = _ => this.setPhone();

            let btn_3 = GM_addElement(toolBar, 'a');
            btn_3.innerText = 'Tạo đơn'; btn_3.onclick = _ => this.createOrder();

            this.eventsListener();

            // get info
            this.table.innerText = 'Tải thông tin khách hàng...';
            Customer_Mng.get(this.customer.uid).then(res => {
                console.log(res)
                let data_current = res?.pop() || new Object();
                let data_new = {...data_current, ...this.customer};

                this.customer = data_new;

            }).then(_ => {

                this.refreshInfo()

            }).catch(err => {
                this.table.innerText = '⚠️ ' + err.message;
                return false;
            });
        }

        async refreshInfo(){

            if(this.delay_kfbs) return;

            try{
                this.table.innerText = 'Tải thông tin Viettel...';

                let {uid, phone, addr} = this.customer;
                if(!phone) throw new Error('Chưa có số đt!!');

                // get info from Viettel Post
                let vt = await VIETTEL.getListOrders(phone);
                if(!vt) throw new Error('Lỗi: không tìm đc đơn hàng viettel!');
                if(vt.error) throw new Error('Viettel: ' + vt.message);

                let list = (vt.data.data.LIST_ORDER || new Array());
                let total = vt.data.data.TOTAL;

                let pendding = list.filter(od => !!~([-108,100,102,103,104]).indexOf(od.ORDER_STATUS));
                this.penddingOrderCount = pendding.length;
                let draf = list.filter(od => od.ORDER_STATUS == -100);
                this.draftOrderCount = draf.length;

                let title = pendding.map(o => o.PRODUCT_NAME).join('\n ');
                title += draf.map(o => o.PRODUCT_NAME).join('\n ');

                let lastestAddr = list[0]?.RECEIVER_ADDRESS.toLowerCase();
                if(lastestAddr){
                    if(lastestAddr != addr){
                        this.customer.addr = lastestAddr;
                        Customer_Mng.set(this.customer).catch(err => alert(err.message));
                    }
                }

                let kyc = await VIETTEL.getKyc(phone);
                let kycStr = kyc.deliveryRate > -1.0 ? (`${(Math.round(kyc.deliveryRate*1000)/10)}% • ${kyc.order501}/${kyc.totalOrder}`) : '---';

                this.table.innerHTML = `
                <tr style="display:none;"><td>ID:</td> <td>${uid}</td></tr>
                <tr>
                  <td>Số điện thoại:</td> <td>${phone}</td>
                </tr>
                <tr>
                  <td>Đơn Viettel:</td>
                  <td>
                    <a href="https://viettelpost.vn/quan-ly-van-don?q=1&p=${btoa(phone)}" target="_blank" style="color:inherit; text-decoration: underline;" title="${title}">
                      <span>${total} đơn </span>&nbsp
                      ${this.draftOrderCount ? `<span style="color:yellow"> • có ${this.draftOrderCount} đơn nháp</span>` : ''}
                      ${this.penddingOrderCount ? `<span style="color:coral"> • có ${this.penddingOrderCount} đơn chờ giao</span>` : ''}
                    </a>
                  </td>
                </tr>
                <tr> <td>Tỷ lệ nhận:</td> <td>${kycStr}</td> </tr>
                <tr> <td>Tags:</td> <td>---</td> </tr>`;
            } catch(e){

                this.table.innerText = '⚠️ ' + e.message;

            } finally{

                delete this.delay_kfbs;
                console.log(this.customer);

            }
        }

        async phoneFinder(isRun = !this.isSearching){
            this.isSearching = isRun;
            this.btn_1.innerText = this.isSearching ? "Dừng tìm" : "Tìm sđt";
            this.btn_1.style.color = this.isSearching ? "var(--ifc-highlight-color)" : "";

            if(!this.isSearching){
                clearInterval(this.loopSearching);
                return false;
            }

            clearInterval(this.loopStick);
            let overTime = 0;

            let scrollElm = this.container.querySelector('[aria-label^="Tin nhắn trong cuộc trò chuyện"] > div > div');

            let loopFn = async _ => {
                if(overTime >= 50) return this.phoneFinder(false); // overTime

                let spans = scrollElm.querySelectorAll('div[role="row"] span[dir="auto"]:has(div):not(.scanned)');

                if(!spans.length) {
                    overTime++;
                    return scrollElm.scrollTo({ top: 0, behavior: 'smooth' });
                }

                overTime = 0;

                for(let i = spans.length; i > 0; i--){
                    let span = spans[i-1];

                    span.classList.add('scanned');

                    let phone = await new Promise(resolve => {
                        let txt = span.innerText.replaceAll(/[^\w\d]/g, '');
                        let num = txt && txt.match(/(03|05|07|08|09)+([0-9]{8})/g)?.pop();
                        return resolve( !num ? false : num == _myPhone ? false : num );
                    });

                    if(phone){
                        let stick = function(){ span.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }) };
                        stick();
                        this.loopStick = setInterval( stick , 300 );
                        //await Delay(100);
                        setTimeout(() => {
                            this.container.addEventListener('click', () => {
                                clearInterval(this.loopStick)
                            } , { once: true });
                        }, 100);

                        /***
                        this.container.addEventListener('click', _ => clearInterval(this.loopStick) , { once: true });
                        setTimeout(_ => {
                            this.container.addEventListener('mousemove', _ => clearInterval(this.loopStick) , { once: true });
                        }, 3000);
                        ***/

                        let p = span.closest('div[role="presentation"]');
                        p.style.border = '2px dashed ' + ( phone == this.customer.phone ? 'aqua' : 'coral');

                        this.phoneFinder(false);
                        break;
                    }
                }
            }
            loopFn();
            this.loopSearching = setInterval(loopFn, 200);
        }

        async setPhone(phone = window.prompt("Nhập sđt cho " + this.customer.name, this.customer.phone || '0900000000')){
            if(!phone || !isVNPhone(phone) || phone == this.customer.phone || phone == _myPhone) return;

            this.customer.phone = phone;
            this.refreshInfo();
            Customer_Mng.set(this.customer).catch(err => alert(err.message))
        }

        async createOrder(){
            const {uid, phone, name} = this.customer;
            const orderInfo = { uid, phone, name };
            let title = `Tạo đơn cho ${name}\n\n`;

            //let cid = GM_getValue('lastClickCid', '');
            //cid && ( orderInfo.cid = cid, title += `cid: ${orderInfo.cid}\n` );

            try{
                if(!phone) throw new Error('❌ Vui lòng cập nhật sđt trước!');

                if(phone != _samplePhoneNo && ( (this.draftOrderCount || this.penddingOrderCount) && !window.confirm(title + '❌ Có đơn chưa giao!!! \nVẫn tiếp tục tạo đơn?') )) return false

                let url = 'https://viettelpost.vn/order/tao-don-le?query=';

                let prices_str = prompt(title + "B1 - Điền giá \n(đv nghìn đồng, phân tách bằng dấu cách để tính tổng)", GM_getValue('lastest_prices', 0));
                if (prices_str == undefined || prices_str == null) { return false }
                if(!(/^[\d\s]*$/g).test(prices_str)) throw new Error('❌ Giá sản phẩm không hợp lệ!');

                let price = prices_str.trim().split(/\D+/g).reduce((pv, cv) => pv + parseInt(cv || 0), 0);

                let itemNameList = GM_getValue('lastest_items_list', []);
                let list = itemNameList.map((e, i) => `[${i}] ${e}`).join('\n');
                let input = prompt(title + 'Chọn tên sp có sẵn hoặc nhập tên sản phẩm mới: \n' + list, itemNameList[0] || '');
                if (input == null || input == undefined) return false;

                let itemName = itemNameList[input] || input
                itemNameList.unshift(itemName);
                itemNameList = itemNameList.filter((value, index, array) => array.indexOf(value) === index ); //unique
                GM_setValue('lastest_items_list', itemNameList.slice(0, 10));

                orderInfo.prdName = `${itemName} - (${prices_str})`;
                orderInfo.price = (price*1000);

                url += btoa(unescape(encodeURIComponent(JSON.stringify(orderInfo))));

                window.popupWindow?.focus();
                window.popupWindow = window.open(url, 'window', 'toolbar=no, menubar=no, resizable=no, width=1200, height=800');

                GM_setValue('lastest_prices', prices_str);
                GM_deleteValue('lastClickCid');

                window.addEventListener('message', ({data}) => {
                    uid == data.uid && this.refreshInfo();
                    //data.uid && data.cid && GGSHEET.log('createOrder', [data.cid, data.uid ]);
                }, {once: true});
            }
            catch(e){ alert(title + e.message) }
        }

        async eventsListener(){
            this.container.addEventListener("click", function(e){
                let target = e.target.closest('div[aria-label="Trả lời"][role="button"]');
                target && GM_setClipboard("e gửi về địa chỉ này c nhé", "text");
            });

            this.container.addEventListener("keydown", e => {
                if(e.key === "F2") {
                    e.preventDefault();
                    this.preOrder();
                }
            })

            this.container.addEventListener('contextmenu', function(e) {
                return;
                event.preventDefault();
                alert('contextmenu');
            });

            // Set phone by mouse selection
            this.container.addEventListener('mouseup', _ => {
                if(!window.getSelection) return alert('⚠ window.getSelection is undifined');
                let phone = window.getSelection().toString().replaceAll(/\D/g,``);

                if(!phone || phone.length != 10 || phone == this.customer.phone || phone == _myPhone || !isVNPhone(phone)) return;
                if(!this.customer.phone || window.confirm(`Xác nhận đổi số đt cho ${this.customer.name} thành ${phone}?`)){
                    if(this.delay_xjae) return;
                    this.delay_xjae = setTimeout(_ => {delete this.delay_xjae}, 1000);

                    this.setPhone(phone);
                }
            });
        }
    }

    window.document.addEventListener('mousemove', async function() {
        if(this.delay) return;
        this.delay = 1; setTimeout(_ => {this.delay = 0}, 1000);

        let links = window.document.querySelectorAll(`
          div[role="main"][aria-label^="Cuộc trò chuyện với "] > div > div > div > div:first-child a[role="link"][href]:not(.checked, [aria-label]),
          div:not([hidden]) > div[style*="chat-composer"] a[role="link"][href^="/"][aria-label]:not(.checked, [aria-label="Mở ảnh"])
        `);
        for(let i = 0; i < links.length; i++){
            let e = links[i];
            let uid = e.getAttribute('href')?.match(/\d+/g)?.pop();
            let name = e.getAttribute('aria-label') || e.querySelector('h2')?.innerText;
            let img = e.querySelector('img')?.getAttribute('src');

            let hasCard = window.document.querySelector('#ifc'+uid);

            if(!uid || !name || !img || uid == _myFbUid || hasCard) continue;

            e.classList.add('checked');
            let contain = e.closest('div:is(.__fb-dark-mode, .__fb-light-mode)');
            new InfoCard({uid, name, img}, contain);
        }
    });
})();


// ///////////////////;
(async function($){
    if(!isFBpage) return false;
    let werwfcsder = null;
    let selector = 'div[role="article"][aria-label*="ình luận"]';
    $(document).on('click', selector, function(e){
        clearTimeout(werwfcsder);
        werwfcsder = setTimeout(() => {
            if(e.target.getAttribute('dir') != 'auto') return;
            let article = $(e.target).closest('div[role="article"][aria-label*="ình luận"]')[0];
            let btn = $(article).find('div + div[role="button"][aria-label*="cảm xúc"]')[0];
            console.log(e.target, article, btn);
            getSelectedText() && btn?.click();
        }, 200);
    });
})(window.jQuery);


// MESSENGER SEARCH WHEN FOCUS;
(function($){
    if(!isMessPage) return false;

    window.addEventListener("focus", function (e) {
        let input = document.querySelector('input[type="search"][aria-label="Tìm kiếm trên Messenger"], input[type="text"][aria-label="Tìm kiếm"]');
        input?.focus();
        input?.select();
    });
})();

// MESSENGER AUTO SCROLL BUTTON;
(function(){
    if(!isMessPage) return false;

    GM_addStyle('div#aqweasdf div#list p { margin:0; padding:3px; border-radius:3px; overflow:hidden; }'+
                'div#aqweasdf div#list p:hover { background-color:whitesmoke; color:#333; }'+
                'div#aqweasdf div#list {background:black; position:absolute; top:30px; border-radius:5px; border:1px solid white; color:white; text-wrap:nowrap; overflow:hidden; }'+

                'div#aqweasdf div#list > div { max-height:492px; padding:10px 0; max-width:200px; width:30px; overflow-x:hidden; }'+
                'div#aqweasdf div#list > div { -webkit-transition: width .3s ease-in-out !important; -moz-transition: width .3s ease-in-out !important; -o-transition: width .3s ease-in-out !important; transition: width .3s ease-in-out !important; }'+
                'div#aqweasdf div#list > div:hover{ padding:10px; overflow-y:overlay; width:150px; }'+
                '');

    let panelContainer = GM_addElement(document.body, 'div', {id:'aqweasdf', style:'position:absolute; top:30px; left:30px; '});
    let scrollBtn = GM_addElement(panelContainer, 'div', {
        style:'background:crimson; color:white; padding:5px 15px; border:1px solid; border-radius:5px; cursor:pointer; ',
    });
    let userListPanel = GM_addElement(panelContainer, 'div', {id:'list', style:''});
    let userList = GM_addElement(userListPanel, 'div', {style:''});

    scrollBtn.innerText = '✨ Load all ✨';
    scrollBtn.onclick = _ => doScroll();

    function scrollTo1(x){
        let messList = document.querySelector('div[aria-label="Danh sách cuộc trò chuyện"][aria-hidden="false"] div[aria-label="Đoạn chat"] div:is(.__fb-dark-mode, .__fb-light-mode)');
        messList.style.height = x + 100;
        messList.scrollTo(0, x);
    };

    const doScroll = function(isStop = 0){
        let messList = document.querySelector('div[aria-label="Danh sách cuộc trò chuyện"][aria-hidden="false"] div[aria-label="Đoạn chat"] div:is(.__fb-dark-mode, .__fb-light-mode)');

        if(!messList || this.scrolling || isStop){
            scrollBtn.innerText = '✨ Load all ✨';
            clearInterval(this.scrolling);
            delete this.scrolling;
            return false;
        }

        scrollBtn.innerText = '✨ Stop ✨';


        this.scrolling = setInterval(_ => {
            try{
                scrollTo1(messList.scrollHeight);

                let containers = messList.querySelectorAll('div[data-virtualized="false"]:has(a[href][role="link"]):not(.checked)');
                containers.forEach(container => {
                    let name = container.querySelector('div[aria-label^="Lựa chọn khác cho "]')?.getAttribute('aria-label')?.replace('Lựa chọn khác cho ', '');
                    let href = container.querySelector('a[href][role="link"]')?.getAttribute('href');
                    let time = container.querySelector('abbr')?.getAttribute('aria-label');

                    if(!href || !name || !time) return;

                    container.classList.add('checked');
                    console.log(name, time, `https://messenger.com/${href}`);

                    let top = container.offsetTop;

                    userList.querySelector('p[data-href="'+href+'"]')?.remove();
                    let p = GM_addElement(userList, 'p', {style:'cursor:pointer','data-href':href});
                    p.innerText = name;
                    p.onclick = _ => {
                        doScroll('stop'); // stop scrolling;
                        scrollTo1(top);
                    }

                    window.document.title = name;
                    container.classList.add('checked');
                });

            }catch(e){
                console.error(e.messages);
            }
        }, 1000);
    };

})();

/***
isFBpage && (function(){
    $(document).on('click',`div[role="article"][aria-label*="${_myFbName}"]`, function(){
        let url = $(this).find('li a[href*="comment_id"]')?.attr('href');
        url = new URL(url);
        let cid = url.searchParams.get('reply_comment_id') || url.searchParams.get('comment_id');
        GM_setValue('lastClickCid', cid);
    });
})();
***/


(function(){
    if(!isFBpage) return;

    (function addHotKeys(){
        $(document).on('keydown', function(e) {
            console.log(e.key);
            if(e.key == 'y'){
                /***
                let btn = document.querySelector('div[role="button"][aria-label="Yêu thích"]');
                console.log(btn);
                btn.dispatchEvent(customEvent('click'));
                ***/
                let btn = $('div:has(div[role="button"][aria-label*="Yêu thích"])');
                console.log(btn);
                [...btn].map(b => {
                    console.log(b);
                    $(b).click();
                    let event = new Event("click");
                    b.dispatchEvent(event);
                })
            }
            if(e.key == 't'){
                let btn = document.querySelector('div[role="button"][aria-label="Thương thương"]');
                console.log(btn);
                btn.dispatchEvent(customEvent('click'));
             //   btn.click();
            }
        });
    })();

})();


/***
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
***/

// VIETTEL MAIN //
(function() {
    if(!isViettelPage) return;

    let vtpStyle = (
        'div:is(#vtpModalPrintOrder, #vtpBillModalPrintOrder, #createOrderSuccess) button.btn:not(:last-child){ display:none; }'+
        'div:is(#vtpModalPrintOrder, #vtpBillModalPrintOrder, #createOrderSuccess) button.btn:last-child{ width:100%; }'+
        '.mat-menu-item-highlighted:not([disabled]), .mat-menu-item.cdk-keyboard-focused:not([disabled]), .mat-menu-item.cdk-program-focused:not([disabled]), .mat-menu-item:hover:not([disabled]){background: gray; color: white;}'+

        //'body.custom div.box-product-info div.card-body { max-height: 210px; overflow: auto; }' +
        //'body.custom div.box-receiver div.card-body { max-height: 400px; overflow: auto; }' +

        //màu số tiền
        //'body.custom #createEditForm > div.mt-3.vt-order-footer > div > div.row.col-lg-8.resp-border-money > div:nth-child(3) > div > strong.txt-color-viettel {color: orangered !important; font-size: 30px;}' +

        'body.custom button {text-wrap: nowrap; width: auto;}'+

        'div.vtp-bill-table *:is(.mat-column-SENDER_FULLNAME, .mat-column-PARTNER, .mat-column-COD_STATUS ):is(th, td) {display:none;}'+
        'div.vtp-bill-table {  overflow-y: hidden !important; }'+

        'body.custom div.box-receiver div.card-body group small {color: red !important; font-size: 14px;}'+
        'div.dieukhoan, body.custom nav#sidebar {display:none;}'+

        'body.custom #content {width: 100vw !important; margin-left: 0;}'+

        'div.vtp-order-detail-card c-payment-cod-status span.bold-700, div[class*="col-"]:not(.row) > div.resp-money > strong.txt-color-viettel { font-size: 1.3em; color: yellow !important; background-color: var(--brand-color-red, red); padding: .1em .3em; border-radius: 5px;  }'
    );
    GM_addStyle(vtpStyle);

    $(document).ready( async function(){
        await new Promise(resolve => { setTimeout(resolve, 1000)});

        function updateCOD(){
            try{
                let price = Number($('input#productPrice')?.val()?.replaceAll(/\D/g, '') || 0),
                    fee = Number($('div.text-price-right')?.text()?.replaceAll(/\D/g, '') || 0);

                let tax = Number((price + fee) / 100 * 1.5);

                let total = (price + fee + tax);

                if(price == 0) total = 0;
                else if(price == 1000) {total = fee;}

                if(!fee || window.lastTotal == total) return 0;

                let input_cod = window.document.querySelector('input#cod');
                input_cod.value = Math.round(total);
                input_cod.dispatchEvent(customEvent('input'));
                input_cod.dispatchEvent(customEvent('change'));

                window.lastTotal = total;

                return true;
            } catch(e){
                alert('Lỗi cập nhật COD \n' + e.message + 'Mã lỗi: #1213');
                return false;
            }
        }

        async function setInves(){
            let slt = window.document.querySelector('select#selectGroupAddress');
            if(!slt) return false;
            let id = await GM_getValue('lastInventoryID', 0);
            if(!id || slt.value == id) return false;

            slt.value = id;
            slt.dispatchEvent(new Event('click', { bubbles: true }));
            slt.dispatchEvent(new Event('input', { bubbles: true }));
            slt.dispatchEvent(new Event('change', { bubbles: true }));
            clearInterval(seInvesInterval);
        }
        let seInvesInterval = setInterval(setInves , 1000);

        $(document).one('click', 'div.vtp-bill-table td.mat-column-select', function(){
            window.onbeforeunload = function (e) {
                e = e || window.event;
                if (e) { e.returnValue = 'Sure?' }
                return 'Sure?';
            };

        });

        $(document).on('change', 'form.create-order input#productName', function(){
            let price = (window.eval(this.value?.match(/\(.*\)/g)?.shift()?.replaceAll(/[\(\)]/g, '').trim().replaceAll(/\s+/g, " + ")) || 0) * 1000;
            $('input#productPrice')?.val(price).trigger('input').trigger('change');
        });
        $(document).on('change', 'form.create-order input#productPrice', _ => setTimeout(updateCOD, 500));

        $(document).on('change', 'form.create-order input#phoneNo', async function(){
            try{
                this.value = this.value.replaceAll(/\D/g, '');
                this.dispatchEvent(customEvent('input'));
                if(this.value == _samplePhoneNo || !isVNPhone(this.value)) return;

                let res = await VIETTEL.getListOrders(this.value).catch(e => {throw new Error()});
                GM_log(JSON.stringify(res));
                if(res?.status != 200) throw new Error();

                let orders = (res.data.data.LIST_ORDER || []).filter(o => !!~([-100, -108,100,102,103,104]).indexOf(o.ORDER_STATUS));

                let oLength = orders.length

                this.style['border-color'] = oLength ? 'coral' : 'greenyellow';

                oLength && alert('❌ CẢNH BÁO: \n\n SDT có đơn chưa gửi!!!?');

            } catch(e){
                alert('Lỗi check trùng đơn! ❌❌❌');
            }
        });

        GM_addElement(window.document.body, 'input', {style:'position:absolute; top:0; right:0;', placeholder:'confirm url', id:'BumConfirmUrl'});

        let info_encode = UrlParams.get('query');

        if(!info_encode) return false;

        let info = JSON.parse(decodeURIComponent(escape(window.atob(info_encode.replaceAll(' ','+')))));
        let {uid, phone, addr, name, price, prdName} = info;

        if(!uid || !phone) return true;

        let col1 = $('div.box-receiver, div.box-sender').parent();
        //$('div.box-sender').appendTo(col1);
        //$('div.box-receiver').prependTo(col1);
        window.document.body.classList.add('custom');
        //s.prependTo(p);

        let isSample = phone == _samplePhoneNo;

        let productName = window.document.querySelector('input#productName'),
            productPrice = window.document.querySelector('input#productPrice'),
            productWeight = window.document.querySelector('input#productWeight'),
            orderNo = window.document.querySelector('input#orderNo'),
            fullName = window.document.querySelector('input#fullName'),
            autoAddress = window.document.querySelector('input#autoAddress'),
            phoneNo = window.document.querySelector('input#phoneNo');


        window.addEventListener('beforeunload', _ => {
            window.opener?.postMessage({uid: uid}, '*');
        });

        $(document).keyup(function(e) {
            if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey){
                let status = 0;

                autoAddress.value = autoAddress.value.toLowerCase().replace(/((phường)|(xã)|(thị\strấn)|(p\.)|(x\.)|(tt\.)).*/g,'');
                autoAddress.dispatchEvent(customEvent('input'));

                let invesId = window.document.querySelector('select#selectGroupAddress')?.value;
                GM_setValue('lastInventoryID', invesId);

                if(e.shiftKey){
                    $('#confirmCreateOrder button.btn.btn-viettel').click();
                    status = 1;
                } else {
                    $('#confirmSaveDraft button.btn.btn-viettel').click();
                    status = 0;
                }

                let doPrint = window.confirm('in tem?');

                let interv = setInterval(_ => {
                    if(productName.value || phoneNo.value) return true;

                    clearInterval(interv);

                    if(!doPrint) return window.close();

                    VIETTEL.getListOrders(phone, 0, 0).then(data => {
                        let order = data.data.data.LIST_ORDER[0];
                        let oid = order?.ORDER_NUMBER;

                        if(!oid) throw new Error('Không tìm thấy đơn hàng mới!');

                        return VIETTEL.getOrderPrint(oid);
                    }).then(link => {
                        window.open(link+'&status='+status , '_blank', 'toolbar=no, menubar=no, resizable=no, width=500, height=800, top=50, left=50"');
                    }).catch(e => {
                        e.message && alert(e.message);
                    }).finally(_=>{
                        setTimeout(window.close, 200);
                    })
                }, 1500);
            }
        });

        $(window.document).on('click keyup keydown', function(){
            if(fullName.value != name) {
                fullName.value = name;
                fullName.dispatchEvent(customEvent('input'));
            };
        });

        fullName.setAttribute('disabled', 'true');
        phoneNo.value = phone;
        productPrice.value = price;
        productWeight.value = 1000;
        productName.value = prdName + (isSample ? '    ❌ ❌ ❌' : '');
        autoAddress.value = isSample ? '..., Ô chợ dừa, đống đa' : '';
        orderNo.value = [uid, makeid(5)].join('-');

        [ productPrice, productName, productWeight, orderNo, autoAddress, phoneNo].forEach(i => {
            ['click', 'input', 'change'].forEach(e => i.dispatchEvent(customEvent(e)));
        });

        phoneNo.click();
        phoneNo.focus();
        phoneNo.scrollIntoView({ behavior: 'auto', block: 'center' });

        setInterval(updateCOD , 1000);
    });

})();


(function(){
    if(!isViettelPage) return;

    let onKeyDown = function(e){
        let buttons = $('div.mat-menu-content button.vtp-bill-btn-action');
        if(!buttons.length) return;
        if(e.key == 'i'){
            e.preventDefault();
            $.each(buttons, (i, btn) => {
                if(btn.innerText != 'In đơn') return;
                btn.click();
                setTimeout(_ => $('div:is(#vtpModalPrintOrder, #vtpBillModalPrintOrder, #createOrderSuccess) button.btn:last-child')?.focus(), 200);
            });
        }
        if(e.key == 'd'){
            e.preventDefault();
            $.each(buttons, (i, btn) => {
                if(btn.innerText != 'Duyệt đơn') return;
                btn.click();
                setTimeout(_ => $('div#vtpBillModalOrderApproval.modal.show div.col-6:first-child button')?.focus(), 200);
            });
        }
        if(e.key == 'h'){
            e.preventDefault();
            $.each(buttons, (i, btn) => {
                if(btn.innerText != 'Hủy đơn') return;
                btn.click();
                setTimeout(_ => $('#vtpBillModalDeleteOrder.modal.show button.btn-confirm:not([data-dismiss])')?.focus(), 200);
            });
        }
        if(e.key == 'x'){
            e.preventDefault();
            $.each(buttons, (i, btn) => {
                if(btn.innerText != 'Xóa đơn') return;
                btn.click();
                setTimeout(_ => $('#vtpBillModalDeleteOrder.modal.show button.btn-confirm:not([data-dismiss])')?.focus(), 200);
            });
        }
    }

    $(window.document).ready(function(){
        // menu quản lý đơn
        $(document).on('contextmenu', 'div.vtp-bill-table > table > tbody > tr', function(e) {
            e.preventDefault();
            $(document).off("keydown", onKeyDown);
            let row = $(e.currentTarget);
            let btn = row.find('td.mat-column-ACTION label i.fa-bars');
            btn && btn.click();
            row.css('background-color', '#e3f0f0');
            $(document).on('keydown', onKeyDown);
        });
    });
})();

// bắn đơn viettel
(function(){
    if(window.location.pathname != '/quan-ly-van-don') return;

    let snd_true = new Audio("data:audio/mpeg;base64,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+MCGA2zAXwKIsAMpYAZP/1GVGP+i/nf59AWAGQwGUElMdqJrSwBRlgBkogDi2BoEbgwCCrlj5algtSK4RCARCIGJmIBlSxg1EwRCMLmBNRVCfv/8tMWAaAotlktFnLRYyxyKvLeWCxy1/LcsSz/97//LXyxLP/LJaLEt2LJZ/LZZLPIvTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/70sQAA9JtsQAOftBCaDVfQd/aCCvh/9z//V679z8tN8XxAwWMFgowULTBZUMFKMwBMEKMBGCBTBCxnox9LowNEhHPjBPgv0wHcKZMJpA2jBCgEcDCqDADBgAsDAWAoGAKxCIhpzqJbwiAsIiiAz9z2AwqgwCIC4Ng0BgPgmp7//4C4FgMdISgYBc5zvzk///z3//z//nPnf9XOl/+czv/5d/8////88V0j9H/3fhi79/v/JB0BTAQDA4CzBQFDEcRzHgqjKs3TBlAZQwgMJvMSEHEDZq+9w4oop0MVeKCDDRxV4wZUGVMC8AvAMG4NwMGwNgMG4N+GrCX9X4GDYRY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VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/70sQAA9CBhPQO/rBCNDMeQe/WCCvo/oPov+Hf/4P//LdgACC3ZgkCRiGIZj0PRm2bZgkwMcYQCE0mJEDUxtCvKscUITKGKxFBBhoorEYQCDMmBeAXgGj0KBjgcAY5HJC4uQhfV+ERKBybyhES5ChaWQkf/+S5Kkpkv8l7cf/xc/5C///bkJ/4/7f/6v8fvyE/IXITx+/8fytB36D6e/e3yD/gz5N67RGAYYBgBpgUAUmCKBQYMAIphFg3GBvAb5g54OcYhwMSmw18GZ0IwluYWUS+GDnjEhhJgOeYG+BvAamU4GRSIBkQi8QVGL62vwiKAM+9wGCnEFQvL//x+IT+3H7/8lHJQlvJXJWSmOft//H/tyE/9Y3vkJ/8f/j94/f7kJ/8hExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//vSxAAD0GGq9g7+sEJZM92Bb9YIK79/7//f3/yT/9/VSID0BpYBUwUEYxHHkxGNwwIsExMDcCfjB2Rr0yvLuBMpLIszDJxCEwdgHZMIqANisDdBhgBglBgkBglxWfr/CINAxe7wYBMc4Tl/JclOSklv5LfJX5LfJaRUsf/lj//5LeOf/kv8leS//9X5K5KEp5Lf5L///JYGXLx/IXEFRvx+IQXeAsAYIgZAXAMDAMgYUAMAYhwMgZPAoGEngVZhiwMMYy6DDnLyDLp8RYy6Yy6c9mGUEZJgVYYsYFUDDgZjcQRMYRMWJqJqDAN97cDA4GA2c9AYUcSsBgGxKv+QsfvH6P3IQhOQuLkFycfvsJViaf/3/+Jr9xNf+JV7///8XXGKILf+MSLqMT8Yni6TEFNRTMuMTAwVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV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");
    let snd_fail = new Audio("data:audio/mpeg;base64,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GGyLtEYau0v0X0Xc2YSG0CP+Vg3////////////////+VgxYBywD////////////////+VgxYBvLAOEHgAASaOVEY3hebPicZoCKZIWGYtieZ+BwZdBGahDeZvjCaYBcYSDADSaBgimIonmEgtmFw9mDItg46docVnTrxwHDAFIx4I0c40gMwe80U4HSzBDwcwGxZjlyehjwQ1dBqUGOBkwgFLC4x44xwIavgwyMGAaPBzMHHQakBqQrBA5kYMcDEqAYzA5AIDDIyCBx4HBwcELAMHBnKGj40eGg0HjR8ZBp9jQQGD1GBoOnqDR8GJ9jR4sD1Eh50gMZEHCg4QWkHQifANBOQNH1E09hgFB40HckGA3KQDwe5KjMHIBBgEMg4OT0GQaiblMkR1ZMqdIBHVUqp02E9lE09FGEAyiafKfCfaiSfKeowDg9RhAL6jCjCfPqMA0FByAeDQaCT0chy0Azlp8QYnp6fCfKiSifqMOUnt7kQc5SQLJ5KyVk6p2Q+qdHdkEnaqjo1Ry09XLUYcpyU94NcqDnIg9ynKchRhRNRJRP////////////////1ElEv////////////////UZQC+gEACTcZSJIJEABBFWNHIcMewuNXy8MvAuMQqRMJQkNhAIMqihNmCFNJwuOMCqNVhoMZEUMMyNM1TUMoBJMAVD/+9LEHwA0lg8xmd2ABj5B5Zc7oALKwcFuIyBJB7GbqoCaEc0HmFMhioqLVRi5QZiNiTEAU8wQhLWChCWCEuSLIRjpcFTkKjoCEjJCUw4BMXBxJ0FRQVCS5BWKFgUFC0ULRUJLkgkhHRYRB5gIePF4MDiwEvgLFJYCEjhYSHBdAIDgMGg4iBh4CHAcSDRIeEgAsACV4sIioS+CSaSQqEptDQmWQVWLfDQgpwqslUYOAJUCQ+lWIw4cAFOEVkCKnCBJFZAh6BIrAB4BbM0wrABIBaUuxSIsICwmWBQuUkiLCSR6Rj5qqoEFV0CaqqjUHoE1G1VYORWQaVgQiQaQIIrqNIEC3aqqAVs6ARpg4Av8oyVgCVahskURTafFnCiCbSbfpIptM6URZym37OEj022cs7Z2m2+aiLO3wURURfJ8xYRSQSPSRSSSRSPZ2kYkazlRFJBNpnb5vm+L4f///////////////vm+T4vn///////////////++b5vgBAAAAAbMUMZjmMbfsIZ2GMWNrMCSgNCAvMJSXNHAvMlx6M4heM4gdMdgJMXxeMCS0AAvGHIcmFw0AN8elKVpTlOAYAMDDAEM4SUbCGShIERsoAZRrzg1xNekGJRZIaunCJhVIYg4AnIDDBBMyQgI5jLlyCsSEJjJiQokLCQKnAggEOBlKMuBgQNcRpM5IQlCCAQSGUkHoMDRAIcgAmFCSqgwcVUCE5YOBUkrCVkiwdUaVjCCQVEqqKrgAkg0EEhpIW9g8ITBBJFQITorlglBo0RRUcsZEQaNECwJcpWMaIFuSwJLcKxlv0VFORokViAgkio5A0TRULAhRtTlFYsCXIKxCjSjblOSioo25Rb1Bly1YUG0CLkIRqxwarGW+g4t2rGgwgRVhViVhg5WNWNFZAi5CBJAgo3B6sKqiq6sSq7lKqoRKqoEXLctVdVWD1YnKcuD3KVXclCBBhAjBqsSsKq6nKsCBFVX1YXJcv0CSBD/////////////////QJ/////////////////6BL0CNUFtAAA01CaIyhNA1DXIyWMYxDpkwIKoyWEMyFEMIRwYGgxUCQygGkKDiYEiEYcDUYWi8YckEYQB//70sQcADIODzC53YAGTMXlgzugAANLphJwAtA1Q5K4I2sIMJJRkuRVBCmZYWApbMADlGB53KzgZQ4NGjoISyyJhISEEwCSBgSLJhBwFBwt0AhFRsBCIVExkJMICSsdMJCAoOFgdcgaEgAJlgSLJhBMWTLcFvSwJFvy3hbxRot4qsECQ0SlvkVkCQ0IDAS5SEaETluSW9GAhVYaEhoRGAlBsrEy36KgQJlvywEIEVOFOFGoPU5UbgxyYMU4Lfor+gTRWLdoqoElYVGkCKKqnKKqDLlIElYVGoNU5VX9WFWBVZRpykCaBBFRTlFRRpThThRtFRTkrCFOS3CBJFcsBCKyK6BAt0o25KsajblKwKNKNqcqNuQqr6sSjUGIE4OUbg+DXLg2D3KUacuDlOPgxRpBpRtWNCJWFRtTlAkqvBqnCK6jajSnCK6jajX///////////////6nCjSjSK3///////////////6nKjajRug3xm2lxsLKxm0qxuVG5lYTBjgL4025gkFxkcKhjiCRggEpiGUI0CJiUIZiGHJg2MxhSE4D6nwJDb04a8qgRU4WNBuSYSWATczp0MdDEMUOizQ0p0YlKwDUkziQIdmcOBDUQkRQyZIMLNjEpRgmYkkEJCwcMQaRUCGwY5Cp1UYoIBxdLpaiDYCJAImABLkjRELnS34CbDJosmEJCEiqcSGoNq3iwBBgtyqsgTLdKxIMgJKWCRYEBhIIIjBMZEiw5byghQHLjQlDnByKqqhYE+rEqoqs5LljRJBpFdWAaIoNKqKcqXKwqrseLorWSKkKsSnKjcGKcKwKNKcqcqrqNQcp5aLlwatdylY3IVgcpyEhnZg9MZKl3WdK2sKhp2VOEG1G1YlYFGoNU5ctVVyVOFGoNcqDXIg1T7kuW5K13KVUg9TzkuRB60mBPvYXMslyI8z1hExE1OoMgdAmgQ/////////////////0CaBFAii7z///////////////omRJPkwFtXzfiTSOHKKRxSin5ZRT8sVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQAAAAIIAADk17WOE1IF2np/zOyXQMWIpl9Mv8yQg+zB/EIq//vSxBGAKlG+7RnugAAAADSDgAAE3P81qnMHaLjz/MGTTNXpLNWBK/HX/5BGpxlwZuAehkpheeOs///NkKBNKDGMYpFNVodM3DIx1njr///MQGZM3lhMdiMMTmPM0FHMYCMzx1njr///8xeZszGTMxGJQxcZkysQswyIgxQXHeOt463////5kscZgMQxjQwJkocJgUQxicr5jMTYXGwxISvHW8db3rf/////5icN5gqMxiMiZhgIpgyKBhUZpekwlDAwWH8LgwYchN+t////////////+YODeBQkMOwcMJBxMAwiMJwQIALMNRoHh3LASGHo6GHIAkoeGGo2ERFf///////////////////ggADEUcAKGZh+bBjeXhiaF4NJYw5GQwTCEwHHYwtFIwJBswFGgwnEgwFBcwFGIwlEIwBBUwFF5UxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=");
    snd_true.volume = 1;
    snd_fail.volume = 0.7;

    $(window.document).ready(function(){
        let gridItem = GM_addElement(document.querySelector('div.grid-action'), 'div', {class:'grid-item', style: 'justify-self: end; position: absolute;'});
        let input = GM_addElement(gridItem, 'input', {class:'form-control', id:'orderIdCheckField', placeholder:'Order scanner • Quang.TD', title:'Order scanner • Quang.TD'});
        input.focus();

        $(input).keydown(async function(e) {
            if (e.key !== 'Enter') return;
            let id = input.value?.trim();
            if(!id || id.length < 10) return;
            let link = $('a[href*="thong-tin-don-hang"][href*="orderNumber='+id+'"]:not(.checked)');
            if(link.length){
                link.addClass('checked');
                let row = link.closest('tr.mat-row[role="row"]');
                //let checkbox = row.find('label.mat-checkbox-layout');
                row.find('label.mat-checkbox-layout')?.click();
                await Delay(100);
                snd_true.play();
            } else {
                await Delay(100);
                snd_fail.play();
            }

            $(input).val(id).focus().select();
        });

    });
})();

(function(){
    if(!isViettelPage) return;

    GM_addStyle('td.mat-column-ORDER_REFERENCE{cursor:pointer;} td.mat-column-ORDER_REFERENCE:hover{font-weight: 700; text-decoration: underline; color: blue !important;}')
    if(window.location.origin != "https://viettelpost.vn") return;
    $(document.body).on('click', 'td.mat-column-ORDER_REFERENCE', function(){
        let fbid = this.innerText.match(/(\d)+/g)?.shift();
        let url = 'https://fb.com/'+fbid;
        window.open(url, '_blank');
    });
})();
