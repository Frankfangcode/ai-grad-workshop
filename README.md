# 海內外 AI 研究所與獎學金探索工作坊

2026 年 11 月 24 日（二）18:00–20:00，國立政治大學大仁樓 200106。主持：方澤享。學程與獎學金簡報：何則文。

這個資料夾是一份靜態簡報，入口是 `index.html`。共 11 頁。← → 換頁，F 全螢幕。手機可以滑動。

簡報給方向，不給做好的工具。各組自己決定小工具要有什麼功能。

- 第 3 頁是彈幕投票。QR 連到 `https://workshop-danmaku-1124.onrender.com/?room=1124`，房間代碼 1124。
- 第 4 頁連到何則文的簡報：https://wenzhotw.github.io/ai-masters-scholarship-guide/
- 第 10 頁是 12/9 成果展，QR 連到 https://luma.com/6frrdys3

## 在自己的電腦打開

```bash
python3 -m http.server 47321
```

瀏覽器打開 `http://127.0.0.1:47321/`。直接開 `index.html` 也可以翻頁。

## 發佈

整個資料夾都是靜態檔，不要用建置指令。

### GitHub Pages

Settings → Pages → Deploy from a branch，資料夾選 `/ (root)`。

### Netlify

Build command 留空。Publish directory 填 `.`。

### Render 靜態網站

Build command 留空。Publish directory 填 `.`。

## 事實從哪裡來

流程、地點、12/9 成果展（N24 台北方舟 1F、18:10 報到、Luma 與表單）來自 2026/11/24 的流程確認。學程學費和截止日期不在這份簡報裡。校園照片來自 Wikimedia Commons，作者與授權寫在每張圖的角落。
