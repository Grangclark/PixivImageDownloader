// content.js：background に「強奪」を依頼し、届いたデータを受け取って保存する
setInterval(() => {
    const existingBtn = document.getElementById('pixiv-dl-btn');
    if (location.host === 'www.pixiv.net' && !existingBtn) {
        const dlBtn = document.createElement('button');
        dlBtn.id = 'pixiv-dl-btn';
        dlBtn.innerText = "画像を保存";
        dlBtn.style.cssText = "position:fixed; top:20px; right:20px; z-index:9999; padding:10px; background:#0096fa; color:#fff; border:none; border-radius:5px; cursor:pointer;";
        
        dlBtn.onclick = () => {
            const img = document.querySelector('main [role="presentation"] img');
            if (!img) return alert("画像が見つかりません");

            chrome.runtime.sendMessage({ message: "download_blob", url: img.src }, (response) => {
                if (response.error || !response.dataUrl) return alert("強奪失敗: " + response.error);

                // ★ 最終奥義：Base64文字列から生のデータ(Blob)を再構成して保存する
                fetch(response.dataUrl) // 一度自分の中で読み込み直す（これが一番確実！）
                    .then(res => res.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = "pixiv_image.jpg";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url); // メモリを綺麗にする
                        console.log("PixivImageDownloader: 完璧に保存されました！");
                    });
            });
        };
        document.body.appendChild(dlBtn);
    }
}, 1000);