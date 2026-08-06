/**
 * 1枚目の画像URLと総ページ数から、全ページの画像URLリストを生成する関数
 * @param {string} firstImageUrl - 1枚目の原寸画像URL (例: .../12345678_p0.jpg)
 * @param {number} pageCount - 作品の総枚数 (例: 5)
 * @return {string[]} 全ページの画像URL配列
 */
// content.js

/**
 * 1枚目の画像URLと総ページ数から、全ページの画像URLリストを生成する関数
 */
function generateAllImageUrls(firstImageUrl, pageCount) {
  const urls = [];
  for (let i = 0; i < pageCount; i++) {
    const pageUrl = firstImageUrl.replace(/_p0(\.[a-zA-Z]+)$/, `_p${i}$1`);
    urls.push(pageUrl);
  }
  return urls;
}

// ボタンの動的生成と監視
setInterval(() => {
  const existingBtn = document.getElementById('pixiv-dl-btn');
  // Pixivのイラストページ（/artworks/数字）にいる場合のみボタンを表示
  if (location.host === 'www.pixiv.net' && location.pathname.includes('/artworks/') && !existingBtn) {
    const dlBtn = document.createElement('button');
    dlBtn.id = 'pixiv-dl-btn';
    dlBtn.innerText = "📦 全画像をZIP保存";
    dlBtn.style.cssText = "position:fixed; top:20px; right:20px; z-index:9999; padding:10px 15px; background:#0096fa; color:#fff; border:none; border-radius:5px; font-weight:bold; cursor:pointer;";

    dlBtn.onclick = async () => {
      // 1. URLからイラストIDを取得 (例: /artworks/12345678 -> 12345678)
      const illustId = location.pathname.split('/').pop();
      if (!illustId || isNaN(illustId)) return alert("イラストIDの取得に失敗しました");

      try {
        dlBtn.innerText = "⏳ 情報取得中...";

        // 2. Pixivの内部データ(API)を取得して、原寸URLと枚数を解析
        const res = await fetch(`https://www.pixiv.net/ajax/illust/${illustId}`);
        const data = await res.json();
        
        if (data.error) return alert("イラスト情報の取得に失敗しました");

        const pageCount = data.body.pageCount; // 総枚数
        const originalFirstUrl = data.body.urls.original; // 原寸1枚目のURL (_p0)

        // 3. 全ページの原寸URLリストを自動生成！
        const allUrls = generateAllImageUrls(originalFirstUrl, pageCount);

        console.log(`🎉 [PixivImageDownloader] 全${pageCount}枚のURLを生成しました:`, allUrls);
        alert(`全${pageCount}枚のURL取得に成功！\nコンソール(F12)で生成されたURL一覧を確認できます。`);

        // ※ 2日目にここで `allUrls` を使ってZIP化・ダウンロードを行います！
        dlBtn.innerText = "📦 全画像をZIP保存";

      } catch (err) {
        console.error(err);
        alert("エラーが発生しました: " + err.message);
        dlBtn.innerText = "📦 全画像をZIP保存";
      }
    };

    document.body.appendChild(dlBtn);
  }
}, 1000);