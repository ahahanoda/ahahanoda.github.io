// DSiブラウザ（Opera）互換の最低限の記述（ES3形式）

(function() {
    // あなたのGitHub情報（パスの組み立て用）
    var USERNAME = "ahahanoda"; 
    var REPO = "ahahanoda.github.io";
    var FOLDER_PATH = "gifs"; 

    // 投稿フォームの送信動作を安全に無効化
    var form = document.getElementById('uploadForm');
    if (form) {
        form.onsubmit = function() { return false; };
    }

    function loadGifs() {
        var gifArea = document.getElementById('gif-list'); 
        if (!gifArea) return;
        
        gifArea.innerHTML = ""; // クリア

        // 【手動設定エリア】
        // DSiブラウザはGitHub APIのセキュリティ制限（TLS等）で通信が遮断されるため、
        // 閲覧を確実に機能させるために、gifsフォルダ内にあるファイル名をここに直接記述します。
        // （新しいGIFをフォルダに入れたら、ここにファイル名を追加してください）
        var files = [
            "sample1.gif",
            "sample2.gif",
            "animation.gif"
        ];

        // DSiでは forEach や アロー関数は動かないため、通常の for ループを使用
        for (var i = 0; i < files.length; i++) {
            var fileName = files[i];

            // 拡張子が .gif のものだけを処理（念のためのセーフティ）
            // DSiでは endsWith() が使えないため、indexOf や slice を使用
            if (fileName.indexOf('.gif') !== -1) {
                
                // 画像を包むコンテナを作成
                var container = document.createElement('div');
                container.className = 'gif-item';

                var img = document.createElement('img');
                
                // 互換性のある文字列結合（テンプレートリテラル ${} の禁止）
                img.src = 'https://' + USERNAME + '.github.io/' + FOLDER_PATH + '/' + fileName;
                img.style.width = '200px'; 
                img.style.margin = '10px';
                
                // タイトル表示用（ファイル名から拡張子を除いたものを簡易表示）
                var titleDiv = document.createElement('div');
                titleDiv.className = 'gif-title';
                var cleanTitle = fileName.replace('.gif', '');
                titleDiv.appendChild(document.createTextNode(cleanTitle));

                // 組み立てて画面に追加
                container.appendChild(img);
                container.appendChild(titleDiv);
                gifArea.appendChild(container);
            }
        }
    }

    // ページ読み込み完了時に実行（window.onloadを安全にバインド）
    if (window.addEventListener) {
        window.addEventListener('load', loadGifs, false);
    } else if (window.attachEvent) {
        window.attachEvent('onload', loadGifs); // さらに古いブラウザ用
    } else {
        window.onload = loadGifs;
    }

})();
