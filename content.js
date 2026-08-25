// content.js

setInterval(() => {
  const isArtworkPage = location.host === 'www.pixiv.net' && location.pathname.includes('/artworks/');
  const existingBtn = document.getElementById('pixiv-dl-btn');

  // 作品ページ以外ならボタンを削除
  if (!isArtworkPage) {
    if (existingBtn) existingBtn.remove();
    return;
  }

  // 作品ページかつボタンが無ければ作成
  if (!existingBtn) {
    const dlBtn = document.createElement('button');
    dlBtn.id = 'pixiv-dl-btn';
    dlBtn.innerText = "📦 全画像をZIP保存";

    // 🎯 指定の親要素（div.sc-4a56e1b9-1）を探す
    const targetContainer = document.querySelector('.sc-4a56e1b9-1');

    if (targetContainer) {
      // 親要素が相対位置を持てるように設定
      if (getComputedStyle(targetContainer).position === 'static') {
        targetContainer.style.position = 'relative';
      }
      // 指定要素の右上に絶対配置
      dlBtn.style.cssText = "position:absolute; top:10px; right:10px; z-index:9999; padding:8px 14px; background:#0096fa; color:#fff; border:none; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2);";
      targetContainer.appendChild(dlBtn);
    } else {
      // 親要素が取得できない場合の安全な固定位置（ヘッダーアイコン下の top:80px）
      dlBtn.style.cssText = "position:fixed; top:80px; right:20px; z-index:9999; padding:10px 15px; background:#0096fa; color:#fff; border:none; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2);";
      document.body.appendChild(dlBtn);
    }

    dlBtn.onclick = async () => {
      const match = location.pathname.match(/\/artworks\/(\d+)/);
      const illustId = match ? match[1] : null;
      if (!illustId) return alert("イラストIDの取得に失敗しました");

      try {
        dlBtn.disabled = true;
        dlBtn.innerText = "⏳ 作品情報解析中...";

        const pagesRes = await fetch(`https://www.pixiv.net/ajax/illust/${illustId}/pages`);
        const pagesData = await pagesRes.json();
        
        if (pagesData.error || !pagesData.body) {
          throw new Error("全ページ情報の取得に失敗しました");
        }

        const allUrls = pagesData.body.map(item => item.urls.original);
        dlBtn.innerText = `⏳ ダウンロード＆ZIP化中 (${allUrls.length}枚)...`;

        chrome.runtime.sendMessage({
          message: "start_zip_download",
          illustId: illustId,
          urls: allUrls
        }, (response) => {
          if (chrome.runtime.lastError) {
            alert("エラー: " + chrome.runtime.lastError.message);
            dlBtn.disabled = false;
            dlBtn.innerText = "📦 全画像をZIP保存";
            return;
          }

          if (response && response.success) {
            dlBtn.innerText = "✅ ダウンロード完了！";
          } else {
            alert("ダウンロード失敗: " + (response?.error || "不明なエラー"));
          }

          setTimeout(() => {
            dlBtn.disabled = false;
            dlBtn.innerText = "📦 全画像をZIP保存";
          }, 2000);
        });

      } catch (err) {
        console.error("[PixivImageDownloader Error]:", err);
        alert("エラーが発生しました: " + err.message);
        dlBtn.disabled = false;
        dlBtn.innerText = "📦 全画像をZIP保存";
      }
    };
  }
}, 1000);