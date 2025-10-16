// ==UserScript==
// @name         Bumkids Ext by Quang.TD
// @author       Quang.TD
// @version      2025.10.13.6
// @description  try to take over the world!
// @namespace    https://bumm.kids
// @icon         https://www.google.com/s2/favicons?sz=64&domain=viettelpost.vn

// @downloadURL  https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/master/main.js
// @updateURL    https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/master/main.js

// @require      https://code.jquery.com/jquery-3.7.1.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.14.1/jquery-ui.min.js

// @require      https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js
// @require      https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore-compat.js



// @match        *viettelpost.vn/*
// @match        *.facebook.com/*
// @match        *.messenger.com/*

// @connect      bumm.kids
// @connect      location.viettelpost.vn
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

const MYPHONE = '0966628989', MYFBNAME = 'Trịnh Hiền', MYFBUSERNAME = 'hien.trinh.5011', MYFBUID = '100003982203068',
      TEST_PHONENUM = '0900000000', TEST_ADDRESS = 'số 31 ngõ 19, Trần Quang Diệu, Đống Đa, Hà Nội',
      UrlParams = new URLSearchParams(window.location.search), $ = (window.$ || window.jQuery);

const isFBpage = window.location.host === 'www.facebook.com';
const isMessPage = window.location.host === 'www.messenger.com' || window.location.pathname.includes('/messages/');
const isViettelPage = window.location.host === 'viettelpost.vn'


function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms||1000)) }
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
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
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

/***
(isMessPage || isFBpage) && GM_addValueChangeListener('change2reload', (key, oldValue, newValue, remote) => {
    window.confirm('Đã cập nhật dữ liệu mới! \nEnter để tải lại trang!') && window.location.reload();
});
***/

function getSelectedText() {
  let selectedText = '';
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
  } else if (document.selection && document.selection.createRange) { // For older IE versions
    selectedText = document.selection.createRange().text;
  }
  return selectedText;
}

/***********************************************************************************************************************************
Facebook
************************************************************************************************************************************/

// ADD CSS STYLE
(function(){
    if(!isFBpage && !isMessPage) return !1;

    GM_addStyle(
        'body * {transition: unset !important; }'+
        'div[role="button"]:is([aria-label="Thêm bạn bè"], [aria-label="Theo dõi"]){display:none;}'+
        'div[aria-label="Công cụ soạn cuộc trò chuyện"] > div:first-child >div {display: none; }'+
        'div[aria-label="Công cụ soạn cuộc trò chuyện"] div[aria-label="Chọn biểu tượng cảm xúc"] {display: none; }'+
        'input:is([aria-label="Tìm kiếm"], [aria-label="Tìm kiếm trên Messenger"]) ~ span > div[aria-label="Xóa"] {display: none; }'+

        //'@keyframes blinker { 50% { opacity: 0; } }' +

        'div[style*="--chat-composer"]:is(.__fb-dark-mode, .__fb-light-mode) > div > div[role="none"] > div {  height: calc(100vh - 200px); }'+
        //'div[aria-label="Xem trước liên kết"] div[role="button"]:not([aria-label="Nhắn tin"]) {display:none;}' +
        'div[aria-label="Xem trước liên kết"]:has(a[href*="hien.trinh"]){ display:none; }'+

        'div[role="article"][aria-label*="dưới tên Trịnh Hiền"] span[lang] * {color: palegreen; }'+
        'div[role="article"]:has(div[aria-label="Gỡ Yêu thích"]) span[lang] * {color: var(--reaction-love, #DD2334); }'+
        'div[role="article"]:has(div[aria-label="Gỡ Thương thương"]) span[lang] * {color: var(--reaction-support, #887000); }'+
        '');

    GM_addStyle(
        'div.infoCard-wraper { --ifc-highlight-color: coral; --ifc-bg-gradient: linear-gradient(to right, #ece9e6, #ffffff); --ifc-toolbar-bg: rgba(220, 220, 220, 0.40); --ifc-text-color: #333; }'+
        'html.__fb-dark-mode div.infoCard-wraper { --ifc-highlight-color: yellow; --ifc-bg-gradient: linear-gradient(to right, #859398, #283048); --ifc-toolbar-bg: rgba(0, 0, 0, 0.20); --ifc-text-color: white; }'+

        'div.infoCard-wraper {min-height: 115px; display: flex;flex-direction: column; justify-content: space-between; color: var(--ifc-text-color); backdrop-filter: brightness(1.5) blur(10px);box-shadow: 0 12px 28px 0 var(--shadow-1), 0 2px 4px 0 var(--shadow-1);font-weight: bolder;position: absolute;bottom: calc(100% + 8px);left: 10px;width: calc(100% - 30px);max-height: unset;max-width: 350px;border: 2px solid #d3d3d32b;border-radius: 8px;padding: 8px;filter: blur(0px);transition: all 1.5s ease-in-out;overflow: hidden;opacity: 1;}'+

        'div.infoCard{overflow: hidden; min-height:115px; display: flex ; flex-direction: column; justify-content: space-between;}'+

        'div.infoCard div.cardBg { background: var(--ifc-bg-gradient); z-index: -1; opacity: 0.5; }'+

        'div.infoCard table td {white-space: nowrap;  padding-right: 10px;}'+
        'div.infoCard table td:last-child {white-space: nowrap;  width: 100%;}'+
        'div.infoCard table td.long_text {  overflow: clip;  direction: rtl;  max-width: 150px;  display: block;  white-space: normal;  text-wrap: nowrap;  text-overflow: ellipsis;  }'+

        'div.infoCard ::selection { color: red; background: yellow;}'+

        'div[aria-label^="Biểu ngữ Tin nhắn đã ghim"] > div { flex-direction: row-reverse; text-align: right; }'+
        'div:has(div[role="main"][aria-label^="Cuộc trò chuyện với"]) div.infoCard-wraper { left: 27px; top: 64px; right: unset; bottom: unset; }'+

        'div.infoCard div.toolBar { text-align: center; background-color: var(--ifc-toolbar-bg); border-radius: 6px; display: flex; justify-content: space-around; }'+
        'div.infoCard div.toolBar a { color: initial; padding: 5px; flex: 1; }'+
        'div.infoCard div.toolBar a:hover { background-color: inherit; border-radius: inherit; }'+

        'div[aria-label="Nhắn tin"][role="button"] { border: 2px dashed red; border-radius: 6px; }'+
        'div[role="list"] div[role="listitem"] span:hover { -webkit-line-clamp: 10 !important; }'+
    '');
})();

/***
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
                //headers: { },
                dataType: "json",
                onload: function (res) {
                    res = JSON.parse(res.response);
                    console.log(res);
                    return (res.status != 200) ? reject(res.message) : resolve(res.data);
                },
                onerror: function(error) {
                    return reject(error.message || 'Lỗi SHEET \nMã lỗi: #178');
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
                //headers: { },
                dataType: "json",
                data: JSON.stringify(data),
                onload: (res) => {
                    res = JSON.parse(res.response);
                    //console.log(res);
                    return (res.status != 200) ? reject(res.message) : resolve(res.data);
                },
                onerror: (error) => {
                    return reject(error.message || 'Lỗi SHEET \nMã lỗi: #193');
                }
            })
        })
    },

    getCustomer: function(uid){
        return this.get({action: 'getCustomer', data: uid});
    },
    getCustomerAll: function(uid){
        return this.get({action: 'getCustomerAll'});
    },
    setCustomer: function(data){
        return this.post({action: 'setCustomer', data: data});
    },
} ***/

// VIETTEL
const VIETTEL = {
    init: async function(){
        GM_registerMenuCommand("Cài đặt ViettelPost" , _ => this.setOptions());

        this.deviceId = await GM_getValue('vtp_deviceId', null);
        GM_addValueChangeListener('vtp_deviceId', (key, oldValue, newValue, remote) => { this.deviceId = newValue });

        this.token = await GM_getValue('vtp_tokenKey', null);
        GM_addValueChangeListener('vtp_tokenKey', (key, oldValue, newValue, remote) => { this.token = newValue });

        this.cus_id = await GM_getValue('vtp_cusId', null);
        GM_addValueChangeListener('vtp_cusId', (key, oldValue, newValue, remote) => { this.cus_id = newValue });

        if(isViettelPage){
            let deviceId = window.localStorage.deviceId;
            let {tokenKey, UserId} = JSON.parse(window.localStorage['vtp-token']);

            tokenKey != this.token && API.saveToken(UserId, deviceId, tokenKey);

            GM_setValue('vtp_deviceId', deviceId);
            GM_setValue('vtp_tokenKey', tokenKey);
            GM_setValue('vtp_cusId', UserId);

        }

        this.allWard = await this.get('https://api.viettelpost.vn/api/setting/listallwards').catch(e => alert(e.message));
        this.allDistrict = await this.get('https://api.viettelpost.vn/api/setting/listalldistrict').catch(e => alert(e.message));
        this.allProvince = await this.get('https://api.viettelpost.vn/api/setting/listallprovince').catch(e => alert(e.message));

    },
    setOptions: async function(v){
        v = v?.toString();
        let opts = GM_getValue('vtpCreateOrderOptions', {});
        try{
            let optionsList = ['Sửa kho mặc định', 'Sửa người trả cước mặc định', 'Sửa trọng lượng sp mặc định', 'Sửa tự động tin tem']
            let i = v || window.prompt('▶︎ Chọn mục cần sửa:\n' + optionsList.map((name, i) => `[${i}] ${name}`).join('\n'), 0);
            if(i == null) return false;

            if(i == 0){
                let listInventory = await this.post('https://api.viettelpost.vn/api/setting/listInventoryV2').catch(e => console.error(e));
                console.log(listInventory);
                listInventory = listInventory.filter(i => (i.IS_VISIBLE >= 0 && i.CUS_ID == this.cus_id));
                listInventory.sort((a, b) => b.IS_VISIBLE - a.IS_VISIBLE);
                let i = window.prompt('▶︎ Chọn kho lấy mặc định \n' + listInventory.map((inv, i) => `[${i}]. ${inv.NAME} - ${inv.SENDER_HOME_NO}`).join('\n'), 0);
                if(i == null) return false;
                let sltInv = listInventory[i];
                if(sltInv){
                    opts.GROUPADDRESS_ID = sltInv.GROUPADDRESS_ID;
                    opts.CUS_ID = sltInv.CUS_ID;
                    opts.SENDER_FULLNAME = sltInv.NAME;
                    opts.SENDER_PHONE = sltInv.PHONE;
                    opts.SENDER_PROVINCE = sltInv.PROVINCE_ID;
                    opts.SENDER_DISTRICT = sltInv.DISTRICT_ID;
                    opts.SENDER_WARD = sltInv.WARDS_ID;
                    opts.SENDER_HOME_NO = sltInv.ADDRESS;
                }
            }
            else if(i == 1){
                let current = opts.ORDER_PAYMENT
                let array = [{label: 'Người nhận', val: 2}, {label: 'Người gửi', val: 3}]
                let p = window.prompt('▶︎ Mặc định ai trả cước? \n' + array.map((op, i) => `[${i}]. ${op.label} ${current == op.val ? '◀︎ đang chọn' : ''}`).join('\n'), 0);
                if(p == null) return false;
                let sl = array[i];
                if(!sl) throw new Error('Lựa chọn không hợp lệ');
                opts.ORDER_PAYMENT = sl.val;
            }
            else if(i == 2){
                let w = window.prompt('▶︎ Nhập trọng lượng hàng hoá mặc định (d.v gram) lớn hơn 100g ', opts.PRODUCT_WEIGHT);
                if(w == null) return false;
                if(parseInt(w) > 100) { opts.PRODUCT_WEIGHT = w }
                else { throw new Error('Giá trị không hợp lệ'); }
            }
            else if(i == 3){
                let current = opts.qp_autoprint
                let arr = [{label: 'Không in', val: 0}, {label: 'Tự động in', val: 1}, {label: 'Hỏi trước khi in', val: 'ask'}]
                let i = window.prompt('▶︎ Tự động in tem vận đơn \n' + arr.map((op, i) => `[${i}]. ${op.label} ${current == op.val ? '◀︎ đang chọn' : ''}`).join('\n'), 0);
                if(i == null) return false;
                let sl = arr[i];
                if(!sl) throw new Error('Lựa chọn không hợp lệ');
                opts.qp_autoprint = sl.val;
            }
            else {
                throw new Error('Lựa chọn không hợp lệ');
            }

            console.log('Set ViettelPost options:', opts);
            GM_setValue('vtpCreateOrderOptions', opts);
            alert('✅ Đã lưu!');
        }
        catch(e){
            return alert('❌ Lỗi: ' + e.message);
        }
    },
    get: function(url){
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
    post: function(url, json = {}){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url:  url,
                method: "POST",
                synchronous: true,
                headers: { "Token": this.token, "Content-Type": "application/json" },
                data: JSON.stringify({...json, "deviceId": this.deviceId, "token": this.token}),
                onload: (response) => {
                    console.log(response);
                    let res = JSON.parse(response.responseText);
                    return resolve(res);
                },
                onerror: (e) => {
                    alert(e.message || 'Lỗi viettel \nMã lỗi: #178');
                    return reject(e);
                }
            })
        })
    },
    locationAutocomplete: function(text) {
        return this.get('https://location.viettelpost.vn/location/v1.0/autocomplete?system=VTP&q='+encodeURIComponent(text))
    },
    locationAutocomplete_v2: function(id) {
        return this.get('https://location.viettelpost.vn/location/v2.0/autocomplete/'+encodeURIComponent(id)+'?system=VTP')
    },
    getshippingFee: function(json){
        json = {
            ...json,
            'CUSTOMER_CODE': null,
            'IS_BUUCUC': false,
            'OPTION_LOCATION': 0,
            'ORDER_TYPE_ADD': '',
            'PRODUCT_HEIGHT': null,
            'PRODUCT_LENGTH': null,
            'PRODUCT_WIDTH': null,
            'XMG_EXTRA_MONEY': 0,
        };
        return this.post('https://api.viettelpost.vn/api/tmdt/getPriceWithExchangeWeightForWeb', json);
    },
    getListOrders: function(key, from = -30, to = 0){
        let success = [105,200,202,300,310,320,400,500,506,507,509,505,501,515,502,551,508,550,504,503,516,517],
            pedding = [-108,100,102,103,104],
            draft = [-100];
        if(!key) {
            return new Error('Chưa có sdt');
        }

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
            "ORDER_STATUS": ([...success, ...pedding, ...draft]).join(),
        };
        return this.post(url, json);

    },
    getKyc: function(phone){
        return new Promise((resolve, reject) => {
            this.get('https://io.okd.viettelpost.vn/order/v1.0/kyc/'+phone).then(resolve).catch(e => {
                alert(e.message || 'Lỗi viettel \nMã lỗi: #202');
                reject(e);
            });
        })
    },
    getOrderPrint_v2: async function(id){
        let url = 'https://api.viettelpost.vn/api/setting/encryptLinkPrintV2';
        let data = { "TYPE": 100, "ORDER_NUMBER": id + ',' + (new Date().getTime() + (360000000)), "IS_SHOW_POSTAGE": 0, "PRINT_COPY": 1 };
        return this.post(url, data).catch(e => alert('❌ Lỗi: ' + e.message));
    },
    getOrderInfo: function(id){
        return new Promise((resolve, reject) => {
            this.get('https://api.viettelpost.vn/api/setting/getOrderDetailForWeb?OrderNumber='+id).then(resolve).catch(e => {
                alert(e.message || 'Lỗi viettel \nMã lỗi: #202');
                reject(e);
            });
        })
    },
    getPhoneAddr: function(phone){
        return new Promise((resolve, reject) => {
            this.get('https://io.okd.viettelpost.vn/order/v1.0/sender/receivers?ofs=0&size=10&q='+phone).then(resolve).catch(e => {
                alert(e.message || 'Lỗi viettel \nMã lỗi: #202');
                reject(e);
            });
        })
    },
    suggestAddress: async function(p){
        return this.get('https://io.okd.viettelpost.vn/order/v1.0/receiver/_suggest?q='+p);
    },
    textToAddress: function(text){
        return new Promise(async (resolve, reject) => {
            let locations = await this.locationAutocomplete(text).catch(e => reject(e.message));
            console.log(locations);
            if(!locations.length) reject('Không tìm thấy địa chỉ nào trùng khớp với: ' + text);

            let i = window.prompt('▶︎ Chọn 1 trong các địa chỉ bên dưới \n' + locations.map( ({name}, i) => `[${i}]. ${name.toLowerCase()}`).join('\n'), 0);
            if(i == null) return;

            let location = locations[i];
            if(!location) reject('Lựa chọn không hợp lệ!');

            let res = await this.locationAutocomplete_v2(location.id).catch(e => reject(e.message));
            console.log(res);
            if(!res.id) reject(res.message);

            console.log(res);

            let result = {
                'ward': res.components?.find(a => a.type == 'WARD')?.code,
                'district': res.components?.find(a => a.type == 'DISTRICT')?.code,
                'province': res.components?.find(a => a.type == 'PROVINCE')?.code,
                'addr': text,
            }
            resolve(result);
        })
    },
};
VIETTEL.init();


const API = {
    url: 'https://api.bumm.kids',
    get: function(uri){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: encodeURI(this.url+uri),
                method: "GET",
                synchronous: true,
                headers: {
                    // 'Authorization': 'Bearer YOUR_AUTH_TOKEN',
                    'Content-Type': 'application/json'
                },
                dataType: "text",
                // contentType: 'application/json',
                onload: function (res) {
                    return resolve(JSON.parse(res.response));
                },
                onerror: function(error) {
                    return reject(error.message || 'Lỗi API: #645');
                }
            })
        })
    },
    post: function(path, data){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: encodeURI(this.url+path),
                method: "POST",
                synchronous: true,
                headers: {
                    // 'Authorization': 'Bearer YOUR_AUTH_TOKEN',
                    'Content-Type': 'application/json'
                },
                dataType: "json",
                data: JSON.stringify(data),
                onload: (res) => {
                    return resolve(res);
                },
                onerror: (error) => {
                    return reject(error.message || 'Lỗi API: #666');
                }
            })
        })
    },
    saveToken: function(cus_id, deviceId, token){
        this.post('/admin/vtpToken', {cus_id, deviceId, token}).then(res => {
            alert('token updated!')
        }).catch(e => {
            alert(e.message)
        });
    },
    getAllCustomers: function(){
        return this.get('/getAllCustomers');
    },
    getCustomer: function(q){
        return this.get('/getCustomer?q='+q);
    },
    setCustomer: function(data){
        return this.post('/setCustomer', data);
    },
}

/***
* FB CUSTOMER MANAGER
***/
const Customer_mng = {
    key: 'GM_customers_11',
    int: async function(){
        this.storage = await GM_getValue(this.key, new Array());
        GM_addValueChangeListener('GM_customers_11', (key, oldValue, newValue, remote) => { remote && (this.storage = newValue) });

        GM_registerMenuCommand("Đồng bộ khách hàng." , _ => this.sync() );
        // TODO: check time to re-sync
    },
    sync: async function(){
        let res = await API.getAllCustomers().catch(e => alert(e.message));
        this.storage = res.data;
        console.log(this.storage);

        GM_setValue(this.key, this.storage);
        window.confirm('Đã đồng bộ '+Object.keys(this.storage).length+' khách hàng \nEnter để tải lại trang') && window.location.reload();
    },
    save: function(obj){
        this.storage = this.storage.filter(u => u.uid != obj.uid);
        this.storage.push(obj);
        GM_setValue(this.key, this.storage);
    },
    get: async function(uid){
        if(!uid || uid == MYFBUID) throw new Error('Uid không hợp lệ');

        // get from local
        let customer = this.storage.find(u => u.uid == uid);
        if(customer) return customer;

        // get from cloud
        let res = await API.getCustomer(uid).catch(e => alert(e.message));
        customer = res.data;
        customer && this.save(customer);
        return customer;
    },
    set: async function(obj){
        await API.setCustomer(obj).catch(e => alert(e.message));
        this.save(obj);
    },
    edit: async function(customer, key, value, callback){
        try{
            if(!customer) throw new Error('Customer invalid');
            const rawAddr = customer?.address?.rawAddress;

            const list = [ 'Sửa số điện thoại: ' + customer.phone, ];

            let i = key?.toString() || window.prompt('▶︎ Lựa chọn mục cần sửa cho '+customer.name+': \n' + list.map( (text, i) => `[${i}]. ${text}`).join('\n'), 0);
            if(i == null) return;

            if( i == '0' ){
                let p = window.prompt("Nhập sđt của " + customer.name, value || customer.phone || TEST_PHONENUM);

                if(p == null || !p || p.length != 10 || p == customer.phone || p == MYPHONE || !isVNPhone(p)) return false;

                customer.phone = p;
            }
            else {
                throw new Error('Lựa chọn không hợp lệ!');
            }

            callback(customer);
            this.set(customer);

        } catch(e){
            alert("❌ Lỗi:" + e.message);
        }
    }
};
(isMessPage || isFBpage) && Customer_mng.int();

/***
* FB INFO CARD
***/
(function() {
    if(!isFBpage && !isMessPage) return !1;

    class InfoCard{
        constructor(container, info){
            this.container = container;

            this.customer = {...info};
            let e2ee = (window.location.pathname.includes('e2ee') ? window.location.pathname.match(/\d{3,}/g)?.pop() : '');
            if(e2ee) this.customer.e2ee = e2ee;

            let wraper = GM_addElement(container, 'div', {class:'infoCard-wraper'});
            let card = GM_addElement(wraper, 'div', { class: 'infoCard', 'id': 'ifc'+this.customer.uid });
            let bg = GM_addElement(card, 'div', { class: 'cardBg', style: 'position: absolute; top: 0; right: 0; bottom: 0; left: 0; ' });
            let quangplus = GM_addElement(card, 'small', {style: 'opacity: .5; position: absolute; top: 5px; right: 5px;'});
            quangplus.innerHTML = '<a href="https://fb.com/trinhdacquang" target="_blank" style="color: inherit;">© QuangPlus</a>';

            this.table = GM_addElement(card, 'table', { style: 'padding-bottom: 5px;' });

            let toolBar = GM_addElement(card, 'div', { class: 'toolBar' });

            this.btn_find = GM_addElement(toolBar, 'a');
            this.btn_find.innerText = 'Tìm sđt'; this.btn_find.onclick = _ => this.phoneFinder();

            let btn_od = GM_addElement(toolBar, 'a');
            btn_od.innerText = 'Tạo đơn'; btn_od.onclick = _ => this.createOrder();

            let btn_edit = GM_addElement(toolBar, 'a');
            btn_edit.innerText = 'Sửa'; btn_edit.onclick = _ => this.edit();

            this.eventsListeners();

            // get infos
            this.table.innerText = '🧸 Tải thông tin khách hàng...';
            Customer_mng.get(this.customer.uid).then(info => {
                this.customer = {...info, ...this.customer};
            }).then(_ => {
                this.refreshInfo();
            }).catch(err => {
                this.table.innerText = '⚠️ ' + err.message;
                return false;
            })
        }

        async refreshInfo(){

            if(this.delay_kfbs) return;

            try{
                this.table.innerText = '📦 Tải thông tin Viettel...';

                let {uid, phone} = this.customer;

                if(!phone) throw new Error('Chưa có số đt!!');

                let vt = await VIETTEL.getListOrders(phone).catch(err => alert(err.message));
                if(!vt) throw new Error('Lỗi: không tìm đc đơn hàng viettel!');
                if(vt.error) throw new Error('Viettel: ' + vt.message);

                let list = (vt.data.data.LIST_ORDER || new Array());
                this.totalOd = vt.data.data.TOTAL;

                let pendding = list.filter(od => !!~([-108,100,102,103,104]).indexOf(od.ORDER_STATUS));
                this.penddingOrderCount = pendding.length;

                let draf = list.filter(od => od.ORDER_STATUS == -100);
                this.draftOrderCount = draf.length;

                let title = pendding.map(o => o.PRODUCT_NAME).join('\n ');
                title += draf.map(o => o.PRODUCT_NAME).join('\n ');

                let kyc = await VIETTEL.getKyc(phone);
                this.kycStr = kyc.deliveryRate > -1.0 ? (`${(Math.round(kyc.deliveryRate*1000)/10)}% • ${kyc.order501}/${kyc.totalOrder}`) : '---';

                this.table.innerHTML = `
                <tr style="display:none;"><td>ID:</td> <td>${this.customer.uid}</td></tr>
                <tr>
                  <td>Số đt:</td> <td>${this.customer.phone}</td>
                </tr>
                <tr> <td>Địa chi:</td> <td><span title=" "> </span></td> </tr>
                <tr>
                  <td>Đơn Viettel:</td>
                  <td>
                    <a href="https://viettelpost.vn/quan-ly-van-don?q=1&p=${btoa(this.customer.phone)}" target="_blank" style="color:inherit; text-decoration: underline;">
                      <span>${this.totalOd} đơn </span>&nbsp
                      ${this.draftOrderCount ? `<span style="color:yellow"> • ${this.draftOrderCount} nháp</span>` : ''}
                      ${this.penddingOrderCount ? `<span style="color:coral"> • ${this.penddingOrderCount} chờ giao</span>` : ''}
                    </a>
                  </td>
                </tr>
                <tr> <td>Tỷ lệ nhận:</td> <td>${this.kycStr}</td> </tr>`;
            } catch(e){
                this.table.innerText = '⚠️ ' + e.message;
            } finally{
                delete this.delay_kfbs;
                console.log(this.customer);
            }
        }

        async phoneFinder(isRun = !this.isSearching){
            this.isSearching = isRun;
            this.btn_find.innerText = this.isSearching ? "Dừng tìm" : "Tìm sđt";
            this.btn_find.style.color = this.isSearching ? "var(--ifc-highlight-color)" : "";

            if(!this.isSearching){
                clearInterval(this.loopSearching);
                return false;
            }

            clearInterval(this.loopStick);

            let loopCount = 0;
            let scrollElm = this.container.querySelector('[aria-label^="Tin nhắn trong cuộc trò chuyện"] > div > div');

            let loopFn = async _ => {
                if(loopCount >= 33) return this.phoneFinder(false); // loopCount

                let spans = scrollElm.querySelectorAll('div[role="row"] span[dir="auto"]:has(div):not(.scanned)');

                if(!spans.length) {
                    loopCount++;
                    return scrollElm.scrollTo({ top: 0, behavior: 'smooth' });
                }
                loopCount = 0;
                for(let i = spans.length; i > 0; i--){
                    let span = spans[i-1];

                    span.classList.add('scanned');

                    let phone = await new Promise(resolve => {
                        let txt = span.innerText.replaceAll(/[^\w\d]/g, '');
                        let num = txt && txt.match(/(03|05|07|08|09)+([0-9]{8})/g)?.pop();
                        return resolve( !num ? false : num == MYPHONE ? false : num );
                    });

                    if(phone){
                        let stick = function(){ span.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }) };
                        stick();
                        this.loopStick = setInterval( stick , 300 );

                        setTimeout(() => {
                            this.container.addEventListener('click', () => {
                                clearInterval(this.loopStick)
                            } , { once: true });
                        }, 100);

                        let p = span.closest('div[role="presentation"]');
                        p.style.border = '2px dashed ' + ( phone == this.customer.phone ? 'aqua' : 'coral');

                        this.phoneFinder(false);
                        break;
                    }
                }
            }
            loopFn();
            this.loopSearching = setInterval(loopFn, 300);
        }

        async edit(key, value){
            Customer_mng.edit(this.customer, key, value, (res) => {
                this.customer = res;
                this.refreshInfo();
            });
        }

        async createOrder(){
            let {uid, phone, name} = this.customer;
            const orderInfo = { uid, phone, name };

            try{
                if(!phone) return window.confirm("⚠️ Chưa có sđt! enter để thêm sdt") ? this.edit(0) : false;

                if(phone != TEST_PHONENUM && ( (this.draftOrderCount || this.penddingOrderCount) && !window.confirm('❌ Có đơn chưa giao!!! \nVẫn tiếp tục tạo đơn?') )) return false

                let url = 'https://viettelpost.vn/order/tao-don-le?query=';

                let cod_input = window.prompt('▶︎ Chọn hoặc nhập số tiền phải thu (đv nghìn đồng) \n[0]. Đơn 0 đồng \n[1]. Chỉ thu ship', GM_getValue('lastCOD', 0));
                if(!cod_input || cod_input == null) return false;
                cod_input = cod_input.trim();
                cod_input = cod_input.replaceAll(/\s+/g, '+');
                if(!(/^\d[\d\+\-\*]*\d$/g).test(cod_input)) throw new Error('Số tiền không hợp lệ! - ' + cod_input);
                cod_input = cod_input.trim();

                let itemList = GM_getValue('lastItems', []);
                let input = prompt('▶︎ Chọn tên sp có sẵn hoặc nhập tên sản phẩm mới: \n' + itemList.map((item, i) => `[${i}]. ${item}`).join('\n'), itemList[0]);
                if (!input || input == null) return false;
                let itemName = itemList[input] || input;

                itemList.unshift(itemName);
                itemList = [...new Set(itemList)];
                GM_setValue('lastItems', itemList.slice(0, 10));

                orderInfo.ref = uid + '-' + makeid(12);
                orderInfo.prdName = `${itemName} - (${cod_input})`;

                url += btoa(unescape(encodeURIComponent(JSON.stringify(orderInfo))));

                window.createOrderWindow && !window.createOrderWindow.closed && window.createOrderWindow.close();
                window.createOrderWindow = window.open(url, 'window', 'toolbar=no, menubar=no, resizable=no, width=1200, height=800');

                GM_setValue('lastCOD', cod_input);

                window.addEventListener('message', ({data}) => { orderInfo.ref == data.ref && this.refreshInfo() }, {once: true});
            }
            catch(e){ alert('❌ Lỗi: ' + e.message) }
        }

        async eventsListeners(){
            this.container.addEventListener("click", e => {
                if(!e.ctrlKey) return;

                let replBtn = e.target.closest('div[aria-label="Trả lời"][role="button"]');
                replBtn && GM_setClipboard("e gửi về địa chỉ này c nhé", "text");

                // dừng tìm sdt
                let elm = e.target.closest('div[aria-label*="Tin nhắn trong cuộc trò chuyện"][role="grid"], div[aria-label="Công cụ soạn cuộc trò chuyện"][role="group"]');
                elm && this.phoneFinder(false);
            });

            // Set phone by mouse selection
            this.container.querySelector('div[aria-label*="Tin nhắn trong cuộc trò chuyện"]').addEventListener('mouseup', event => {
                if(!event.ctrlKey && !event.metaKey) return;
                if(!window.getSelection) return alert('⚠ window.getSelection is undefined');
                let selection = window.getSelection();
                if (selection.rangeCount <= 0) return false;
                let selectedText = selection.toString();
                let p = selectedText.replaceAll(/[^\d\w]*/g, '');
                if(p.length == 10 && p != this.customer.phone && p != MYPHONE && isVNPhone(p)) this.edit(0, p);
            });

            /***
            this.container.addEventListener("keydown", e => {
                if(e.key === "F2") {
                    e.preventDefault();
                    this.preOrder();
                }
            });

            this.container.addEventListener('contextmenu', function(e) {
                return;
                event.preventDefault();
                alert('contextmenu');
            });
            ***/

        }
    }

    window.document.addEventListener('mousemove', async function() {
        if(window.delay_i0mr) return;

        window.delay_i0mr = setTimeout(_ => delete window.delay_i0mr, 1000);

        let profiles = window.document.querySelectorAll(`
        div:not([hidden]) > div[style*="chat-composer"] a[role="link"][href^="/"][aria-label]:not(.checked, [aria-label="Mở ảnh"]),
        div[role="main"][aria-label^="Cuộc trò chuyện với "] > div > div > div > div:first-child a[role="link"][href]:not(.checked, [aria-label])`);

        if(!profiles.length) return;

        for(let i = 0; i < profiles.length; i++){
            let e = profiles[i];
            let uid = e.getAttribute('href')?.match(/\d+/g)?.pop();
            let name = e.getAttribute('aria-label') || e.querySelector('h2')?.innerText;
            let img = e.querySelector('img')?.getAttribute('src');

            let hasCard = window.document.querySelector('#ifc'+uid);

            if(!uid || !name || !img || uid == MYFBUID || hasCard) continue;

            e.classList.add('checked');
            let target = e.closest('div:is(.__fb-dark-mode, .__fb-light-mode)');
            new InfoCard(target, {uid, name});
        }
    });
})();

(function($){
    $(document).on('contextmenu', 'div[aria-label*="in nhắn trong cuộc trò chuyện"] div[role="gridcell"]', async function(ev){
        try{
            ev.preventDefault();
            $(this).find('div[aria-label="Xem thêm"]')?.click();
           // await delay(50);
           // let menuContainer = document.querySelector('div[style*="transform: translate"]:has(div[role="menu"])')
           // menuContainer.style.transform = ('translate('+ev.clientX+'px, '+ev.clientY+'px) translate(-50%, -100%)');
        } catch(err){
            console.error(err);
        }

    })
})(window.jQuery);

/***
* FB PHÍM TẮT THẢ TIM
***/
(async function($){
    if(!isFBpage) return false;
    let selector = 'div[role="article"][aria-label*="ình luận"]';
    $(document).on('click', selector, function(e){
        if((!e.ctrlKey && !e.metaKey)) return;
        let parentElm = $(e.target).closest('div[role="article"][aria-label*="ình luận"]')[0];
        $(parentElm).find('div + div[role="button"][aria-label*="cảm xúc"]')[0]?.click();
    });
})(window.jQuery);

/***
* MESSENGER SEARCH WHEN FOCUS
***/
(function(){
    if(!isMessPage) return false;

    window.addEventListener("focus", function (e) {
        let input = document.querySelector('input[type="search"][aria-label="Tìm kiếm trên Messenger"], input[type="text"][aria-label="Tìm kiếm"]');
        input?.focus();
        input?.select();
    });
})();

/***
* MESSENGER AUTO SCROLL BUTTON
***/
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
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
***/

// STYLE - CSS
(function(){
    if(!isViettelPage) return;
    let vtpStyle = (
        'div:is(#vtpModalPrintOrder, #vtpBillModalPrintOrder, #createOrderSuccess) button.btn:not(:last-child){ display:none; }'+
        'div:is(#vtpModalPrintOrder, #vtpBillModalPrintOrder, #createOrderSuccess) button.btn:last-child{ width:100%; }'+
        '.mat-menu-item-highlighted:not([disabled]), .mat-menu-item.cdk-keyboard-focused:not([disabled]), .mat-menu-item.cdk-program-focused:not([disabled]), .mat-menu-item:hover:not([disabled]){background: gray; color: white;}'+

        'body.custom button {text-wrap: nowrap; width: auto;}'+

        // nổi bật tên tỉnh/thành khi tạo đơn.
        'ng-select[formcontrolname="cityAddress"] span.ng-value-label { font-size: 110%; font-weight: 600; color: red; background: yellow; }'+

        'div.vtp-bill-table *:is(.mat-column-SENDER_FULLNAME, .mat-column-PARTNER, .mat-column-COD_STATUS ):is(th, td) {display:none;}'+
        'div.vtp-bill-table {  overflow-y: hidden !important; }'+

        'body.custom div.box-receiver div.card-body group small {color: red !important; font-size: 14px;}'+
        'div.dieukhoan, body.custom nav#sidebar {display:none;}'+

        'body.custom #content {width: 100vw !important; margin-left: 0;}'+

        'div.vtp-order-detail-card c-payment-cod-status span.bold-700, div[class*="col-"]:not(.row) > div.resp-money > strong.txt-color-viettel { font-size: 1.3em; color: yellow !important; background-color: var(--brand-color-red, red); padding: .1em .3em; border-radius: 5px;  }'
    );
    GM_addStyle(vtpStyle);
})();

// VIETTEL FUNCTION //
(function() {
    if(!isViettelPage) return;

    // GLOBAL //

    function updateCOD(x){
        try{
            const product_name = window.document.querySelector('input#productName');
            const product_price = window.document.querySelector('input#productPrice');
            const input_cod = window.document.querySelector('input#cod');

            const feeStr = ($('div.text-price-right')?.text()?.replaceAll(/\D/g, '') || 0);
            const priceStr = (product_price?.value.replaceAll(/\D/g, '') || 0);

            if(!feeStr) return 0;

            const price = Number(priceStr);
            let fee = Number(feeStr);
            // if(product_name.value.includes('#fs') ){ fee = 0; }
            const tax = Number(price * 1.5 / 100);

            let total = (price == 0) ? 0 : (price == 1000) ? fee : (price + fee + tax);
            // if(product_name.value.includes('#ckfull')){ total = 0; }

            if(window.lastTotal == total) return false;

            input_cod.value = Math.round(total);
            ['click', 'input', 'change'].forEach(e => input_cod.dispatchEvent(customEvent(e)));

            window.lastTotal = total;
            console.log(price, fee, tax, total);
            return true;
        } catch(e){
            alert('Lỗi cập nhật COD \n' + e.message + 'Mã lỗi: #1044');
            return false;
        }
    }

    $(document).on('change', 'form.create-order input#productName', function(){
        try{
            const product_price = window.document.querySelector('input#productPrice');
            const priceStr = this.value?.match(/\(.*\)/g)[0]?.replaceAll(/[\(\)]/g, '').trim();
            const priceStrFixed = priceStr.replaceAll(/\s+/g, '+').replaceAll(/\D{2,}/g, '+');

            this.value = this.value.replace(priceStr, priceStrFixed);
            ['click', 'input'].forEach(e => this.dispatchEvent(customEvent(e)));

            const priceTotal = (window.eval(priceStrFixed) || 0) * 1000;
            product_price.value = priceTotal;

            ['click', 'input', 'change'].forEach(e => product_price.dispatchEvent(customEvent(e)));
        }catch(err){
            alert('❌ Lỗi: ' + err.message)
        }
    });

     $(document).on('change', 'form.create-order input#productPrice', updateCOD);
     $(document).on('change', 'form.create-order input#autoAddress', _ => setTimeout(updateCOD, 1500));

    $(document).on('change', 'input#phoneNo', function(){
        if(this.value == TEST_PHONENUM) return;
        let product_name = window.document.querySelector('form.create-order input#productName');
        let v = product_name.value.replaceAll('❌', '').trim();
        product_name.value = v;
        ['click', 'input', 'change'].forEach(e => product_name.dispatchEvent(customEvent(e)));
    });

    $(document).one('click', 'div.vtp-bill-table td.mat-column-select', function(){
        window.onbeforeunload = function (e) {
            e = e || window.event;
            if (e) { e.returnValue = 'Sure?' }
            return 'Sure?';
        };
    });

    // ON CREATE ORDERS
    $(document).ready( async function(){
        const opts = GM_getValue('vtpCreateOrderOptions', {});

        let info_encode = UrlParams.get('query');
        if(!info_encode) return false;

        let info = JSON.parse(decodeURIComponent(escape(window.atob(info_encode.replaceAll(' ','+')))));

        let {uid,ref, phone, addr, name, prdName} = info;

        if(!uid || !phone || !ref) return alert('❌ Lỗi: ');

        // let col1 = $('div.box-receiver, div.box-sender').parent();
        // $('div.box-sender').appendTo(col1);
        // $('div.box-receiver').prependTo(col1);
        window.document.body.classList.add('custom');
        // s.prependTo(p);

        await delay(1000);

        window.addEventListener('beforeunload', _ => window.opener?.postMessage({ ref: ref }, '*') );

        // CHECK TRÙNG ĐƠN.
        $(document).on('change', 'form.create-order input#phoneNo', async function(){
            try{
                this.value = this.value?.replaceAll(/\D/g, '');
                this.dispatchEvent(customEvent('input'));
                if(!this.value || this.value == TEST_PHONENUM) return;

                let res = await VIETTEL.getListOrders(this.value);

                if(res?.status != 200) throw new Error();

                let orders = (res.data.data.LIST_ORDER || []).filter(o => !!~([-100, -108,100,102,103,104]).indexOf(o.ORDER_STATUS));

                let oLength = orders.length

                this.style['border-color'] = oLength ? 'coral' : 'greenyellow';

                oLength && alert('❌ CẢNH BÁO: \n\n SDT có đơn chưa gửi!!!?');

            } catch(err){
                alert('❌ Lỗi: ' + err.message);
            }
        });

        let isSample = phone == TEST_PHONENUM;

        let productName = window.document.querySelector('input#productName'),
            productPrice = window.document.querySelector('input#productPrice'),
            productWeight = window.document.querySelector('input#productWeight'),
            orderNo = window.document.querySelector('input#orderNo'),
            fullName = window.document.querySelector('input#fullName'),
            autoAddress = window.document.querySelector('input#autoAddress'),
            phoneNo = window.document.querySelector('input#phoneNo'),
            orderNote = window.document.querySelector('textarea#otherYeuCauGiao');

        fullName.value = name;
        fullName.setAttribute('disabled', 'true');

        phoneNo.value = phone;
        productWeight.value = opts.PRODUCT_WEIGHT || 1000;
        productName.value = prdName + (isSample ? '        ❌ ❌ ❌' : '' );
        autoAddress.value = isSample ? '(❌ Địa chỉ ảo), Đống Đa, Hà Nội' : '';
        orderNote.value = '⚠️ 𝗞𝗛𝗢̂𝗡𝗚 𝗫𝗘𝗠 𝗛𝗔̀𝗡𝗚 - ⚠️ 𝗞𝗛𝗢̂𝗡𝗚 𝗧𝗛𝗨̛̉ 𝗛𝗔̀𝗡𝗚';
        orderNo.value = ref;

        [fullName, productPrice, productName, productWeight, orderNo, autoAddress, phoneNo, orderNote].forEach(i => {
            orderNote.value = '⚠️ 𝗞𝗛𝗢̂𝗡𝗚 𝗫𝗘𝗠 𝗛𝗔̀𝗡𝗚 - ⚠️ 𝗞𝗛𝗢̂𝗡𝗚 𝗧𝗛𝗨̛̉ 𝗛𝗔̀𝗡𝗚';
            ['click', 'input', 'change'].forEach(e => i.dispatchEvent(customEvent(e)));
        });

        if(isSample){
            autoAddress.focus();
            autoAddress.scrollIntoView({ behavior: 'auto', block: 'center' });
        } else {
            phoneNo.click();
            phoneNo.focus();
            phoneNo.scrollIntoView({ behavior: 'auto', block: 'center' });
        }

        setInterval(updateCOD , 1000);

        $(document).keyup(function(e) {
            if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey){

                autoAddress.value = autoAddress.value.toLowerCase().replace(/((phường)|(xã)|(thị\strấn)|(p\.)|(x\.)|(tt\.)).*/g,'');
                autoAddress.dispatchEvent(customEvent('input'));

                const submitBtn = e.shiftKey ? $('#confirmCreateOrder button.btn.btn-viettel') : $('#confirmSaveDraft button.btn.btn-viettel');
                submitBtn.click();

                let doPrint = opts.qp_autoprint == 'ask' ? window.confirm('✅ Bạn có muốn in tem ko?') : opts.qp_autoprint;

                let interv = setInterval(async _ => {

                    // if($('input.is-invalid').length) return (alert('is-invalid'), clearInterval(interv));

                    const toast = $('div.toast-success div.toast-message');
                    const modal = $('div#createOrderSuccess.modal.show');

                    if(!toast.length && !modal.length) return;
                    clearInterval(interv);

                    if(!doPrint) return window.close();

                    let res = await VIETTEL.getListOrders(ref, 0, 0).catch(e => alert(e.message));

                    const order = res?.data?.data?.LIST_ORDER[0];
                    const oid = order?.ORDER_NUMBER;

                    res = await VIETTEL.getOrderPrint_v2(oid).catch(e => alert(e.message));
                    const link = res?.data?.enCryptUrl;
                    link && window.open(link, '_blank', 'toolbar=no, menubar=no, resizable=no, width=500, height=800, top=50, left=50"');

                    !link && alert(JSON.stringify(res));

                    await delay(100);
                    window.close();
                }, 500);
            }
        });
    });

})();


(function(){
    if(!isViettelPage) return;

    let onKeyDown = function(e){
        let buttons = $('div.mat-menu-content button.vtp-bill-btn-action');
        if(!buttons.length) return;
        if(e.key == 'i' || e.key == 'I'){
            e.preventDefault();
            $.each(buttons, (i, btn) => {
                if(btn.innerText != 'In đơn') return;
                btn.click();
                setTimeout(_ => $('div:is(#vtpModalPrintOrder, #vtpBillModalPrintOrder, #createOrderSuccess) button.btn:last-child')?.focus(), 200);
            });
        }
        if(e.key == 'd' || e.key == 'D'){
            e.preventDefault();
            $.each(buttons, (i, btn) => {
                if(btn.innerText != 'Duyệt đơn') return;
                btn.click();
                setTimeout(_ => $('div#vtpBillModalOrderApproval.modal.show div.col-6:first-child button')?.focus(), 200);
            });
        }
        if(e.key == 'h' || e.key == 'H'){
            e.preventDefault();
            $.each(buttons, (i, btn) => {
                if(btn.innerText != 'Hủy đơn') return;
                btn.click();
                setTimeout(_ => $('#vtpBillModalDeleteOrder.modal.show button.btn-confirm:not([data-dismiss])')?.focus(), 200);
            });
        }
        if(e.key == 'x' || e.key == 'X'){
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
                await delay(100);
                snd_true.play();
            } else {
                await delay(100);
                snd_fail.play();
            }

            $(input).val(id).focus().select();
        });

    });
})();

/***
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
***/




// "ORDER_NUMBER": "",
// "SENDER_STREET_NAME": "Phố Thái Hà",
// "SENDER_EMAIL": "",
// "SENDER_LATITUDE": 0,
// "SENDER_LONGITUDE": 0,
// "RECEIVER_STREET_NAME": "",
// "RECEIVER_LATITUDE": 0,
// "RECEIVER_LONGITUDE": 0,
// "PRODUCT_DESCRIPTION": "",
// "PRODUCT_WIDTH": null,
// "PRODUCT_HEIGHT": null,
// "PRODUCT_LENGTH": null,
// "DISPLAY_SERVICE_NAME": "Chuyển phát tiêu chuẩn",
// "ORDER_SERVICE_ADD": "SMS",
// "ORDER_TYPE_ADD": "",
// "ORDER_VOUCHER": "",
// "DELIVERY_CODE": -1,
// "MONEY_FEECOD": 5000,
// "MONEY_FEEVAS": 0,
// "MONEY_FEEINSURRANCE": 0,
// "MONEY_FEE": 0,
// "MONEY_FEEOTHER": 0,
// "MONEY_TOTALVAT": 1333,
// "MONEY_TOTAL": 0,,
// "LIST_ITEM": [
//     {
//         "ORDER_NUMBER_ITEM": 1,
//         "PRODUCT_NAME": "ten hang hoa",
//         "PRODUCT_QUANTITY": 1,
//         "PRODUCT_WEIGHT": 1000,
//         "PRODUCT_PRICE": 0
//     }
// ],
// "SENDER_POST_OFFICE_CODE": "",
// "SENDER_POST_OFFICE_NAME": "",
// "SENDER_BRANCH_CODE": "",
// "SENDER_POST_OFFICE_ADDRESS": "",
// "PICKUP_DATE": null,
// "PICKUP_TIME": null,
// "REMOVE_PICKUP_DATE": true,
// "OPTION_LOCATION": 0,
// "SENDER_ADDRESS": "165 Thái Hà,, Phố Thái Hà",
// "RECEIVER_ADDRESS": "đông la, hoài đưc , X.Đông La, H.Hoài Đức, TP.Hà Nội",
// "XMG_EXTRA_MONEY": 0,
// "deviceId": "wcfalna3z427py9o2v5ez"
// "ORDER_TYPE": 1,
// "MONEY_TOTAL": (collectMoney || 1000) * 1000,
//"ORDER_REFERENCE": (user.uid + '-' + makeid(10)),
// "RECEIVER_HOME_NO": "",
// "RECEIVER_ADDRESS": rawAddr,
// "MONEY_TOTALFEE": "",
