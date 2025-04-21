// ==UserScript==
// @name         Bum | FB - VTP
// @author       QuangPlus
// @version      2025-04-20
// @description  try to take over the world!
// @namespace    Bumkids_fb_vtp
// @icon         https://www.google.com/s2/favicons?sz=64&domain=viettelpost.vn

// @downloadURL  https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main/script.js
// @updateURL    https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main/script.js

// @match        https://viettelpost.vn/*
// @match        https://www.facebook.com/*
// @match        https://www.messenger.com/*
// @match        https://api.viettelpost.vn/*

// @require      https://code.jquery.com/jquery-3.7.1.js

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
            let url = `https://docs.google.com/spreadsheets/d/${ggsid}/gviz/tq?tqx=out:csv&sheet=${sheet}&range=${range}&tq=${tq}`;
            GM_xmlhttpRequest({
                url: url,
                method: "GET",
                synchronous: true,
                headers: {"Content-Type": "text/html; charset=utf-8"},
                onload: function (res) {
                    let json = csvJSON(res.response);
                    return resolve(JSON.parse(json));

                  //  return GM_log(JSON.parse(json));
                },
                onerror: function(res) {
                    GM_log("error: ", res.message);
                    return reject(res.message);
                }
            });
        });
    },
    submitForm: function(url){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: url,
                method: "GET",
                synchronous: false,
                headers: {"Content-Type": "text/html; charset=utf-8"},
                onload: function (res) {
                    if(res.readyState == 4 && res.status == 200) resolve(res);
                },
                onerror: function(res) {
                    GM_log("error: ", res.message);
                    return reject('GG Log error: ' + res.message);
                }
            })
        })
    },
    log: function(type = 'test', data = []){
        let form_id = '1FAIpQLSfebo4FeOLJjN7qItNX65z2Gg_MDeAJnUIhPxba8bPwpEMSmQ';
        let fields = [689021464,354401759,1477078849,2101594477,204892124,1251442348,94653935,814190568,733397838,718607793,570486205];
        return new Promise((resolve, reject) => {
            if(!type || !data) { return reject('input is invalid!') };
            let url = `https://docs.google.com/forms/d/e/${form_id}/formResponse?entry.${fields[0]}=${type}&${data.map((d, i) => (`entry.${fields[i+1]}=${encodeURIComponent(d)}`)).join('&')}`;
            //GM_log(url);
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
                    GM_log("error: ", res.message);
                    return reject('GG Log error: ' + res.message);
                }
            })
        })
    },
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


const viettel = {
    init: function(){
        this.deviceId = GM_getValue('vtp_deviceId', null);
        GM_addValueChangeListener('vtp_deviceId', (key, oldValue, newValue, remote) => {
            if(remote) this.deviceId = newValue;
        });

        this.token = GM_getValue('vtp_tokenKey', null);
        GM_addValueChangeListener('vtp_tokenKey', (key, oldValue, newValue, remote) => {
            if(remote) this.token = newValue;
        });
    },
    getReq: function(url){
       // let i = this.deviceId, t = this.token;
        let token = this.token;
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: url,
                method: "GET",
                synchronous: true,
                headers: { 'Authorization': 'Bearer ' + token },
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
        let deviceId = this.deviceId, token = this.token;
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url:  url,
                method: "POST",
                synchronous: true,
                headers: { "Token": token, "Content-Type": "application/json" },
                data: JSON.stringify({...json, "deviceId": deviceId}),
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
    getListOrders: function(key){
        return new Promise((resolve, reject) => {
            if(!key) return reject(new Error('Chưa có sdt'));
            let url = 'https://api.viettelpost.vn/api/supperapp/get-list-order-by-status-v2';
            let json = {
                "PAGE_INDEX": 1,
                "PAGE_SIZE": 10,
                "INVENTORY": null,
                "TYPE": 0,
                "DATE_FROM": getFormatedDate(-30),
                "DATE_TO": getFormatedDate(),
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
    }
};
viettel.init();

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
const Imgbb = {
    key: 'd2c959c2bb733f020987806e60640feb',
    upload: function(src, name){
        return new Promise((resolve, reject) => {
            var data = new FormData();
            data.append("image", src);
            data.append("type", "url");
            data.append("title", name);
            data.append("description", name);

            GM_xmlhttpRequest({
                url:  'https://api.imgur.com/3/image',
                method: "POST",
                synchronous: true,
                data: data,
                headers:  {
                    "Authorization": "Client-ID 46065c05c1005de"
                },
                onload: (response) => {
                    let res = JSON.parse(response.responseText);
                    return res.status == 200 ? resolve(res) : reject(new Error(res.detail));
                },
                onerror: (e) => {
                    return reject(e);
                }
            });
        });


        /***
        let key = this.key;
        var formData = new FormData();
        formData.append('image', src);
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url:  'https://api.imgbb.com/1/upload?key='+ key + '&name=' + name,
                method: "POST",
                synchronous: true,
                data: formData,
                onload: (response) => {
                    let res = JSON.parse(response.responseText);
                  //GM_log(res);
                    return res.status == 200 ? resolve(res) : reject(res.message);
                },
                onerror: (e) => {
                    return reject(e.message || 'Lỗi viettelReqPost');
                }
            });
        });
        ***/
    }
};

const PhoneBook = {
    data: [],
    key: 'fb_phoneBook',
    ggFormId: '1FAIpQLSdpUDJ_mQvRQqvzYHrFuhPpuCvs9DA7P74s2YLDQDFwOyHXAw',
    ggFormEntry:{ id: 937098229, phone: 130151803, name: 648384740, img: 549043843,},
    sheetName: 'PhoneBook',
    int: async function(){
        this.data = await GM.getValue(this.key, []);
        GM_addValueChangeListener(this.key, (key, oldValue, newValue, remote) => {
            if(remote) this.data = newValue;
        });
    },
    sync: async function(){
        GM_log('Đồng bộ danh bạ');
        return new Promise((resolve, reject) => {
            this.data = [];
            GoogleSheet.query(this.sheetName, 'B:F', 'SELECT * WHERE E IS NOT NULL' ).then(json => {
                this.data = json;
                GM_setValue(this.key, this.data);
                GM_log('Đồng bộ thành công ' + this.data.length + ' danh bạ');
                return resolve()
            });
        });
    },
    get: function(id){
        let matchs = this.data.filter(function(obj){
            return !!~Object.values(obj).indexOf(id);
        });
        return matchs;
    },
    set: function(info){
        new Promise(resolve => {
            let matchs = this.get(info.id);
            let existUser = matchs?.pop();
            if(existUser){
                info.img = existUser?.img;
                return resolve();
            } else {
                Imgbb.upload(info.img, info.id).then(r => {
                    info.img = r.data.link;
                    return resolve();
                });
            }
        }).catch(e => {
            alert(e.message)
        }).then(_ => {
            let entry = Object.keys(this.ggFormEntry).map(key => `entry.${this.ggFormEntry[key]}=${encodeURIComponent("\'"+info[key])}`).join('&')
            let url = `https://docs.google.com/forms/d/e/${this.ggFormId}/formResponse?${entry}`;
            return GoogleSheet.submitForm(url);
        }).then(_ => {
            this.data.push(info);
            GM_setValue(this.key, this.data);
            return true;
        }).catch(e => {
            alert(e.message);
        })
    },
};
PhoneBook.int();

const OrdersStorage = {
    key:'storage_5',
    data: [],
    ggFormId: '1FAIpQLScGgvVzi2U_2rWLVmuzrOYdFG40tCMnhK1nOG8F0jhWz7MJkw',
    ggFormEntry:{ post_id: 1429611565, cmt_id: 654208817, user_id: 436883162, user_name: 1981615867, cmt_txt: 21212061, status: 522750528, },
    sheetName: 'PreOrder',
    start: function(force){
        this.data = GM_getValue(this.key, []);
    },
    add: function(info, callback){
        let {cmt_id} = info;
        let entry = Object.keys(this.ggFormEntry).map(key => `entry.${this.ggFormEntry[key]}=${encodeURIComponent("\'"+info[key])}`).join('&')
        let url = `https://docs.google.com/forms/d/e/${this.ggFormId}/formResponse?${entry}`;
        GoogleSheet.submitForm(url).then(_ => {
            this.data = this.data.filter(o => o.cmt_id != cmt_id);
            this.data.push(info);
            this.save();
            GM_log(info);
            return callback();
        }).catch(error => {
            alert(error.message);
        });
    },
    get: function(k){
        let matchs = this.data.filter(function(obj){
            return !!~Object.values(obj).indexOf(k);
        });
        return matchs;
       // return (this.data.filter(e => (e.user_id == k || e.cmt_id == k || e.post_id == k)));
    },
    del: function(k){
        if(!window.confirm("Bạn có chắc chắn xoá đơn hàng #" + k + "? \nThao tác này không thể hoàn tác!")) return;
        this.data = this.data.filter(e => e.cmt_id != k);
        this.save();
    },
    save: function(){
        GM_setValue(this.key, this.data);
        GM_notification({
            title: "Order saved",
            text: " ",
            timeout: 1000,
        });
    },
    sync: function(){
        return new Promise((resolve, reject) => {
            GM_log('Đồng bộ đơn hàng');
            this.data = [];
            GoogleSheet.query(this.sheetName, 'B:G', 'SELECT *' ).then(json => {
                this.data = json;
                GM_setValue(this.key, this.data);
                GM_log('Đồng bộ thành công ' + this.data.length + ' đơn hàng');
                return resolve(true);
            });
        });
    },
};
OrdersStorage.start();

const PostCollector = {
    key: 'postList_1',
    data: [],
    ggFormId: '1FAIpQLSdfeoPmxxbEvUBdbcpPG4f2RabbslqpbrDCCvfX29WfijGJPA',
    ggFormEntry:{id: 1370929995, url: 1270605326, txt: 1381764206, img: 1194118624,},
    sheetName: 'Posts',
    start: function(){
        this.data = GM_getValue(this.key, []);
        this.lopping();
        setInterval(_ => this.lopping(), 1000);
    },
    lopping: function(href = window.location.href){

        if(href == this.lastHref) return true;
        this.lastHref = href;

        this.showPostInfo?.remove();
        window.POST_ID = null;

        if(!(/facebook\.com\/.*\/posts\/(\d|\w)+/g).test(href) || !href.includes(myFbUserName)) return true;

        let dialog = Array.from(document.querySelectorAll('div[role="dialog"]')).pop(),
            url = window.location.pathname.split('/').pop(),
            txt = dialog?.querySelector('div[data-ad-rendering-role="story_message"]')?.innerText?.replaceAll('\n',' '),
            id = txt && window.btoa(unescape(encodeURIComponent(txt))).replaceAll(/[^\d\w]/g, '').substr(0, 20),
            img = dialog?.querySelector('a[role="link"] img[src*="scontent"]')?.getAttribute('src');

        if(!txt || !img) return true;

        this.showPostInfo = GM_addElement(window.document.body, 'div', { style:'background-color: #363636; color: white; padding: 8px; border-radius: 5px; position: absolute; bottom: 5px; left: 5px; opacity: 1;'});
        this.showPostInfo.innerHTML = `<div>ID bài đăng: ${id}</div> `;


        window.POST_ID = id;

        let match = this.data.filter(p => p.id == id);
        if(match && match.length) return;

        Imgbb.upload(img, id).then(r => {
            img = r.data.link;
        }).catch(e => {
            console.log(e);
        }).then(e => {
            let values = {id, url, txt, img};
            let entry = Object.keys(this.ggFormEntry).map(k => `entry.${this.ggFormEntry[k]}=${encodeURIComponent("\'"+values[k])}`).join('&')
            let u = `https://docs.google.com/forms/d/e/${this.ggFormId}/formResponse?${entry}`;
            return GoogleSheet.submitForm(u);
        }).then(_ => {
            this.data.push({url, id, txt, img});
            GM_setValue(this.key, this.data);
        }).catch(e => {
            GM_log('error', e.message)
            alert('error' + e.message + '\nMã lỗi #0470');
        });
    },
    sync: async function(){
        return new Promise((resolve, reject) => {
            GM_log('Đồng bộ bài đăng');
            this.data = [];
            GoogleSheet.query(this.sheetName, 'B:F', 'SELECT *' ).then(json => {
                this.data = json;
                GM_setValue(this.key, this.data);
                GM_log('Đồng bộ thành công ' + this.data.length + ' bài đăng');
                return resolve(true);
            });
        })
    },
};
//PostCollector.start();

GM_registerMenuCommand("Đồng bộ Google!", async _ => {
    try{
        //await PostCollector.sync();
        await OrdersStorage.sync();
        await PhoneBook.sync();
        confirm('Đã đồng bộ xong, bạn có muốn tải lại trang?') && window.location.reload();
    } catch(e){
        alert('Lỗi đồng bộ:/n' + e?.message);
    }
});

/***
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
***/

// CSS STYLE
(function(){
    if((window.location.origin != 'https://www.facebook.com') && (window.location.origin != 'https://www.messenger.com')) return !1;

    GM_addStyle('div[role="button"]:is([aria-label="Thêm bạn bè"], [aria-label="Theo dõi"]){display:none;}');

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

// FUNCTIONS
(function() {
    if((window.location.origin != 'https://www.facebook.com') && (window.location.origin != 'https://www.messenger.com')) return !1;
    const $ = window.jQuery, myUserName = 'hien.trinh.5011', myDisplayName = 'Trịnh Hiền'

    GM_addStyle(`div.infoCard table tr td {white-space: nowrap;  padding-right: 10px;}`);
    GM_addStyle(`div.infoCard table tr td:last-child {white-space: nowrap;  width: 100%;}`);
    //GM_addStyle(`div:is(.__fb-dark-mode, .__fb-light-mode):not(:hover) div.infoCard {  opacity: 0.5; }`);
    GM_addStyle(`div:is([aria-label="Đoạn chat"], [aria-label="Danh sách cuộc trò chuyện"]) a:is([href*="/t/"], [href*="/messages/"])::before {  content: attr(href);  position: absolute;  bottom: 0;  left: 10px;  color: initial;  opacity: 0.5; }`);
    GM_addStyle(`div:is([aria-label="Đoạn chat"], [aria-label="Danh sách cuộc trò chuyện"]) a[href*="/e2ee/"]::before {color:red;}`);

    class InfoCard{
        constructor(info, container){
            this.container = container;
            this.userData = {...PhoneBook.get(info.id)?.pop(), ...info};

            this.preOrders = 0;
            this.userData.e2ee = window.location.pathname.includes('e2ee') ? window.location.pathname.match(/\d{3,}/g)?.pop() : null;

            this.card = GM_addElement(container, 'div', { class: 'infoCard refreshing', 'data-fbid': this.userData.id });
            if(window.location.pathname.includes('/messages/') || window.location.hostname == 'www.messenger.com') {
                this.card.classList.add('bottom');
            }

            this.infoList = GM_addElement(this.card, 'table', { style: 'padding-bottom: 5px; color:white;' });
            let toolBar = GM_addElement(this.card, 'div', { class: 'toolBar' });

            this.searchBtn = GM_addElement(toolBar, 'a', { style: 'color:dodgerblue;'});
            this.searchBtn.innerText = 'Tìm sđt';
            this.searchBtn.onclick = _ => this.phoneScanning();

            let btn_2 = GM_addElement(toolBar, 'a', { style: 'color:red;'});
            btn_2.innerText = 'Sửa sđt';
            btn_2.onclick = _ => this.setPhone();

            let btn_3 = GM_addElement(toolBar, 'a', { style: 'color:limegreen;'});
            btn_3.innerText = 'Tạo đơn';
            btn_3.onclick = _ => this.createOrder();

            this.eventsListener();
            this.refreshInfo();

            let bg = GM_addElement(this.card, 'div', { class: 'card-bg', style: 'position: absolute; top: 0; right: 0; bottom: 0; left: 0; ' });
            let copyright = GM_addElement(this.card, 'small', {style: 'opacity: .5; position: absolute; top: 8px; right: 8px;'});
            copyright.innerHTML = '<a href="https://fb.com/trinhdacquang" target="_blank" style="color: inherit;">© QuangPlus</a>'
        }
        async refreshInfo(){
            if(this.isBusy) return;
            this.isBusy = 1;
            let i = {total: 0, pending: 0, draft: 0, preOrder: 0, totalCOD: 0};
            this.infoList.innerHTML = '</tr><tr><td style=" ">Đang tải...</td></tr> <tr><td>&nbsp</td></tr> <tr><td>&nbsp</td></tr> <tr><td>&nbsp</td></tr>';
            this.card.classList.add('refreshing');
            try{
                //this.preOrders = OrdersStorage.get(this.userData.id);
                let data = await viettel.getListOrders(this.userData.phone);
                if(data.error) throw new Error('Viettel: ' + data.message);
                let orderList = data.data.data.LIST_ORDER;
                let totalOrders = data.data.data.TOTAL,
                    pendingOrders = orderList.filter(o => !!~([-108,100,102,103,104]).indexOf(o.ORDER_STATUS)).length,
                    draftOrders = orderList.filter(o => o.ORDER_STATUS == -100).length;

                this.waitingOrders = (draftOrders + pendingOrders);
                //let totalCOD = data.data.data.TOTAL_COLLECTION.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

                let vtlink = 'https://viettelpost.vn/quan-ly-van-don?q=1&p='+btoa(this.userData.phone);
                this.infoList.innerHTML = `
                <tr style="display:none;"><td>ID:</td> <td>${this.userData.id}</td></tr>
                <tr>
                  <td>SĐT: </td> <td>${this.userData.phone}</td>
                </tr>
                <tr>
                  <td>Đơn hàng: </td>
                  <td><a href="${vtlink}" target="_blank" style="color:inherit; text-decoration: underline;">${totalOrders} đơn&nbsp
                     ${pendingOrders ? `<span style="color:coral"> • có đơn chờ giao</span>` : draftOrders ? `<span style="color:yellow"> • có đơn nháp</span>` : ''}
                  </a></td>
                </tr>
                <tr>
                  <td>e2ee: </td> <td>${this.userData.e2ee}</td>
                </tr>
                <tr>
                  <td>Tags: </td> <td>${'---'}</td>
                </tr>`;


            } catch(e){
                console.log(e)
                this.infoList.innerHTML = `<tr style="color:orangered; text-align: center;"><td>${e.message}</td></tr>`;
            } finally{
                this.isBusy = 0;
                this.card.classList.remove('refreshing');
            }
        }
        async phoneScanning(){
            if(this.looping_1){
                clearInterval(this.looping_1);
                this.looping_1 = null;
                this.searchBtn.innerText = "Tìm sđt";
                return false;
            }
            this.searchBtn.innerText = "Dừng";

            let count = 0;
            this.looping_1 = setInterval(() => {
                this.container.querySelector('div[role="grid"] > div > div').scroll({ top: 0, behavior: 'smooth' });
                let rows = this.container.querySelectorAll('div[role="gridcell"] div[role="presentation"] span[dir="auto"] > div:not(.scanned)');

                count = rows.length ? 0 : count + 1;
                if(count == 10) return this.phoneScanning();

                for (let i = (rows.length - 1); i >= 0; i --) {
                    let row = rows[i];
                    row.classList.add('scanned');

                    let text = row.innerText;
                    let t = text.replaceAll(/[^\w\d]/g, '');
                    let phone = t.match(/(03|05|07|08|09)+([0-9]{8})/g)?.pop();
                    if(!phone || phone == myPhone) continue;

                    this.phoneScanning();
                    let d = row.closest('div[role="presentation"]');
                    d.style.border = '2px dashed ' + (phone == this.userData.phone ? 'cyan' : 'red');

                    let func1 = function(){
                        row.scrollIntoView({block: "center", inline: "nearest", behavior: 'smooth'});
                        row.closest('div[role="gridcell"]')?.focus();
                    };
                    func1();
                    let interv = setInterval(func1 , 200);
                    setTimeout(_ => clearInterval(interv), 5000);
                    document.body.addEventListener("click", _ => clearInterval(interv), {once : true});

                    break;
                }

            }, 500);
        }
        async setPhone(phone = window.prompt("Nhập sđt cho " + this.userData.name, this.userData.phone)){
            if(phone == null || phone == '' || !isVNPhone(phone) || phone == this.userData.phone) return;
            this.userData.phone = phone;
            let info = {id: this.userData.id, phone: this.userData.phone.toString(), name:this.userData.name, img:this.userData.img};
            PhoneBook.set(info);
            this.refreshInfo();
        }
        createOrder(){
            try{
                let title = 'Tạo đơn hàng cho ' + this.userData.name + '\n\n';

                if(!this.userData.phone) throw new Error(title + '❌ Vui lòng cập nhật sđt trước!');

                if(this.waitingOrders && !window.confirm(title + '❌ có đơn chưa giao!!! bạn vẫn tiếp tục tạo đơn?')) return false

                let url = 'https://viettelpost.vn/order/tao-don-le?query=';

                let orderInfo = { fbid: this.userData.id, phone: this.userData.phone, name: this.userData.name };


                let prices_str = prompt(title + "B1 - Điền giá \n(đv nghìn đồng, phân tách bằng dấu cách để tính tổng)", GM_getValue('lastest_prices', 0));
                if (prices_str == undefined || prices_str == null) { return false }
                let price = prices_str.trim().split(/\D+/g).reduce((pv, cv) => pv + parseInt(cv || 0), 0);

                let itemNameList = GM_getValue('lastest_items_list', []);
                let list = itemNameList.map((e, i) => `[${i}] ${e}`).join('\n');
                let input = prompt(title + 'Chọn tên sp có sẵn hoặc nhập tên sản phẩm mới: \n' + list, itemNameList[0] || '');
                if (input == null || input == undefined) return false;

                let itemName = itemNameList[input] || input
                itemNameList.unshift(itemName);
                //unique
                itemNameList = itemNameList.filter((value, index, array) => array.indexOf(value) === index );
                GM_setValue('lastest_items_list', itemNameList.slice(0, 10));

                orderInfo.prdName = `${itemName} - (${prices_str})`;
                //orderInfo.prdName = itemName + ' - \(' + prices_str.replaceAll(' ', ' + ') + '\)';
                orderInfo.price = (price*1000);

                url += btoa(unescape(encodeURIComponent(JSON.stringify(orderInfo))));

                window.popupWindow?.focus();
                window.popupWindow = window.open(url, 'window', 'toolbar=no, menubar=no, resizable=no, width=1200, height=800');
                window.addEventListener('message', (ev) => { ev.data.fbid === this.userData.id && this.refreshInfo() });

                GM_setValue('lastest_prices', prices_str);
                //GM_setValue('lastest_order_name', itn);
            }
            catch(e){ alert(e.message) }
        }
        eventsListener(){
            this.container.addEventListener("click", function(e){
                let target = e.target.closest('div[aria-label="Trả lời"][role="button"]'); // Or any other selector.
                target && GM_setClipboard("e gửi về địa chỉ này c nhé", "text");
            });

            this.container.addEventListener("keypress", function(e) {
                //alert('onkeypress')
                console.log(e);
                if (e.charCode == 1111111) {
                    alert('option3');
                }
                if (e.keyCode == 87 && e.ctrlKey == true) {
                    alert('option2');
                }
                if (e.charCode == 339) {
                    alert('option1');
                }
            });

            // Set phone by mouse selection
            this.container.onmouseup = _ => {
                if(!window.getSelection) return;
                let phone = window.getSelection().toString().replaceAll(/\D/g,'');
                if(!isVNPhone(phone) || phone == this.userData.phone || phone == myPhone){
                    return false;
                } else if(!this.userData.phone || window.confirm(`Xác nhận đổi số đt cho ${this.userData.name} thành ${phone}?`)){
                    this.setPhone(phone);
                }
            }
        }
    }

    window.document.addEventListener('mousemove',function(){
        if(window.xx13e) return;
        window.xx13e = setTimeout(_ => { clearTimeout(window.xx13e); window.xx13e = 0 }, 1000);

        let profiles = window.document.querySelectorAll(`
          div[role="main"][aria-label^="Cuộc trò chuyện với "] > div > div > div > div:first-child a[role="link"][href]:not(.checked, [aria-label]),
          div:not([hidden]) > div[style*="chat-composer"] a[role="link"][href^="/"][aria-label]:not(.checked, [aria-label="Mở ảnh"])
        `);

        for(let i = 0; i < profiles.length; i++){
            let e = profiles[i];

            let id = e.getAttribute('href')?.match(/\d+/g)?.pop();
            let name = e.getAttribute('aria-label') || e.querySelector('h2').innerText;
            let img = e.querySelector('img')?.getAttribute('src');

            if(!id || !name || !img) continue;

            e.classList.add('checked');

            let info = {id, name, img};
            let container = e.closest('div:is(.__fb-dark-mode, .__fb-light-mode)');
            new InfoCard(info, container);
            console.log(info);
        }
    });

    if(window.location.href.includes('/posts/')){
        let interval = setInterval(_ => {
            let btn = document.querySelector('div[role="dialog"] div[role="button"][aria-haspopup="menu"]:not([aria-label])');
            if(!btn) return true;
            clearInterval(interval);
            btn.click();
            btn.scrollIntoView(false);
        }, 1000);
    }

    document.addEventListener("keydown", e => {
        if(e.key === "F1") {
            // Suppress default behaviour
            // e.g. F1 in Microsoft Edge on Windows usually opens Windows help
            e.preventDefault();
            alert('F1');
        }
    })
})();

(function(){
    const $ = window.jQuery;

    $(document).ready(function(){
        GM_addStyle(`.fb-article-btn{font-size: 90%; font-weight: 700; width: fit-content; color: white; display: block; margin-top: 10px; cursor: pointer; background-color: #000000db; border-radius: 5px; padding: 2px 6px; }`);
        /*** class PreOderBtn{
            constructor(article){
                let cmt_text_elm = article.querySelector('span[lang]');

                this.cmt_txt = cmt_text_elm?.innerText.replaceAll('\n', ' ');
                this.cmt_id = article.querySelector('div:not([role="article"]) a[role="link"][href*="posts"][href*="comment_id"]')?.getAttribute('href').match(/((reply_comment_id)|(comment_id))\=\d+/g).pop().replace(/((reply_comment_id)|(comment_id))\=/g, '');

                this.btn = GM_addElement(cmt_text_elm.parentNode, 'span', { class: 'fb-article-btn' });
                this.btn.onclick = _ => this.onClick();

                this.check();
            }
            onClick(){
                let i = !this.user_id ? '1' : prompt('Chọn thao tác: \n[0] - Mở facebook '+ this.user_name + '\n[1] - Sửa thông tin \n[2] - Xoá thông tin', '0');
                if(i === null) return;
                switch(i){
                    case '0':
                        window.open('https://fb.com/'+this.user_id, '_blank');
                        break;
                    case '1':
                        this.addOrder();
                        break;
                    case '2':
                        OrdersStorage.del(this.cmt_id);
                        this.check();
                        break;
                    default:
                        break;
                }
            }
            check(){
                let matchs = OrdersStorage.get(this.cmt_id);
                let last = matchs?.pop();
                let {user_id, user_name} = last || {};

                let phone = PhoneBook.get(user_id)?.pop()?.phone;

                this.user_id = user_id;
                this.user_name = user_name;
                this.user_phone = phone;

                this.btn.innerText = '👩‍💼 ' + (user_name || user_id || '---');
                this.btn.innerText += phone ? ' • ' + phone : '';
                this.btn.style['background-color'] = user_id ? 'darkgreen' : 'darkgrey';
            }
            addOrder(){
                if(!window.POST_ID) return alert('⚠ Không tìm thấy POST_ID \nVui lòng mở baif post trước khi thao tác! \nMã lỗi: #1026');

                let cmt_info = {
                    post_id: window.POST_ID,
                    cmt_id: this.cmt_id.toString(),
                    cmt_txt: this.cmt_txt,
                    status: ''
                };
//                let chatBoxs = document.querySelectorAll('div:not([hidden]) > div:is(.__fb-dark-mode, .__fb-light-mode) div[role="button"][aria-label="Cài đặt chat"] a[role="link"][href^="/"][aria-label]');
                let chatBoxs = document.querySelectorAll('div:is(.__fb-dark-mode, .__fb-light-mode) div[role="button"][aria-label="Cài đặt chat"] a[role="link"][href^="/"][aria-label]');
                let chatList = Object.values(chatBoxs).map(e => {
                    return {user_name: e.getAttribute('aria-label'), user_id: e.getAttribute('href').replaceAll('/','')}
                });
                if(!chatList.length) return alert('⚠ Không có khung chat nào đang mở! \nVui lòng mở khung chat với khách hàng trước khi thao tác! \nMã lỗi: #865');
                let selectList = chatList.map((e, i) => `[${i}] - ${e.user_name} - id: ${e.user_id}`).join('\n');

                let n = prompt('Nội dung Comment: ' + cmt_info.cmt_txt + '\n\nChọn tk khách theo số thứ tự dưới đây:\n' + selectList, 0);
                if(n == null) return;

                let {user_name, user_id} = chatList[n];

                this.user_id = user_id.toString();
                this.user_name = user_name;

                if(!user_name || !user_id) return alert('Dữ liệu nhập vào không hợp lệ!! \nMã lỗi: #875');

                OrdersStorage.add({...cmt_info, user_id, user_name}, _ => this.check())
            }
        }
        window.document.addEventListener('mousemove', function(){
            if((/facebook\.com\/.*posts\/[\d\w]+/g).test(location.href) == false) return true;

            if(window.busy_asdxa == true) return;
            window.busy_asdxa = true;
            setTimeout(_ => {window.busy_asdxa = false}, 1000);

           // let post_id = location.pathname.split('\/').pop();
            let articles = document.querySelectorAll('div[role="article"][aria-label*="dưới tên '+myFbName+'"]');
            articles.forEach(article => {
                try{
                    Object.values(article.querySelectorAll('div[role="button"]')).forEach(b => b.innerText == 'Xem thêm' && b.click());
                } catch(e){ }

                try{ !article.querySelector('span.fb-article-btn') && new PreOderBtn(article) } catch(e){ }

            });
        }); ***/
    });
})();

(function(){
    // keyboard shortcuts
    window.addEventListener("keydown",function (e) {
        if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70 && e.shiftKey)){
            let messSearchFields = document.querySelectorAll('input[type="search"][aria-label="Tìm kiếm trên Messenger"][placeholder="Tìm kiếm trên Messenger"], div[style*="translateX(0%)"] input[type="text"][aria-label="Tìm kiếm"][placeholder="Tìm kiếm"]');
            let messSearchField = [...messSearchFields].pop();
            if(!messSearchField) return true;
            e.preventDefault();
            messSearchField.focus();
            messSearchField.select();
        }
    })
})();

(function($){
    if(window.location.origin != 'https://www.messenger.com') return 0;

    var interval = null;
    let json = [];
    let popupWin = null;

    let btnScroll = GM_addElement(document.body, 'div', {
        id:'btnScrollToBottom',
        style:'position: absolute;  top: 20px;  left: 209px;  background: #fafafa;  padding: 5px 15px;  border-radius: 5px;  cursor: pointer; ',
    });

    btnScroll.innerHTML = '<span>Load<span>';
    btnScroll.onclick = function(){
        if(!interval){
            popupWin?.close(); json = new Array();
            interval = setInterval(_ => {
                try{
                    let list = Array.from($('div[aria-label="Danh sách cuộc trò chuyện"][aria-hidden="false"] div[aria-label="Đoạn chat"] div:is(.__fb-dark-mode)')).shift();
                    //$(list).animate({scrollTop: list.scrollHeight}, "slow");

                    $.each($(list).find('div[role="row"]:not(.checked)'), (i, r) => {
                        let time = $(r).find('abbr')[0]?.innerText;
                        let img = $(r).find('img')[0]?.getAttribute('src');

                        let text = r.innerText.replaceAll(/[\r\n]+/g, ' ')
                        .replace('Tin nhắn và cuộc gọi được bảo mật bằng tính năng mã hóa đầu cuối.', '')
                        .replace('Đang hoạt động', '').replaceAll('·', '').replace(time, '').trim();

                        let link = $(r).find('a[href]')[0]?.getAttribute('href');

                        if(time && text && img && link){
                            json.push({time, text, img, link});
                            $(r).addClass('checked').remove();

                            window.document.title = time + ' - ' + json.length + ' tn - ' + text;
                        }
                    })
                }catch(e){}
            }, 1000);
            this.innerHTML = '<span>Stop<span>';
        } else {
            clearInterval(interval);
            interval = null;
            this.innerHTML = '<span>Load<span>';

            popupWin = window.open('', '_blank', 'width=400, height=' + window.innerHeight );
            popupWin.document.write(`<style>
              tr:nth-child(even) { background-color: #f2f2f2;} tr:hover{background-color: #e3e3e3; }
              tr td { overflow: hidden;  max-width: 100vw;  text-wrap: nowrap; }
              img { object-fit:cover; }
              span.content { font-weight: 600; }
              p.time { margin:0; }
            </style>
            <table cellpadding="5">
              <caption>Danh sách đoạn chat.</caption>
              <thread><th>img</th><th>text</th></thread>
              <tbody>${json.map(row => `<tr> <td><a href="${row.link}" target="_blank"><img src="${row.img}" width=32 height=32></a></td> <td><span class="content">${row.text}</span><p class="time"><small>${row.time}</small></p></td></tr>`).join('')}</tbody>
            </table>`);
        }
    };
})(window.$ || window.jQuery);

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

    let i = window.localStorage.deviceId;
    let t = i && JSON.parse(window.localStorage['vtp-token']).tokenKey;
    GM_setValue('vtp_deviceId', i);
    GM_setValue('vtp_tokenKey', t);

    $(document).ready( async function(){
        await new Promise(resolve => { setTimeout(resolve, 1000)});

        function updateCOD(){
            try{
                let price = Number($('input#productPrice')?.val().replaceAll(/\D/g, '') || 0),
                    fee = Number($('div.text-price-right')?.text()?.replaceAll(/\D/g, '') || 0);

                if(!fee || window.lastPrice == price) return 0;

                let tax = Number((price + fee) / 100 * 1.5);

                let input_cod = window.document.querySelector('input#cod');
                input_cod.value = Math.round(price + fee + tax);
                input_cod.dispatchEvent(customEvent('input'));
                input_cod.dispatchEvent(customEvent('change'));

                window.lastPrice = price;

                return true;
            } catch(e){
                alert('Lỗi cập nhật COD \n' + e.message + 'Mã lỗi: #1213');
                return false;
            }
        }

        $(document).on('change', 'form.create-order input#productName', function(){
            let price = (window.eval(this.value?.match(/\(.*\)/g)?.shift()?.replaceAll(/[\(\)]/g, '').trim().replaceAll(/\s+/g, " + ")) || 0) * 1000;
            $('input#productPrice')?.val(price).trigger('input').trigger('change');
        });
        $(document).on('change', 'form.create-order input#productPrice', updateCOD);
        $(document).on('change', 'form.create-order input#phoneNo', async function(){
            try{
                this.value = this.value.replaceAll(/\D/g, '');
                this.dispatchEvent(customEvent('input'));
                if(!isVNPhone(this.value)) return;

                let res = await viettel.getListOrders(this.value).catch(e => {throw new Error()});

                if(res?.status != 200) throw new Error();

                let orders = res.data.data.LIST_ORDER.filter(o => !!~([-100, -108,100,102,103,104]).indexOf(o.ORDER_STATUS));

                if(orders.length && !window.confirm('❌ SDT có đơn chưa gửi!!! bạn vẫn tiếp tục tạo đơn?')){
                    let vtlink = 'https://viettelpost.vn/quan-ly-van-don?q=1&p='+btoa(this.value);
                    window.location.href = vtlink

                }
            } catch(e){
                alert('Lỗi check trùng đơn! ❌❌❌');
            }
        });

        let urlParams = new URLSearchParams(window.location.search);
        let info_encode = urlParams.get('query');

        if(!info_encode) return false;

        let info = JSON.parse(decodeURIComponent(escape(window.atob(info_encode.replaceAll(' ','+')))));
        let {fbid, phone, addr, name, price, prdName} = info;

        if(!fbid) return true;

        window.onbeforeunload = e => window.opener?.postMessage({fbid: fbid, orderId: null}, '*');
        $(document).keyup(function(e) {
            if (e.key === "Escape") { // escape key maps to keycode `27`
                $('button.close').click();
            }
            if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey){
                e.shiftKey ? $('#confirmCreateOrder button.btn.btn-viettel').click() : $('#confirmSaveDraft button.btn.btn-viettel').click();

                // IN TEM
                if(!phone) return false;

                setTimeout(() => {
                    viettel.getListOrders(phone).then(data => {
                        let last_order = data.data.data.LIST_ORDER[0];
                        let order_date = new Date(Date.parse(last_order?.ORDER_SYSTEMDATE || 0)).getDate();
                        let today_date = new Date().getDate();
                        if( !last_order || order_date != today_date) throw new Error('Không tìm thấy đơn hàng mới!');

                        let o = last_order.ORDER_NUMBER;
                        let link = viettel.getOrderPrint(o);
                        window.open(link+'&status=0', '_blank', 'toolbar=no, menubar=no, resizable=no, width=500, height=800, top=50, left=960"');
                        return window.close();
                    }).catch(e => {
                        alert(e.message);
                        window.location.href = 'https://viettelpost.vn/quan-ly-van-don?q=1&p='+btoa(phone);
                    });
                }, 1500);
            }
        });

        let col1 = $('div.box-receiver, div.box-sender').parent();
        $('div.box-sender').appendTo(col1);
        $('div.box-receiver').prependTo(col1);

        window.document.body.classList.add('custom');
        //s.prependTo(p);

        let fullName = window.document.querySelector('input#fullName');
        $(window.document.body).on('click keyup keydown', function(){
            fullName.value = name;
            fullName.dispatchEvent(customEvent('input'));
            fullName.dispatchEvent(customEvent('change'));
        })

        let productName = window.document.querySelector('input#productName');
        productName.value = prdName

        let productPrice = window.document.querySelector('input#productPrice');
        productPrice.value = price;

        let productWeight = window.document.querySelector('input#productWeight');
        productWeight.value = 1000;

        let orderNo = window.document.querySelector('input#orderNo');
        let d = new Date();
        orderNo.value = fbid + '-' + d.getFullYear() + d.getMonth() + d.getDay();

        let phoneNo = window.document.querySelector('input#phoneNo');
        phoneNo.value = phone;

        [productPrice, productName, productWeight, orderNo, phoneNo].forEach(i => {
            i.dispatchEvent(customEvent('click'));
            i.dispatchEvent(customEvent('input'));
            i.dispatchEvent(customEvent('change'))
        });

        phoneNo.click();
        phoneNo.focus();

        setInterval(updateCOD, 500);
    });

})(window.$ || window.jQuery);


(function($){
    $(window.document).ready(function(){
        if(!window.location.href.includes('viettelpost.vn')) return;
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
})(window.$ || window.jQuery);


/** BOOKMARK LET
(function() {
    if (window.intervvv) {
        clearInterval(window.intervvv);
        window.intervvv = null;
        return false;
    };

    window.intervvv = setInterval(_ => {
        let objDiv = document.querySelector('div[aria-label="Messenger"] div[aria-label="Đoạn chat"] div.__fb-dark-mode');
        if (!objDiv) document.querySelector('div[aria-label^="Messenger"][role="button"]')?.click();
        else {
            Array.from(objDiv.querySelectorAll('a[href^="/messages"][role="link"]:not(.checked)')).map(e => {
                e.classList.add('checked');
                //abbr
                let name = e.querySelector('span')?.innerText;
                let href = e.getAttribute('href');
                let time = e.querySelector('abbr')?.innerText;
                console.log(name, ' - ', time, 'https://fb.com'+href);
            })
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    }, 1000)
})()

**/
