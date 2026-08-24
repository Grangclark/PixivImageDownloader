// background.js
importScripts("jszip.min.js");

// Refererヘッダー自動付与ルールの設定
chrome.runtime.onInstalled.addListener(() => {
  const RULE_ID = 1;
  const rule = {
    id: RULE_ID,
    priority: 1,
    action: {
      type: "modifyHeaders",
      requestHeaders: [
        { header: "Referer", operation: "set", value: "https://www.pixiv.net/" }
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
  });
});

// ZIP生成＆ダウンロードの受付
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "start_zip_download") {
    const { illustId, urls } = request;

    (async () => {
      try {
        const zip = new JSZip();

        // CORS制限のないService Workerから直接fetch
        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          const res = await fetch(url, {
            headers: { "Referer": "https://www.pixiv.net/" }
          });
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          
          const blob = await res.blob();
          const ext = url.split('.').pop().split('?')[0];
          const fileName = `${illustId}_p${i}.${ext}`;
          
          zip.file(fileName, blob);
        }

        // 高速化のため STORE (無圧縮) でZIPをBase64化
        const base64 = await zip.generateAsync({
          type: "base64",
          compression: "STORE"
        });

        // chrome.downloads API で一発保存
        const dataUrl = `data:application/zip;base64,${base64}`;
        await chrome.downloads.download({
          url: dataUrl,
          filename: `pixiv_${illustId}.zip`,
          saveAs: false
        });

        sendResponse({ success: true });
      } catch (err) {
        console.error("[Background ZIP Error]:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true; // 非同期処理を維持
  }
});