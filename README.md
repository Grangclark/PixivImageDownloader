# PixivImageDownloader

Pixivのイラスト作品ページから、複数枚の高解像度（原寸）画像を1つのZIPファイルにまとめて一括ダウンロードできるChrome/Brave拡張機能（Manifest V3対応）です。

---

## 🌟 主な機能 (Features)

* **複数画像の一括ZIPダウンロード**: マンガや複数枚イラストの全ページを原寸クオリティのまま1クリックでZIP保存。
* **スマートなファイル名生成**: `[作者名] 作品タイトル_作品ID.zip` の形式で自動保存。
* **コンテキスト連動表示**: 作品ページ（`/artworks/*`）を開いた時のみ、画面右上にダウンロードボタンが自動表示。
* **高速アーカイブ**: 無圧縮（STORE方式）パッキングにより、高速なZIP生成と瞬時の解凍を実現。

---

## 🚀 インストール手順 (Installation)

1. このリポジトリをZIPダウンロードまたはクローンします。
   ```bash
   git clone [https://github.com/your-username/PixivImageDownloader.git](https://github.com/your-username/PixivImageDownloader.git)

2. ChromeまたはBraveを開き、拡張機能管理ページ（chrome://extensions または brave://extensions）にアクセスします。

3. 画面右上の 「デベロッパーモード」 をONにします。

4. 「パッケージ化されていない拡張機能を読み込む」 をクリックし、本プロジェクトのフォルダを選択します。

## 📖 使い方 (Usage)
Pixivで任意のイラスト・マンガ作品ページ（例: https://www.pixiv.net/artworks/12345678）を開きます。

画面右上に表示される 「📦 全画像をZIP保存」 ボタンをクリックします。

自動で全画像が取得され、[作者名] 作品タイトル_作品ID.zip としてダウンロードされます。

## 🛠️ 技術スタック (Tech Stack)
Manifest V3

JavaScript (Vanilla JS)

JSZip (クライアントサイドZIP生成)

Chrome Extension APIs (declarativeNetRequest, downloads, runtime)

## 📄 License
MIT License