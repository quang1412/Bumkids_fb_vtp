// ==UserScript==
// @name         Bum | FB - VTP
// @namespace    http://tampermonkey.net/
// @version      2024-04-08
// @description  try to take over the world!
// @author       You
// @match        https://viettelpost.vn/*
// @match        https://www.facebook.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=viettelpost.vn
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest

// ==/UserScript==

(function(){
    var css = `.infoCard{
    color: darkblue;
    background: radial-gradient(circle at 18.7% 37.8%, rgb(250, 250, 250) 0%, rgb(225, 234, 238) 90%);
    position: absolute;
    bottom: calc(100% + 3px);
    left: 10px;
    min-width: 250px;
    min-height: 20px;
    border: 1px solid #dedede;
    border-radius: 5px;
    padding: 5px;}`,
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

function isVNPhone(number) {
  return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(number);
}

//   Facebook //
(function() {
    if(window.location.href.indexOf('facebook') == -1) return;

    const vtp_deviceId = GM_getValue('vtp_deviceId');
    const vtp_tokenKey = GM_getValue('vtp_tokenKey');
    const fb_phoneBook = GM_getValue('fb_phoneBook') || {};

    console.log(fb_phoneBook);


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
                    return resolve(response.responseText)

                }

            })
        })
    }

    function getDeliveryRate(phone){
        return new Promise((resolve, reject) => {
            if(!phone) return reject('chưa có sdt');
            if (!vtp_tokenKey || !vtp_deviceId) return reject('Lỗi 0012');

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
                    return resolve(response.responseText)
                }

            })
        })
    }

    class InfoCard{
        constructor(container){
            this.container = container;
            this.card = document.createElement('div');
            this.card.classList = 'infoCard';

            let h = container.querySelector('a[aria-label][href][role="link"]');
            this.name = h.getAttribute('aria-label');
            this.id = h.getAttribute('href').replaceAll('\/', '');
            this.phone = fb_phoneBook[this.id];
            this.deliveryRate = 0;

            if(!this.id || !this.name){ return container.classList.remove('added') }

            this.infoList = document.createElement('ul');
            this.infoList.setAttribute('style', 'margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #dedede;');
            this.refreshInfo();

            this.searchBtn = document.createElement('a');
            this.searchBtn.innerText = 'Tìm sđt!';
            this.searchBtn.onclick = () => { this.phoneSearching() };

            this.setPhoneBtn = document.createElement('a');
            this.setPhoneBtn.innerText = 'Sửa sđt!';
            this.setPhoneBtn.style.color = 'red';
            this.setPhoneBtn.style['margin-left'] = '5px';
            this.setPhoneBtn.onclick = () => { this.setPhone() };

            let toolBar = document.createElement('div');
            toolBar.append(this.searchBtn, this.setPhoneBtn);
            this.card.append(this.infoList, toolBar);

            container.append(this.card);
            !this.phone && this.phoneSearching();
        }
        async refreshInfo(){
            await phone2Recievers(this.phone)
            .then(res => JSON.parse(res))
            .then(vtpInfo => {
                console.log(vtpInfo);
            })
            .catch(e => {
//                alert(e.message || e);
            })
            .then(() => {

            })
            .finally(() => {
                this.infoList.innerHTML = `<li>ID: ${this.id}</li><li>Name: ${this.name}</li><li>Phone: ${this.phone || '---'}</li><li>Địa chỉ: ${this.addr || '---'}</li><li>Tỷ lệ nhận: ${this.rate || '---'}</li><!-- <li>xxxxxxx</li> -->`;
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
                    let text = m.innerText.replaceAll(/(\W\D)/g, '');
                    console.log(text);
                    let match = text.match(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})/s);
                    m.classList.add('scanned');
                    if(match){
                        stop();
                        m.scrollIntoView();
                        !this.phone && this.setPhone(match[0]);
                        this.refreshInfo();
                        return false;
                    }
                })
            }, 500);
            this.searchBtn.innerText = 'Stop.';
        }
        setPhone(phone){
            phone = phone || window.prompt("Nhập sđt cho " + this.name, "");
            if (phone == null || phone == "" || !isVNPhone(phone)) {
                return;
            }
            this.phone = phone;
            fb_phoneBook[this.id] = phone;
            GM_setValue('fb_phoneBook', fb_phoneBook);
            this.refreshInfo();
        }
    }
    document.onmousemove = function(){
//    document.onmouseup = function(){
        document.querySelectorAll('div.__fb-light-mode:not(.added)').forEach(function(e){
            e.classList.add('added');
            let s = e.querySelector('div[aria-label="Cài đặt chat"]');
            s && new InfoCard(e);
        })
    }
})();


//   Viettel Post //
(function() {
    if(window.location.href.indexOf('viettelpost') == -1) return;
    let deviceId = window.localStorage.deviceId;
    let tokenKey = deviceId && JSON.parse(window.localStorage['vtp-token']).tokenKey;

    GM_setValue('vtp_deviceId', deviceId);
    GM_setValue('vtp_tokenKey', tokenKey);
})();
