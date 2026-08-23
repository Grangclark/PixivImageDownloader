/**
 * 1枚目の画像URLと総ページ数から、全ページの画像URLリストを生成する関数
 * @param {string} firstImageUrl - 1枚目の原寸画像URL (例: .../12345678_p0.jpg)
 * @param {number} pageCount - 作品の総枚数 (例: 5)
 * @return {string[]} 全ページの画像URL配列
 */
// content.js (V2 完全版)

/**
 * 単一の画像URLを background 経由で取得して Blob を返すヘルパー関数
 */
function fetchImageBlob(imageUrl) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ message: "download_blob", url: imageUrl }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (!response || !response.success || !response.dataUrl) {
        return reject(new Error(response?.error || "画像取得に失敗しました"));
      }
      fetch(response.dataUrl)
        .then(res => res.blob())
        .then(blob => resolve(blob))
        .catch(err => reject(err));
    });
  });
}

/**
 * background.js 経由で画像バイトデータを取得して Uint8Array を返すヘルパー関数
 */
function fetchImageBytes(imageUrl) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ message: "download_bytes", url: imageUrl }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (!response || !response.success || !response.byteArray) {
        return reject(new Error(response?.error || "画像取得に失敗しました"));
      }
      const uint8 = new Uint8Array(response.byteArray);
      resolve(uint8);
    });
  });
}

/**
 * BlobデータをZIPファイルとしてブラウザ保存するヘルパー関数
 */
function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// ボタンの動的生成と監視
setInterval(() => {
  const existingBtn = document.getElementById('pixiv-dl-btn');
  if (location.host === 'www.pixiv.net' && location.pathname.includes('/artworks/') && !existingBtn) {
    const dlBtn = document.createElement('button');
    dlBtn.id = 'pixiv-dl-btn';
    dlBtn.innerText = "📦 全画像をZIP保存";
    dlBtn.style.cssText = "position:fixed; top:20px; right:20px; z-index:9999; padding:10px 15px; background:#0096fa; color:#fff; border:none; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2);";

    dlBtn.onclick = async () => {
      const illustId = location.pathname.split('/').pop();
      if (!illustId || isNaN(illustId)) return alert("イラストIDの取得に失敗しました");

      try {
        dlBtn.disabled = true;
        dlBtn.innerText = "⏳ 作品情報解析中...";

        // 1. 全ページの原寸画像URLとタイトル情報を取得
        const pagesRes = await fetch(`https://www.pixiv.net/ajax/illust/${illustId}/pages`);
        const pagesData = await pagesRes.json();
        
        if (pagesData.error || !pagesData.body) {
          throw new Error("全ページ情報の取得に失敗しました");
        }

        const allUrls = pagesData.body.map(item => item.urls.original);
        const totalCount = allUrls.length;

        const zip = new JSZip();

        // 2. background経由で全枚数を順次取得してZIPへ格納
        for (let i = 0; i < totalCount; i++) {
          const url = allUrls[i];
          dlBtn.innerText = `⏳ 取得中 (${i + 1}/${totalCount})...`;

          const uint8Data = await fetchImageBytes(url);
          const ext = url.split('.').pop().split('?')[0];
          const fileName = `${illustId}_p${i}.${ext}`;

          zip.file(fileName, uint8Data);
        }

        // 3. 👑【今日の一撃】ZIPファイルを生成して一発ダウンロード！
        dlBtn.innerText = "📦 ZIP圧縮中...";
        const zipBlob = await zip.generateAsync({ type: "blob" });
        
        const zipFileName = `pixiv_${illustId}.zip`;
        downloadBlob(zipBlob, zipFileName);

        dlBtn.innerText = "✅ ダウンロード完了！";
        setTimeout(() => {
          dlBtn.disabled = false;
          dlBtn.innerText = "📦 全画像をZIP保存";
        }, 2000);

      } catch (err) {
        console.error("[PixivImageDownloader Error]:", err);
        alert("エラーが発生しました: " + err.message);
        dlBtn.disabled = false;
        dlBtn.innerText = "📦 全画像をZIP保存";
      }
    };

    document.body.appendChild(dlBtn);
  }
}, 1000);