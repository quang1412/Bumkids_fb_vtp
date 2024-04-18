// ==UserScript==
// @name         Bum | FB - VTP
// @namespace    https://github.com/quang1412/Bumkids_fb_vtp
// @version      2024-04-18-1
// @description  try to take over the world!
// @author       QuangPlus
// @match        https://viettelpost.vn/*
// @match        https://www.facebook.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=viettelpost.vn
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest

// ==/UserScript==
let vtp_deviceId, vtp_tokenKey, myPhone = '0966628989';

(function(){
    var css = `.infoCard{
    color: darkblue;
    font-weight: 500;
    background-image: linear-gradient(-20deg, #e9defa 0%, #fbfcdb 100%);
    position: absolute;
    bottom: calc(100% + 3px);
    left: 10px;
    min-width: 250px;
    min-height: 20px;
    border: 1.5px solid #dedede;
    border-radius: 8px;
    padding: 5px;
    /* background: radial-gradient(circle at 18.7% 37.8%, rgb(250, 250, 250) 0%, rgb(225, 234, 238) 90%); */}

    body.vt-post.custom nav#sidebar, body.vt-post div.option-setting, body.vt-post mat-tab-header, body.vt-post header-app {display: none;}
    body.vt-post.custom div.box-product-info div.card-body { max-height: 210px; overflow: auto; }
    body.vt-post.custom div.box-receiver div.card-body { max-height: 310px; overflow: auto; }
    body.vt-post.custom #createEditForm > div.mt-3.vt-order-footer > div > div.row.col-lg-8.resp-border-money > div:nth-child(3) > div > strong.txt-color-viettel {color: orangered !important; font-size: 30px;}
    body.vt-post.custom button {text-wrap: nowrap;}
    body.vt-post.custom div.box-receiver div.card-body group small {color: red !important; font-size: 14px;}
    body.vt-post.custom #content {width: 100% !important; margin-left: 0;}`,

        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    head.appendChild(style);

    style.type = 'text/css';
    if (style.styleSheet){
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
})();

function isVNPhone(number) { return (/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/).test(number) }

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

function getListOrdersVTP(phone = myPhone) {
    return new Promise((resolve, reject) => {
        if(!phone) return reject('Chưa có sdt');
        if (!vtp_tokenKey || !vtp_deviceId) return reject('Lỗi Viettel Post');

        GM_xmlhttpRequest({
            url:  "https://api.viettelpost.vn/api/supperapp/get-list-order-by-status-v2",
            method: "POST",
            headers: {
                'Token': vtp_tokenKey,
                "Content-Type": "application/json;charset=UTF-8",
            },
            data: JSON.stringify({
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
                "ORDER_STATUS": "-108,100,102,103,104,-100",
                "deviceId": vtp_deviceId
            }),
            onload: function (response) {
                console.log (
                    "GM_xmlhttpRequest() response is:\n",
                    response.responseText.substring (0, 80) + '...'
                );
                return resolve(JSON.parse(response.responseText))
            },
            onerror: function(reponse) {
                console.log("error: ", reponse);
                return reject(reponse)
            }
        })
    })
}

//   Facebook //
(function() {
    if(window.location.href.indexOf('facebook') == -1) return;

    vtp_deviceId = GM_getValue('vtp_deviceId');
    vtp_tokenKey = GM_getValue('vtp_tokenKey');

    const phoneBook = {
        key: 'fb_phoneBook',
        get: function(id = 0){
            let pb = GM_getValue(this.key);
            //console.log(pb)
            return pb[id];
        },
        set: function(id = 0, phone = 0){
            let pb = GM_getValue(this.key) || {};
            pb[id] = phone;
            GM_setValue(this.key, pb);
            this.save(id, phone);
            return true;
        },
        save: function(id, phone){
            GM_xmlhttpRequest({
                url:  "https://bumluxury.com/bumkids/fid2phone.php",
                method: "POST",
                headers: { "Content-Type": "application/json;charset=UTF-8" },
                data: JSON.stringify({ "fid": id, "phone": phone }),
                onload: function (response) { },
                onerror: function(reponse) {
                    console.log("error: ", reponse);
                    return alert('Phonebook error: ' + reponse)
                }
            })
        },
        sync: function(){
            let pb = GM_getValue(this.key);
            return new Promise((resolve, reject) => {
                if(pb) return reject();
                GM_xmlhttpRequest({
                    url:  "https://bumluxury.com/bumkids/fid2phone.php",
                    method: "GET",
                    responseType: 'json',
                    onload: function (response) {
                        pb = response.response;
                        return resolve(pb);
                    },
                    onerror: function(reponse) {
                        console.log("error: ", reponse);
                        return resolve(pb);
                        alert('Phonebook error: ' + reponse);
                    }
                })
            }).then(pb => {
                console.log('phoneBook downloaded', pb);
                GM_setValue(this.key, pb);
            }).catch(e => {
                console.log('phoneBook available', pb);
            })
        }
    }
    phoneBook.sync();

    function phone2Recievers(phone = null) {
        return new Promise((resolve, reject) => {
            if(!phone) return reject('chưa có sdt');
            if (!vtp_tokenKey || !vtp_deviceId) return reject('Lỗi 0012');

            GM_xmlhttpRequest({
            method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + vtp_tokenKey
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

    function getDeliveryRate(phone){
        return new Promise((resolve, reject) => {
            if(!phone) return reject('Chưa có sdt');
            if (!vtp_tokenKey || !vtp_deviceId) return reject('Lỗi viettel');

            GM_xmlhttpRequest({
            method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + vtp_tokenKey
                },
                url:  "https://io.okd.viettelpost.vn/order/v1.0/kyc/" + phone,
                onload: function (response) {
                    console.log (
                        "GM_xmlhttpRequest() response is:\n",
                        response.responseText.substring (0, 80) + '...'
                    );
                    let json = JSON.parse(response.responseText);
                    return resolve(json);
                },
                onerror: function(reponse) {
                    console.log("error: ", reponse);
                    return reject(reponse)
                }
            })
        })
    }

    class InfoCard{
        constructor(container){
            this.container = container;

            let h = container.querySelector('a[aria-label][href][role="link"]');
            this.name = h.getAttribute('aria-label');
            this.id = h.getAttribute('href').replaceAll('\/', '');

            if(!this.id || !this.name){
                this.container.classList.remove('added');
                return false;
            }

            this.card = document.createElement('div');
            this.card.classList = 'infoCard';

            this.phone = phoneBook.get(this.id);
            this.penddingOrders = 0;
            this.deliveryRate = 0;

            this.infoList = document.createElement('table');
            this.infoList.setAttribute('style', 'padding-bottom: 5px;');
            this.refreshInfo();

            this.searchBtn = document.createElement('a');
            this.searchBtn.innerText = 'Tìm sđt';
            this.searchBtn.style.color = 'blue';
            this.searchBtn.onclick = () => { this.phoneSearching() };

            let btn_2 = document.createElement('a');
            btn_2.innerText = 'Sửa sđt';
            btn_2.style.color = 'red';
            btn_2.style['margin-left'] = '10px';
            btn_2.onclick = () => { this.setPhone() };

            let btn_3 = document.createElement('a');
            btn_3.innerText = 'Tạo đơn';
            btn_3.style.color = 'green';
            btn_3.style['margin-left'] = '10px';
            btn_3.onclick = () => { this.createOrder() };

            let toolBar = document.createElement('div');
            toolBar.setAttribute('style', 'padding-top: 5px; border-top: 1px solid #dedede;');

            toolBar.append(this.searchBtn, btn_2, btn_3);
            this.card.append(this.infoList, toolBar);

            container.append(this.card);

            this.container.onmouseup = () => {
                if(!window.getSelection) return;
                let phone = window.getSelection().toString().replaceAll(/\D/g,'');
                if(!isVNPhone(phone) || phone == this.phone || phone == myPhone) return;
                this.setPhone(phone);
            }
        }
        refreshInfo(){
            this.infoList.innerHTML = '<tr><td colspan="2" style="text-align:center;">Đang cập nhật...</td></tr>';
            getListOrdersVTP(this.phone).then(orders => {
                this.penddingOrders = orders.data.totalElements;
                return getDeliveryRate(this.phone);
            }).then(rate => {
                this.deliveryRate = rate?.deliveryRate != -1 ? (rate.deliveryRate * 100).toFixed(2) + '% (' + rate.order501 + '/' + rate.totalOrder + ')' : 'Chưa có.';
            }).catch(e => {
                this.penddingOrders = e.message;
                this.deliveryRate = e.message;
            }).finally(() => {
                this.infoList.innerHTML = `<tr><td>Sdt:</td><td> ${this.phone || '---'}</td></tr>
                <tr><td>Uy tín:</td><td> ${this.deliveryRate || '---'}</td></tr>
                <tr><td>Đơn giữ:</td><td> ${this.penddingOrders ? 'Có' : 'Không'}`;
            })
        }
        phoneSearching(){
            let stop = () => {
                window.clearInterval(this.searchLoop);
                this.searchLoop = 0;
                this.searchBtn.innerText = 'Tìm sđt!';
                return;
            }

            if(this.searchLoop){ return stop(); }

            this.searchLoop = setInterval(() => {
                this.container.querySelectorAll('div').forEach(d => {
                    d.scrollTop = 0;
                })
                this.container.querySelectorAll('div.__fb-light-mode[role="row"]:not(.scanned)').forEach( m => {
                    let text = m.innerText.replaceAll(/(\W|\D)/g, '');
                    console.log(text);
                    let match = text.match(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/g);
                    m.classList.add('scanned');
                    if(match && match[0] != myPhone){
                        stop();
                        m.scrollIntoView();
                        return false;
                    }
                })
            }, 500);
            this.searchBtn.innerText = 'Stop.';
        }
        setPhone(phone = window.prompt("Nhập sđt cho " + this.name, "")){
            if (phone == null || phone == "" || !isVNPhone(phone)) return false;
            if (! confirm("Xác nhận đổi sdt cho " + this.name + " thành " + phone + "?")) return false;

            this.phone = phone;
            phoneBook.set(this.id, this.phone);
            this.refreshInfo();
        }
        createOrder(){
            if(!this.phone) return alert('❌ Vui lòng cập nhật sđt trước!');
            if(this.penddingOrders) return alert('❌ Có đơn chờ giao');

            document.body.style.cursor = 'wait';

            phone2Recievers(this.phone).then(r => {

                console.log(r);

                let url = 'https://viettelpost.vn/order/tao-don-le?fbid=' + this.id + '&phone=' + this.phone + '&name=' + this.name;

                let addr = '';
                let numb = prompt("Danh sách địa chỉ:\n" + (!r.items.length ? '❌ Chưa có!' : r.items.map((l, i) => `${i + 1}/ ${l.addr.substring (0, 50) + '...'}`).join('\n')) + "\n\nB1 - Chọn địa chỉ, hoặc nhập địa chỉ mới:", 1);
                if (numb == null || numb == undefined) return false;
                addr = r.items[numb - 1]?.addr || numb;
                url += '&addr=' + addr;

                let prdList = ['Quần Áo - Trịnh Hiền Auth - Bumkids',
                               'Mỹ Phẩm - Trịnh Hiền Auth - Bumkids',
                               'Túi xách - Trịnh Hiền Auth - Bumkids',
                               'Mũ - Trịnh Hiền Auth - Bumkids',
                               'Kính - Trịnh Hiền Auth - Bumkids',
                               'Giày dép - Trịnh Hiền Auth - Bumkids'];
                let pl = prdList.map((p, i) => (i + 1) + '/ ' + p).join('\n');
                var i = prompt('Danh sách sản phẩm\n' + pl +'\n\nB2 - Nhập tên sản phẩm:', 1);
                let prdName = prdList[i - 1];
                if(!prdName) return false;
                url += '&prdName=' + prdName;

                let itemsPrice = prompt("Địa chỉ: " + addr + "\nTên SP: " + prdName + "\n\nB3 - Nhập giá, phân tách bằng dấu cách để tính tổng (đv 1.000đ):", GM_getValue('fb_lastPrice') || 1000);
                if (itemsPrice == null || itemsPrice == undefined) { return false }
                let price = itemsPrice.trim().split(/\D+/g).reduce((pv, cv) => pv + parseInt(cv || 0), 0);
                GM_setValue('fb_lastPrice', itemsPrice);
                url += '&price=' + (price*1000);

                window.childWin = window.open(url, 'window','toolbar=no, menubar=no, resizable=yes, width=1200, height=800');
                window.childWin.focus();
            }).catch(e => {
            }).finally(() => {
                document.body.style.cursor = 'default';
            })
        }
    }
    document.onmouseup = function(){
        document.querySelectorAll('div.__fb-light-mode:not(.added)').forEach(function(e){
            e.classList.add('added');
            let s = e.querySelector('div[aria-label="Cài đặt chat"]');
            s && new InfoCard(e);
        })
    }

    window.addEventListener("beforeunload", function(e){
        window.childWin && window.childWin.close();
    });

})();


//   Viettel Post //
(function($) {
    if(window.location.href.indexOf('viettelpost') == -1) return;

    vtp_deviceId = window.localStorage.deviceId;
    vtp_tokenKey = vtp_deviceId && JSON.parse(window.localStorage['vtp-token']).tokenKey;

    GM_setValue('vtp_deviceId', vtp_deviceId);
    GM_setValue('vtp_tokenKey', vtp_tokenKey);

    function customEvent(n){
        let event = document.createEvent('Event');
        event.initEvent(n, true, false);
        return event;
    }


    $(document).ready(async function(){
        if(window.location.href.indexOf('/order/tao-don-le') == -1) return;

        let test = await getListOrdersVTP();
        let status = test?.status == 200

        $('input#phoneNo').attr('placeholder', 'Nhập số điện thoại để tự điền thông tin người nhận \(check trùng đơn: '+ (status ? 'OK' : 'LỖI') +'\)');

        status && $(document).on('change', 'input#phoneNo', async function(){
            this.value = this.value.replaceAll(/\D/g, '');

            let phone = this.value
            console.warn(phone);

            if(!isVNPhone(phone)){ return }
            getListOrdersVTP(phone).then(orders => {
                console.warn(orders);
                if(orders.status == '200' && orders.data.totalElements){
                    alert('❌❌❌ \n Sđt đang có đơn giữ, hoặc đơn chờ lấy! \n❌❌❌');
                    this.value = '';
                    window.location.reload();
                }
            }).catch(e => {
                alert(e.message);
            });

            this.dispatchEvent(customEvent('input'));
        });

        function updateCOD(price, fee){
            let input = document.querySelector('input#cod'),
                p = parseInt(price),
                f = parseInt(fee)
            input.value = p + f;
            input.dispatchEvent(customEvent('input'));
            input.dispatchEvent(customEvent('change'));

            let n = document.querySelector('.box-product-info + div .ng-star-inserted .custom-switch input#switch1');
            n.checked = true;
            n.dispatchEvent(customEvent('change'));
        }

        $(document).on('change click', 'input#productPrice', function(e){
            let price = parseInt(this.value.replaceAll('.', '')|| 0);
            let fee = parseInt(document.querySelector('.mt-3.vt-order-footer .resp-border-money .txt-color-viettel span').textContent.replaceAll(/[\. đ \s]/g,'') || 0);

            fee && updateCOD(price, fee);
        });

        $(document).keyup(function(e) {
            if (e.key === "Escape") { // escape key maps to keycode `27`
                $('button.close').click();
            }
            if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey){
                $('#confirmCreateOrder button.btn.btn-viettel.btn-sm').click();
            }
        });

        const urlParams = new URLSearchParams(window.location.search);
        let fbid = urlParams.get('fbid');
        if(fbid){
            let phone = urlParams.get('phone');
            let addr = urlParams.get('addr');
            let name = urlParams.get('name');
            let price = urlParams.get('price');
            let prdName = urlParams.get('prdName');

            window.document.body.classList.add('custom');
            let s = $('div.box-receiver');
            let p = s.parent();
            s.prependTo(p);

            //$('#custom_selectbox > div > div > ul.d-flex.flex-column.tab-list > li:nth-child(2) > label').click();

            let ci = document.querySelector('input#phoneNo');
            ci.value = phone;

            let fn = document.querySelector('input#fullName');
            fn.value = name;

            let adr = document.querySelector('input#autoAddress');
            adr.value = addr;

            let pn = document.querySelector('input#productName');
            pn.value = prdName;

            let pr = document.querySelector('input#productPrice');
            pr.value = price;

            let pw = document.querySelector('input#productWeight');
            pw.value = 200;


            setTimeout(() => {[ci, fn, adr, pr, pn, pw].map(i => {i.dispatchEvent(customEvent('click')); i.dispatchEvent(customEvent('input')); i.dispatchEvent(customEvent('change'))});}, 1000)
            let iv = setInterval(function(){
                let fee = parseInt(document.querySelector('.mt-3.vt-order-footer .resp-border-money .txt-color-viettel span').textContent.replaceAll(/[\. đ \s]/g,'') || 0);

                fee && (updateCOD(price, fee), clearInterval(iv));
            }, 1000)
        }
    })
})($);
