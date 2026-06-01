# ADs-Killer Video Controller 🎥

![GitHub Repo stars](https://img.shields.io/github/stars/jay900411/ADs-Killer-Video-Controller?style=social)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

這是一個具備「高內聚、低耦合」架構的 Chrome 擴充功能。旨在統一各種網頁影音平台（目前僅Anime1 其餘尚未擴充）的播放體驗，賦予原生的快捷鍵控制，並針對特定含有流氓廣告的網站實作了強勢的「疫苗級」廣告防禦機制。

> **🌟 如果這個工具改善了你的看片體驗，歡迎點擊右上角 `Star` ⭐️ 給予支持！** \
> **💡 有任何建議或希望支援新網站，歡迎發起 Issue。**

## 核心特色 (Features)

### 1. 通用影片快捷鍵 (Universal Shortcuts)
* **`Space` (空白鍵)**：暫停 / 播放
* **`→` / `←` (左右方向鍵)**：快轉 / 倒退 5 秒
* **`Shift` + `→` / `←`**：快轉 / 倒退 30 秒
* **`Option(Alt)` + `→` / `←`**：跳過 OP / ED (快轉 60 秒)
* **`↑` / `↓` (上下方向鍵)**：調整音量
* **`Shift` + `>` / `<`**：精細調整播放速度 (0.5x ~ 4x)
* **`F` 鍵**：切換全螢幕
* **OSD 視覺回饋**：提供類似 YouTube 的半透明操作提示框。

### 2. Anime1 終極防禦模式 (Ad & Hijack Protection)
* **點擊劫持防禦**：攔截覆蓋在畫面上的隱形透明圖層 (`mousedown` 劫持)。
* **彈出視窗封殺**：覆寫 `window.open`，徹底防堵惡意分頁彈出。
* **上一頁綁架免疫**：封鎖 `history.pushState` 濫用，保證你的「上一頁」永遠乾淨。
* **DOM 變動監視**：使用 `MutationObserver` 搭配 Debounce 機制，動態清除亂碼廣告，並在全螢幕時自動休眠釋放 CPU 效能。

## Architecture

本專案採用 **策略模式 (Strategy Pattern)** 與 **路由器 (Domain Router)** 架構設計，易於後續擴充維護：
* `VideoController`：封裝影片控制與 OSD 渲染的底層邏輯。
* `Site Strategies`：針對不同網域 (e.g., `Anime1Strategy`, `NycuE3Strategy`) 實作特定的跨視窗通訊 (IPC) 與 DOM 操作。
* `inject_*.js`：透過 Manifest V3 `web_accessible_resources` 精準注入 Main World，實現最高權限的廣告腳本覆寫。

## Installation

本專案尚未上架 Chrome Web Store，請依照以下步驟手動載入：
1. 點擊本頁面右上角綠色按鈕 **`<> Code`**，選擇 **`Download ZIP`** 並解壓縮。
2. 打開 Chrome 瀏覽器，網址列輸入 `chrome://extensions/`。
3. 開啟右上角的 **「開發人員模式」**。
4. 點擊左上角的 **「載入未封裝項目」**，選擇剛剛解壓縮的資料夾即可完成安裝！

## License
This project is licensed under the MIT License.
