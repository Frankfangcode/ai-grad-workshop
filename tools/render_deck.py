#!/usr/bin/env python3
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

SEARCH = """你是研究助理。請用繁體中文（台灣）。我是台灣大學生，科系是〔填系所〕，想了解〔填：美國／英國／歐洲／日本與亞洲／台灣〕的 AI 相關碩士學程，以及我可能申請的獎學金。

請給 5 個學程。每個只用這些欄位，不知道就寫「未查到」，不要補你不確定的數字：
學校、學程名稱、領域（只能寫：技術、治理人文、商管 其中一個）、授課語言、獎學金（有／無／未查到）、是否要求資工背景（要／不要／未查到）、學費（寫出幣別；不知道就空白）、申請截止（YYYY-MM-DD；不知道就空白）、官網網址。

每一筆最後加一行「待查證」。不要編造名額、金額或截止日期。"""

VERIFY = """請只用我貼上的官網文字查證，不要用記憶補任何數字。回答用繁體中文（台灣）。

學程名稱：
官網摘錄：

請逐項核對：
1. 學程名稱是否一致
2. 申請截止
3. 學費與幣別
4. 授課語言
5. 是否要求資工或特定先修
6. 這個學程能不能申請你看到的獎學金

摘錄裡沒寫的項目，寫「這段文字沒寫，請再打開官網」。不要猜。

最後用一行 CSV，不要重複表頭：
學校,學程,國家,領域,語言,獎學金,需要資工背景,學費,截止日期,官網,已查證
已查證：六項都對得上才寫「是」，否則寫「否」。"""

HEADER = "學校,學程,國家,領域,語言,獎學金,需要資工背景,學費,截止日期,官網,已查證"

STEP0 = """請用繁體中文（台灣）跟我對話。我們要一起做一個單頁的研究所篩選器，先不要寫程式。
請只複誦這三步：匯入資料、篩選、選目標。
並確認你會用淺色背景、深色文字。"""

STEP1 = """請做一個單一 HTML 檔（CSS 和 JavaScript 都寫在同一個檔案裡），用繁體中文（台灣）。不要用框架，不要安裝任何東西。

視覺：背景 #f6f3ee，文字 #1c1917，重點色 #8f1d2c。使用 Noto Sans TC 與 Noto Serif TC。禁止深色背景配白字。按鈕最小高度 48px。手機優先。

第一屏只有：
標題「選一個你真的想追的學程」
三張步驟卡，文字依序是：匯入資料、篩選、選目標
一顆主要按鈕，文字是「開始匯入」

按下去之後進到同一頁的工作區，三個區塊標題依序是「匯入資料」「篩選」「選目標」。這一階先不要讀檔，三個區塊用虛線框標出位置即可。
頁首放連結「回簡報」，連到 index.html。"""

STEP2 = """在同一個 HTML 上繼續做，不要刪掉第一屏。用繁體中文（台灣），淺色底、深色字。

匯入區要有三種方式：
1. 一個網址欄，按鈕「讀取這個網址」。用 fetch 讀 CSV。若失敗，畫面寫：「讀不到這個網址（瀏覽器常會擋住跨網域）。請改走檔案 → 下載 → 逗號分隔值，再把內容貼到下面。」
2. 一個文字框，按鈕「用這段 CSV」。
3. 一顆全寬大按鈕「載入範例資料」。

範例必須一眼看出是假的：校名含「範例」和「假名」。學費和截止日期留白，不要填任何數字。載入後顯示：「現在是範例資料。不要把範例寫進比較表。」

CSV 第一列請支援：
學校,學程,國家,領域,語言,獎學金,需要資工背景,學費,截止日期,官網,已查證
找不到「學校」或「學程」時，用中文說明缺了哪一欄。

讀入後在「選目標」列出「學校 · 學程 · 國家 · 領域」，並寫「N / 總數 個學程」。把原始 CSV 存進 localStorage。

範例請內建這 8 列（學費與截止日期留白，已查證都是「否」，官網用 example.edu）：
範例大學（假名）,範例學程・機器學習,日本,技術,英語,有,不要,,,https://example.edu/ml,否
範例治理學院（假名）,範例學程・AI 與公共政策,歐洲,治理人文,英語,無,不要,,,https://example.edu/gov,否
範例商學院（假名）,範例學程・商業分析,英國,商管,英語,有,要,,,https://example.edu/ba,否
範例西岸大學（假名）,範例學程・人工智慧,美國,技術,英語,無,要,,,https://example.edu/ai,否
範例島嶼大學（假名）,範例學程・資訊社會,台灣,治理人文,中文,有,不要,,,https://example.edu/tw,否
範例阿爾卑斯學院（假名）,範例學程・人機互動,歐洲,技術,英語,有,不要,,,https://example.edu/hci,否
範例港區商科（假名）,範例學程・金融科技,亞洲,商管,英語,無,不要,,,https://example.edu/fin,否
範例關東情報（假名）,範例學程・社會情報,日本,治理人文,日語,有,不要,,,https://example.edu/si,否"""

STEP3 = """在同一個檔案加上篩選，不要拿掉匯入和清單。淺色底、深色字、繁體中文（台灣）。

條件用可點的圓角鈕：
- 國家：從資料裡長出來，含「全部國家」
- 領域：技術、治理人文、商管（可複選；都沒選＝全部）
- 語言：從資料裡長出來
- 一顆「有獎學金」
- 一顆「不需要資工背景」（按下時藏掉資工欄寫「要」的列）
- 一顆「隱藏已截止」（沒填日期的列仍保留）
- 學費滑桿，最右顯示「不限」。沒填學費的列一律保留。旁邊寫：「幣別不同時，這只是粗篩，送件前以官網為準。」

每按一次，清單立刻更新，並用大字顯示「目前 N / 總數 個學程」。沒有結果時寫「沒有符合的學程」，並給一顆「清除篩選」。篩選狀態存進 localStorage。"""

STEP4 = """把清單改成卡片，不要用密表。保留前面的匯入和篩選。繁體中文（台灣），淺色底、深色字。

每張卡包含：
- 學校（前面加國旗，對不到就用地球符號）
- 學程名稱（最大的字）
- 標籤：國家、領域、語言、獎學金、資工背景
- 截止倒數：日期用 YYYY-MM-DD，時區用台北。未填寫「截止日未填」。已過寫「已過 N 天」。今天寫「今天截止」。21 天內寫「還有 N 天」
- 學費：空白就寫「學費未填」，不要補數字
- 官網連結，開新分頁；沒有網址就寫「官網未填」
- 徽章：已查證欄是「是」才顯示「已查證」，否則「尚未查證」

寬螢幕兩欄。按鈕維持好點。"""

STEP5 = """在每張卡加「加入比較」。最多 3 個。第 4 個不要加進去，並在畫面上寫「最多比較 3 個。先拿掉一個，再加入新的。」不要只用 alert。

畫面下方固定一條「已選 n / 3」和按鈕「並排看」。
並排時每個學程一欄，欄位對齊：國家、領域、語言、獎學金、資工背景、學費、截止、查證。
提供「回到清單」和「清空比較」。比較清單存進 localStorage。
手機改成上下堆疊。"""

STEP6 = """在每張卡加「加入短名單」和「⭐ 設為我的目標」。整個工具同時只能有一個目標。設成目標時也加入短名單。

目標卡要適合截圖，白底深字，內容有：
「我的目標」、學校、學程、國家、領域、語言、截止、學費、查證、官網
一行固定文字：「政大 · 2026/11/24 · 海內外 AI 研究所與獎學金探索工作坊」
一個選填框「我為什麼選它」，存 localStorage。
按鈕：「複製目標卡文字」「適合截圖」「回到清單」。適合截圖時藏起其他介面，只留這張卡。

另有「匯出短名單 CSV」。短名單是空的時候不要下載空檔，改寫「短名單還是空的。先在卡片上按加入短名單，或設一顆星星。」
CSV 用 UTF-8 並加 BOM，沿用原表欄位，多一欄「是我的目標」。
重新整理後，資料、篩選、比較、短名單、目標都還在。"""

STEP7 = """請檢查我貼上的 HTML，只用繁體中文（台灣）回答，不要重寫整個檔，除非我接著請你改。

對照這張清單，缺的只列出來：
1. 是不是單一 HTML 檔
2. 是不是淺色底、深色字
3. 第一屏有沒有「匯入資料 → 篩選 → 選目標」和「開始匯入」
4. 能不能載入範例，而且範例的學費和截止日是空的
5. 篩選時人數會不會變
6. 卡片有沒有截止倒數、官網、已查證
7. 比較是不是最多 3 個
8. 有沒有星星目標卡，以及匯出短名單

每點用「有」或「缺」回答。"""

STEPS = [
    (0, "打開工具", "聊天室和試算表都開著，先不要寫程式。", STEP0, None,
     "網站打不開就換另一個：ChatGPT、Gemini、Claude，用瀏覽器即可，不用安裝。跟鄰座看同一台也可以。",
     "兩個分頁都在：一個 AI 聊天室、一個共用試算表。"),
    (1, "畫出三步驟", "先有第一屏和三個空區塊，還不讀資料。", STEP1, "step1.html",
     "它若給你很多檔案，回它：只要一個 HTML，CSS 和 JavaScript 都寫在同一個檔案裡。",
     "看得到三步驟和一顆「開始匯入」。底是淺的，字是深的。"),
    (2, "讀進資料", "網址、貼上、範例，三條路都要通。", STEP2, "step2.html",
     "範例若出現學費或日期，回它：範例的學費和截止日留白，不要填數字，校名要有「範例」。",
     "按「載入範例資料」後出現清單。每列都有範例，學費和截止日是空的。"),
    (3, "加上篩選", "條件用圓角鈕，數字要跟著變。", STEP3, "step3.html",
     "點了沒反應，回它：條件要真的過濾清單，畫面上要有「目前 N 個」。",
     "點一個國家，數字變少。再點「全部國家」，數字回來。"),
    (4, "換成卡片", "一張卡一個學程，截止日算給你看。", STEP4, "step4.html",
     "倒數變成 NaN 或 Invalid Date，回它：日期留白時顯示「截止日未填」，不要拿空字串去算。",
     "每張卡有學校、學程、倒數或「未填」、官網、已查證或尚未查證。"),
    (5, "並排三個", "選到第 4 個時要停下來。", STEP5, "step5.html",
     "若第 4 個還是加得進去，回它：超過 3 個就停住，並在畫面上寫原因，不要只跳 alert。",
     "選 3 張可以並排。第 4 張選不了，而且看得到那句話。"),
    (6, "設下目標", "一顆星星，加上一張可以截圖的卡。", STEP6, "step6.html",
     "重新整理目標消失，回它：把目標、短名單和篩選存進 localStorage。",
     "按星星後出現目標卡。可以複製文字，也可以下載短名單。"),
    (7, "存檔打開", "存成 filter.html，用瀏覽器打開，截圖傳到小組。", STEP7, "filter.html",
     "若存成 .txt，把副檔名改成 .html。用 Chrome 或 Edge 打開。畫面空白，代表檔案不完整，回到聊天室把整份 HTML 再存一次。",
     "檔案在自己的瀏覽器打得開，截圖已傳進小組。"),
]

def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

def progress(n):
    bits = []
    for i in range(8):
        cls = "on" if i == n else "done" if i < n else ""
        bits.append(f'<li class="{cls}">{i}</li>')
    return '<ol class="progress" aria-label="實作進度">' + "".join(bits) + "</ol>"

def step_slide(n, title, goal, prompt, href, stuck, check):
    pid = f"p-step-{n}"
    preview = ""
    if href:
        preview = f'''<div class="preview"><iframe title="第 {n} 步預期畫面" src="{href}"></iframe><a class="open" href="{href}" target="_blank" rel="noopener">打開參考頁</a></div>'''
    else:
        preview = '''<div class="card"><h3>這一階的畫面</h3><p>左邊一個 AI 聊天室。</p><p>右邊一個共用 Google 試算表，第一列是欄位名稱。</p><p>先不要按產生程式。</p></div>'''
    return f'''
<section class="slide">
  <div class="pad tight">
    <p class="kicker">現場實作 · 步驟 {n} / 7　·　落後了直接開 <a href="filter.html">完成版篩選器</a></p>
    {progress(n)}
    <h2>步驟 {n}　{esc(title)}</h2>
    <p class="sub" style="margin-bottom:12px">{esc(goal)}</p>
    <div class="split">
      <div>
        <pre class="prompt" id="{pid}">{esc(prompt)}</pre>
        <button type="button" class="copy" data-for="{pid}">複製這一步</button>
      </div>
      {preview}
    </div>
    <div class="tips">
      <div class="card"><h3>卡住了？</h3><p>{esc(stuck)}</p></div>
      <div class="card"><h3>過關</h3><p>{esc(check)}</p></div>
    </div>
  </div>
</section>'''

slides = []

slides.append('''
<section class="slide active">
  <div class="hero">
    <div class="copy">
      <p class="kicker">國立政治大學 · 人工智慧應用學士學位學程</p>
      <h1>海內外 AI 研究所與獎學金探索工作坊</h1>
      <p class="sub" style="margin-top:16px">暨 AI 學程交流會。今晚先把一個學程查清楚，再自己做出篩選器。</p>
      <div class="clock" id="clock">2026/11/24（二）18:00–20:00</div>
      <div class="meta">
        <span class="pill">大仁樓 200106</span>
        <span class="pill">主持 · 方澤享</span>
        <span class="pill">約 25–30 人</span>
        <span class="pill">← → 翻頁</span>
      </div>
    </div>
    <div class="photo">
      <img src="assets/photos/nccu-library.jpg" alt="國立政治大學中正圖書館">
      <span class="cap">政大中正圖書館 · Yu tptw · CC BY-SA 4.0</span>
    </div>
  </div>
</section>''')

slides.append('''
<section class="slide">
  <div class="pad">
    <p class="kicker">今晚怎麼走</p>
    <h2>兩小時，一件查證、一個作品</h2>
    <div class="flow">
      <div class="row"><span class="t">18:00–18:10</span><span class="d">開場、簽到、試彈幕</span></div>
      <div class="row"><span class="t">18:10–18:30</span><span class="d">何則文：海內外 AI 研究所與獎學金</span></div>
      <div class="row"><span class="t">18:30–19:15</span><span class="d">小組：選一個地區，用 AI 找 3–5 個學程與獎學金，回官網查證，填進共用表。有餘力就做篩選器。</span></div>
      <div class="row"><span class="t">19:15–19:25</span><span class="d">小組回報</span></div>
      <div class="row"><span class="t">19:25–19:30</span><span class="d">邀請 12/9 金融科技創新實驗室期末成果展</span></div>
      <div class="row"><span class="t">19:30–20:00</span><span class="d">AI 學程學生交流：課程經驗、研究機會、學程學會構想</span></div>
    </div>
  </div>
</section>''')

slides.append('''
<section class="slide">
  <div class="pad">
    <p class="kicker">這間教室</p>
    <h2>不是資工，也可以開始查</h2>
    <div class="grid g3" style="margin-bottom:16px">
      <article class="card"><p class="ix">01</p><h3>技術</h3><p>想寫程式、做模型。先確認學程要哪些數學。</p></article>
      <article class="card"><p class="ix">02</p><h3>治理人文</h3><p>法律、政策、媒體、社會。很多學程不從資工學士出發。</p></article>
      <article class="card"><p class="ix">03</p><h3>商管</h3><p>把 AI 放進商業、金融或分析。門檻各校不同，以官網為準。</p></article>
    </div>
    <div class="photos">
      <div class="ph"><img src="assets/photos/mit-dome.jpg" alt="麻省理工學院大圓頂"><span>MIT</span></div>
      <div class="ph"><img src="assets/photos/oxford.jpg" alt="牛津大學雷德克里夫圖書館"><span>Oxford</span></div>
      <div class="ph"><img src="assets/photos/eth.jpg" alt="蘇黎世聯邦理工學院主樓"><span>ETH</span></div>
      <div class="ph"><img src="assets/photos/tum.jpg" alt="慕尼黑工業大學"><span>TUM</span></div>
      <div class="ph"><img src="assets/photos/utokyo.jpg" alt="東京大學安田講堂"><span>東京大學</span></div>
      <div class="ph"><img src="assets/photos/nccu-seetoo.jpg" alt="政大達賢圖書館"><span>政大達賢</span></div>
    </div>
    <p class="note">照片是校園，不是指定你要申請的學程。歐洲與日本的學程細節在下一頁則文的簡報，金額與截止以各校官網為準。</p>
  </div>
</section>''')

slides.append('''
<section class="slide">
  <div class="hero">
    <div class="copy">
      <p class="kicker">18:10–18:30 · 第 4 頁</p>
      <h2>交給則文</h2>
      <p class="sub">歐洲與日本的 AI 相關碩士、獎學金與時程，在何則文做好的 34 頁簡報裡。這一頁只負責把大家送過去。</p>
      <a class="biglink" href="https://wenzhotw.github.io/ai-masters-scholarship-guide/" target="_blank" rel="noopener">打開則文的簡報</a>
      <p class="note">查證日期寫在他的簡報上。學費、名額、截止日送件前再對一次官網。</p>
    </div>
    <div class="photo">
      <img src="assets/photos/cambridge.jpg" alt="劍橋大學國王學院禮拜堂">
      <span class="cap">劍橋國王學院 · Dmitry Tonkonog · CC BY-SA 3.0</span>
    </div>
  </div>
</section>''')

slides.append('''
<section class="slide">
  <div class="pad">
    <p class="kicker">18:30–19:15 · 小組</p>
    <h2>每組挑一個地區，找到 3 到 5 個</h2>
    <div class="photos" style="grid-template-columns:repeat(5,1fr);margin-bottom:14px">
      <div class="ph" style="height:180px"><img src="assets/photos/stanford.jpg" alt="史丹佛大學方庭"><span>美國</span></div>
      <div class="ph" style="height:180px"><img src="assets/photos/oxford.jpg" alt="牛津校園"><span>英國</span></div>
      <div class="ph" style="height:180px"><img src="assets/photos/eth.jpg" alt="蘇黎世聯邦理工"><span>歐洲</span></div>
      <div class="ph" style="height:180px"><img src="assets/photos/utokyo.jpg" alt="東京大學"><span>日本與亞洲</span></div>
      <div class="ph" style="height:180px"><img src="assets/photos/ntu-library.jpg" alt="台灣大學圖書館"><span>台灣</span></div>
    </div>
    <div class="grid g3">
      <article class="card"><h3>找</h3><p>用下一頁的提示詞，請 AI 列出學程和對得上的獎學金。</p></article>
      <article class="card"><h3>對</h3><p>每一筆都回官網。提示詞沒寫到的數字，維持空白。</p></article>
      <article class="card"><h3>填</h3><p>寫進共用表。欄位用第 8 頁那一列，篩選器才讀得懂。</p></article>
    </div>
    <p class="note">照片只標示地區，不是該組的指定學校。有餘力的組，接著做篩選器。</p>
  </div>
</section>''')

slides.append(f'''
<section class="slide">
  <div class="pad">
    <p class="kicker">搜尋</p>
    <h2>先讓 AI 列出，再自己查</h2>
    <pre class="prompt" id="p-search">{esc(SEARCH)}</pre>
    <button type="button" class="copy" data-for="p-search">複製搜尋提示詞</button>
  </div>
</section>''')

slides.append(f'''
<section class="slide">
  <div class="pad">
    <p class="kicker">查證</p>
    <h2>只相信你貼上的官網文字</h2>
    <pre class="prompt" id="p-verify">{esc(VERIFY)}</pre>
    <button type="button" class="copy" data-for="p-verify">複製查證提示詞</button>
  </div>
</section>''')

slides.append(f'''
<section class="slide">
  <div class="pad">
    <p class="kicker">共用表</p>
    <h2>第一列請用這 11 個欄位</h2>
    <pre class="prompt" id="p-header">{esc(HEADER)}</pre>
    <button type="button" class="copy" data-for="p-header">複製表頭</button>
    <div class="grid g3" style="margin-top:18px">
      <article class="card"><h3>領域只寫三種</h3><p>技術、治理人文、商管。</p></article>
      <article class="card"><h3>不知道就留白</h3><p>學費、截止日期不要填 0，也不要猜。</p></article>
      <article class="card"><h3>已查證</h3><p>六項都對上才寫「是」。否則寫「否」。</p></article>
    </div>
  </div>
</section>''')

slides.append('''
<section class="slide">
  <div class="pad">
    <p class="kicker">三件不要做</p>
    <h2>寧願空白，不要好看的錯數字</h2>
    <div class="grid g3" style="flex:1">
      <article class="card"><p class="ix">01</p><h3>不要編</h3><p>AI 補上的學費、名額、截止日期，一律先當沒這回事，直到官網看得到同一句。</p></article>
      <article class="card"><p class="ix">02</p><h3>不要只留聊天紀錄</h3><p>每筆要有官網網址。沒有網址的那一列，篩選器上不會出現「已查證」。</p></article>
      <article class="card"><p class="ix">03</p><h3>不要拿範例去回報</h3><p>等一下的範例資料校名是假的，學費和截止日是空的。那是來練習按按鈕的。</p></article>
    </div>
  </div>
</section>''')

slides.append('''
<section class="slide">
  <div class="hero">
    <div class="copy">
      <p class="kicker">有餘力的組 · 方澤享帶</p>
      <h2>現在一起做篩選器</h2>
      <p class="sub">用瀏覽器裡的 ChatGPT、Gemini 或 Claude，一步一步做出「AI 研究所篩選器」。不用安裝。</p>
      <a class="biglink" href="filter.html">我跟不上，打開完成版</a>
      <p class="note">後面 8 頁是步驟 0 到 7。每一頁都能複製提示詞，右邊是你現在應該有的樣子。</p>
    </div>
    <div class="photo">
      <img src="assets/photos/nccu-seetoo.jpg" alt="政大達賢圖書館外觀">
      <span class="cap">政大達賢圖書館 · Yu tptw · CC BY-SA 4.0</span>
    </div>
  </div>
</section>''')

for item in STEPS:
    slides.append(step_slide(*item))

slides.append('''
<section class="slide">
  <div class="hero">
    <div class="copy">
      <p class="kicker">19:25 · 下一場</p>
      <h2>12/9 來方舟看成果</h2>
      <div class="qrbox">
        <img src="assets/luma_qr.png" alt="Luma 報名頁 QR code，網址是 luma.com/6frrdys3">
        <div>
          <p>政大金融科技創新實驗室期末成果展</p>
          <p style="margin:8px 0">N24 台北方舟 1F · 18:10 報到</p>
          <a class="biglink" href="https://luma.com/6frrdys3" target="_blank" rel="noopener">Luma 報名</a>
          <p class="note">同一場也有表單：<a href="https://forms.gle/u2hbzVVZBQJgZnCt7" target="_blank" rel="noopener">forms.gle/u2hbzVVZBQJgZnCt7</a></p>
        </div>
      </div>
    </div>
    <div class="photo">
      <img src="assets/photos/stanford.jpg" alt="史丹佛大學方庭，只作現場氣氛，不是指定學程">
      <span class="cap">史丹佛方庭 · King of Hearts · CC BY-SA 3.0</span>
    </div>
  </div>
</section>''')

slides.append('''
<section class="slide">
  <div class="pad">
    <p class="kicker">19:30–20:00</p>
    <h2>學程的人留下來說說</h2>
    <div class="grid g3" style="flex:1">
      <article class="card"><p class="ix">課程</p><h3>實際上過什麼</h3><p>哪一門讓你真的做出東西，哪一門和你原來的科系接得上。</p></article>
      <article class="card"><p class="ix">研究</p><h3>機會在哪</h3><p>老師的計畫、作品集、你還想問誰。</p></article>
      <article class="card"><p class="ix">學會</p><h3>學程學會構想</h3><p>如果有一個學生組織，你希望它先做哪一件事。</p></article>
    </div>
    <p class="note">方向鍵可以回到任何一頁。篩選器一直開在 <a href="filter.html">filter.html</a>。</p>
  </div>
</section>''')

slides.append('''
<section class="slide">
  <div class="pad">
    <p class="kicker">出處</p>
    <h2>照片與這一頁用到的事實</h2>
    <ul class="credits">
      <li>政大中正圖書館：<a href="https://commons.wikimedia.org/wiki/File:NCCU_Main_Library_20230602-1.jpg">NCCU Main Library 20230602-1.jpg</a> · Yu tptw · CC BY-SA 4.0</li>
      <li>政大達賢圖書館：<a href="https://commons.wikimedia.org/wiki/File:Dah_Hsian_Seetoo_Library_front_20220815.jpg">Dah Hsian Seetoo Library front 20220815.jpg</a> · Yu tptw · CC BY-SA 4.0</li>
      <li>麻省理工學院：<a href="https://commons.wikimedia.org/wiki/File:Great_dome_of_MIT,_Feb_2021.jpg">Great dome of MIT, Feb 2021.jpg</a> · Peacearth · CC BY-SA 4.0</li>
      <li>牛津大學：<a href="https://commons.wikimedia.org/wiki/File:Radcliffe_Camera_Oxford_2018_03.jpg">Radcliffe Camera Oxford 2018 03.jpg</a> · Julian Herzog · CC BY 4.0</li>
      <li>蘇黎世聯邦理工學院：<a href="https://commons.wikimedia.org/wiki/File:ETH_Zurich,_Hauptgeb%C3%A4ude.1.jpg">ETH Zurich, Hauptgebäude.1.jpg</a> · Peter Christian Riemann · CC BY-SA 4.0</li>
      <li>慕尼黑工業大學：<a href="https://commons.wikimedia.org/wiki/File:Arcisstr._21_TUM_Muenchen-1.jpg">Arcisstr. 21 TUM Muenchen-1.jpg</a> · Rufus46 · CC BY-SA 3.0</li>
      <li>東京大學安田講堂：<a href="https://commons.wikimedia.org/wiki/File:Yasuda_Auditorium_-_Tokyo_University_2.jpg">Yasuda Auditorium - Tokyo University 2.jpg</a> · Kakidai · CC BY-SA 4.0</li>
      <li>劍橋大學國王學院：<a href="https://commons.wikimedia.org/wiki/File:20130808_Kings_College_Chapel_01.jpg">20130808 Kings College Chapel 01.jpg</a> · Dmitry Tonkonog · CC BY-SA 3.0</li>
      <li>史丹佛大學：<a href="https://commons.wikimedia.org/wiki/File:Stanford_University_Main_Quad_May_2011_001.jpg">Stanford University Main Quad May 2011 001.jpg</a> · King of Hearts · CC BY-SA 3.0</li>
      <li>台灣大學圖書館：<a href="https://commons.wikimedia.org/wiki/File:National_Taiwan_University_Library_20060802.jpg">National Taiwan University Library 20060802.jpg</a> · peellden · CC BY-SA 3.0</li>
      <li>12/9 報名 QR：指向 <a href="https://luma.com/6frrdys3">luma.com/6frrdys3</a>。流程、地點與表單來自 2026/11/24 主持人之間的流程確認。學程金額與截止日期不在這份簡報裡發明，請用則文的簡報與各校官網。</li>
    </ul>
    <p class="note">照片皆為 Wikimedia Commons，依頁面所標 CC BY、CC BY-SA 使用，經縮圖。照片只示意校園，不代表學程上課地點。</p>
  </div>
</section>''')

html = f'''<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>海內外 AI 研究所與獎學金探索工作坊｜方澤享</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Serif+TC:wght@700;900&display=swap">
<link rel="stylesheet" href="assets/deck.css">
</head>
<body>
<div id="viewport">
  <div id="stage">
    <div id="bar"></div>
    {''.join(slides)}
    <p class="foot">政大 · 2026/11/24 · 方澤享 · <a href="filter.html">AI 研究所篩選器</a></p>
    <div id="hud">
      <button type="button" id="prev" aria-label="上一頁">←</button>
      <span id="count">1 / {len(slides)}</span>
      <button type="button" id="next" aria-label="下一頁">→</button>
      <button type="button" id="fs" aria-label="全螢幕">⛶</button>
    </div>
  </div>
</div>
<script src="assets/deck.js"></script>
</body>
</html>
'''
(ROOT / "index.html").write_text(html, encoding="utf-8")
print("slides", len(slides), "bytes", (ROOT / "index.html").stat().st_size)
