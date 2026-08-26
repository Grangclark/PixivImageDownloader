// background.js
importScripts("jszip.min.js");

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "start_zip_download") {
    const { illustId, urls, fileName } = request;

    (async () => {
      try {
        const zip = new JSZip();

        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          const res = await fetch(url, {
            headers: { "Referer": "https://www.pixiv.net/" }
          });
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          
          const blob = await res.blob();
          const ext = url.split('.').pop().split('?')[0];
          const entryName = `${illustId}_p${i}.${ext}`;
          
          zip.file(entryName, blob);
        }

        const base64 = await zip.generateAsync({
          type: "base64",
          compression: "STORE"
        });

        const dataUrl = `data:application/zip;base64,${base64}`;
        
        // 👑 指定された [作者名] 作品タイトル_作品ID.zip で保存
        const finalFileName = fileName || `pixiv_${illustId}.zip`;

        await chrome.downloads.download({
          url: dataUrl,
          filename: finalFileName,
          saveAs: false
        });

        sendResponse({ success: true });
      } catch (err) {
        console.error("[Background ZIP Error]:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  }
});