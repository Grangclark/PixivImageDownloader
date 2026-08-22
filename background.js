// 1. ブラウザ自体に「pximg.netへの通信は全部pixivのふりをせよ」と命令する
chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
        id: 1,
        priority: 1,
        action: {
            type: "modifyHeaders",
            requestHeaders: [
                { header: "Referer", operation: "set", value: "https://www.pixiv.net/" },
                { header: "Origin", operation: "set", value: "https://www.pixiv.net" }
            ]
        },
        condition: { urlFilter: "pximg.net", resourceTypes: ["xmlhttprequest"] }
    }]
});

// 2. その状態で fetch を実行する
// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "download_bytes") {
    fetch(request.url, {
      headers: {
        "Referer": "https://www.pixiv.net/"
      }
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then(buffer => {
      // ArrayBuffer をバイト配列にして送信
      const byteArray = Array.from(new Uint8Array(buffer));
      sendResponse({ success: true, byteArray: byteArray });
    })
    .catch(err => {
      console.error("[Background Fetch Error]:", err);
      sendResponse({ success: false, error: err.message });
    });

    return true; // 非同期通信を維持
  }
});

chrome.runtime.onInstalled.addListener(() => {
  const RULE_ID = 1;
  const rule = {
    id: RULE_ID,
    priority: 1,
    action: {
      type: "modifyHeaders",
      requestHeaders: [
        {
          header: "Referer",
          operation: "set",
          value: "https://www.pixiv.net/"
        }
      ]
    },
    condition: {
      urlFilter: "pximg.net",
      resourceTypes: ["xmlhttprequest", "image", "other"]
    }
  };

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [rule]
  }, () => {
    console.log("[PixivImageDownloader] Refererヘッダー自動付与ルールを適用しました");
  });
});