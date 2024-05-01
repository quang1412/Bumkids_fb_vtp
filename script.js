// ==UserScript==
// @name         Bum | FB - VTP
// @namespace    https://github.com/quang1412/Bumkids_fb_vtp
// @version      2024-05-01-01
// @description  try to take over the world!
// @author       QuangPlus
// @match        https://viettelpost.vn/*
// @match        https://www.facebook.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=viettelpost.vn
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest

// ==/UserScript==
const myPhone = '0966628989';

(function(){
    var css = `div.infoCard {
    font-weight: 500;
    color: darkblue;
    background-image: linear-gradient(240deg, #a1c4fd 0%, #c2e9fb 100%);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 10px;
    min-width: 250px;
    min-height: 20px;
    border: 2px solid #fff;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 12px 28px 0 var(--shadow-1),0 2px 4px 0 var(--shadow-1);
    }

    div.infoCard:after {
    content: '';
    position: absolute;
    left: 4%;
    top: 101%;
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 6px solid #fff;
    clear: both;
    }

    div[aria-label="Nhắn tin"][role="button"] { border: 2px dashed red; border-radius: 6px; }

    div.infoCard div.toolBar {
    text-align: center;
    background-color: rgb(245 245 245 / 60%);
    border-radius: 6px;
    display: flex;
    justify-content: space-around;
    }

    div.toolBar a { padding: 5px; flex: 1; }
    div.toolBar:hover a:not(:hover) { opacity: .5; }

    div.hasPhoneNum {
    border: 2px dashed red;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 5px;
    }

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

function getListOrdersVTP(phone = myPhone) {
    return new Promise((resolve, reject) => {
        if(!phone) return reject('Chưa có sdt');

        let dvId = GM_getValue('vtp_deviceId');
        let token = GM_getValue('vtp_tokenKey');
        if (!token || !dvId) return reject('Lỗi Viettel Post');

        GM_xmlhttpRequest({
            url:  "https://api.viettelpost.vn/api/supperapp/get-list-order-by-status-v2",
            method: "POST",
            headers: {
                'Token': token,
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
                "deviceId": dvId
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

    const prdList = ['Quần Áo','Mỹ Phẩm','Túi xách','Mũ','Kính','Giày dép'];

    const phoneBook = {
        key: 'fb_phoneBook',
        get: function(id){
            let pb = GM_getValue(this.key);
            return pb[id];
        },
        set: function(id, phone){
            let pb = GM_getValue(this.key) || {};
            pb[id] = phone;
            GM_setValue(this.key, pb);
            this.upload(id, phone);
            return true;
        },
        upload: function(id, phone){
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
        init: function(){
            let pb = GM_getValue(this.key);
            if(pb) {
                console.log('phoneBook available', pb);
                return false;
            }
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    url:  "https://bumluxury.com/bumkids/fid2phone.php",
                    method: "GET",
                    responseType: 'json',
                    onload: function (response) {
                        return resolve(response.response);
                    },
                    onerror: function(reponse) {
                        return reject(reponse);
                    }
                })
            }).then(json => {
                pb = json;
                console.log('Phone Book downloaded', json);
            }).catch(e => {
                pb = new Object();
                console.log("error: ", e.message);
                alert('Phonebook error: ' + e.message);
                console.log('Phone Book unavailable!');
            }).then(() => {
                GM_setValue(this.key, pb);
            })
        }
    }
    phoneBook.init();

    function phone2Recievers(phone = null) {
        return new Promise((resolve, reject) => {
            if(!phone) return reject('chưa có sdt');

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

    function getDeliveryRate(phone){
        return new Promise((resolve, reject) => {
            if(!phone) return reject('Chưa có sdt');

            let token = GM_getValue('vtp_tokenKey');
            if (!token) return reject('Lỗi viettel');

            GM_xmlhttpRequest({
            method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + token
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
            let imgElem = h.querySelector('img[src*="https"]');
            let imgSrc = imgElem?.getAttribute('src');

            if(!this.id || !this.name || !imgSrc){
                this.container.classList.remove('added');
                return false;
            }

            this.card = document.createElement('div');
            this.card.classList = 'infoCard';
            // this.card.style['background-image'] = `url(${imgSrc})`;

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
            btn_2.onclick = () => { this.setPhone() };

            let btn_3 = document.createElement('a');
            btn_3.innerText = 'Tạo đơn';
            btn_3.style.color = 'green';
            btn_3.onclick = () => { this.createOrder() };

            let btn_4 = document.createElement('a');
            btn_4.innerText = 'Order';
            btn_4.style.color = 'purple';
            btn_4.onclick = () => { this.createPreOrder() };

            let toolBar = document.createElement('div');
            toolBar.classList.add('toolBar');

            toolBar.append(this.searchBtn, btn_2, btn_3);
            this.card.append(this.infoList, toolBar);

            container.append(this.card);

            this.container.onmouseup = () => {
                if(!window.getSelection) return;
                let phone = window.getSelection().toString().replaceAll(/\D/g,'');
                if(!isVNPhone(phone) || phone == this.phone || phone == myPhone){
                    return false;
                } else if(!this.phone || confirm("Xác nhận đổi sdt cho " + this.name + " => " + phone + "?")){
                    this.setPhone(phone);
                }
             }
        }
        refreshInfo(){

            if(this.isBusy) return;
            this.isBusy = 1;

            this.infoList.innerHTML = '<tr><td colspan="2" style="text-align:center;">Đang tải...</td></tr>';
            getListOrdersVTP(this.phone).then(orders => {
                console.log(orders)
                this.penddingOrders = orders.data.totalElements;
                return getDeliveryRate(this.phone);
            }).then(rate => {
                let r = 'Chưa có';
                if(rate && rate.deliveryRate !== -1){
                    let percent = (rate.deliveryRate * 100).toFixed(2);
                    r = (`${percent}% (${rate.order501}/${rate.totalOrder})`);
                }
                this.deliveryRate = r;
            }).catch(e => {
                this.penddingOrders = e.message;
                this.deliveryRate = e.message;
            }).finally(() => {
                this.infoList.innerHTML = `<tr style="display:none;"><td>ID:</td><td> ${this.id}</td></tr>
                <tr><td>Sdt:</td><td> ${this.phone || '---'}</td></tr>
                <tr><td>Uy tín:</td><td> ${this.deliveryRate || '---'}</td></tr>
                <tr><td>Đơn giữ:</td><td> ${this.penddingOrders ? 'Có ❌❌❌' : 'Không'}`;
                this.isBusy = 0;
            })
        }
        phoneSearching(){
            let stop = () => {
                window.clearInterval(this.searchLoop);
                this.searchLoop = 0;
                this.searchBtn.innerText = 'Tìm sđt';
                return;
            }

            if(this.searchLoop){ return stop(); }

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
                    if(!match || !!~match.indexOf(myPhone)){ continue; }

                    m.classList.add('hasPhoneNum');
                    m.dispatchEvent(customEvent('mouseover'));

                    for(let i = 0; i <= 10; i++){
                        setTimeout(() => {
                            m.scrollIntoView( {block: "center", inline: "nearest"});
                            m.querySelector('div[aria-haspopup="menu"][role="button"][aria-label="Xem thêm"]:not([aria-expanded="true"])')?.click();
                        }, i * 100)
                    }

                    stop();
                    break;
                }
            }, 500);
            this.searchBtn.innerText = 'Dừng';
        }
        setPhone(phone = window.prompt("Nhập sđt cho " + this.name, this.phone)){
            if (phone == null || phone == "" || phone == this.phone || !isVNPhone(phone)) return false;
            this.phone = phone;
            phoneBook.set(this.id, this.phone);
            this.refreshInfo();
        }
        createOrder(){
            new Promise((resolve, reject) => {
                if(!this.phone) return reject('❌ Vui lòng cập nhật sđt trước!');
                if(this.penddingOrders) return reject('❌ Có đơn chờ giao');
                return resolve(true);
            }).then(_ => {
                let url = 'https://viettelpost.vn/order/tao-don-le?fbid=' + this.id + '&phone=' + this.phone + '&name=' + this.name;

                let prices = prompt("B1 - Nhập giá, phân tách bằng dấu cách để tính tổng (đv 1.000đ):", GM_getValue('fb_lastPrice') || 1000);
                if (prices == null || prices == undefined) { return false }
                let price = prices.trim().split(/\D+/g).reduce((pv, cv) => pv + parseInt(cv || 0), 0);
                GM_setValue('fb_lastPrice', prices);
                url += '&price=' + (price*1000);

                let pl = prdList.map((p, i) => (i + 1) + '/ ' + p).join('\n');
                var i = prompt('Danh sách sản phẩm\n' + pl +'\n\nB2 - Chọn tên sản phẩm, giá '+ prices +':', 1);
                let prdName = prdList[i - 1];
                if(!prdName) return false;
                url += '&prdName=' + prdName;

                viettelWindown?.focus();
                var viettelWindown = window.open(url, 'window','toolbar=no, menubar=no, resizable=yes, width=1200, height=800');
                //window.addEventListener('message', (event) => {if (event.data === 'popup-closed') {alert('ok')}});
            }).catch(alert).finally(() => {
            })

           /* phone2Recievers(this.phone).then(r => {
                console.log(r);

                let addr = '';
                let addrList = !r.items.length ? ('❌ Chưa có!') : r.items.map((l, i) => `${i + 1}/ ${l.addr?.substring (0, 50) + '...'}`).join('\n');

                let numb = prompt("Danh sách địa chỉ:\n" + addrList + "\n\nB1 - Chọn địa chỉ, hoặc nhập địa chỉ mới:", 1);
                if (numb == null || numb == undefined) return false;
                addr = r.items[numb - 1]?.addr || numb;
                url += '&addr=' + addr;

                let pl = prdList.map((p, i) => (i + 1) + '/ ' + p).join('\n');
                var i = prompt('Danh sách sản phẩm\n' + pl +'\n\nB2 - Chọn tên sản phẩm:', 1);
                let prdName = prdList[i - 1];
                if(!prdName) return false;
                url += '&prdName=' + prdName;

                let itemsPrice = prompt("Địa chỉ: " + addr + "\nTên SP: " + prdName + "\n\nB3 - Nhập giá, phân tách bằng dấu cách để tính tổng (đv 1.000đ):", GM_getValue('fb_lastPrice') || 1000);
                if (itemsPrice == null || itemsPrice == undefined) { return false }
                let price = itemsPrice.trim().split(/\D+/g).reduce((pv, cv) => pv + parseInt(cv || 0), 0);
                GM_setValue('fb_lastPrice', itemsPrice);
                url += '&price=' + (price*1000);

                viettelWindown?.focus();
                var viettelWindown = window.open(url, 'window','toolbar=no, menubar=no, resizable=yes, width=1200, height=800');
                //window.addEventListener('message', (event) => {if (event.data === 'popup-closed') {alert('ok')}});

            }).then(_ => {

            }).catch(e => {
                alert('lỗi ' + e.message);
            }).finally(() => {
                document.body.style.cursor = 'default';
                this.isBusy = 0;
            }) */
        }
        createPreOrder(){
            let pathname = window.location.pathname;
            let isPost = (/\/posts\/[\d\w]+$/g).test(pathname);
            if(!isPost){
                return alert('vui lòng chuyển vào trang bài post');
            }
            let postId = window.prompt("Nhập id bài post", window.location.pathname);
            if(postId == null || postId == '') return;
            return
            alert('✔đang phát triển!');
        }
    }

    /* function conversationScaning(callback){
        console.log('conversationScaning');
        let elems = document.querySelectorAll('div[aria-label="Tin nhắn"]:not(.added)')
        if(!elems.length){
            return callback(true);
        }
        elems.forEach(function(e){
            let contain = e.closest('div:is(.__fb-dark-mode, .__fb-light-mode)');
            if(contain.querySelector('a[aria-label][href][role="link"]')){
                let card = new InfoCard(contain);
                e.classList.add('added');
                return callback(true);
            }
        })
    } */

    document.onmouseup = async function(){

        await new Promise(resolve => { setTimeout(_ => resolve(), 1000) });

        document.querySelectorAll('div:is(.__fb-dark-mode, .__fb-light-mode):not(.added)').forEach(function(e){
            e.classList.add('added');
            let s = e.querySelector('div[aria-label="Cài đặt chat"]');
            s && new InfoCard(e);
        })

        document.querySelectorAll('a[aria-label][role="link"][href*="/"]:not(.tested)').forEach(function(e){
            // return;
            e.classList.add('tested');
            // e.style.border = '1px dashed green';
            let label = e.getAttribute('aria-label');
            let href = e.getAttribute('href').replaceAll('/', '');
            let isName = !~(['Trang cá nhân', 'Mở ảnh']).indexOf(label)
            let isId = (/^\d(\d)+\d$/g).test(href);
            if(isId && isName){
                e.style.border = '1px dashed red';
            }
        });
    }


    document.onkeyup = (function(e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
            // document.querySelectorAll('div[aria-label="Đóng đoạn chat"]').forEach(e => e.click());
        }
    });

})();


//   Viettel Post //
(function($) {
    if(window.location.href.indexOf('viettelpost') == -1) return;

    let dvId = window.localStorage.deviceId;
    let token = dvId && JSON.parse(window.localStorage['vtp-token']).tokenKey;
    GM_setValue('vtp_deviceId', dvId);
    GM_setValue('vtp_tokenKey', token);

    $(document).ready(async function(){
        if(window.location.href.indexOf('/order/tao-don-le') == -1) return;

        let test = await getListOrdersVTP();
        let status = test?.status == 200;

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
            let price = parseInt(this.value.replaceAll('.', '') || 0);
            let fee = parseInt(document.querySelector('.mt-3.vt-order-footer .resp-border-money .txt-color-viettel span').textContent.replaceAll(/[\. đ \s]/g,'') || 0);

            fee && updateCOD(price, fee);
        });

        $(document).keyup(function(e) {
            if (e.key === "Escape") { // escape key maps to keycode `27`
                $('button.close').click();
            }
            if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey){
                $('#confirmCreateOrder button.btn.btn-viettel.btn-sm').click();
                //window.opener.parent.postMessage('childMess', 'hello');

            }
        });

        window.opener?.postMessage('popup-closed', '*');

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

            let phoneNoInput = document.querySelector('input#phoneNo');
            phoneNoInput.value = phone;

            let fn = document.querySelector('input#fullName');
            ['click', 'keydown', 'keyup'].forEach(e => {
                document.body.addEventListener(e, _ => {
                    fn.value = name;
                    fn.dispatchEvent(customEvent('input'));
                    fn.dispatchEvent(customEvent('change'));
                })
            })

            let pn = document.querySelector('input#productName');
            pn.value = prdName + ' - Trịnh Hiền - Bumkids';

            let pr = document.querySelector('input#productPrice');
            pr.value = price;

            let pw = document.querySelector('input#productWeight');
            pw.value = 200;

            [pr, pn, pw].map(i => {i.dispatchEvent(customEvent('input')); i.dispatchEvent(customEvent('change'))});

            setTimeout(() => {
                phoneNoInput.dispatchEvent(customEvent('change'));
                phoneNoInput.click();
                phoneNoInput.focus();
            }, 1000);

            let iv = setInterval(function(){
                let fee = parseInt(document.querySelector('.mt-3.vt-order-footer .resp-border-money .txt-color-viettel span').textContent.replaceAll(/[\. đ \s]/g,'') || 0);

                fee && (updateCOD(price, fee), clearInterval(iv));
            }, 1000)
        }
    })
})($);
