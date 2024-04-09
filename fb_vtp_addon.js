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

// ==/UserScript==

function isVNPhone(number) {
  return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(number);
}

(function() {
    if(window.location.href.indexOf('facebook') == -1) return;

    const vtp_deviceId = GM_getValue('vtp_deviceId');
    const vtp_tokenKey = GM_getValue('vtp_tokenKey');
    const fb_phoneBook = GM_getValue('fb_phoneBook') || {};

    console.log(fb_phoneBook);

    let oRange = {}, oRect = {}, clickTimeout;

    function getSelectedText() {
        var text = "";
        if (typeof window.getSelection != "undefined") {
            let s = window.getSelection();
            text = s.toString();
            oRange = s.getRangeAt(0);
            oRect = oRange.getBoundingClientRect();
        } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
            text = document.selection.createRange().text;
        }
        return text;
    }

    function getFbName(){
        console.log(oRect);
        return '';
    }

    const infoCard = {
        phone: '',
        name: '',
        show: async function(phone, name){
            this.remove();
            this.el = document.createElement("div");
            this.el.className = 'info-card';
            this.el.innerHTML = `<ul><li>Phone: ${phone}</li><li>Name: ${name}</li><li>DeviceId: ${vtp_deviceId}</li><li>xxxxxxxxx</li></ul>`;
            this.el.setAttribute('style', 'position: absolute; min-width: 20px; padding: 5px; min-height: 20px; border: 2px solid #dedede; border-radius: 5px; background: #ffffff;');
            this.el.style.top = (oRect.y + oRect.height) + 'px';
            this.el.style.left = (oRect.x) + 'px';

            document.body.append(this.el);
        },
        remove: function(){ this.el && this.el.remove() },
    };
    function doSomethingWithSelectedText() {
        let phone = getSelectedText();
        if (phone && isVNPhone(phone)) {
            let name = getFbName();
            infoCard.show(phone, name);
        }
    }

    document.onmouseup = function(e){
     //   window.clearTimeout(clickTimeout);
       // infoCard.remove();
       // clickTimeout = setTimeout(doSomethingWithSelectedText, 200);
    };


    class InfoCard{
        constructor(container){
            this.container = container;
            this.card = document.createElement('div');
            this.card.setAttribute('style', `/*backdrop-filter: blur(32px);*/ position: absolute; bottom: calc(100% + 3px); left: 10px; min-width: 250px; min-height: 20px; background: white; border: 1px solid #dedede; border-radius: 5px; padding: 5px; background-image: linear-gradient( 174.2deg,  rgba(255,244,228,1) 7.1%, rgba(240,246,238,1) 67.4% );`);
            this.card.classList = 'infoCard';

            let h = container.querySelector('a[aria-label][href][role="link"]');
            this.name = h.getAttribute('aria-label');
            this.id = h.getAttribute('href').replaceAll('\/', '');
            this.phone = fb_phoneBook[this.id];

            if(!this.id){ return container.classList.remove('added') }

            this.infoList = document.createElement('ul');
            this.infoList.setAttribute('style', 'margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #dedede;');
            this.refreshInfo();

            this.searchBtn = document.createElement('a');
            this.searchBtn.innerText = 'Tìm sđt!';
            this.searchBtn.onclick = () => { this.phoneSearching() };

            let pinMesBtn = document.createElement('a');
            pinMesBtn.innerText = 'Xem tn ghim';
            pinMesBtn.onclick = () => { this.getPinMes() };

            let toolBar = document.createElement('div');
            toolBar.append(this.searchBtn, pinMesBtn);
            this.card.append(this.infoList, toolBar);

            container.append(this.card);
            this.phoneSearching();
        }
        async refreshInfo(){
            this.infoList.innerHTML = `<li>ID: ${this.id}</li><li>Name: ${this.name}</li><li>Phone: ${this.phone || '---'}</li><li>Địa chỉ: ${this.addr || '---'}</li><li>Tỷ lệ nhận: ${this.rate || '---'}</li><!-- <li>xxxxxxx</li> -->`;
        }
        getPinMes(){
            try{
                window.document.querySelectorAll('div[aria-label="Cài đặt tab Chat"][role="menu"] span').forEach(e => {console.log(e.innerText)})
                let d = this.container.querySelector('div[aria-label="Cài đặt chat"] > div');
                d.click();
            } catch(e){}
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
            this.phone = phone;
            fb_phoneBook[this.id] = phone;
            GM_setValue('fb_phoneBook', fb_phoneBook);
        }
    }
    document.onmouseup = function(){

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
