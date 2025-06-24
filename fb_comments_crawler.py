from selenium import webdriver

from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import TimeoutException

import re
import sys
import time
import requests 

fbProfile = 'https://www.facebook.com/hien.trinh.5011/grid';
# googleSheetUrl = 'https://docs.google.com/spreadsheets/d/1KAhQCGOIInG3Et77PfY03V_Nn4fWvi0z1ITh1BKFkmk/gviz/tq?tqx=out:csv&sheet=web&range=O2:O3&headers=0';
path_comments = './comments_list.txt';
path_posts ='./posts_list.txt'; 

def getFbPost():

    posts = [];
    
    driver.get(fbProfile);

    print("goto: ", fbProfile);
    
    try:
        print('Thu thập thông tin post');
        listitems = WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR , 'div[role="listitem"]:has(a[href])')));
        
        time.sleep(3);

        pin_post = driver.find_element(By.XPATH , "//span[text()='Bài viết đã ghim']");

        for index, listitem in enumerate(listitems):
            post = {};
            try:
                urlElm = listitem.find_element(By.CSS_SELECTOR, 'a[href*="/hien.trinh.5011/posts/"][aria-label]:not([aria-label=""])');
                url = urlElm.get_attribute('href');
                
                pid = 0;

                match = re.search(r"[\d\w]{30,}", url);
                if match: pid = match.group();
                else: raise;
               
                date = urlElm.text;

                if "Tháng" in date: raise;

                text = listitem.find_element(By.CSS_SELECTOR, 'span[dir="auto"]');
                text = " ".join(text.text.splitlines());
                imgs = listitem.find_elements(By.CSS_SELECTOR, 'img');

                srcs = [];
                for i, img in enumerate(imgs):
                    src = img.get_attribute('src'); srcs.append(src);

                imgs = ", ".join(srcs);

                post['pid'] = pid;
                post['text'] = text;
                post['date'] = date;
                post['imgs'] = imgs;

            # except NoSuchElementException:
            except:
                continue;

            posts.append(post);

    except TimeoutException:
        print("Loading took too much time!");

    return posts;

def googleSheetLog(data):
    sheetId = '1FAIpQLSdnt9BSiDQEirKx0Q3ucZFxunOgQQxp4SB7B6Gd8nNMFGzEyw';
    entry = [2075359581, 1542826863, 2077606435, 1093369063, 2124435966, 450302808, 2118396800, 839689225, 2086451399, 1329285789];
    url = f"https://docs.google.com/forms/d/e/{sheetId}/formResponse";
    user_agent = {'Referer':'none','User-Agent': "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36"};
    payload = {};
    
    for i, val in enumerate(data): payload[f"entry.{entry[i]}"] = "\'" + val;

    session = requests.Session();
    
    r = session.post(url, headers=user_agent, data=payload);

    return r.status_code;

def uploadComment(data):

    formId = '1FAIpQLSdFJWCyBzIwVJoH5hPVKKOIDAM8kHtolvkaTamUqahuRyLFwQ';
    entry = {"cid": 1372917580, "uid": 1672107945, "pid": 212434003, "text": 662290354};

    url = f"https://docs.google.com/forms/d/e/{formId}/formResponse";
    user_agent = {'Referer':'none','User-Agent': "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36"};
    payload = {};
    
    for key, value in data.items(): payload[f"entry.{entry[key]}"] = "\'" + value;

    session = requests.Session();
    
    r = session.post(url, headers=user_agent, data=payload);

    return r.status_code;

def uploadPost(data):

    formId = '1FAIpQLSfx4bd487gRF7O5l8sGXqC1kJuz_a4huUrm64UZY5Ich2gfWw';
    entry = { "pid": 1865259179, "name": 1706162306, "text": 1064661769, "imgs": 1723256352};

    url = f"https://docs.google.com/forms/d/e/{formId}/formResponse";
    user_agent = {'Referer':'none','User-Agent': "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36"};
    payload = {};
    
    for key, value in data.items(): payload[f"entry.{entry[key]}"] = "\'" + value;
    
    session = requests.Session();
    
    r = session.post(url, headers=user_agent, data=payload);

    return r.status_code;

def getFbPostComments(url):
 
    comments = [];
    
    driver.get(url);

    print("goto: ", url);
    
    try:
        sortBtn = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH , "//span[text()='Phù hợp nhất']")));
        sortBtn.click();
        print('Sắp xếp lại comment.');
        
        time.sleep(1);

        sortBtnNewest = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH , "//span[text()='Mới nhất']")));
        sortBtnNewest.click();
        print('Chọn mới nhất.');
        
        time.sleep(1);

        timeout = 0;
        last_height = 0;

        print('Cuộn xuống.');
        while True:
            scroll_element = driver.find_element(By.CSS_SELECTOR, 'div[role="dialog"] > div > div > div > div:nth-child(2)');
            driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", scroll_element);
            time.sleep(1);
            height = scroll_element.size['height'];
            if height > last_height:
                last_height = height;
                timeout = 0;
            elif timeout < 5:
                timeout += 1;
            else:
                break;

        print('Thu thập các comment!');
        articles = driver.find_elements(By.CSS_SELECTOR, 'div[aria-label^="Bình luận dưới tên Trịnh Hiền"]');
        
        for index, el in enumerate(articles):
            try:
                linkElm = el.find_element(By.CSS_SELECTOR, 'a[role="link"][href*="/posts/"][href*="comment_id"]');
                
                cid     = 0;
                span    = el.find_element(By.CSS_SELECTOR, 'span[dir="auto"][lang]');
                text    = " ".join(span.text.splitlines());
                date    = linkElm.text;
                url     = linkElm.get_attribute('href');
                match   = re.search(r"comment_id=\d+", url);
                
                if match: cid = match.group(); cid = cid.replace('comment_id=', '');
                else: raise;

                comments.append({"cid": cid, "text": text, "date": date});

            except NoSuchElementException:
                continue;

        time.sleep(1);

    except TimeoutException:
        print("Loading took too much time!");

    return comments;
 

try:
    saved_posts = open(path_posts, 'r').read();
    saved_posts = saved_posts.splitlines();
except:
    saved_posts = [];

try:
    cids_log = open(path_comments, 'r').read();
    cids_log = cids_log.splitlines();
except:
    cids_log = [];


options = Options(); 
options.add_argument('--headless')  # Bỏ ghi chú nếu bạn muốn chạy ẩn
service = Service(executable_path="/Users/trinhdacquang/Downloads/geckodriver");

try: 
    driver = webdriver.Firefox(options=options);
except: 
    driver = webdriver.Firefox(service=service, options=options);
driver.set_window_size(800, 800);

try:
    print('Tìm post mới!');
    postsList = getFbPost();

    print('Lọc ra các bài post mới');
    with open (path_posts, 'a') as f:
        for i, p in enumerate(postsList):
            
            pid     = p['pid'];
            date    = p['date'];
            text    = p['text'];
            imgs    = p['imgs'];

            if pid in saved_posts: continue;

            print(f"Phát hiện bài post mới: {date} - {pid}");
            
            try: status = uploadPost({"pid": pid, "text": text, "imgs": imgs});
            except: status = 404;
            
            if status == 200: print('Đã tải lên google sheet'); saved_posts.append(pid); f.write(pid + "\n");

        f.close();

    for pid in reversed(saved_posts[-20:]):
        print('\n');

        try: comments = getFbPostComments(f"https://facebook.com/{pid}");
        except: continue;

        print('Lọc các comment mới!');
        with open (path_comments, 'a') as f:
        
            for j, c in enumerate(comments):
                cid     = c["cid"];
                text    = c["text"];
                date    = c["date"];

                if cid in cids_log: continue;

                print(f"Phát hiện comment mới: {cid} - {date} - {text}");
                try: status = uploadComment({"cid": cid, "pid": pid, "text": text});
                except: status = 404;

                if status == 200: print('Đã tải lên google sheet!'); cids_log.append(cid);  f.write(cid + "\n");
                    
            f.close();

except: print('driver quit!');

driver.quit();
