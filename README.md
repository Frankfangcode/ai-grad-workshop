# 海內外 AI 研究所與獎學金探索工作坊

2026 年 11 月 24 日（二）18:00–20:00，國立政治大學大仁樓 200106。主持：方澤享。學程與獎學金簡報：何則文。

這個靜態網站有兩頁：

- [簡報](index.html)：鍵盤可翻頁。← → 換頁，F 全螢幕。手機可以滑動，頁面太長時往下捲。
- [AI 研究所篩選器](filter.html)：小組把查過的表貼進來，篩到只剩一個目標。

實作參考頁是 `step1.html` 到 `step6.html`。簡報步驟頁的右邊就是這些畫面。跟不上的人直接開 `filter.html`。

## 在自己的電腦打開

不需要安裝。在這個資料夾執行：

```bash
python3 -m http.server 47321
```

瀏覽器打開 `http://127.0.0.1:47321/`。

直接用瀏覽器開 `index.html` 也可以翻頁。篩選器的「讀取網址」需要透過上面的方式開，瀏覽器才允許讀取試算表。貼上 CSV 和「載入範例資料」在直接開檔時也能用。

## 篩選器怎麼用

1. 第一屏按「開始匯入」。
2. 貼上 Google 試算表發佈成 CSV 的網址，或貼上 CSV，或按「載入範例資料」。
3. 用圓角條件縮小。畫面上的數字會跟著變。
4. 最多並排 3 個，再按「設為我的目標」。
5. 匯出短名單。目標和篩選會留在這台電腦的 localStorage。

範例資料的校名都是假的，學費和截止日是空的。不要把範例寫進小組比較表。

表頭請用：

```text
學校,學程,國家,領域,語言,獎學金,需要資工背景,學費,截止日期,官網,已查證
```

領域只寫：技術、治理人文、商管。不知道的學費和日期留白。

示範網址（會直接載入範例）：

- `filter.html?demo=results`
- `filter.html?demo=compare`
- `filter.html?demo=target`

## 發佈

整個資料夾都是靜態檔，不要用建置指令。

### GitHub Pages

1. 把這個資料夾推到 GitHub 儲存庫。
2. Settings → Pages → Build and deployment 選 GitHub Actions，或選 Deploy from a branch，分支用放網站的那個，資料夾選 `/ (root)`。
3. 存檔後等它給你 `https://<帳號>.github.io/<儲存庫>/`。

### Netlify

1. 把資料夾拖上 [app.netlify.com/drop](https://app.netlify.com/drop)，或用 Netlify 連到 GitHub。
2. Build command 留空。Publish directory 填 `.`。
3. 它會給一個 `https://xxxx.netlify.app`。

### Render 靜態網站

1. New → Static Site，連到這個儲存庫。
2. Build command 留空。Publish directory 填 `.`。
3. 部署完成後用 Render 給的網址。

## 簡報裡的事實

流程、地點、12/9 成果展（N24 台北方舟 1F、18:10 報到、Luma 與表單）來自 2026/11/24 的流程確認。學程的學費、名額、截止日期不在這份簡報裡填數字，請看何則文的簡報，再回各校官網：

https://wenzhotw.github.io/ai-masters-scholarship-guide/

照片來自 Wikimedia Commons，出處在簡報最後一頁。
