// ==UserScript==
// @name         Bum | FB - VTP
// @author       QuangPlus
// @version      2025-05-18-1
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
    query: function( sheet = 'log', range = 'A:A', queryStr = 'SELECT *'){
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
const randomInteger = (min, max) => (Math.floor(Math.random() * (max - min + 1)) + min);

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
        async createOrder(){
            let title = 'Đang tạo đơn hàng cho: ' + this.userData.name + '\n\n';

            try{
                if(!this.userData.phone) throw new Error(title + '❌ Vui lòng cập nhật sđt trước!');

                if(this.waitingOrders && !window.confirm(title + '❌ có đơn chưa giao!!! bạn vẫn tiếp tục tạo đơn?')) return false

                let url = 'https://viettelpost.vn/order/tao-don-le?query=';

                let orderInfo = { fbid: this.userData.id, phone: this.userData.phone, name: this.userData.name };

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
                //orderInfo.prdName = itemName + ' - \(' + prices_str.replaceAll(' ', ' + ') + '\)';
                orderInfo.price = (price*1000);

                url += btoa(unescape(encodeURIComponent(JSON.stringify(orderInfo))));

                window.popupWindow?.focus();
                window.popupWindow = window.open(url, 'window', 'toolbar=no, menubar=no, resizable=no, width=1200, height=800');
                window.addEventListener('message', (ev) => { ev.data.fbid === this.userData.id && this.refreshInfo() });

                GM_setValue('lastest_prices', prices_str);
            }
            catch(e){ alert(title + e.message) }
        }
        async eventsListener(){
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

    let interval = null;

    let btnScroll = GM_addElement(document.body, 'div', {
        id:'btnScrollToBottom',
        style:'position: absolute;  top: 20px;  left: 209px;  background: crimson; color: white;  padding: 5px 15px;  border-radius: 5px;  cursor: pointer; ',
    });

    btnScroll.innerHTML = '<span>Load all 💢<span>';
    btnScroll.onclick = function(){
        if(interval){
            clearInterval(interval);
            interval = null;
            this.innerHTML = '<span>Load all 💢<span>';
            return false;
        }
        this.innerHTML = '<span>Stop ✋🤚<span>';
        interval = setInterval(_ => {
            try{
                let list = Array.from($('div[aria-label="Danh sách cuộc trò chuyện"][aria-hidden="false"] div[aria-label="Đoạn chat"] div:is(.__fb-dark-mode)')).shift();
                let rows = $(list).find('div[role="row"]:not(.checked)');
                rows.length && $(list).animate({scrollTop: list.scrollHeight}, "fast");

                $.each(rows, (i, r) => {
                    let time = $(r).find('abbr')[0]?.innerText;
                    let img = $(r).find('img')[0]?.getAttribute('src');

                    let text = r.innerText.replaceAll(/[\r\n]+/g, ' ')
                    .replace('Tin nhắn và cuộc gọi được bảo mật bằng tính năng mã hóa đầu cuối.', '')
                    .replace('Đang hoạt động', '').replaceAll('·', '').replace(time, '').trim();

                    let link = $(r).find('a[href]')[0]?.getAttribute('href');

                    if(time && text && img && link){
                        $(r).addClass('checked')
                        window.document.title = time + ' - ' + text;
                    }
                })
            }catch(e){}
        }, 200);

    };
})(window.$ || window.jQuery);

// PREORDER
// PREORDER
// PREORDER FACEBOOK
// PREORDER
// PREORDER

(function($){
    if(window.location.host != 'www.facebook.com') return !1
    function scan(){
        let cmt_lang = document.querySelectorAll('div[role="article"][aria-label^="Bình luận"] span[lang]:not(.checked)');
        [...cmt_lang].forEach(elm => {
            [...elm.querySelectorAll('div[role="button"]')].forEach(b => b.innerText == 'Xem thêm' && b.click());

            let btn = GM_addElement(elm, 'button', {style:'position: absolute;  bottom: 3px;  left: calc(100% - 8px);  cursor: pointer;  text-wrap: nowrap;'});
            btn.innerHTML = '<span>link</span>';
            btn.onclick = function(){
                let article = elm.closest('div[role="article"]');
                let cmt_id = article.querySelector('li a[href*="comment_id"]')?.getAttribute('href').match(/comment_id\=\d+/g)?.pop()?.replace('comment_id=', '');
                alert(cmt_id);
            }
            elm.classList.add('checked');
        });
    }
    window.document.addEventListener('mouseover', scan);
    window.document.addEventListener('scroll', scan);


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

                let total = (price + fee + tax);
               // if(price == 0) total = 0;
               // else if(price == 1000) total = fee;

                let input_cod = window.document.querySelector('input#cod');
                input_cod.value = Math.round(total);
                input_cod.dispatchEvent(customEvent('input'));
                input_cod.dispatchEvent(customEvent('change'));

                window.lastPrice = price;

                return true;
            } catch(e){
                alert('Lỗi cập nhật COD \n' + e.message + 'Mã lỗi: #1213');
                return false;
            }
        }

        $(document).one('click', 'div.vtp-bill-table td.mat-column-select', function(){
            $('a').css({cursor:'not-allowed', 'pointer-events': 'none !important'});
            window.onbeforeunload = function (e) {
                e = e || window.event;
                // For IE and Firefox prior to version 4
                if (e) {
                    e.returnValue = 'Sure?';
                }
                // For Safari
                return 'Sure?';
            };

        });

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
                        return link;
                    }).then(link => {
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

(function($){
    if(window.location.href != 'https://viettelpost.vn/quan-ly-van-don') return;

    let snd_success = new Audio("data:audio/x-wav;base64, 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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwP+AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwP+AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAA");
    snd_success.volume = 1;
    let snd_fail = new Audio("data:audio/x-wav;base64, SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA//uSwAAAAAABLBQAAAMIQ+rzN1AAAQCAgDBgECBGDDP/99NXazg4//5w38zMeAP/PMwIgM8Is3UBpEihZV2w9MDHxGAyMKv8LkhCBwMQjUDGYP/u8RoKEBvABiEEjJf/og2AA2MEiPsG5f/3wGAWNgfAeoAEHyJHv//wMBAYAIIDeF+AKBQFAWNgagao///8AIPjiJwAQAAFAQhBrgGgEBoBkIPj//3/28R4AUDx3EQBvgNjA8D7CxsLTyRJQToAcAyJf////////5oMoMweOjLjjY4TguNAUBAMOgYBACCBBAwaEsxCreXFUd5wkHUw/PwwQBoeAC2PBRQigEFg0HtIAasFUIDiocMGgUeAVlPaOGJAyKX4LlGXEoEHgPLVDh4RmOBYABmIrqYcSHypbJEBJulkJQFFiLBBYVGIwIj/9Km0syZj8wvooAlx3SALF910NVIQbTRpGOpKqKbetSVenegABpIhHYwAGDBIQQXclNixQvErTQ0Dk3pZK3RzowsEgCE0UEO4hBZgAMLER2MCAaXrOuXKRetinlUpYhhLq//7ksBlgCvqH2GZ3hAC6qrut7GgAi95iZg0hBC64dRUBoJYgrOqcGAqGFgmm3aTNrVbnXR5PM3q0GbQa0cycaXRsvQKAhp8VS4BoJa4tlb4UBHVVkSBABoXWenk5Yei1S07p/GsHbsRl0rMYrvjWorT6W6aifzvJM++EzPQBnTSGAP//////////+Wyx9J6U14byiWov///////////4zkXvSWvRS2IU0R0IEyMlkqSbCHIaHKRQb+jnVYLeOqaMF6RJjcq0aW0RBLPfyfLF88qtoqjTjgggdJ4Pbq31LAXIKqCoQRHWWxSXTcqtOnjdqsJMmZQAto/UaVjmWCP1KU6VSiWye7zl78e/arMiot46x+5z8dsI1vX1Pu8/P4bkPM/zy+9/Nyl7su/WvXZd2tg0V1rV3Gh7Wm8qDJ4nf5SZXL2UP/uzZW5zDu6P5D27auM15c5cs/HtmrP9013SdS9mp8ieDADgyVbbZHIaNGNryLGRBK1D/+5cL0CIFlGVR008ef/ybGBMaSNDgpuDRWPfN6+I/WnH3A4Uj1lt7ORjt3/+5LAHwAS7VmB7OYtkmKrMH2NTbK9DgEMRJSdJqOpAwLSACuaeleYH1oHQweitpenDyy84zRCT03nWoLG6jVXUevkLZZmyzSdYXaUynXlakyQq3TnGkxOrLBDZymfk9n0hb3TZRvI/K/KdtfR/VEGAJBoyXbVyQqPt2jUDZEDWrf/0Ew2pOKpngnepjW1+L5Zu/9zNuAkZgSX8oZzTxauTjSThAnlgP5JAvIGvUMgccQpTIlDRhgojHniUmYHCZvLUnI/IKKqQXMD0Y6NTWUNdFTWrPVrFpHtj0wnEaMwGLTWddRVoMN0qUaz8qTsjx3WnGna3SGG5nW8u2c6QCdz8uZbtp+r6v2A+lZLK22xAI+ifBhbQiWVk5/3IgqqBgR3fU7R4+1j9V7LbodlUZHRDfFi0R7dk3sx3k/JKAZNcalN65C+wz3c7FBGgtIkSkQNxZpJmQ7ygBi0zLPKO0jyk0Ay8VDp+ZVnlHWFykKgnL06WqpODFQTpOcN6UfAxaS2c4nSYao2JlUfUY2cfycpTjS9U5ZI6jMWk9Sc4ObQdapt//uSwE2AFIlZeaxmjZJxOC61jTW6lfo+nsr7a3batiC81ZJIikgxpA2XF7OtwK3c3+4AjQcGVyiVt4ROr+HzLHJQwHCblgjCnJDN++l+w9unq+biiyzRkIvAHKeFabBrcghZiDOE3RZwNk3TLcnmxEdralOtdYQa711tdY0JXrrPUVCEKU/O5bRjMOtGcy2tisXqM48pTlEWjI1NNarC8xys9Ls48WznM9MfNqt6vS96vR/V539fndpKoJwAArIle3aJOB+lJs+YhmSAJ+4d+7cTiDjRXKuQAIHb/krpakSlr8wAMMn4lIa1m1O5x/VXdkjAhFrVDP9rzk3QyA0yKOdnI/ZuSSTUlzo4okieTKKZWpFZsBcFJalu6Jou45iygtJ2PKSiGNLUF0ruLA2Wpj7sYLSczEggcWZKYoayoWrJOcWkSzH0xoJrIMZonB+Z3OhfEFIpHkB88sbU+1cx2XqbmG1qvQeu9bL0X6s9zkyAAciTHdawmw0VwKdNrMgkR9w7/I065EDmvReEkUufwXvsM/c2zAPLAk9Y3B2n4+SU6v/7ksBzgBaF2W/sZa3ClDttvYw1uKR3vGo52hl2cA/dtS4FpvZXtwjkN3rlHdC70TmYya8+gE6KDtQrbUNaKtdR6lNh0c/TrPVRHaM66ijaiK03nTyi/ORmLqjKo/KO6QpunWek+ZzgnsyZRrNt5Tq0J3ydU1trS+ynrnPMmvbPWnHvXVrnDwCJAAOyBUtlJJYpSICCWx1yS4a1wx+YjQOKEJLIMqRVYpBe18F/ffrK1GR0h/O/UA9mITp19UFZVM44jdbK69mEEfdtykbdR0Nm5Q+6NvsjrGaTqzag60Fg4U56bzrKMWHKR1POTh6yxNyDVRaWU4jj1Kp1Jzk4L1CdrNrsThvnai2Os4kRRjLMaJZHZMXTCWdNjicdu8lKtGzraRamvOty696E49pmeXpZ6nKt7VH6pw9VAAFAgqaTIAoKyJWwWDArpU0Qhw78xaX+hdUr1EdxonDP3xywe3CbsIzgeZf7kT8ARXsU+Y7GBM2QRPtSQ/DfKHKgFrJC9eObQsmYWqGRVTdRY40slWaqA6Gy2oTu6xCJLenU14up2nL/+5LAjQAWJdtp7OGtwq67bT2ctbij1CMxZacy2m5EHSnOvLJ2Zi2dCo/JScsKzGFR6Sc66IXxjuWx83j3q3nNo+VNQnXvIm9Oo/eTXtXUeoScetVn66iwmQACgAMonAASGfDyt6wSGmSrcDgdznxzNGsOIUW9FV6KdNZ7BPePPyZphwJ4A4r/WXqz+R/NWXiAa56lvXIv2Q9oexMBznojR1X44/05Q4ZBNLis/pVD6CRk+oP6q8oYeiNMZzUrZiiNcP7tRu/FQ43w6lY2Lg8Mc01V4N+rFY7pP6i+S91EQiw/UWx2b11AS+rl2O/m8EjiojP1FY38Vv6X3Y31N6HmfGaLw3Q1DLneZQ3fSpds4I0QAAUABk42AAAxkOJPiz2ZIaglfps/uSlCpCTfqZocR8ee/4Jv5v5+FOmQCzXkgPk1J/ezU1GEXxmKbgDl+T6fblDqGDSIs8o7kV2+ON2c4LPMpphM2n0wbpuvNKz9FQPZrPTacanHYL8/MWOG9o1C9SUZtLKTi4a08+spTkfROLVH5ytnEi5jOZfs6xhpys9N//uSwKUAFx3bY+1hbcLhO2x9rLW4WW8Y9bT0mup45HUepSY6z0erreZzp+ioakFPTnCyqP56fmLnVU8jAJcAAXADJuMAAgYAloIygQqjMIXP2rH7lK4yIND9yuqoLfW8fg2/lBuUkujoBtgv1LMrkH7g/7lluBzBwJKp+ZgbNou5Lecs0X7Uxf1A/Zy/8mzMoF1NMZXXUBSGy3m9R+bxLSOg0xnGqUGApLQmFRbeThITVR11Izri4b0Jx5QvQESyVR9RIzsijsWYMcPyUz7CiyTKNY7nW8Zp2tOYPPyOykJrJzKRULJS2mErPz83LHP0Zw9RjOmtCcnShQrIywAADgBlE0QABFWIt0cqqKtBvfIsMqGPuEHAG/sUJAknNZy7EaegejOnrIcwPEx+GI3DEKlMRyu3X2CS4VOS56a9SUSeW0LWAs1ev0dWR1oIt552DDEpm9HdW9ylhzBpuq2zTW3dc5EgfX3WNaSPfWh3KjMtJ9XfZzp+bVZPApt3W8Y2Gnf1Cxlj3NVMJWudX3ZuzSnLTUCsltxq2s3IXvU0KmW/ev/7ksCygBft22PtZa3DUbtsPay9uK2P3OqXj2Xq4xtA61BxvdHUKnP/OottZbZ9X2et6U3PuBXFtvXOWXF90WcUwu3EvAAoEV2ABNJRzgVALIhECM3k9XVWA4CWPcrYEKAahFZVjWc+w3PGUw8MFnQU/MNY3IP9u2sYeSdMSKUyq/dezj7c1PQOIF9YyerGOO1OVYpNmI/fE+ZPWfNLheucCbLb8O8ybNI+rxO98jvwdM5aXp4upXDwee5aeDjc0sDwZz2NfwfmbML70eyj73yz9h96ry5xbwt9l9ZpTS99SZ7jWTfLl86xG8ebGecWpLd92+L69onk343X5/bpx3ivm2vT+N0g7zG9NtVdT9MzRAAAwIIckgAADGUDpaXv4nuUvp+prUThkSBUlekeci5vZ/chdd9s5i2jIA4W8fe9be7F6fmIusg4kYpAfaSE7bHvUjhBksZzFHhAuLd8dSaYEblT0Zx7KCAVaZTh+ygozWenKj9JYhyjPTmWUozjpSncsqcqF+lOtKM7SFu6Vbzau4vudqPy9OtFqx3PzJ1PHjP/+5LArwAZhdtfjeXtwsE7bL2stbi56V1PHC6nnpXUfjuZT0ZXtGpC9Kce0iZ6ZTh+jIrAegAAYAMmpAACG4pmMkYhUFUY/On8cLk2+SeEsu1B0kMJyw/CFZPz8eqjoBsgv1O2pmRfJPudnib+T0s5QXdOBlnInuNxmxBn1nn7IaO5OzIjlqebSplJohPyxz0xlTzeJaR0GmdR+ywwm6k6bqLK4jyNPUXUjM6QkaM7Ub2cnidOdnXkadcij4swy2SM7SC5ui6zZY/1PGVOutOXHn4xpzN5ifpLGOio/NpWepy+eTPzsqPz8nFBS5m0j0pF3AA4CH+ABEEgX8VqpBWaJxpfcwrTKmih9Bc0VIho5dd/CRcg/8rDMw8TzwR8lnvenUcplknyUVjlmmkfwvm5HFT+a/JLF2NabFqgzrADCSnmlM9PpgtJTWeWXpUy0FglCko/LlRbPuJ6L82mLHEZyKpRpzB1FOjMxXm066y9OKGcuTCdeU7OgKLJVn5JTGdGicrNJcWo/F6t5tJzLSWLs49CTD6z0gH5+azpYtJYsU1o//uSwLcAF6HZY+1lrcL+u2wxrDW4TCVFs0mZGUfoudKUxjO4hgAAgAQr8ARJZHuYQLmB3CHfqezhWpUuQxE5eq60Sl+evdmGz0rTOUNQcFOISHZXjQ2Pej4MuqoGQzGJVbqvNm7PbsijQSTRZUXvZyH71yT1TLPY48zlbLnAIZA60uzh6aOHKGxz8/ls0UJoLZE0mE4bzsNK6UqY6bUmIoiprWfkamxiKDJzp9Y9JU5EE/UVuZpR2zM+cCqsZMooyk8/E7qdRosnstomk5nZEQUioT5BZ+bUSyelAtnpvOFtONZrQnJWqcjOfegAAcAIaoACNERNMpCRQEu0MPV62HZ1JEMCQXjNjAgZtnl9yR9jf3a6hgO5gTHVDIPgv5qxDYaVI7uVDLMIK+7P0JNffob1yb+Ae50eQOMc46zKYn55EEfKKeXqj0+oEuUU8u5bTUEAlRpOotmENJTmt2WUJ1hdG6bVH1F+dWTA4WadeT5xkxSdCdaTq3cRbnWUuSLT8SicdaMkXnol8482pHkj6Im7LeazAspqFxSkZq5wtoRdTv/7ksC/ABjZ22HNZa3C+ztsOay1uGtNjpQnZFLQ1AAoBECAA4RZhhy0YCIM0BHERr6g3iBpdd3bkyVNjMEd23OvVqNP5amoyMjHCGuqzAzdb0SjFqhnm4m4BAvz1DIKWnnal6CAdRFakVmoXTcgapdqCV9I7llYfQ1q8CGC9R8R9DaKsCNox0COmPEg0abMaq0/kC1DwnarsuH6i2yZCWkPmbIathxFLqPEEFNerfRTPNpjUbQ0mWEwbUryyI3BnME/IMDalvBO+LAcFKQR7dxXW3x2RW6aEPXG7ttu+Ui027qLhW7uC4PYaNx6ksvAcZFXGhIGS9jjcLuUq2+fmNl5BWUfDfZcILwvNGeCpTzeAABgAME4wAAGfCwl6GRTQ5jDuFLY+7NBwEuFYr4DoQ2pId+9V6o//52GZh0UDxztWi+F7qy9NocbmIDtXny2ynODNtbOdu12iuxbTYMrk/mJUnzrzOYH5qgB2NFZvUepLBKG0/NZW9COMWqjWTnOmk3jSJGisweR6LCPNqGeUSs7H4TufrPSup2FZjKdy5djgmL/+5LAwoAeSdtZjeXtwwQ7bD2stbjHajebOpoxKnn4/MtowbLNpjH9lH49jxxphOFk2WLFNbTSdLZ2NB9Z6ZMVI0MdQNwAMARMgAJ1LyMCBjBAdAWAXs4IKCAyxfhiVOKHArA4m/6Cc8AaaYpIhexkn1dkIYGcV5YnKGE6kOdeH2Hm2JSSmWRCHevF2gjbSDAQqWZzGQfP2OxeNgI5QV3d9118Q4YLtZtEo8zdw7hILkYmo3Yu128sMQdNUf3f7laNRbK0i7vqwtQ32mqIQNQRIeW+bC39b2M672+Yt1dRqwiEXuXw5uz68Sch3gx7uXTsSBqAZuYW8UyxzZcKGrHzHuzdSx725Q1hX8Oi4cPEoqFvutRu1uWYVDO+Id2/TUq7x8NiDkAgAAAuCAQ5J8xxkyjM7Xk+lM0wcwQdDZTJa1DZhmlepZwJYCrSK/S9lMtqPqlSZFgaLquy7r+zuVNamaVeIAGgNh2mprVWlwpm5Fwmaxq7GYzZxlM7VlK0S5IdKhVr1W31azccyvLi4RYMXLDFoniVCElheq1WsuoL232b//uSwK8AHBnbXY3l7cPTO2ohrD24pCVn+uXsXD45iFKrDCnWWsFWxdyF9ISqYL17FhbtCVyihuL58+1BVsXDEW4hTMwq17F8F69e2UqpxbdYSui2YjmOqNCYldFqwq2LqEcyir8xcPsvWFPKrMj59GsnmWLhiOZCrPnz2m4L169mYoD6NbDEzWyxHMqgLaX4uphGaZhvnQa44hbRhDtI0QMcg+ycIQtxcZxmEwp0/kSkkykEWnE+/iX//rGVzCplyvLtsY2CBbOzxaiJISKAxB5h5ZRZRZR8LSInFlHmHlFGnFlFmWgjUs7WzmnGlFlHxeyzs7PRxpxZRZlxG///zJxpRZR8XbOzs+bRpxZRcBlNNMNCE0wyNVVURMSqqqCaaYYgrT9IMSqiDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksCKgBOhUsgHvM2IAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwP+AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwP+AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAA//uSwP+AAAABLAAAAAAAACWAAAAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAAA==");
    snd_fail.volume = 0.7;

    $(window.document).ready(function(){
        let gridItem = GM_addElement(document.querySelector('div.grid-action'), 'div', {class:'grid-item', style: 'justify-self: end; position: absolute;'});
        let input = GM_addElement(gridItem, 'input', {class:'form-control', id:'orderIdCheckField', placeholder:'Quét mã - by QuangPlus', title:'Quét mã - by QuangPlus'});
        input.focus();

        $(input).keyup(function(event) {
            if (event.keyCode !== 13) return;
            
            let id = this.value?.trim();
            if(!id) return;
            let link = $('a[href*="thong-tin-don-hang"][href*="orderNumber='+id+'"]:not(.checked)');
            if(link.length){
                link.addClass('checked');
                let row = link.closest('tr.mat-row[role="row"]');
                let checkbox = row.find('label.mat-checkbox-layout');
                checkbox.click();
                snd_success.play();
            } else {
                snd_fail.play();
            }
            $(input).focus().select();
        });

    });
})(window.$ || window.jQuery);;

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

// C6FAE97E8F83FBFDE0D949B3F0D29CE7
