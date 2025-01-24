// ==UserScript==
// @name         Bum | FB - VTP
// @author       QuangPlus
// @version      2025-01-21
// @description  try to take over the world!
// @namespace    Bumkids_fb_vtp
// @downloadURL  https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main/script.js
// @updateURL    https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main/script.js
// @match        https://viettelpost.vn/*
// @match        https://api.viettelpost.vn/*
// @match        https://www.facebook.com/*
// @match        https://www.messenger.com/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=viettelpost.vn

// @grant        GM_log
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_addElement
// @grant        GM_notification
// @grant        GM_addValueChangeListener
// @grant        GM_webRequest
// @grant        GM_setClipboard
// @grant        window.onurlchange
// @grant        GM_registerMenuCommand

// ==/UserScript==

const myPhone = '0966628989', myFbName = 'Trịnh Hiền', myFbUserName = 'hien.trinh.5011';

function wait(ms = 1000){
    return new Promise(resolve => setTimeout(resolve, ms));
}
//var csv is the CSV file with headers
function csvJSON(csv){

  var lines=csv.split("\n");

  var result = [];

  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step
  // (you might convert them to &&& or something, then covert them back later)
  // jsfiddle showing the issue https://jsfiddle.net/
  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){

      var obj = {};
      var currentline=lines[i].split(",");

      for(var j=0;j<headers.length;j++){
          let label = headers[j].replaceAll('\"','');
          let value = currentline[j].replaceAll('\"','');
          obj[label] = value;
      }
      result.push(obj);

  }

  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}
const GoogleSheet = {
    query: function( sheet = 'PreOrder', range = 'A:A', queryStr = 'SELECT *'){
        return new Promise((resolve, reject) => {
            let ggsid = '1g8XMK5J2zUhFRqHamjyn6tMM-fxnk-M-dpAM7QEB1vs';
            let tq = encodeURIComponent(queryStr);
        //    let url = `https://docs.google.com/spreadsheets/d/${ggsid}/gviz/tq?tqx=out:json&sheet=${sheet}&range=${range}&tq=${tq}`;
            let url = `https://docs.google.com/spreadsheets/d/${ggsid}/gviz/tq?tqx=out:csv&sheet=${sheet}&range=${range}&tq=${tq}`;
            GM_xmlhttpRequest({
                url: url,
                method: "GET",
                synchronous: true,
                headers: {"Content-Type": "text/html; charset=utf-8"},
                onload: function (res) {
                    let json = csvJSON(res.response);
                    return resolve(JSON.parse(json));

                    return GM_log(JSON.parse(json));
                },
                onerror: function(res) {
                    console.log("error: ", res.message);
                    return reject(res.message);
                }
            });
        });
    },
    log: function(type = 'test', data = []){
        let form_id = '1FAIpQLSfebo4FeOLJjN7qItNX65z2Gg_MDeAJnUIhPxba8bPwpEMSmQ';
        let fields = [689021464,354401759,1477078849,2101594477,204892124,1251442348,94653935,814190568,733397838,718607793,570486205];
        return new Promise((resolve, reject) => {
            if(!type || !data) { return reject('input is invalid!') };
            let url = `https://docs.google.com/forms/d/e/${form_id}/formResponse?entry.${fields[0]}=${type}&${data.map((d, i) => (`entry.${fields[i+1]}=${encodeURIComponent(d)}`)).join('&')}`;
            console.log(url);

            GM_xmlhttpRequest({
                url: url,
                method: "GET",
                synchronous: false,
                headers: {"Content-Type": "text/html; charset=utf-8"},
                onload: function (res) {
//                    resolve(res);
                    if(res.readyState == 4 && res.status == 200) resolve(res);
                },
                onerror: function(res) {
                    console.log("error: ", res.message);
                    return reject('GG Log error: ' + res.message);
                }
            })
        })
    },
}
const viettel = {
    deviceId: GM_getValue('vtp_deviceId', null),
    token: GM_getValue('vtp_tokenKey', null),
    getReq: function(url){
        let i = this.deviceId, t = this.token;
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: url,
                method: "GET",
                synchronous: true,
                headers: { 'Authorization': 'Bearer ' + t },
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
        let i = this.deviceId, t = this.token;
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url:  url,
                method: "POST",
                synchronous: true,
                headers: { "Token": t, "Content-Type": "application/json" },
                data: JSON.stringify({...json, "deviceId": i}),
                onload: (response) => {
                    let res = JSON.parse(response.responseText);
                    return res.status == 200 ? resolve(res) : reject(res.message);
                },
                onerror: (e) => {
                    return reject(e.message || 'Lỗi viettelReqPost');
                }
            })
        })
    },
    updateToken: (async function(isForce){
        this.deviceId = await GM_getValue('vtp_deviceId', null);
        this.token = await GM_getValue('vtp_tokenKey', null);

        if(!(isForce || !this.deviceId || !this.token)) return true;
        this.deviceId = '';
        this.token = '';

        let updateUrl = 'https://viettelpost.vn/cau-hinh-tai-khoan';
        if(window.location.origin == 'https://viettelpost.vn' && window.location.href == updateUrl){
            await wait(2000);
            let id = window.localStorage.deviceId, token = JSON.parse(window.localStorage['vtp-token'] || "{}").tokenKey;
            id && token && window.opener.postMessage({ type:'updateToken', data:[id, token] }, '*')
        } else if(window.location.origin == 'https://www.facebook.com'){
            let popUp = window.open(updateUrl, "popup", "width=600,height=400");
            window.onmessage = e => {
                if (e.source != popUp || e.data.type !== 'updateToken' || !e.data.data) return true;
                popUp && !popUp.closed && popUp.close();
                this.deviceId = e.data.data[0];
                this.token = e.data.data[1];
                GM_setValue('vtp_deviceId', this.deviceId);
                GM_setValue('vtp_tokenKey', this.token);
            };

            await wait(5000);
            if(!this.deviceId || !this.token) {
                popUp && !popUp.closed && popUp.close();
                return alert('dang nhap lai viettel');
            }
        }
    })(0),
    getListOrders: function(phone){
        return new Promise((resolve, reject) => {
            if(!phone) return reject(new Error('Chưa có sdt'));
            let url = 'https://api.viettelpost.vn/api/supperapp/get-list-order-by-status-v2';
            let json = {
                "PAGE_INDEX": 1,
                "PAGE_SIZE": 10,
                "INVENTORY": null,
                "TYPE": 0,
                "DATE_FROM": getFormatedDate(-30),
                "DATE_TO": getFormatedDate(),
                "ORDER_PROPERTIES": phone,
                "ORDER_PAYMENT": "",
                "IS_FAST_DELIVERY": false,
                "REASON_RETURN": null,
                "ORDER_STATUS": "-100,-101,-102,-108,-109,-110,100,102,103,104,105,107,200,201,202,300,301,302,303,320,400,500,501,502,503,504,505,506,507,508,509,515,550,551,570",
            };
            this.postReq(url, json ).then(resolve).catch(e => reject(e.message));
        })
    }
};
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
    const today = new Date(new Date().getTime() + i * 24 * 60 * 60 * 1000);
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedToday = dd + '/' + mm + '/' + yyyy;
    return formattedToday;
}
function getListOrdersVTP(phone = null) {
    return new Promise((resolve, reject) => {
        console.log('getListOrdersVTP', phone)
      if(!phone) return reject(new Error('Chưa có sdt'));
        viettel.postReq("https://api.viettelpost.vn/api/supperapp/get-list-order-by-status-v2", {
            "PAGE_INDEX": 1,
            "PAGE_SIZE": 10,
            "INVENTORY": null,
            "TYPE": 0,
            "DATE_FROM": getFormatedDate(-30),
            "DATE_TO": getFormatedDate(),
            "ORDER_PROPERTIES": phone,
            "ORDER_PAYMENT": "",
            "IS_FAST_DELIVERY": false,
            "REASON_RETURN": null,
            "ORDER_STATUS": "-100,-101,-102,-108,-109,-110,100,102,103,104,105,107,200,201,202,300,301,302,303,320,400,500,501,502,503,504,505,506,507,508,509,515,550,551,570",
        }).then(res => {
            resolve(res);
        }).catch(e => {
            reject(e.message)
        });
    })
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
const PhoneBook = {
    data: null,
    key: 'fb_phoneBook',
    int: async function(force = false){
        this.data = await GM.getValue(this.key, null);
        GM_addValueChangeListener(this.key, (key, oldValue, newValue, remote) => {
            if(remote) this.data = newValue;
        });

        //console.log(this.data)

       if(this.data && !force) return;

        GM_log('Tải phonebook từ google sheet');

        this.data = new Object();
        let json = await GoogleSheet.query('phonebook', 'B:D', 'SELECT *' );
        this.data = json;

        /**
        let remap = json.rows.map(row => {
            try{ this.data[(row.c[0].v)] = (row.c[1].f || row.c[1].v).replaceAll(/\D/g, "") }
            catch(e){ console.error(e.message, row) }
        });
        **/
        GM_setValue(this.key, this.data);
    },
    get: function(fbid){
        console.log(fbid);
        let match = this.data.filter(function(e){
            return e.fbid == fbid;
        });

        let phone = match && match.pop()?.phone;

        return phone
    },
    set: function(info){
        let {fbid, phone, name} = info;
        this.data.push({fbid, phone, name});
        GoogleSheet.log('userInfo', [fbid, phone, name]);
        GM_setValue(this.key, this.data);
        return true;
    },
};

/***
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
***/

// FACEBOOK MAIN //

// STYLE
(function(){
    if((window.location.origin != 'https://www.facebook.com') && (window.location.origin != 'https://www.messenger.com')) return !1;

    GM_addStyle(`/* CSS START */
@keyframes blinker {
  50% {
    opacity: 0;
  }
}

div.infoCard {
  --border-color: lightgray;
  --bg-brightness: 1.5;
  --bg-toolBar: rgb(231 231 231 / 60%);
  --text-color: #000;
  min-height: 115px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--text-color);
  backdrop-filter: brightness(var(--bg-brightness)) blur(10px);
  box-shadow: 0 12px 28px 0 var(--shadow-1), 0 2px 4px 0 var(--shadow-1);
  font-weight: bolder;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 10px;
  width: calc(100% - 30px);
  max-height: unset;
  max-width: 350px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  filter: blur(0px);
  transition: all 1.5s ease-in-out;
  overflow: hidden;
  opacity: 1;
}

html.__fb-dark-mode div.infoCard {
  --border-color: gray;
  --bg-brightness: 0.5;
  --bg-toolBar: rgb(79 79 79 / 60%);
  --text-color: whitesmoke;
}

div.infoCard.refreshing {
  /* filter: blur(5px); */
}

div.infoCard ::selection {
  color: red;
  background: yellow;
}
div.infoCard:after {
  content: "";
  position: absolute;
  left: 4%;
  top: 101%;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 6px solid var(--border-color);
  clear: both;
}

div.infoCard.bottom {
  left: 10px;
  top: 64px;
  right: unset;
  bottom: unset;
}
div.infoCard.bottom:after {
  top: -8px;
  border-top: unset;
  border-bottom: 6px solid var(--border-color);
}

div.infoCard div.toolBar {
  text-align: center;
  background-color: var(--bg-toolBar);
  border-radius: 6px;
  display: flex;
  justify-content: space-around;
}
div.infoCard div.toolBar a {
  padding: 5px;
  flex: 1;
  opacity: 1;
  transition: all 0.5s ease-in-out;
}
/* div.infoCard div.toolBar:hover a:not(:hover) { opacity: .3; } */

div.infoCard div.card-bg {
  background: #bdc3c7;
  background: -webkit-linear-gradient(to right, #2c3e50, #bdc3c7);
  background: linear-gradient(to right, #2c3e50, #bdc3c7);
  z-index: -1;
  opacity: 0.5;
}

div.hasPhoneNum {
  border: 2px dashed red;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 5px;
}
div[aria-label="Nhắn tin"][role="button"] {
  border: 2px dashed red;
  border-radius: 6px;
}
div[role="list"] div[role="listitem"] span:hover {
  -webkit-line-clamp: 10 !important;
}

/*** Sửa chiều cao khung chat ***/
div:is(.__fb-dark-mode, .__fb-light-mode) > div > div[role="none"] > div {
  height: 65vh;
}

/**dsfdgdf**/
a[href*="/messages/e2ee/t/"]:after {
  content: "";
  position: absolute;
  top: 0px;
  right: 0px;
  width: 0.7em;
  height: 0.7em;
  background: lightcoral;
  border-radius: 50%;
}

/*** Đánh dấu cmt của người đăng ***/
div[aria-label*="Bình luận dưới tên Trịnh Hiền"] svg[role="none"] {
    border: 2px solid red;
    border-radius: 50%;
    padding: 0px;
}

/*** comment ***/
div[role="article"][aria-label*="Bình luận"] a[href*="?comment_id="] {
}


    /*** CSS END ***/`);
})();

const OrdersStorage = {
    key:'storage_5',
    data: null,
    init: function(force){
        this.data = GM_getValue(this.key, null);
        (!this.data || typeof this.data != 'object' || force) && this.sync();

        GM_registerMenuCommand("Đồng bộ lại đơn hàng!", function(event) {
            alert("Đồng bộ lại đơn hàng!");
        });

        GM_registerMenuCommand("Reset toàn bộ đơn hàng!", (event) => {
            this.data = new Array();
            this.save();
            GM_setValue(this.key, this.data);

        });
    },
    sync: function(){
        GM_log('sync from Clound!!');
        this.data = [];
    },
    add: function(info){
        return new Promise((resolve, reject) => {
            let values = Object.values(info);

            let {post_id_unique, post_id, cmt_id, cmt_txt, user_id, user_name} = info;

         //   if(!values.length) return alert('Dữ liệu không hợp lệ \nMã lỗi: #520');

            GoogleSheet.log('preorder', [post_id_unique, post_id, cmt_id, cmt_txt, user_id, user_name]).then(_ => {

                this.data = this.data.filter(o => o.cmt_id != cmt_id);
                this.data.push({post_id_unique, post_id, cmt_id, cmt_txt, user_id, user_name});
                this.save();

                console.log(this.data);
                return resolve(true);
            }).catch(error => {
                reject(error.message);
            })
        });
    },
    get: function(k){
        return this.data.filter(e => (e.user_id == k || e.cmt_id == k || e.post_id_unique == k || e.post_id == k));
    },
    del: function(k){

    },
    save: function(){
        console.clear();
        console.table(this.data);
        GM_setValue(this.key, this.data);
        GM_notification({
            title: "Order saved",
            text: "....",
        });
    }
};
OrdersStorage.init(0);

// FUNCTIONS
(function() {
    if((window.location.origin != 'https://www.facebook.com') && (window.location.origin != 'https://www.messenger.com')) return !1;
    const $ = window.jQuery, myUserName = 'hien.trinh.5011', myDisplayName = 'Trịnh Hiền';
  //  const preOrderPosts = [];
    PhoneBook.int();

    class InfoCard{
        constructor(info, container){
            this.container = container;
            this.id = info.id;
            this.name = info.name;2
            this.picUrl = info.picUrl;
            this.phone = PhoneBook.get(this.id);
            this.penddingOrders = 0;

            this.card = GM_addElement(container, 'div', { class: 'infoCard refreshing', 'data-fbid': this.id });
            if(window.location.pathname.includes('/messages/') || window.location.hostname == 'www.messenger.com') {
                this.card.classList.add('bottom');
            }

            this.infoList = GM_addElement(this.card, 'table', { style: 'padding-bottom: 5px;' });
            let toolBar = GM_addElement(this.card, 'div', { class: 'toolBar' });

            this.searchBtn = GM_addElement(toolBar, 'a', { style: 'color:dodgerblue;'});
            this.searchBtn.innerText = 'Tìm sđt';
            this.searchBtn.onclick = _ => this.phoneScanning();

            let btn_2 = GM_addElement(toolBar, 'a', { style: 'color:red;'});
            btn_2.innerText = 'Sửa sđt';
            btn_2.onclick = _ => this.setPhone();

            let btn_4 = GM_addElement(toolBar, 'a', { style: 'color:yellow;'});
            btn_4.innerText = 'Order';
            btn_4.onclick = _ => this.preOrder(btn_4);

            let btn_3 = GM_addElement(toolBar, 'a', { style: 'color:limegreen;'});
            btn_3.innerText = 'Tạo đơn';
            btn_3.onclick = _ => this.createOrder();

            this.refreshInfo();
            this.eventsListener();

            // Set phone by mouse selection
            this.container.onmouseup = _ => {
                if(!window.getSelection) return;
                let phone = window.getSelection().toString().replaceAll(/\D/g,'');
                if(!isVNPhone(phone) || phone == this.phone || phone == myPhone){
                    return false;
                } else if(!this.phone || confirm("Xác nhận đổi sdt cho " + this.name + " thành: " + phone + "?")){
                    this.setPhone(phone);
                }
            }
            let bg = GM_addElement(this.card, 'div', { class: 'card-bg', style: 'position: absolute; top: 0; right: 0; bottom: 0; left: 0; ' });
            let copyright = GM_addElement(this.card, 'small', {style: 'opacity: .5; position: absolute; top: 8px; right: 8px;'});
            copyright.innerHTML = '<a href="/trinhdacquang" target="_blank" style="color: inherit;">© QuangPlus</a>'
        }
        async preOrder(b){ //preorder
            try{
                if(window.busy_xjr) throw new Error('bận...');

                let match = window.location.pathname.match(/\/posts\/\w+/g);
                let postId = match? match[0]?.replace('/posts/', '') : null;
                if(!postId) throw new Error('Mở bài viết order!');

                let story_message = document.querySelector('div[role="dialog"] div[data-ad-rendering-role="story_message"] div[data-ad-comet-preview="message"]').innerText;

                let note = window.prompt(`Nhập ghi chú cho đơn hàng: ${this.name} \n\nBài post: "${story_message.substr(0, 70)}..."`, GM_getValue('lastest_preorder_note', ''));
                if(note == null || note == 'null') return;
                GM_setValue('lastest_preorder_note', note);

                let odid = makeid().toLowerCase();
                window.busy_xjr = 1;
                await GoogleSheet.log('preorder', [odid, postId, this.id, this.name, note]).then(res => {
                    GM_notification({
                        image: this.picUrl,
                        title: "Tạo đơn order",
                        text: this.name + ": " + note ,
                        timeout: 10000,
                    });
                   // alert('Pre-order \n' + this.name)
                });
                return true;
            } catch(e){
                return alert(e.message);
            } finally{
                window.busy_xjr = 0;
            }
        }
        async refreshInfo(){
            if(this.isBusy) return;
            this.isBusy = 1;
            let i = {rate: 'Chưa có', total: 0, pending: 0, draft: 0, preOrder: 0, totalCOD: 0};
            this.infoList.innerHTML = '</tr><tr><td style=" ">Đang tải...</td></tr> <tr><td>&nbsp</td></tr> <tr><td>&nbsp</td></tr> <tr><td>&nbsp</td></tr>';
            this.card.classList.add('refreshing');

            try{
                /**
                let json = await gooogleSheetQuery('SELECT * WHERE O = '+this.id, 'N2:P', 'PreOrder');
                console.log(json);
                let cols = json.cols;
                let orders = new Array(...json.rows.map(function(row, i){
                    let r = {};
                    row.c.forEach((o, i) => { r[cols[i].label] = o.f || o.v});
                    return r;
                }));
                this.preOrderPostsId.push(...orders.map(a => a.post_id));
                **/
                console.log(this.phone);
                let orderList = await viettel.getListOrders(this.phone);
                if(orderList.error) throw new Error('Viettel: ' + orderList.message);
                let list = orderList.data.data.LIST_ORDER;
                i.total = orderList.data.data.TOTAL;
                i.totalCOD = orderList.data.data.TOTAL_COLLECTION.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                i.pending = list.filter(function(o){ return !!~([-108,100,102,103,104]).indexOf(o.ORDER_STATUS) }).length;
                i.draft = list.filter(function(o){ return (o.ORDER_STATUS == -100) }).length;
                this.holdedOrders = (i.draft + i.pending);

                let vtlink = 'https://viettelpost.vn/quan-ly-van-don?q=1&p='+btoa(this.phone);
                this.infoList.innerHTML = `
                <tr style="display:none;"><td>ID:</td> <td>${this.id}</td></tr>
                <tr>
                  <td>SĐT: </td> <td>${this.phone}</td>
                </tr>
                <tr style="display:none;">
                  <td>Uy tín: </td> <td>${i.rate}</td>
                </tr>
                <tr style="display:none;">
                  <td>Đặt trước: </td> <td>${i.preOrder}</td>
                </tr>
                <tr>
                  <td>Đơn giữ: </td>
                  <td><a href="${vtlink}" target="_blank" style="color: ${this.holdedOrders?'red':'inherit'}">${i.pending} chờ • ${i.draft} nháp</a></td>
                </tr>
                <tr>
                  <td>Tổng COD: </td> <td>${i.total} đơn • ${i.totalCOD}</td>
                </tr>`;


            } catch(e){
                this.infoList.innerHTML = `<tr style="color:orangered; text-align: center;"><td>${e.message}</td></tr>`;
            } finally{
                this.isBusy = 0;
                this.card.classList.remove('refreshing');
            }
        }
        async phoneScanning(){
            let txt = ["Tìm sđt", "Dừng"];
            //aria-label="Xem tin nhắn mới đây nhất"
            if(this.interval_4123){
                window.clearInterval(this.interval_4123);
                this.interval_4123 = 0;
                this.searchBtn.innerText = txt[0];
                return;
            } else {
                this.searchBtn.innerText = txt[1];
                this.interval_4123 = setInterval(() => {
                    this.container.querySelectorAll('div').forEach(d => { d.scrollTop = 0 });

                    let topAvt = this.container.querySelector('div[aria-label="'+this.name+'"][role="img"]');
                    topAvt && this.phoneScanning();

                    let rows = this.container.querySelectorAll('div:is(.__fb-dark-mode, .__fb-light-mode)[role="row"]:not(.scanned)');

                    for (let i = (rows.length - 1); i >= 0; i--) {
                        let row = rows[i];
                        console.log(row)
                        row.classList.add('scanned');
                        let text1 = row.innerText;
                        let text = text1.replaceAll(/(\.|\,|\-|\s)/g, '');
                        console.log(text)
                        let match = text.match(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})/g);
                        if(match && !~match.indexOf(myPhone)){
                            this.phoneScanning();
                            row.style.border = '1px solid red';
                            row.style['border-radius'] = '5px';
                            row.style.overflow = 'hidden';
                            let i = setInterval(_ => row.scrollIntoView( {block: "center", inline: "nearest"}) , 200);
                            setTimeout(_ => clearInterval(i), 5000);
                            row.addEventListener('click', _ => clearInterval(i));
                            break;
                        }
                    }

                }, 500);
            }
        }
        phoneSearching_Stop(e){
            window.clearInterval(this.searchLoop);
            this.searchBtn.innerText = 'Tìm sđt';
            this.searchLoop = 0;

            if(!e) return;

            e.classList.add('hasPhoneNum');
            e.dispatchEvent(customEvent('mouseover'));

            for(let i = 0; i <= 10; i++){
                setTimeout(() => {
                    e.scrollIntoView( {block: "center", inline: "nearest"});
                    //e.querySelector('div[aria-haspopup="menu"][role="button"][aria-label="Xem thêm"]:not([aria-expanded="true"])')?.click();
                }, i * 100);
            }
        }
        async setPhone(phone = window.prompt("Nhập sđt cho " + this.name, this.phone)){
            if(phone == null || phone == '' || !isVNPhone(phone)) return;
            this.phone = phone;
            let inf = {fbid: this.id, phone: this.phone, name:this.name}
            PhoneBook.set(inf);
            //let data = {uid: this.id, phone:phone, name:this.name, tag:'tags'}
            //Customers.set(data)
            this.refreshInfo();
        }
        createOrder(){
            try{
                if(!this.phone) throw new Error('❌ Vui lòng cập nhật sđt trước!');
                if(this.holdedOrders) throw new Error('❌ Có đơn chờ giao');

                let url = 'https://viettelpost.vn/order/tao-don-le?i=';

                let info = new Object();
                info.fbid = this.id;
                info.phone = this.phone;
                info.name = this.name;

                let prices_str = prompt("B1 - Điền giá \n(đv nghìn đồng, phân tách bằng dấu cách để tính tổng)", GM_getValue('lastest_prices', 0));
                if (prices_str == undefined || prices_str == null) { return false }
                let price = prices_str.trim().split(/\D+/g).reduce((pv, cv) => pv + parseInt(cv || 0), 0);

                let itemNameList = GM_getValue('lastest_items_list', []);
                let list = itemNameList.map((e, i) => `[${i}] ${e}`).join('\n');
                let itn = prompt(`Chọn tên sp có sẵn hoặc nhập tên sản phẩm mới: \n ${list}`, itemNameList[0] || '');
                if (itn == null || itn == undefined) return false;

                itn = itemNameList[itn] || itn
                itemNameList.unshift(itn);
                itemNameList = itemNameList.filter((value, index, array) => array.indexOf(value) === index );
                GM_setValue('lastest_items_list', itemNameList.slice(0, 10));

                info.prdName = itn + ' - \(' + prices_str + '\)';
                info.price = (price*1000);

                url += btoa(unescape(encodeURIComponent(JSON.stringify(info))));

                window.popupWindow?.focus();
                window.popupWindow = window.open(url, 'window', 'toolbar=no, menubar=no, resizable=no, width=1200, height=800');
                window.addEventListener('message', (ev) => { ev.data.fbid === this.id && this.refreshInfo() });

                GM_setValue('lastest_prices', prices_str);
                //GM_setValue('lastest_order_name', itn);
            }
            catch(e){ alert(e.message) }
        }
        eventsListener(){
            this.container.addEventListener("click", function(e){
                const target = e.target.closest('div[aria-label="Trả lời"][role="button"]'); // Or any other selector.
                target && GM_setClipboard("e gửi về địa chỉ này c nhé", "text");
            });

            this.container.addEventListener("keypress", function(e) {
                console.log(e);
                if (e.keyCode == 113 && e.ctrlKey == true) {
                    alert('hi.');
                }
            });
        }
    }

    window.document.addEventListener('mousemove',function(){
        if(window.busy_xxag) return;
        let ee = window.document.querySelectorAll(`div:not([hidden]) > div:is(.__fb-dark-mode, .__fb-light-mode) div[role="button"][aria-label="Cài đặt chat"] a[role="link"][href^="/"][aria-label]`);
//        let ee = window.document.querySelectorAll(`a[aria-label][href^="/"][role="link"]:not([aria-label=""], [aria-label="Mở ảnh"], [aria-label="Trang cá nhân"]):not(.checked)`);
        if(window.location.origin == 'https://www.messenger.com') {
            ee = window.document.querySelectorAll(`a[aria-label][href^="https://www.facebook.com/"][role="link"]:not([aria-label=""], [aria-label="Xem tất cả trong Messenger"], [aria-label="Tin nhắn mới"], [aria-label="Mở ảnh"], [aria-label="Thông báo"], [aria-label="Trang cá nhân"]):not(.checked)`);
        }
        for(let i = 0; i < ee.length; i++){
            let e = ee[i];
            e.classList.add('checked');

            let id = e.getAttribute('href').replaceAll('https://www.facebook.com/', '').replaceAll('/', '');
            if((/\D+/g).test(id)) continue;
            if(window.document.querySelector('div.infoCard[data-fbid="'+id+'"]')) continue;

            let name = e.getAttribute('aria-label');
            let picUrl = e.querySelector('img')?.getAttribute('src');
            if(!picUrl) continue;

            let info = {id, name, picUrl};
            console.log(info);

            let p = e.closest('div:is(.__fb-dark-mode, .__fb-light-mode)');
            let card = new InfoCard(info, p);
        }
        window.busy_xxag = 1;
        window.timeout = setTimeout(function(){
            window.busy_xxag = 0;
        }, 1000);
    })

    $(document).ready(function(){
        ////////////////////////////////////////////////////////////////
        class PreOderBtn{
            constructor(article){
                let cmt_text_elm = article.querySelector('span[lang]');
                this.cmt_txt = cmt_text_elm?.innerText.replaceAll('\n', ' ');
                this.cmt_id = article.querySelector('a[role="link"][href*="posts"][href*="comment_id"]')?.getAttribute('href').match(/comment_id=\d+/g)[0].replace('comment_id=', '');

                this.btn = GM_addElement(cmt_text_elm.parentNode, 'span', {
                    style:'font-size: 90%; font-weight: 700; width: fit-content; color: yellow; display: block; margin-top: 10px; cursor: pointer;'
                });

                this.btn.innerText = '👩‍💼 định danh';

                this.check();
                this.btn.onclick = _ => this.handleClick();
            }
            check(){
                let matchs = OrdersStorage.get(this.cmt_id);
                if(matchs && matchs.length){
                    let current = matchs.pop();
                    let {cmt_id, user_id, user_name} = current;
                   // user_name = unescape(user_name);
                    this.user_id = user_id;
                    this.user_name = user_name;

                    this.btn.innerText = '👩‍💼 ' + (user_name || user_id);
                    this.btn.style.color = 'red';
                };
            }
            handleClick(){
                if(!this.user_id) this.selectUser();
                else {
                    let i = prompt('Chọn thao tác: \n[0] - Mở facebook '+ this.user_name + '\n[1] - Sửa thông tin', '0');
                    if(i === null) return;
                    switch(i){
                        case '0':
                            window.open('https://fb.com/'+this.user_id, '_blank');
                            break;
                        case '1':
                            this.selectUser();
                            break;
                        default:
                            break;
                    }
                }
            }
            selectUser(){
                let story_message = document.querySelector('div[role="dialog"] div[data-ad-rendering-role="story_message"]')?.innerText;
                let cmt_info = {
                    post_id: location.pathname.split('\/').pop(),
                    post_id_unique: window.btoa(unescape(encodeURIComponent(story_message))).replaceAll(/[^\d\w]*/g, '').substr(0, 50),
                    cmt_id: this.cmt_id,
                    cmt_txt: this.cmt_txt
                };

                let chatBoxs = document.querySelectorAll('div:not([hidden]) > div:is(.__fb-dark-mode, .__fb-light-mode) div[role="button"][aria-label="Cài đặt chat"] a[role="link"][href^="/"][aria-label]');
                let chatList = Object.values(chatBoxs).map(e => {
                    return {name: e.getAttribute('aria-label'), id: e.getAttribute('href').replaceAll('/','')}
                });
                if(!chatList.length) return alert('⚠ Không có khung chat nào đang mở! \nVui lòng mở khung chat với khách hàng trước khi thao tác! \nMã lỗi: #865');
                let selectList = chatList.map((e, i) => `[${i}] - ${e.name} - id: ${e.id}`).join('\n');

               // GM_log(cmt_info);
                let n = prompt('Nội dung Comment: ' + cmt_info.cmt_txt + '\n\nChọn thông tin khách theo số thứ tự dưới đây:\n' + selectList, 0);
                if(n == null) return;

                let {name, id} = chatList[n];
                if(!name || !id) return alert('Dữ liệu nhập vào không hợp lệ!! \nMã lỗi: #875');

                cmt_info.user_id = id;
                cmt_info.user_name = name;
              //  GM_log(cmt_info);

                OrdersStorage.add(cmt_info).then(_ => {
                    this.check();
                });
            }
        }

        window.document.addEventListener('mousemove', function(){
            if((/facebook\.com\/.*posts\/[\d\w]+/g).test(location.href) == false) return true;
            let post_id = location.pathname.split('\/').pop();
            let text = document.querySelector('div[role="dialog"] div[data-ad-rendering-role="story_message"]')?.innerText;
            let post_id_unique = window.btoa(unescape(encodeURIComponent(text))).replaceAll(/[^\d\w]*/g, '').substr(0, 50);

            let articles = document.querySelectorAll('div[role="article"][aria-label*="Bình luận dưới tên '+myFbName+'"]:not(.checked)');
            articles.forEach(article => {
                article.classList.add('checked');
                Object.values(article.querySelectorAll('div[role="button"]')).forEach(b => b.innerText == 'Xem thêm' && b.click());

                new PreOderBtn(article);
            })
        });
    });

    $(document).ready(function(){
        if((window.location.origin != 'https://www.facebook.com')) return !1;
        if(!(/\/posts\/.+/g).test(window.location.pathname)) return !1;

        let post_id = window.location.pathname.split('/').pop();
        console.log(post_id);

        let table = GM_addElement(document.body, 'table', {id:'orderUserList'});
        let reload = function(){
            let story_message = document.querySelector('div[role="dialog"] div[data-ad-rendering-role="story_message"]')?.innerText;
            let post_id_unique = window.btoa(unescape(encodeURIComponent(story_message))).replaceAll(/[^\d\w]*/g, '').substr(0, 50);
            let matchs = OrdersStorage.get(post_id_unique);
            console.table(matchs);
            table.innerHTML = '<thead><tr><th>Name</th><th>Comment</th></tr></thead>';
            table.innerHTML += '<tbody>';
            table.innerHTML += matchs.map(r => `<tr><td><a href="https://fb.com/${r.user_id}" target="_blank">${r.user_name}</a></td><td><a href="?comment_id=${r.cmt_id}">${r.cmt_txt}</a></td></tr>`).join('');
            table.innerHTML +='</tbody>';
        }
        setTimeout(reload, 1000);
        GM_addValueChangeListener(OrdersStorage.key, function(key, oldValue, newValue, remote) {
            reload();
        });


        GM_addStyle('#orderUserList{color: white; position: absolute; top: 0; left: 0; text-align: left; padding: 10px; max-width: 500px;}');
        GM_addStyle('#orderUserList tr > td:first-child{white-space: nowrap}');
    });

})();



/***
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
***/

// VIETTEL MAIN //
(function($) {
    if(window.location.origin != 'https://viettelpost.vn') return !1;

    GM_addStyle(`/* ViettelPost custom css */
    body.vt-post.custom nav#sidebar, body.vt-post div.option-setting, body.vt-post mat-tab-header, body.vt-post header-app {display: none;}
    body.vt-post.custom div.box-product-info div.card-body { max-height: 210px; overflow: auto; }
    body.vt-post.custom div.box-receiver div.card-body { max-height: 400px; overflow: auto; }
    body.vt-post.custom #createEditForm > div.mt-3.vt-order-footer > div > div.row.col-lg-8.resp-border-money > div:nth-child(3) > div > strong.txt-color-viettel {color: orangered !important; font-size: 30px;}
    body.vt-post.custom button {text-wrap: nowrap;}
    body.vt-post.custom div.box-receiver div.card-body group small {color: red !important; font-size: 14px;}
    body.vt-post.custom #content {width: 100% !important; margin-left: 0;}
    div.dieukhoan {display:none;}
    .mat-menu-item-highlighted:not([disabled]), .mat-menu-item.cdk-keyboard-focused:not([disabled]), .mat-menu-item.cdk-program-focused:not([disabled]), .mat-menu-item:hover:not([disabled]){background: gray;}


    /* ViettelPost custom css */`);
//  .cdk-overlay-pane{position: fixed !important; left: var(--left-value) !important;}
    let i = window.localStorage.deviceId;
    let t = i && JSON.parse(window.localStorage['vtp-token']).tokenKey;
    GM_setValue('vtp_deviceId', i);
    GM_setValue('vtp_tokenKey', t);

    function total_price_func(e){
        let value = e.target.value;
        let match = (value).match((/\((\d+\s*)+\)/));
        let total_price = 0, fee = 0, cod = 0;
        fee = parseInt(($('.mt-3.vt-order-footer .resp-border-money .txt-color-viettel span')?.text() || 0 ).replaceAll(/\D/g,''));
        if(fee && match && match[0]){
            let ns = match[0].replace('(', '').replace(')', '');
            total_price = ns.split(/\s+/).reduce((partialSum, a) => partialSum + Number(a)*1000, 0);
            cod = fee + total_price;

            //prompt( `Giá: ${match[0].replaceAll(' ',' + ')} \nPhí ship: ${fee/1000}k \nTổng COD:`, cod);
            $('input#productPrice').val(cod);
        }
    }

    //$(document).off('click', '#productName', total_price_func);
    $(document).on('change', '#productName', total_price_func)

    $(document).ready( async function(){
        await new Promise(resolve => { setTimeout(resolve, 1000)});

        if(window.location.pathname != '/order/tao-don-le') return !1;
        const urlParams = new URLSearchParams(window.location.search);
        let info_encode = urlParams.get('i');
        let info = JSON.parse(decodeURIComponent(escape(window.atob(info_encode.replaceAll(' ','+')))));
        const fbid = info.fbid;
        let phoneNoInput = window.document.querySelector('input#phoneNo');
        let status = GM_getValue('vtp_duplicateCheckStatus') || 200;
        $(phoneNoInput).attr('placeholder', `Nhập số điện thoại để tự điền thông tin người nhận \| check trùng ${status == 200 ? '🟢' : '🔴'}`);
        $(phoneNoInput).on('change', async function(){
            try{
                this.value = this.value.replaceAll(/\D/g, '');
                this.dispatchEvent(customEvent('input'));
                if(!isVNPhone(this.value)) return;

                let res = await viettel.getListOrders(this.value).catch(e => {throw new Error()});
                GM_setValue('vtp_duplicateCheckStatus', res?.status);

                if(res?.status != 200) throw new Error();

                let list = res.data.data.LIST_ORDER;
                let holdOrders = list.filter(function(o){return !!~([-100,-108,100,102,103,104]).indexOf(o.ORDER_STATUS)});

                if(holdOrders.length){
                    alert('Sđt đang có đơn giữ/chờ lấy! ❌❌❌');
                    let lastestOrder = holdOrders[0].ORDER_NUMBER;
                    window.location.href = 'https://viettelpost.vn/thong-tin-don-hang?peopleTracking=sender&orderNumber=' + lastestOrder;
                }
            } catch(e){
                alert('Lỗi check trùng đơn! ❌❌❌');
            }
        });

        function updateCOD(callback){
            try{
                let price = parseInt(window.document.querySelector('input#productPrice').value.replaceAll('.', '') || 0);
                let fee = parseInt(window.document.querySelector('.mt-3.vt-order-footer .resp-border-money .txt-color-viettel span').textContent.replaceAll(/[\. đ \s]/g,'') || 0);
                if(!price || !fee) return false;

                let input = window.document.querySelector('input#cod'),
                    p = parseInt(price),
                    f = parseInt(fee)
                input.value = p + f;
                input.dispatchEvent(customEvent('input'));
                input.dispatchEvent(customEvent('change'));

                let n = window.document.querySelector('.box-product-info + div .ng-star-inserted .custom-switch input#switch1');
                n.checked = true;
                n.dispatchEvent(customEvent('change'));

                return callback();
            } catch(e){
                return false;
            }
        }

        $(document).on('change click', 'input#productPrice', updateCOD);

        $(document).keyup(function(e) {
            if (e.key === "Escape") { // escape key maps to keycode `27`
                $('button.close').click();
            }
            if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey){
                if(e.shiftKey){
                    $('#confirmCreateOrder button.btn.btn-viettel.btn-sm').click();
                } else {
                    $('#confirmSaveDraft button.btn.btn-viettel.btn-sm').click();
                }

                // IN TEM
                let printableStatus = [-108,100,102,103,104];
                let phone = info.phone;
                if(!phone) return;


                setTimeout(() => {
                    viettel.getListOrders(phone).then(data => {
                        let lastest = data.data.data.LIST_ORDER[0];
                        let lastest_date = new Date(Date.parse(lastest?.ORDER_SYSTEMDATE || 0)).getDate();
                        let today_date = new Date().getDate();
                        if( !lastest || lastest_date != today_date) throw new Error('Không tìm thấy đơn hàng mới!');
                        return(lastest);
                    }).then(async order => {
                        let o = order.ORDER_NUMBER;
                        let status = order.ORDER_STATUS;
                        if(!~printableStatus.indexOf(status)){ /** throw new Error('new order not found!'); **/ }

                        let json = await viettel.postReq("https://api.viettelpost.vn/api/setting/encryptLinkPrintV2", {
                            "TYPE": 100,
                            "ORDER_NUMBER": o,
                            "IS_SHOW_POSTAGE": 0,
                            "PRINT_COPY": 1
                        });
                        if(!json.error && json?.data?.enCryptUrl){
                            let link = json.data.enCryptUrl
                           // alert(link);
                            window.open(link+'&status='+status, '_blank', 'toolbar=no, menubar=no, resizable=no, width=800, height=800, top=50, left=960"');
                            setTimeout(window.close, 200);
                        } else {
                            throw new Error('getPrintLink not found!');
                        }

                        //window.location.href = link+'&status='+status;
                        //return json.data.enCryptUrl+'&status='+status;
                    }).then(link => {

                    }).catch(e => {
                        alert(e.message);
                        window.location.href = 'https://viettelpost.vn/quan-ly-van-don';
                    });
                }, 1000)
            }
        });

         window.onbeforeunload = function(e) {
            //e.preventDefault();
            window.opener?.postMessage({fbid: fbid, orderId: null}, '*');
        };

        /**
        function beforeunload(e){
            // Cancel the event
            e.preventDefault();
            // Chrome requires returnValue to be set
            e.returnValue = '';
        }
        window.addEventListener('beforeunload',beforeunload);
        **/

        if(!fbid) return true;

        let phone = info.phone,
            addr = info.addr,
            name = info.name,
            price = info.price,
            prdName = info.prdName;

        let s = $('div.box-receiver'),
            p = s.parent();

        window.document.body.classList.add('custom');
        s.prependTo(p);

        let fn = window.document.querySelector('input#fullName');
        $(window.document.body).on('click keyup keydown', function(){
            fn.value = name;
            fn.dispatchEvent(customEvent('input'));
            fn.dispatchEvent(customEvent('change'));
        })

        let pn = window.document.querySelector('input#productName');
        pn.value = prdName

        let pr = window.document.querySelector('input#productPrice');
        pr.value = price;

        let pw = window.document.querySelector('input#productWeight');
        pw.value = 500;

        let odn = window.document.querySelector('input#orderNo');
        let d = new Date();
        odn.value = fbid + '-' + d.getFullYear() + d.getMonth() + d.getDay();

        phoneNoInput.value = phone;

        [pr, pn, pw, odn, phoneNoInput].forEach(i => {
            i.dispatchEvent(customEvent('input'));
            i.dispatchEvent(customEvent('change'))
        });

        phoneNoInput.click();
        phoneNoInput.focus();

        let iv = setInterval(function(){
            updateCOD(function(){ clearInterval(iv) });
        }, 500);
    });

})($);

(function($){
    $(window.document).ready(function(){
        if(!window.location.href.includes('viettelpost.vn')) return;
        /**
        let interval = setInterval(function(){
            let select = window.document.querySelector('mat-select[role="listbox"][aria-label="Bản Ghi Mỗi Trang"]');
            if(!select) return;
            select.click();
            let option = window.document.querySelector('mat-option#mat-option-3[role="option"]');
            if(!option) return;
            option.click();
            clearInterval(interval);
        }, 500);
        **/

        // menu quản lý đơn
        var mouseX, mouseY;
        $(document).mousemove(function(e) { mouseX = e.pageX; mouseY = e.pageY; });

        $(document).on('contextmenu', 'div.vtp-bill-table > table > tbody > tr', function(e) {
            event.preventDefault();
            let row = $(e.currentTarget);
            let btn = row.find('td.mat-column-ACTION label i.fa-bars');
            btn && btn.click();
            row.css('background-color', '#e3f0f0');
            $('body').css('--left-value', mouseX+'px');
        });
    })
})($);

(async function(){
    return
    GM_notification({
        text: "This is the notification message.",
        title: "Notification Title",
        url: 'https:/example.com/',
        onclick: (event) => {
            // The userscript is still running, so don't open example.com
            event.preventDefault();
            // Display an alert message instead
            alert('I was clicked!')
        }
    });

})();




/****
function phone2Recievers(phone = null) {
    return new Promise((resolve, reject) => {
        if(!phone) return reject(new Error('Chưa có sdt'));

        let token = GM_getValue('vtp_tokenKey');
        if (!token) return reject('Lỗi 0012');

        GM_xmlhttpRequest({
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + token
            },
            url:  "https://io.okd.viettelpost.vn/order/v1.0/receiver/_suggest?q=" + phone,
            onload: function (response) {
                console.log (
                    "GM_xmlhttpRequest() response is:\n",
                    response.responseText.substring (0, 80) + '...'
                );
                return resolve(JSON.parse(response.responseText));
            },
            onerror: function(reponse) {
                console.log("error: ", reponse);
                return reject(reponse)
            }

        })
    })
}
***/
