// ==UserScript==
// @name         Create woo product
// @author       Quang.TD
// @version      2025.9.21
// @description  try to take over the world!
// @namespace    bumkids_ext
// @icon         https://www.google.com/s2/favicons?sz=64&domain=patek.com

// @downloadURL  https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main0506/script.js
// @updateURL    https://raw.githubusercontent.com/quang1412/Bumkids_fb_vtp/main0506/script.js

// @require      https://code.jquery.com/jquery-3.7.1.js

// @match        *vuahanghieu.com/*

// @connect      quangPlus

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

(function($){

    const temp = {
        name: '',
        images: [],
        sortDescr:'',
        longDescr: '',
        price: 0,
        brand: '',
        attr_name_1:'',
        arrt_1:'',
        attr_name_2:'',
        attr_2:'',
    }

    GM_registerMenuCommand("Xuất sản phẩm" , async _ => {
        switch(window.location.host){
            case 'vuahanghieu.com':
                vuaHangHieu();
                break;
            default:
                alert('not found!');
        }
    });

    const vuaHangHieu = function(){
        temp.name = document.querySelector('div.prdInfoHeader .product-name-dk').innerText;
        temp.images = ([...document.querySelectorAll('.prdInfoGallery .product-img-box a[href]')]).map(a => a.getAttribute('href'));
        temp.sortDescr = document.querySelector('.prdInfoContent .general-info').innerText;
        temp.longDescr = document.querySelector('dynamic-html.content-product.std').innerText;
        temp.price = document.querySelector('.prdInfoContent .final-price').innerText?.replaceAll(/\D|\W/g, '');

        console.log(temp);
        alert('vuaHangHieu');
    }

})(window.jQuery);
