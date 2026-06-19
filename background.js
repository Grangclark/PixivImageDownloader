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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "download_blob") {
        fetch(request.url) // ヘッダー指定はルールに任せるので不要
        .then(response => {
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            return response.blob();
        })
        .then(blob => {
            const reader = new FileReader();
            reader.onload = () => sendResponse({ dataUrl: reader.result });
            reader.readAsDataURL(blob);
        })
        .catch(error => sendResponse({ error: error.message }));
        return true; 
    }
});