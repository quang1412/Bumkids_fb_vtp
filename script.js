(async function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const apiUrl = 'https://script.google.com/macros/s/AKfycbwyjbwXPxmqpZ7ctUpaw2Lh0uWVVgFg-yG85owKKe-uyM9A9I1zxYtU90EOXmHGPbkD/exec';

    const genID = function(length = 10) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const CONFIG = {
        key: 'config',
        get: async function(k, ifnull){
            let data = JSON.parse( await localStorage.getItem(this.key) || '{}' );
            return (data[k] || ifnull);
        },
        set: async function(k, v){
            let data = JSON.parse( localStorage.getItem(this.key) || '{}' );
            data[k] = v;
            await localStorage.setItem(this.key, JSON.stringify(data));
        }
    }

    const Delay = function(t = 1000){
        return new Promise(resolve => {
            setTimeout(resolve, t);
        })
    }
    
    const Logger = function(name, message){
        $.post(apiUrl, JSON.stringify({name, message}), function(data, status){});
    }

    const readSheetTable = (url) => {
        return new Promise((resolve, reject) => {
            window.fetch(url).then(r => {
                if (!r.ok) {
                    throw new Error(`HTTP error! status: ${r.status}`);
                }
                return r.text();
            }).then(html => {
                return resolve(html);
            });
        });
    }

    const groupByN = (n, arr) => {
        const result = [];
        for (let i = 0; i < arr.length; i += n) {
            result.push(arr.slice(i, i + n));
        }
        return result;
    }

    const csvToJson = function(csvString) {
        const lines = csvString.trim().split('\n'); // Split into lines and remove leading/trailing whitespace
        const headers = lines[0].split(','); // First line contains headers
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(','); // Split each subsequent line into values
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j].trim().replaceAll('"', '')] = values[j] ? values[j].trim().replaceAll('"', '') : '';
            }
            result.push(obj);
        }
        return result;
    }
 
    const setTime = function() {
        const today = new Date();
        const formattedDateVN = today.toLocaleDateString('vi-VN');
        console.log('date:', formattedDateVN);
        $('span#date')?.text(formattedDateVN);

    }

    let starModels = await CONFIG.get('starModels', []);
 

    // const memOrder = ['6/128', '8/128', '8/256', '12/256', '12/512', '16/256', '16/512', '16/1T', '24/1T', ]
    const memOrder = await fetch('https://docs.google.com/spreadsheets/d/1B0lsfTAz0T2YL2-J5D3ufloYwqlJeZbdqxn06VRbTno/gviz/tq?tqx=out:csv&tq&gid=1074479198&range=A1:A50&headers=0')
        .then(resp => resp.text()).then(text => text?.replaceAll(`"`, '').split(/\r?\n|\r/));
    // console.log(memOrder)
 

    $(document).ready(async function () {
        window.uid = await CONFIG.get('uid');
        if(!window.uid){
            window.uid = genID(); 
            CONFIG.set('uid', window.uid);
        }
        console.log('uid:', window.uid);
    });
    
    $(document).ready(async function() {
        setTime();
        let sid = '1B0lsfTAz0T2YL2-J5D3ufloYwqlJeZbdqxn06VRbTno';
        let gid = urlParams.get('gid');
        let url = `https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:csv&tq&gid=${gid}&range=A:D&headers=1`;
        let csvData = await readSheetTable(url)

        let jsonData = csvToJson(csvData);
        if(!jsonData.length) {
            $('body').html('<h3 style="text-align:center;"><strong>⚠️ Error!!!</strong></h3>');
            return false;
        }
        let uniqueModel = Array.from(new Map(jsonData.map(item => [item["model"]])).keys());
        let modelGroup = groupByN(Math.ceil(uniqueModel.length / 1.8), uniqueModel);

        $('div#main div.col').each((h, col) => {
            let table = $('<table>').attr({
                "class": "",
                "border": 1,
                "cellspacing": 0
            });
            $(col).html(null).append(table);
            let models = modelGroup[h];
            models.forEach((model, i) => {
                let modelData = jsonData.filter(e => e.model == model);
                let uniqueMem = Array.from(new Map(modelData.map(item => [item["mem"]])).keys());

                let memSortedList = uniqueMem.sort((a, b) => {
                  // Find the position of 'a' and 'b' in the ordering array
                  const indexA = memOrder.indexOf(a);
                  const indexB = memOrder.indexOf(b);
                
                  // The sort is based on the numerical difference of their indices
                  return indexA - indexB;
                });
                
                let uniqueColor = Array.from(new Map(modelData.map(item => [item["color"]])).keys()).sort((a, b) => a.localeCompare(b))
                let colorGroup = groupByN(3, uniqueColor);
                table.append('<tr data-model="'+model+'" class="spacer">');

                memSortedList.forEach((mem, j) => {
                    let memData = modelData.filter(obj => obj.mem == mem);
                    colorGroup.forEach((colors, k) => {
                        let x = (!j && !k);

                        let tr = $('<tr>').attr('data-model', model).appendTo(table);
                        // !!~starModels.indexOf(model) && tr.addClass('star');
                        // tr.on('mouseover mouseout', _ => {
                        //     $(`tr[data-model="${model}"]`).toggleClass('isHover');
                        // });
                        
                        let td_1 = $('<td>').html('<div>' + model + '</div>').attr({
                            'rowspan': (!x ? 1 : (uniqueMem.length * colorGroup.length)),
                        }).appendTo(tr);
                        !x && td_1.hide();

                        

                        let td_2 = $('<td>').text(mem).attr({
                            'rowspan': k ? 1 : colorGroup.length,
                            'style': 'display:' + (k ? 'none' : 'table-cell'),
                        }).appendTo(tr);

                        for (var l = 0; l <= 2; l++) {
                            let color = colors[l] || '';
                            let price = !color ? '' : memData.find(item => (item.mem == mem && item.color == color))?.price;
                            let priceFormat = price && formatterCurrency.format(price);
                            $('<td>').text(color).appendTo(tr);
                            $('<td>').text(price).appendTo(tr); 
                        }
                    });
                });
            });
        });
    }); 
    
    $(document).ready(async function () {
        let darkModeSw = $('input#darkMode[type="checkbox"]'); 
        let on = await CONFIG.get('darkMode');
        
        darkModeSw.prop('checked', on == true);
        on && $(document.body).addClass('darkMode'); 
        
        darkModeSw.change(function(){
            let isChecked = this.checked;
            $('body').toggleClass('darkMode', isChecked);
            CONFIG.set('darkMode', isChecked);
        });
    });
 
    $(document).ready(async function () {
        let data = await $.getJSON("https://jsonip.com/?callback=?");
        window.ip = data.ip;
        Logger('pageLoad', `${window.uid}; ${window.ip}`);
        console.log('ip:', window.ip);
    }); 
})();
