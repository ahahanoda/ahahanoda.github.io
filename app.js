(function() {
    // あなたのGitHub情報
    var USERNAME = "ahahanoda"; 
    var REPO = "ahahanoda.github.io";
    var FOLDER_PATH = "gifs"; 

    // アップロードボタンのダミー化
    var uploadBtn = document.getElementById('upload-btn');
    if (uploadBtn) {
        uploadBtn.onclick = function() { return false; };
    }

    function loadGifs() {
        var gifArea = document.getElementById('gif-list'); 
        if (!gifArea) return;

        // DSiブラウザでも動作する伝統的な XMLHttpRequest
        var xhr = new XMLHttpRequest();
        
        // GitHub Pages 上の gifs フォルダのURLを直接読み込む
        var targetUrl = 'https://' + USERNAME + '.github.io/' + FOLDER_PATH + '/';
        
        xhr.open('GET', targetUrl, true);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // 取得したフォルダページのHTMLからGIFファイルを自動抽出する
                    parseHtmlAndRender(xhr.responseText, gifArea, targetUrl);
                } else {
                    gifArea.innerHTML = '<p class="error">GIF一覧の自動取得に失敗しました</p>';
                }
            }
        };

        try {
            xhr.send(null);
        } catch (e) {
            gifArea.innerHTML = '<p class="error">通信エラーが発生しました</p>';
        }
    }

    // HTML（ディレクトリ一覧）から .gif リンクを自動抽出し表示する関数
    function parseHtmlAndRender(htmlText, gifArea, baseUrl) {
        gifArea.innerHTML = ""; // クリア

        // DSiのJS環境には正規表現の match( /.../g ) があるためこれを利用して <a> タグの href を抽出
        // href="ファイル名.gif" または href='ファイル名.gif' を探す古いブラウザ向けの確実なパターン
        var reg = /href=["']([^"']+\.gif)["']/gi;
        var match;
        var count = 0;

        // exec() ループを回して、ページ内にあるすべての .gif ファイル名を自動で割り出す
        while ((match = reg.exec(htmlText)) !== null) {
            var gifFileName = match[1];

            // フルパス（URL）が含まれていない場合はベースURLと結合
            var finalSrc = gifFileName;
            if (gifFileName.indexOf('://') === -1) {
                // 重複するスラッシュを考慮して結合
                finalSrc = baseUrl + gifFileName;
            }

            // DSiの画面に1つずつ描画していく処理
            var container = document.createElement('div');
            container.className = 'gif-container';

            var img = document.createElement('img');
            img.src = finalSrc;

            // ファイル名からクエリやパスを除去してタイトルに変換
            var shortName = gifFileName.substring(gifFileName.lastIndexOf('/') + 1);
            shortName = decodeURIComponent(shortName).replace('.gif', '');

            var titleDiv = document.createElement('div');
            titleDiv.className = 'gif-title';
            titleDiv.appendChild(document.createTextNode(shortName));

            container.appendChild(img);
            container.appendChild(titleDiv);
            gifArea.appendChild(container);
            
            count++;
        }

        // もし1つも見つからなかった場合
        if (count === 0) {
            gifArea.innerHTML = '<p style="text-align:center; color:#666;">投稿されたGIFはありません。</p>';
        }
    }

    // 安全な読み込みトリガー
    if (window.addEventListener) {
        window.addEventListener('load', loadGifs, false);
    } else {
        window.onload = loadGifs;
    }
})();
