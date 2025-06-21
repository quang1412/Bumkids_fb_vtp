// ==UserScript==
// @name         Bumkids Tamp new
// @author       QuangPlus
// @version      2025.6.21.4
// @description  try to take over the world!
// @namespace    Bumkids_fb_vtp
// @icon         https://www.google.com/s2/favicons?sz=64&domain=viettelpost.vn

// @downloadURL  https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main0506/script.js
// @updateURL    https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main0506/script.js

// @match        *viettelpost.vn/*
// @match        *api.viettelpost.vn/*
// @match        *.facebook.com/*
// @match        *.messenger.com/*

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
// @grant        GM_removeValueChangeListener
// @grant        GM_webRequest
// @grant        GM_setClipboard
// @grant        window.onurlchange
// @grant        GM_registerMenuCommand

// ==/UserScript==


const _myPhone = '0966628989', _myFbName = 'Trịnh Hiền', _myFbUsername = 'hien.trinh.5011',
      UrlParams = new URLSearchParams(window.location.search),
      $ = (window.$ || window.jQuery);

const isFBpage = window.location.host === 'www.facebook.com';
const isMessPage = window.location.host === 'www.messenger.com';
const isViettelPage = window.location.host === 'viettelpost.vn'
let allowPreOrder = false;

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
            obj[label] = value;
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

isFBpage && GM_registerMenuCommand("refresh post", async _ => {
    FbPost_Mng.getCurrentPostInfo('force');
});

isFBpage && GM_registerMenuCommand("Allow pre-order" , _ => {
    allowPreOrder = !allowPreOrder;
});

/*** Sync and reload all pages ***/
(isMessPage || isFBpage) && GM_addValueChangeListener('do_reload_page', function(){ window.confirm('Đã cập nhật dữ liệu mới! \nEnter để tải lại trang!') && window.location.reload() });
(isMessPage || isFBpage) && GM_registerMenuCommand("Đồng bộ lại" , async _ => {
    await Customer_Mng.sync(); await FbPost_Mng.sync(); await PreOrder_Mng.sync();
    GM_setValue('do_reload_page', new Date().getTime());
})

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

    GM_addStyle(`/* CSS START */
    div.infoCard {--border-color: lightgray;--bg-brightness: 1.5;--bg-toolBar: rgb(231 231 231 / 60%);--text-color: #000;min-height: 115px;display: flex;flex-direction: column;justify-content: space-between;color: var(--text-color);backdrop-filter: brightness(var(--bg-brightness)) blur(10px);box-shadow: 0 12px 28px 0 var(--shadow-1), 0 2px 4px 0 var(--shadow-1);font-weight: bolder;position: absolute;bottom: calc(100% + 8px);left: 10px;width: calc(100% - 30px);max-height: unset;max-width: 350px;border: 2px solid var(--border-color);border-radius: 8px;padding: 8px;filter: blur(0px);transition: all 1.5s ease-in-out;overflow: hidden;opacity: 1;}

    html.__fb-dark-mode div.infoCard { --border-color: gray; --bg-brightness: 0.5; --bg-toolBar: rgb(79 79 79 / 60%); --text-color: whitesmoke; }
    div.infoCard ::selection { color: red; background: yellow;}
    div.infoCard.bottom { left: 10px; top: 64px; right: unset; bottom: unset;}
    div.infoCard div.toolBar { text-align: center; background-color: var(--bg-toolBar); border-radius: 6px; display: flex; justify-content: space-around; }
    div.infoCard div.toolBar a { padding: 5px; flex: 1; opacity: 1; transition: all 0.5s ease-in-out; }
    div.infoCard div.card-bg { background: #bdc3c7; background: -webkit-linear-gradient(to right, #2c3e50, #bdc3c7); background: linear-gradient(to right, #2c3e50, #bdc3c7); z-index: -1; opacity: 0.5; }

    div[aria-label="Nhắn tin"][role="button"] { border: 2px dashed red; border-radius: 6px; }
    div[role="list"] div[role="listitem"] span:hover { -webkit-line-clamp: 10 !important; }
    `);

    GM_addStyle('@keyframes blinker { 50% { opacity: 0; } }' +

                'div[aria-label*="dưới tên"]:not([aria-label*="Trịnh Hiền"]):not(:hover) {  opacity: .5; }' +
                'div[style*="--chat-composer"]:is(.__fb-dark-mode, .__fb-light-mode) > div > div[role="none"] > div {  height: calc(100vh - 200px); }' +

                /*** Đánh dấu cmt của người đăng ***/
                // 'div[aria-label*="Bình luận dưới tên Trịnh Hiền"] svg[role="none"] { border: 2px solid red; border-radius: 50%; padding: 0px; }' +
                '');
})();

// VIETTEL
const VIETTEL = {
    init: function(){
        if(isViettelPage){
            this.deviceId = window.localStorage.deviceId;
            GM_setValue('vtp_deviceId', this.deviceId);
            this.token = this.deviceId && JSON.parse(window.localStorage['vtp-token']).tokenKey;
            GM_setValue('vtp_tokenKey', this.token);
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
                headers: { 'Authorization': 'Bearer ' + this.token },
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
VIETTEL.init();

// GOOGLE SHEET
const GGSHEET = {
    query: function( sheet = 'log', range = 'A:A', queryStr = 'SELECT *'){
        return new Promise((resolve, reject) => {
            let ggsid = '1KAhQCGOIInG3Et77PfY03V_Nn4fWvi0z1ITh1BKFkmk';
            let tq = encodeURIComponent(queryStr);
            let url = `https://docs.google.com/spreadsheets/d/${ggsid}/gviz/tq?tqx=out:csv&sheet=${sheet}&range=${range}&tq=${tq}&time=${new Date().getTime()}`;

            console.log(url)
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
    sheetName: 'customers',
    sheetRange: 'A:O',
    storageKey: 'GMcustomer',
    int: async function(){
        this.dataStorage = await GM_getValue(this.storageKey, []);
        GM_addValueChangeListener(this.storageKey, (key, oldValue, newValue, remote) => { remote && (this.dataStorage = newValue) });

        GM_registerMenuCommand("Customer sync" , _ => this.sync() );
    },
    sync: async function(){
        this.dataStorage = await GGSHEET.query(this.sheetName, this.sheetRange, `SELECT * WHERE B <> '' `);
        GM_setValue(this.storageKey, this.dataStorage);
        window.prompt(`${this.dataStorage.length} customers syncing done! \n\nE.g.: `, JSON.stringify(this.dataStorage[0]));
    },
    get: async function(uid){
        if (!uid) return false;
        let matchs = this.dataStorage.filter(i => (i.uid == uid));
        return matchs;
    },
    add: async function(info){
        try{
            //let img = await uploadimage(info.img);
            this.dataStorage = this.dataStorage.filter(i => i.uid != info.uid); // del old id;
            this.dataStorage.push(info)
            GM_setValue(this.storageKey, this.dataStorage);

            let entry = Object.keys(this.ggFormEntry).map(k => !info[k] ? '' : ('entry.' + this.ggFormEntry[k] + "=\'" + encodeURIComponent(info[k]))).join('&');
            let url = `https://docs.google.com/forms/d/e/${this.ggFormId}/formResponse?${entry}`;
            let res = await GGSHEET.formSubmit(url);
            return res;
        } catch(err){
            alert(err.message);
        };
    },
};
(isMessPage || isFBpage) && Customer_Mng.int();

// FB POST MANAGER
const FbPost_Mng = {
    ggFormId: '1FAIpQLSfx4bd487gRF7O5l8sGXqC1kJuz_a4huUrm64UZY5Ich2gfWw',
    ggFormEntry:{ pid: 1865259179, name: 1706162306, fbid: 1305732350, text: 1064661769, imgs: 1723256352},
    sheetName: 'posts',
    sheetRange: 'A:F',
    storageKey: 'GMpostsStorage',

    int: async function(){
        this.dataStorage = await GM_getValue(this.storageKey, []);
        GM_addValueChangeListener(this.storageKey, (key, oldValue, newValue, remote) => { remote && (this.dataStorage = newValue) });

        GM_addStyle('code#postInfoCard{color:whitesmoke; position:absolute; bottom:10px; left:10px; border:1px solid whitesmoke; border-radius:5px; padding:5px;}' +
                    'code#postInfoCard p {  margin: 0;  display: block;  max-width: 300px;  white-space: nowrap;  text-overflow: ellipsis;  overflow: hidden !important; }');

        this.footerTag = GM_addElement(window.document.body, 'code', {class:'', id:'postInfoCard', style:'display:none;'});
        (["click", "mousemove"]).map(ev => window.document.addEventListener(ev, _ => this.getCurrentPostInfo()))
    },

    sync: async function(){
        this.dataStorage = await GGSHEET.query(this.sheetName, this.sheetRange, `SELECT B,C,D,E,F WHERE B <> '' `);
        GM_setValue(this.storageKey, this.dataStorage);
        window.prompt(`${this.dataStorage.length} posts syncing done! \n\nE.g.: `, JSON.stringify(this.dataStorage[0]));
    },

    get: async function(pid){
        if (!pid) return false;
        let matchs = this.dataStorage.filter(i => (i.pid == pid));
        return matchs;
    },

    add: async function(info){
        try{
            //let img = await uploadimage(info.img);
            this.dataStorage = this.dataStorage.filter(i => i.pid != info.pid); // unique filter;
            this.dataStorage.push(info)
            GM_setValue(this.storageKey, this.dataStorage);

            let entry = Object.keys(this.ggFormEntry).map(k => !info[k] ? '' : ('entry.' + this.ggFormEntry[k] + "=\'" + encodeURIComponent(info[k]))).join('&');
            let url = `https://docs.google.com/forms/d/e/${this.ggFormId}/formResponse?${entry}`;
            let res = await GGSHEET.formSubmit(url);
            return res;
        } catch(err){
            alert(err.message);
        };
    },

    getCurrentPostInfo: async function(force){
        let dialog = document.querySelector('div[role="dialog"]:has(div[role="dialog"] div[aria-label="Chỉnh sửa đối tượng"])');
        let author = dialog?.querySelector('div[data-ad-rendering-role="profile_name"] h3 span').innerText;

        if(author != _myFbName){
            this.current = new Object();
            this.footerTag.innerHTML = null;
            this.footerTag.style.display = 'none';
            return false;
        }

        if(this.busy) return false; this.busy = 1; setTimeout(_ => {this.busy = 0}, 1000);


        let pid = window.location.pathname.split('/').pop();
        let imgs = [...dialog.querySelectorAll('a[href*="/photo/?fbid"] img')].map(e => e.getAttribute('src')).join(', ');
        let name = '---';
        dialog.querySelectorAll('div[data-ad-preview="message"] div[role="button"]').forEach(el => {
            el.innerText == "Xem thêm" && el.click();
        });
        await Delay(100);
        let text = dialog.querySelector('div[data-ad-preview="message"]')?.innerText?.replaceAll(/\n/g, ' ');

        if((!pid || this.current?.pid == pid) && !force) return;

        this.current = new Object();

        if(!pid || !name || !text || !imgs) return;

        this.current = {pid, name, text, imgs};
        console.log(this.current)

        this.footerTag.innerHTML = '<b>pid:</b>&nbsp<b>' + pid + '</b>';
        this.footerTag.style.display = 'block';
        this.footerTag.setAttribute('title', '');

        this.get(pid).then(res => {
            console.log(res)
            if(!res || !res.length){
                throw new Error('not found');
            }
            document.querySelectorAll('div[role="article"][data-uid]').forEach(el => el.removeAttribute('data-uid') )
        }).catch(e => {
            if(e.message == 'not found'){
                this.add({ pid, name, text, imgs});
            } else {
                alert(e.message);
            }
        }).finally(_ => {
        });
    }
};
(isMessPage || isFBpage) && FbPost_Mng.int();

// FB PREORDER MANAGER
const PreOrder_Mng = {
    ggFormId: '1FAIpQLSdFJWCyBzIwVJoH5hPVKKOIDAM8kHtolvkaTamUqahuRyLFwQ',
    ggFormEntry:{ cid: 1372917580, uid: 1672107945, pid: 212434003, text: 662290354},
    sheetName: 'pre-od',
    sheetRange: 'A:E',
    storageKey: 'GMpreOrder',

    int: async function(){
        this.dataStorage = await GM_getValue(this.storageKey, []);
        GM_addValueChangeListener(this.storageKey, (key, oldValue, newValue, remote) => { remote && (this.dataStorage = newValue) });
    },

    sync: async function(){
        this.dataStorage = await GGSHEET.query(this.sheetName, this.sheetRange, `SELECT B,C,D,E WHERE B <> '' `);
        GM_setValue(this.storageKey, this.dataStorage);
        window.prompt(`${this.dataStorage.length} pre-order syncing done! \n\nE.g.: `, JSON.stringify(this.dataStorage[0]));
    },

    get: function(id){
        if (!id) return false;
        let matchs = this.dataStorage.filter(i => ((i.uid == id) || (i.cid == id) || (i.pid == id)) );
        return matchs;
    },

    add: async function(info = {}){
        try{
            /***
            ***/
            this.dataStorage = this.dataStorage.filter(({cid}) => (cid != info.cid)); // unique filter;
            this.dataStorage.push(info);
            GM_setValue(this.storageKey, this.dataStorage);

            let entry = Object.keys(this.ggFormEntry).map(k => !info[k] ? '' : ('entry.' + this.ggFormEntry[k] + "=\'" + encodeURIComponent(info[k]))).join('&');
            let url = `https://docs.google.com/forms/d/e/${this.ggFormId}/formResponse?${entry}`;
            let res = await GGSHEET.formSubmit(url);
            return res;

        } catch(err){
            alert(err.message);
        };
    },
};
(isMessPage || isFBpage) && PreOrder_Mng.int();

// FB INFO CARD
(function() {
    if(!isFBpage && !isMessPage) return !1;

    GM_addStyle('div.infoCard table tr td {white-space: nowrap;  padding-right: 10px;}'+
                'div.infoCard table tr td:last-child {white-space: nowrap;  width: 100%;}'+
                'div:is([aria-label="Đoạn chat"], [aria-label="Danh sách cuộc trò chuyện"]) a:is([href*="/t/"], [href*="/messages/"])::before {  content: attr(href);  position: absolute;  bottom: 0;  left: 10px;  color: initial;  opacity: 0.5; }'+
                'div:is([aria-label="Đoạn chat"], [aria-label="Danh sách cuộc trò chuyện"]) a[href*="/e2ee/"]::before {color:red;}');

    class InfoCard{
        constructor(info, container){
            this.container = container;

            this.customer = {"uid":'', ...info};
            let e2ee = (window.location.pathname.includes('e2ee') ? window.location.pathname.match(/\d{3,}/g)?.pop() : '');
            if(e2ee) this.customer.e2ee = e2ee;

            let card = GM_addElement(container, 'div', { class: 'infoCard', 'data-fbid': this.customer.id });
            if(window.location.pathname.includes('/messages/') || window.location.hostname == 'www.messenger.com') card.classList.add('bottom');

            this.table = GM_addElement(card, 'table', { style: 'padding-bottom: 5px; color:white;' });
            //this.table.innerText = 'Loading...';

            let toolBar = GM_addElement(card, 'div', { class: 'toolBar' });

            this.btn_1 = GM_addElement(toolBar, 'a', { style: 'color:dodgerblue;'});
            this.btn_1.innerText = 'Tìm sđt'; this.btn_1.onclick = _ => this.phoneFinder();

            let btn_2 = GM_addElement(toolBar, 'a', { style: 'color:red;'});
            btn_2.innerText = 'Sửa sđt'; btn_2.onclick = _ => this.setPhone();

            let btn_3 = GM_addElement(toolBar, 'a', { style: 'color:limegreen;'});
            btn_3.innerText = 'Tạo đơn'; btn_3.onclick = _ => this.createOrder();

            /***
            let btn_4 = GM_addElement(toolBar, 'a', { style: 'color:whitesmoke;', class: 'setPreOrderBtn'});
            btn_4.innerText = 'Pre-od'; btn_4.onclick = _ => this.preOrder();
            ***/

            GM_addElement(card, 'div', { class: 'card-bg', style: 'position: absolute; top: 0; right: 0; bottom: 0; left: 0; ' });
            let quangplus = GM_addElement(card, 'small', {style: 'opacity: .5; position: absolute; top: 5px; right: 5px;'});
            quangplus.innerHTML = '<a href="https://fb.com/trinhdacquang" target="_blank" style="color: inherit;">© QuangPlus</a>';

            this.eventsListener();

            // get info from Google sheet
            this.table.innerText = 'Loading customer data...';
            Customer_Mng.get(this.customer.uid).then(res => {
                let data = res?.pop();

                if(!data) Customer_Mng.add(this.customer);
                else if(data && this.customer.e2ee && !data.e2ee) Customer_Mng.add( {...data, ...this.customer});

                this.customer = {...data, ...this.customer};
            }).then(_ => {
                this.refreshInfo();
            }).catch(err => {
                this.table.innerText = '⚠️ ' + err.message;
            });
        }

        async refreshInfo(){

            if(this.delay_kfbs) return;

            try{
                this.table.innerText = 'Loading viettel data...';

                let {uid, phone, addr, e2ee} = this.customer;
                if(!phone) throw new Error('chưa có số đt!');

                // get info from Viettel Post
                let vt = await VIETTEL.getListOrders(phone);
                if(vt.error) throw new Error('Viettel: ' + vt.message);

                let list = vt.data.data.LIST_ORDER;
                let total = vt.data.data.TOTAL;
                this.viettelPending = list.filter(od => !!~([-108,100,102,103,104]).indexOf(od.ORDER_STATUS)).length;
                this.viettelDraft = list.filter(od => od.ORDER_STATUS == -100).length;

                await Delay();
                this.preOd = PreOrder_Mng.get(uid);

                this.table.innerHTML = `
                <tr style="display:none;"><td>ID:</td> <td>${uid}</td></tr>
                <tr> <td>Số điện thoại: </td> <td>${phone}</td> </tr>
                <tr>
                  <td>Đơn viettel 30ng: </td>
                  <td>
                    <a href="https://viettelpost.vn/quan-ly-van-don?q=1&p=${btoa(phone)}" target="_blank" style="color:inherit; text-decoration: underline;">
                    ${total} đơn
                    ${this.viettelDraft ? `&nbsp<span style="color:yellow"> • có đơn nháp</span>` : ''}
                    ${this.viettelPending ? `&nbsp<span style="color:coral"> • có đơn chờ giao</span>` : ''}
                    </a>
                  </td>
                  <tr> <td>Đơn pre-order: </td> <td>${(this.preOd?.length || 0)}</td> </tr>
                </tr>
                <tr style='display:unset;'> <td>e2ee: </td> <td>${e2ee || '---'}</td> </tr>
                <tr> <td>Tags: </td> <td>---</td> </tr>`;
            } catch(e){

                this.table.innerText = '⚠️ ' + e.message;

            } finally{

                delete this.delay_kfbs;
                console.log(this.customer);

            }
        }

        async phoneFinder(isStop){
            if(this.scanner || isStop){
                this.btn_1.innerText = "Tìm sđt";
                clearInterval(this.scanner);
                delete this.scanner;
                return false;
            }
            this.btn_1.innerText = "Dừng";
            let scroll = this.container.querySelector('[aria-label^="Tin nhắn trong cuộc trò chuyện"] > div > div');
            let count = 0;

            this.scanner = setInterval(async _ => {

                let rows = scroll.querySelectorAll('div[role="row"]:is(.__fb-dark-mode, __fb-light-mode):not(.scanned)');

                if(rows.length) count = 0;
                else count++; scroll.scrollTop = 0;
                if(count == 100) return this.phoneFinder('stop'); /*** timeout ***/

                for(let i = rows.length - 1; i > -1; i-- ){
                    let row = rows[i];

                    row.classList.add('scanned');

                    let span = row.querySelector('[role="presentation"] span[dir="auto"]:not(:has(span)) ');
                    if(!span) return false;

                    let phone = await new Promise(resolve => {
                        let txt = span.innerText.replaceAll(/[^\w\d]/g, '');
                        let num = txt && txt.match(/(03|05|07|08|09)+([0-9]{8})/g)?.pop();
                        return resolve( !num ? false : num == _myPhone ? false : num );
                    });

                    if(phone){
                        let p = span.closest('div[role="presentation"]');
                        p.style.border = '2px dashed ' + (phone == this.customer.phone ? 'cyan' : 'red');

                        row.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                        row.querySelector('div[role="gridcell"][data-release-focus-from="CLICK"]')?.focus();

                        this.phoneFinder('stop');
                        break;
                    }
                }
            }, 500);
        }

        async setPhone(phone = window.prompt("Nhập sđt cho " + this.customer.name, this.customer.phone)){
            if(!phone || !isVNPhone(phone) || phone == this.customer.phone || phone == _myPhone) return;
            this.customer.phone = phone;
            this.refreshInfo();
            Customer_Mng.add(this.customer).catch(err => alert(err.message))
        }

        async preOrder(){
            let title = `Tạo đơn Pre-order \n\n`;

            let i = GM_getValue('lastestPreOdInfo', null)

            if(!i?.cid) return alert('⚠️ Chọn comment note đơn trước!');

            let uid = this.customer.uid;
            i.uid = uid;

            title += `Tên FB: ${this.customer.name} \n`;
            title += `Nội dung: ${i.text} \n`;

            window.confirm(title) && GM_setValue('lastestPreOdInfo', i); this.refreshInfo();
        }

        async createOrder(){
            if(keyState.ControlLeft ) return (this.preOrder(), delete keyState.ControlLeft);

            let title = 'Đang tạo đơn hàng cho: ' + this.customer.name + '\n\n';

            try{
                if(!this.customer.phone) throw new Error('❌ Vui lòng cập nhật sđt trước!');

                if((this.viettelDraft || this.viettelPending) && !window.confirm(title + '❌ có đơn chưa giao!!! bạn vẫn tiếp tục tạo đơn?')) return false

                let url = 'https://viettelpost.vn/order/tao-don-le?query=';

                let orderInfo = { fbid: this.customer.uid, phone: this.customer.phone, name: this.customer.name };

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
                window.addEventListener('message', (ev) => { ev.data.fbid === this.customer.uid && this.refreshInfo() });

                GM_setValue('lastest_prices', prices_str);
            }
            catch(e){ alert(title + e.message) }
        }

        async eventsListener(){
            this.container.addEventListener("click", function(e){
                let target = e.target.closest('div[aria-label="Trả lời"][role="button"]'); // Or any other selector.
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

    window.document.addEventListener('mousemove', _ => {
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

            if(!uid || !name || !img) continue;

            e.classList.add('checked');
            let contain = e.closest('div:is(.__fb-dark-mode, .__fb-light-mode)');
            new InfoCard({uid, name, img}, contain);
        }
    });
})();

// FB SET COMMENTS INFO
(function(){
    if(!isFBpage) return false;

    let listener;

    function clearData(){ GM_removeValueChangeListener(listener); GM_deleteValue("lastestPreOdInfo") }

    function cmtClick(a){
        if(this.busy_qwe || a.getAttribute('data-uid')) return;
        this.busy_qwe = setTimeout(_ => delete this.busy_qwe, 1000);
        clearData();

        let cid = a.getAttribute('data-cid'),
            text = a.getAttribute('data-text'),
            pid = FbPost_Mng.current?.pid;

        GM_setValue('lastestPreOdInfo', {cid, text, pid});
        listener = GM_addValueChangeListener('lastestPreOdInfo', (key, oldValue, newValue, remote) => {
            let i = {...oldValue, ...newValue};
            if(!i.uid) return;
            PreOrder_Mng.add(i);
            clearData();
        });
    }

    function cmtScan(){
        if(this.delay) return;
        this.delay = setTimeout(_ => delete this.delay, 500);

        window.document.querySelectorAll('div[role="article"][aria-label*="dưới tên ' + _myFbName + '"]').forEach(a => {
            let cid = a.getAttribute('data-cid');
            let uid = a.getAttribute('data-uid');

            if(!cid){
                let href = a.querySelector('li a[href*="comment_id"]')?.getAttribute('href');
                let search = href && new URL(href).searchParams;
                cid = search?.get('reply_comment_id') || search?.get('comment_id');
                let text = a.querySelector('span[lang]')?.innerText?.replaceAll(/\n/g, ' ');

                if(!cid || !text) return;

                a.setAttribute('data-cid', cid);
                a.setAttribute('data-text', text);

                a.querySelector('span[lang]')?.addEventListener('mouseup', _ => cmtClick(a));

            } else if(!uid) {
                let match = PreOrder_Mng.get(cid)?.pop();
                match && a.setAttribute('data-uid', match.uid);
            }
        });
    };
    window.document.addEventListener('mousemove', cmtScan );

    GM_addStyle('div[role="article"][aria-label*="dưới tên ' + _myFbName + '"] span[lang]::after { position:absolute; top:0; right:-5px; color:red; }' +
               // 'div[role="article"][aria-label*="dưới tên ' + _myFbName + '"]:not([data-uid]) span[lang]::after { content:"🌿🍀"; }' +
              //  'div[role="article"][aria-label*="dưới tên ' + _myFbName + '"][data-uid] span[lang]::after { content:"🌻🌸"; }' +
                '' );

})();

// MESSENGER SEARCH WHEN FOCUS;
(function(){
    if(!isMessPage) return false;

    window.addEventListener("focus", function (e) {
        let input = document.querySelector('input[type="search"][aria-label="Tìm kiếm trên Messenger"], input[type="text"][aria-label="Tìm kiếm"]');
        input?.focus();
        input?.select();
    })
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

                    if(!href || !name) return;

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

// VIETTEL MAIN //
(function() {
    if(!isViettelPage) return;

    GM_addStyle(`/* ViettelPost custom css */
    /**
    body.vt-post.custom nav#sidebar, body.vt-post div.option-setting, body.vt-post mat-tab-header, body.vt-post header-app {display: none;}
    body.vt-post.custom div.box-product-info div.card-body { max-height: 210px; overflow: auto; }
    body.vt-post.custom div.box-receiver div.card-body { max-height: 400px; overflow: auto; }
    body.vt-post.custom #createEditForm > div.mt-3.vt-order-footer > div > div.row.col-lg-8.resp-border-money > div:nth-child(3) > div > strong.txt-color-viettel {color: orangered !important; font-size: 30px;}
    body.vt-post.custom button {text-wrap: nowrap;}
    body.vt-post.custom div.box-receiver div.card-body group small {color: red !important; font-size: 14px;}
    body.vt-post.custom #content {width: 100% !important; margin-left: 0;}
    div.dieukhoan {display:none;}
    .mat-menu-item-highlighted:not([disabled]), .mat-menu-item.cdk-keyboard-focused:not([disabled]), .mat-menu-item.cdk-program-focused:not([disabled]), .mat-menu-item:hover:not([disabled]){background: gray;}
    **/

    *:is(.mat-column-SENDER_FULLNAME, .mat-column-PARTNER):is(th, td) {display:none;}

    /* ViettelPost custom css */`);


    $(document).ready( async function(){
        await new Promise(resolve => { setTimeout(resolve, 1000)});

        function updateCOD(){
            try{
                let price = Number($('input#productPrice')?.val().replaceAll(/\D/g, '') || 0),
                    fee = Number($('div.text-price-right')?.text()?.replaceAll(/\D/g, '') || 0);

                if(!fee || window.lastPrice == price) return 0;

                let tax = Number((price + fee) / 100 * 1.5);

                let total = (price + fee + tax);
                if(price == 0) total = 0;
                else if(price == 1000) total = fee;

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
            //$('a').css({cursor:'not-allowed', 'pointer-events': 'none !important'});
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

                let res = await VIETTEL.getListOrders(this.value).catch(e => {throw new Error()});

                if(res?.status != 200) throw new Error();

                let orders = res.data.data.LIST_ORDER.filter(o => !!~([-100, -108,100,102,103,104]).indexOf(o.ORDER_STATUS));

                orders.length && alert('❌ CẢNH BÁO: \n\n SDT có đơn chưa gửi!!!?');
            } catch(e){
                alert('Lỗi check trùng đơn! ❌❌❌');
            }
        });

        GM_addElement(window.document.body, 'input', {style:'position:absolute; top:0; right:0;', placeholder:'confirm url', id:'BumConfirmUrl'});

        let info_encode = UrlParams.get('query');

        if(!info_encode) return false;

        let info = JSON.parse(decodeURIComponent(escape(window.atob(info_encode.replaceAll(' ','+')))));
        let {fbid, phone, addr, name, price, prdName} = info;

        if(!fbid) return true;

        //window.onbeforeunload = e => window.opener?.postMessage({fbid: fbid, orderId: null}, '*');

        window.addEventListener('beforeunload', _ => {
            window.opener?.postMessage({fbid: fbid, orderId: null}, '*')
        });

        $(document).keyup(function(e) {
            if (e.key === "Escape") { // escape key maps to keycode `27`
                $('button.close').click();
            }
            if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey){
                e.shiftKey ? $('#confirmCreateOrder button.btn.btn-viettel').click() : $('#confirmSaveDraft button.btn.btn-viettel').click();

                // IN TEM
                if(!phone) return false;

                setTimeout(() => {
                    VIETTEL.getListOrders(phone).then(data => {
                        let last_order = data.data.data.LIST_ORDER[0];
                        let order_date = new Date(Date.parse(last_order?.ORDER_SYSTEMDATE || 0)).getDate();
                        let today_date = new Date().getDate();
                        if( !last_order || order_date != today_date) throw new Error('Không tìm thấy đơn hàng mới!');

                        let o = last_order.ORDER_NUMBER;
                        let link = VIETTEL.getOrderPrint(o);
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

})();


(function(){
    if(!isViettelPage) return;

    $(window.document).ready(function(){
        // menu quản lý đơn
        $(document).on('contextmenu', 'div.vtp-bill-table > table > tbody > tr', function(e) {
            event.preventDefault();
            let row = $(e.currentTarget);
            let btn = row.find('td.mat-column-ACTION label i.fa-bars');
            btn && btn.click();
            row.css('background-color', '#e3f0f0');
        });
    })
})();

// bắn đơn viettel
/***
(function(){
    if(window.location.href != 'https://viettelpost.vn/quan-ly-van-don') return;

    let snd_success = new Audio("data:audio/x-wav;base64, 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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwP+AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwP+AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAA");
    snd_success.volume = 1;
    let snd_fail = new Audio("data:audio/x-wav;base64, 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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksCKgBOhUsgHvM2IAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwP+AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwP+AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAA//uSwP+AAAABLAAAAAAAACWAAAAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAAA==");
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
})();
***/

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
