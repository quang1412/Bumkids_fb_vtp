// ==UserScript==
// @name         Bum | FB - VTP
// @author       QuangPlus
// @version      2024-08-31
// @description  try to take over the world!
// @namespace    Bumkids_fb_vtp
// @downloadURL  https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main/script.js
// @updateURL    https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main/script.js
// @match        https://viettelpost.vn/*
// @match        https://api.viettelpost.vn/*
// @match        https://www.facebook.com/*
// @match        https://www.messenger.com/*
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

// ==/UserScript==

const myPhone = '0966628989', myFbName = 'Trịnh Hiền', myFbUserName = 'hien.trinh.5011';
let vtpDeviceId = GM_getValue('vtp_deviceId'), vtpToken = GM_getValue('vtp_tokenKey');

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

function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
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

const viettelReq = {
    get: function(url){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                synchronous: true,
                headers: { 'Authorization': 'Bearer ' + vtpToken },
                url: url,
                onload: function (response) {
                    return resolve(JSON.parse(response.responseText))
                },
                onerror: function(reponse) {
                    return reject(reponse.message || 'Lỗi viettelReqGet');
                }
            })
        })
    },
    post: function(url, json){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url:  url,
                method: "POST",
                synchronous: true,
                headers: { "Token": vtpToken, "Content-Type": "application/json" },
                data: JSON.stringify({...json, "deviceId": vtpDeviceId}),
                onload: function (response) {
                    return resolve(JSON.parse(response.responseText))
                },
                onerror: function(reponse) {
                    return reject(reponse.message || 'Lỗi viettelReqPost');
                }
            })

        })
    }
}

function viettelReqPost(url, json){
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url:  url,
            method: "POST",
            synchronous: true,
            headers: { "Token": vtpToken, "Content-Type": "application/json" },
            data: JSON.stringify({...json, "deviceId": vtpDeviceId}),
            onload: function (response) {
                return resolve(JSON.parse(response.responseText))
            },
            onerror: function(reponse) {
                return reject(reponse.message || 'Lỗi viettelReqPost');
            }
        })

    })
}

function viettelReqGet(url){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                synchronous: true,
                headers: { 'Authorization': 'Bearer ' + vtpToken },
                url: url,
                onload: function (response) {
                    return resolve(JSON.parse(response.responseText))
                },
                onerror: function(reponse) {
                    return reject(reponse.message || 'Lỗi viettelReqGet');
                }
            })
        })
    }

function getListOrdersVTP(phone) {
    return new Promise((resolve, reject) => {
      if(!phone) return reject(new Error('Chưa có sdt'));
        viettelReq.post("https://api.viettelpost.vn/api/supperapp/get-list-order-by-status-v2", {
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


/***
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
Facebook Facebook Facebook
***/

// FACEBOOK MAIN //
(function() {
    if((window.location.origin != 'https://www.facebook.com') && (window.location.origin != 'https://www.messenger.com')) return !1;

    GM_addStyle(`/* CSS START */

    @keyframes blinker { 50% { opacity: 0; }}

    ._8ykn :not(.always-enable-animations) .infoCard{ transition-property: all !important; }

    div.infoCard {
    --border-color: lightgray;
    --bg-brightness: 1.5;
    --bg-toolBar: rgb(231 231 231 / 60%);
    --text-color: #000;

    color: var(--text-color);
    backdrop-filter: brightness(var(--bg-brightness)) blur(10px);
    box-shadow: 0 12px 28px 0 var(--shadow-1),0 2px 4px 0 var(--shadow-1);
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

    div.infoCard.refreshing{
    /* filter: blur(5px); */
    }

    div.infoCard ::selection {color: red; background: yellow;}
    div.infoCard:after { content: ''; position: absolute; left: 4%; top: 101%; width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 6px solid var(--border-color); clear: both; }

    div.infoCard.bottom { left: 10px; top: 64px; right: unset; bottom: unset; }
    div.infoCard.bottom:after { top: -8px; border-top: unset; border-bottom: 6px solid var(--border-color); }

    div.infoCard div.toolBar { text-align: center; background-color: var(--bg-toolBar); border-radius: 6px; display: flex; justify-content: space-around; }
    div.infoCard div.toolBar a { padding: 5px; flex: 1; opacity: 1; transition: all .5s ease-in-out; }
    /* div.infoCard div.toolBar:hover a:not(:hover) { opacity: .3; } */

    div.infoCard div.card-bg {
    background: #bdc3c7;
    background: -webkit-linear-gradient(to right, #2c3e50, #bdc3c7);
    background: linear-gradient(to right, #2c3e50, #bdc3c7);
    z-index: -1;
    opacity: .5;
    }

    div.hasPhoneNum { border: 2px dashed red; border-radius: 10px; overflow: hidden; margin-bottom: 5px; }
    div[aria-label="Nhắn tin"][role="button"] { border: 2px dashed red; border-radius: 6px; }
    div[role="list"] div[role="listitem"] span:hover {-webkit-line-clamp: 10 !important;}

    /*** Sửa chiều cao khung chat ***/
    div:is(.__fb-dark-mode, .__fb-light-mode) > div > div[role="none"] > div { height: 65vh; }

    /*** Đánh dấu cmt của người đăng ***/
    /*div[role="article"][aria-label*="${myFbName}"] {border-left: 2px dashed gray; }*/

    /*** CSS END ***/`);

    const prdList = ['👖👕 Quần Áo','💄💋 Mỹ Phẩm','👜👛 Túi xách','👒🧢 Mũ nón','👓 🕶️ Kính mắt','👠👢 Giày dép', '🧦🧦 Tất / Vớ', '🎁🎀 Khác'];

    const phoneBook = {
        data: null,
        key: 'fb_phoneBook',
        ggForm:{
            id: '1FAIpQLSe_qTjWWDDWHlq-YvtpU0WnWeyL_HTA2gcSB3LDg8HNTTip0A',
            entrys: { fbid: '1158876406', phone: '1286223003' }
        },
        int: async function(){
            //GM_deleteValue('fb_phoneBook');
            let url = 'https://docs.google.com/spreadsheets/d/1g8XMK5J2zUhFRqHamjyn6tMM-fxnk-M-dpAM7QEB1vs/gviz/tq?tqx=out:json&tq&gid=314725270';
            this.data = await GM.getValue(this.key, null);
            GM_addValueChangeListener(this.key, (key, oldValue, newValue, remote) => {
                if(remote) this.data = newValue;
            });

            if(this.data) return true;

            GM_log('Tải phonebook từ google sheet');
            let res = await GM.xmlHttpRequest({ url: url, responseType: 'text', }).catch(e => console.error(e));
            let txt = res.responseText.replace('/*O_o*/\ngoogle.visualization.Query.setResponse(', '').replace(');','');
            let json = JSON.parse(txt);

            GM_log(json);
            let object = new Object();
            let remap = json.table.rows.map(r => {
                try{ object[(r.c[1].v)] = r.c[2].v.replaceAll(/\D/g, "") }
                catch(e){ console.error(e.message, r) }
            });

            GM_log(object);
            this.data = object;
            GM_setValue(this.key, object);
        },
        upload_gg: function(fbid, phone){
            GM_xmlhttpRequest({
                url: `https://docs.google.com/forms/d/e/${this.ggForm.id}/formResponse?entry.${this.ggForm.entrys.fbid}=${fbid}&entry.${this.ggForm.entrys.phone}=${phone}`,
                method: "GET",
                synchronous: true,
                headers: {"Content-Type": "text/html; charset=utf-8"},
                onload: function (res) {
                    console.log(res);
                },
                onerror: function(res) {
                    console.log("error: ", res.message);
                    return alert('GG phonebook error: ' + res.message)
                }
            })
        },
        get: function(fbid){
            return this.data[fbid];
        },
        set: function(fbid, phone){
            this.data[fbid] = phone;
            GM_setValue(this.key, this.data);
            this.upload_gg(fbid, phone);
            return true;
        },
    };
    phoneBook.int();

    function gglog(type, data, callback){
        if(!type || !data) {
            return callback(false);
        };
        let form_id = '1FAIpQLSfebo4FeOLJjN7qItNX65z2Gg_MDeAJnUIhPxba8bPwpEMSmQ',
            entry_type = 689021464,
            entry_data = 354401759;
        GM_xmlhttpRequest({
            url: `https://docs.google.com/forms/d/e/${form_id}/formResponse?entry.${entry_type}=${type}&entry.${entry_data}=${data}`,
            method: "GET",
            synchronous: true,
            headers: {"Content-Type": "text/html; charset=utf-8"},
            onload: function (res) {
                callback(res);
            },
            onerror: function(res) {
                console.log("error: ", res.message);
                return alert('GG Log error: ' + res.message);
                callback(false);
            }
        })
       //https://docs.google.com/forms/d/e/1FAIpQLSfebo4FeOLJjN7qItNX65z2Gg_MDeAJnUIhPxba8bPwpEMSmQ/viewform?usp=pp_url&entry.689021464=type&entry.354401759=data
    }

    function getDeliveryRate(phone){
        return new Promise((resolve, reject) => {
            if(!phone) return reject('Chưa có sdt');

            let token = GM_getValue('vtp_tokenKey');
            if (!token) return reject('Chưa đăng nhập');
            setTimeout(_ => resolve({totalOrder: 0, deliveryRate: -1}), 5000);

            viettelReq.get("https://io.okd.viettelpost.vn/order/v1.0/kyc/" + phone).then(resolve).catch(e => {
                reject(e.message);
            });
        })
    }

    const preOrderItemsList = [];

    class InfoCard_1{
        constructor(info, container){
            this.container = container;
            this.id = info.id;
            this.name = info.name;
            this.picUrl = info.picUrl;
            this.phone = phoneBook.get(this.id);
            this.penddingOrders = 0;
            this.deliveryRate = 0;

            this.card = GM_addElement(container, 'div', { class: 'infoCard refreshing', 'data-fbid': this.id });
            if(window.location.pathname.includes('/messages/') || window.location.hostname == 'www.messenger.com') {
                this.card.classList.add('bottom');
            }

            this.infoList = GM_addElement(this.card, 'table', { style: 'padding-bottom: 5px;' });
            let toolBar = GM_addElement(this.card, 'div', { class: 'toolBar' });

            this.searchBtn = GM_addElement(toolBar, 'a', { style: 'color:dodgerblue;'});
            this.searchBtn.innerText = 'Tìm sđt';
            this.searchBtn.onclick = _ => this.phoneSearching();

            let btn_2 = GM_addElement(toolBar, 'a', { style: 'color:red;'});
            btn_2.innerText = 'Sửa sđt';
            btn_2.onclick = _ => this.setPhone();

            let btn_4 = GM_addElement(toolBar, 'a', { style: 'color:yellow;'});
            btn_4.innerText = 'Order';
            btn_4.onclick = _ => this.preOrder();
            !(new RegExp(/.*\/posts\/.*/g).test(document.location.pathname)) && btn_4.remove();

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
        preOrder(){
            let t = "Nhập thông tin sản phẩm order, các item cách nhau bằng dấu ; \n " + (preOrderItemsList.map((v, k) => {
                return "[" + k + "] " + v + "\n";
            }));

            let info = {
                "orderId" : makeid(12),
                "uid": this.id,
                "name": this.name,
                "picUrl": encodeURIComponent(this.picUrl),
                "post": document.location.pathname.replace(/.*\/posts\//g, ""),
                "items": prompt(t, "den_200"),
            }

            if(!info.items){
                return;
            }

            info.items = preOrderItemsList[info.items] || info.items;

            gglog('pre-order', JSON.stringify(Object.values(info).join(";")), function(result){
                console.log(result);
            });

            preOrderItemsList.push(info.items);
            preOrderItemsList = [...new Set(preOrderItemsList)];

            console.log((info));
        }
        refreshInfo(){
            if(this.isBusy) return;
            this.isBusy = 1;
            let i = {rate: 'Chưa có', total: 0, pending: 0, draft: 0, totalCOD: 0};
            this.infoList.innerHTML = '</tr><tr><td style=" ">Đang tải...</td></tr> <tr><td>&nbsp</td></tr> <tr><td>&nbsp</td></tr> <tr><td>&nbsp</td></tr>';
            this.card.classList.add('refreshing');
            getListOrdersVTP(this.phone).then(res => {
                if(res.error) throw new Error('Viettel: ' + res.message);

                // picked: 105,200,202,300,310,320,400,500,506,507,509,505,501,515,502,551,508,550,504,503
                let list = res.data.data.LIST_ORDER;
                i.total = res.data.data.TOTAL;
                i.totalCOD = res.data.data.TOTAL_COLLECTION.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                i.pending = list.filter(function(o){ return !!~([-108,100,102,103,104]).indexOf(o.ORDER_STATUS) }).length;
                i.draft = list.filter(function(o){ return (o.ORDER_STATUS == -100) }).length;
                this.holdedOrders = (i.draft + i.pending);
            }).then(_ => getDeliveryRate(this.phone)).then(info => {
                if(info.error) throw new Error('Viettel: ' + info.message);
                if(!info.totalOrder || info.deliveryRate == -1) return;

                let percent = (info.deliveryRate * 100).toFixed(2);
                i.rate = (`${percent}% (${info.order501}/${info.totalOrder})`);
            }).then(() => {
                let vtlink = 'https://viettelpost.vn/quan-ly-van-don?q=1&p='+btoa(this.phone);
                this.infoList.innerHTML = `
                <!--<tr><td>ID:</td> <td>${this.id}</td></tr>-->
                <tr>
                  <td>SĐT: </td>
                  <td>${this.phone}</td>
                </tr>
                <tr>
                  <td>Uy tín: </td>
                  <td>${i.rate}</td>
                </tr>
                <tr>
                  <td>Đơn giữ: </td>
                  <td><a href="${vtlink}" target="_blank" style="color: ${this.holdedOrders?'red':'inherit'}">${i.pending} chờ • ${i.draft} nháp</a></td>
                </tr>
                <tr>
                  <td>Tổng COD: </td>
                  <td>${i.total} đơn • ${i.totalCOD}</td>
                </tr>`;
            }).catch(e => {
                this.infoList.innerHTML = `<tr style="color:orangered; text-align: center;"><td>${e.message}</td></tr>`;
            }).finally(_ => {
                this.isBusy = 0;
                this.card.classList.remove('refreshing');
            })
        }
        phoneSearching(){
            this.searchBtn.innerText = 'Dừng';
            if(this.searchLoop) return this.phoneSearching_Stop();
            this.searchLoop = setInterval(() => {
                this.container.querySelectorAll('div').forEach(d => { d.scrollTop = 0 });

                let topAvt = this.container.querySelector('div[aria-label="'+this.name+'"][role="img"]');
                topAvt && stop();

                let nodes = this.container.querySelectorAll('div:is(.__fb-dark-mode, .__fb-light-mode)[role="row"]:not(.scanned)');

                for(let i = 1; i < nodes.length; i++){
                    let m = nodes[nodes.length - i];
                    m.classList.add('scanned');

                    let text = m.innerText.replaceAll(/(\.|\,|\-|\s)/g, '');
                    let match = text.match(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})/g);
                    if(!match || !!~match.indexOf(myPhone)){
                        continue;
                    } else {
                        this.phoneSearching_Stop(m);
                        break;
                    }
                }
            }, 500);
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
        setPhone(phone = window.prompt("Nhập sđt cho " + this.name, this.phone)){
            if (phone == null || phone == "" || phone == this.phone || !isVNPhone(phone)) return false;
            this.phone = phone;
            phoneBook.set(this.id, this.phone);
            this.refreshInfo();
        }
        createOrder(){
            try{
                if(!this.phone) throw new Error('❌ Vui lòng cập nhật sđt trước!');
                if(this.holdedOrders) throw new Error('❌ Có đơn chờ giao');

                let url = 'https://viettelpost.vn/order/tao-don-le?fbid=' + this.id + '&phone=' + this.phone + '&name=' + this.name;

                let prices = prompt("B1 - Nhập giá (đv nghìn đồng, phân tách bằng dấu cách để tính tổng)", GM_getValue('fb_lastPrice', 1000));
                if (prices == undefined || prices == null) { return false }
                GM_setValue('fb_lastPrice', prices);
                let price = prices.trim().split(/\D+/g).reduce((pv, cv) => pv + parseInt(cv || 0), 0);

                url += '&price=' + (price*1000);

                let pl = prdList.map((p, i) => '[' + (i + 1) + '] ' + p + ( (i + 1) % 3 ? '    ' : '\n')).join('');
                let iii = prompt('Danh sách sản phẩm\n' + pl +'\n\nB2 - Chọn sản phẩm (phân tách bằng dấu cách)', 1);
                if (iii == null || iii == undefined) { return false }
                let prdNames = iii.split(/\D+/).map(i => prdList[i - 1]);
                if(!!~prdNames.indexOf(undefined)){ throw new Error('Mã sản phẩm không hợp lệ!') }

                url += '&prdName=' + prdNames.join(" %2B ") + ' - (' + prices + ')';

                popupWindow?.focus();
                var popupWindow = window.open(url, 'window','toolbar=no, menubar=no, resizable=yes, width=1200, height=800');
                window.addEventListener('message', (ev) => { ev.data.fbid === this.id && this.refreshInfo() });
            }
            catch(e){ alert(e.message) }
        }
        eventsListener(){
            this.container.addEventListener("click", function(e){
                const target = e.target.closest('div[aria-label="Trả lời"][role="button"]'); // Or any other selector.

                if(target){
                    GM_setClipboard("e gửi về địa chỉ này c nhé", "text", () => console.log("Clipboard set!"));
                }
            });
        }
    }

    document.onmousemove = function(){
       // clearTimeout(window.timout);
        if(window.xxag) return;

        // console.log('find find');
        let ee = document.querySelectorAll(`a[aria-label][href^="/"][role="link"]:not([aria-label=""], [aria-label="Mở ảnh"], [aria-label="Trang cá nhân"]):not(.checked)`);
        if(window.location.origin == 'https://www.messenger.com') {
            ee = document.querySelectorAll(`a[aria-label][href^="https://www.facebook.com/"][role="link"]:not([aria-label=""], [aria-label="Xem tất cả trong Messenger"], [aria-label="Tin nhắn mới"], [aria-label="Mở ảnh"], [aria-label="Thông báo"], [aria-label="Trang cá nhân"]):not(.checked)`);
        }
        for(let i = 0; i < ee.length; i++){
            let e = ee[i];
            e.classList.add('checked');
            let id = e.getAttribute('href').replaceAll('https://www.facebook.com/', '').replaceAll('/', '');

            let name = e.getAttribute('aria-label');
            if((/\D+/g).test(id)) continue;
            if(document.querySelector('div.infoCard[data-fbid="'+id+'"]')) continue;

            let picUrl = e.querySelector('img')?.getAttribute('src');
            if(!picUrl) continue;

            let info = {id, name, picUrl};

            console.log(info);

            let p = e.closest('div:is(.__fb-dark-mode, .__fb-light-mode)');
            let card = new InfoCard_1(info, p);
        }
        window.xxag = 1;

        window.timout = setTimeout(function(){
            window.xxag = 0;
        }, 1000);
    }

})();


// COMMENT FILTER //
(function(){
    if(window.location.origin != 'https://www.facebook.com') return !1;
    let interv, timout;

    let commentFilterClick = function(){
        clearInterval(interv); clearInterval(timout);

        interv = setInterval(function(){
            if(!(/facebook\.com\/.*\/posts\//g).test(window.location.href)) return;
            let i = getElementByXpath('//*[@id="facebook"]/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div/div/div/div/div/div/div/div/div/div/div/div/div[13]/div/div/div[4]/div/div/div[2]/div[2]/div/div/span/div/div/i');
            i && (clearInterval(interv), i.click());
        }, 500);
        timout = setTimeout(function(){
            clearInterval(interv);
        }, 5000);
    }
    commentFilterClick();
    window.addEventListener('urlchange', commentFilterClick);
})();


/***
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel Viettel
***/

// VIETTEL MAIN //
(function($) {
    if(window.location.origin != 'https://viettelpost.vn') return !1;

    GM_addStyle(`/* ViettelPost custom css */
    body.vt-post.custom nav#sidebar, body.vt-post div.option-setting, body.vt-post mat-tab-header, body.vt-post header-app {display: none;}
    body.vt-post.custom div.box-product-info div.card-body { max-height: 210px; overflow: auto; }
    body.vt-post.custom div.box-receiver div.card-body { max-height: 310px; overflow: auto; }
    body.vt-post.custom #createEditForm > div.mt-3.vt-order-footer > div > div.row.col-lg-8.resp-border-money > div:nth-child(3) > div > strong.txt-color-viettel {color: orangered !important; font-size: 30px;}
    body.vt-post.custom button {text-wrap: nowrap;}
    body.vt-post.custom div.box-receiver div.card-body group small {color: red !important; font-size: 14px;}
    body.vt-post.custom #content {width: 100% !important; margin-left: 0;}
    /* ViettelPost custom css */`);


    const printableStatus = [-108,100,102,103,104];

    vtpDeviceId = window.localStorage.deviceId;
    vtpToken = vtpDeviceId && JSON.parse(window.localStorage['vtp-token']).tokenKey;
    GM_setValue('vtp_deviceId', vtpDeviceId);
    GM_setValue('vtp_tokenKey', vtpToken);


    $(document).ready(async function(){

        if(window.location.pathname != '/order/tao-don-le') return !1;
        const urlParams = new URLSearchParams(window.location.search);
        let fbid = urlParams.get('fbid');

        let phoneNoInput = document.querySelector('input#phoneNo');

        let status = GM_getValue('vtp_duplicateCheckStatus') || 200;
        $(phoneNoInput).attr('placeholder', `Nhập số điện thoại để tự điền thông tin người nhận \| check trùng ${status == 200 ? '🟢' : '🔴'}`);

        $(phoneNoInput).on('change', async function(){
            try{
                this.value = this.value.replaceAll(/\D/g, '');
                this.dispatchEvent(customEvent('input'));
                if(!isVNPhone(this.value)) return;

                let res = await getListOrdersVTP(this.value).catch(e => {throw new Error()});
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
                let price = parseInt(document.querySelector('input#productPrice').value.replaceAll('.', '') || 0);
                let fee = parseInt(document.querySelector('.mt-3.vt-order-footer .resp-border-money .txt-color-viettel span').textContent.replaceAll(/[\. đ \s]/g,'') || 0);
                if(!price || !fee) return false;

                let input = document.querySelector('input#cod'),
                    p = parseInt(price),
                    f = parseInt(fee)
                input.value = p + f;
                input.dispatchEvent(customEvent('input'));
                input.dispatchEvent(customEvent('change'));

                let n = document.querySelector('.box-product-info + div .ng-star-inserted .custom-switch input#switch1');
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
                    $('#confirmSaveDraft button.btn.btn-viettel.btn-sm').click();
                    return;
                } else {
                    $('#confirmCreateOrder button.btn.btn-viettel.btn-sm').click();
                }

                let phone = urlParams.get('phone');
                if(!phone) return;

                setTimeout(() => {
                    getListOrdersVTP(phone).then(data => {
                        let lastest = data.data.data.LIST_ORDER[0];
                        if(!lastest) throw new Error('new order not found!');
                        return(lastest);
                    }).then(data => {
                        let o = data.ORDER_NUMBER;
                        let status = data.ORDER_STATUS;
                        if(!~printableStatus.indexOf(status)){
                            throw new Error('new order not found!');
                        }
                        viettelReq.post("https://api.viettelpost.vn/api/setting/encryptLinkPrintV2", {
                            "TYPE": 100,
                            "ORDER_NUMBER": o,
                            "IS_SHOW_POSTAGE": 0,
                            "PRINT_COPY": 1
                        }).then(json => {
                            if(json.error || !json.data.enCryptUrl) throw new Error('getPrintLink not found!');

                            viettelReq.post('https://api.viettelpost.vn/api/orders/saveOrderPrint', {
                                "OrderNumbers": [ o ],
                                "Type": "Printed"
                            }).then(res => {
                                //alert(JSON.stringify(res));
                                window.location.href = json.data.enCryptUrl+'&status='+status;
                            }).catch(e => {
                                alert(e.message);
                            })

                            console.log(json.data.enCryptUrl);
                        }).then(link => {

                        });
                    }).catch(e => {
                        alert(e.message);
                    });
                }, 1000)
            }
        });

        window.onbeforeunload = function(event) {
            window.opener?.postMessage({fbid: fbid, orderId: null}, '*');
        };


        if(!fbid) return true;

        let phone = urlParams.get('phone'),
            addr = urlParams.get('addr'),
            name = urlParams.get('name'),
            price = urlParams.get('price'),
            prdName = urlParams.get('prdName');

        let s = $('div.box-receiver'),
            p = s.parent();

        window.document.body.classList.add('custom');
        s.prependTo(p);

        let fn = document.querySelector('input#fullName');
        $(document.body).on('click keyup keydown', function(){
            fn.value = name;
            fn.dispatchEvent(customEvent('input'));
            fn.dispatchEvent(customEvent('change'));
        })

        let pn = document.querySelector('input#productName');
        pn.value = prdName;

        let pr = document.querySelector('input#productPrice');
        pr.value = price;

        let pw = document.querySelector('input#productWeight');
        pw.value = 200;

        phoneNoInput.value = phone;

        [pr, pn, pw, phoneNoInput].forEach(i => {
            i.dispatchEvent(customEvent('input'));
            i.dispatchEvent(customEvent('change'))
        });

        phoneNoInput.click();
        phoneNoInput.focus();

        let iv = setInterval(function(){
            updateCOD(function(){ clearInterval(iv) });
        }, 500);
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
