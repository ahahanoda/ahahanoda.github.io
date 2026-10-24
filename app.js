(function() {
    // 🛠️ あなたのGitHub情報
    var USERNAME = "ahahanoda"; 
    var REPO = "ahahanoda.github.io";
    var FOLDER_PATH = "gifs"; 

    // --- 1. DSiブラウザかどうかの自動判定 ---
    var isDSi = false;
    if (navigator && navigator.userAgent) {
        if (navigator.userAgent.indexOf('Nintendo DSi') !== -1) {
            isDSi = true;
        }
    }

    // DSi環境だった場合は投稿GUIを非活性化する（DSi用セーフティ）
    if (isDSi) {
        var tokenInput = document.getElementById('token');
        var fileInput = document.getElementById('gif-file');
        var uploadBtn = document.getElementById('upload-btn');

        if (tokenInput) { tokenInput.disabled = true; tokenInput.value = "DSiからは閲覧のみ可能です"; }
        if (fileInput) { fileInput.disabled = true; }
        if (uploadBtn) { uploadBtn.disabled = true; uploadBtn.onclick = function() { return false; }; }
    } else {
        // --- 2. 【スマホ・PC専用】完全自動アップロード＆リスト自動更新処理 ---
        var uploadBtn = document.getElementById('upload-btn');
        if (uploadBtn) {
            uploadBtn.onclick = function() {
                var token = document.getElementById('token').value;
                var fileInput = document.getElementById('gif-file');
                var statusDiv = document.getElementById('status');

                if (!token) { alert("トークンを入力してください"); return; }
                if (!fileInput.files || fileInput.files.length === 0) { alert("ファイルを選択してください"); return; }

                // 【修正箇所】配列の0番目を明示的に取得するように修正
                var file = fileInput.files[0];
                var fileName = file.name;
                statusDiv.innerText = "アップロード中...";

                var reader = new FileReader();
                reader.onload = function(e) {
                    // 画像データをBase64に変換
                    var arrayBuffer = e.target.result;
                    var base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));

                    // ① まずGIF画像をGitHubにアップロード
                    var gifUrl = 'https://github.com' + USERNAME + '/' + REPO + '/contents/' + FOLDER_PATH + '/' + fileName;
                    var xhr1 = new XMLHttpRequest();
                    xhr1.open('PUT', gifUrl, true);
                    xhr1.setRequestHeader('Authorization', 'token ' + token);
                    xhr1.setRequestHeader('Content-Type', 'application/json');

                    xhr1.onreadystatechange = function() {
                        if (xhr1.readyState === 4) {
                            if (xhr1.status === 201 || xhr1.status === 200) {
                                statusDiv.innerText = "GIF成功！続けてDSi用リストを全自動更新中...";
                                // ② GIFの保存に成功したら、続けて自動で list.txt を更新する
                                autoUpdateListText(token, fileName, statusDiv);
                            } else {
                                statusDiv.innerText = "失敗: " + xhr1.status + " (トークンや権限を確認してください)";
                            }
                        }
                    };
                    xhr1.send(JSON.stringify({ message: 'Upload GIF via GifTube', content: base64Data }));
                };
                
                // エラーハンドリングを追加
                reader.onerror = function() {
                    statusDiv.innerText = "ファイルの読み込みに失敗しました。";
                };
                
                reader.readAsArrayBuffer(file);
            };
        }
    }

    // スマホ側でGIF投稿成功時に「list.txt」を裏で全自動で書き換える関数
    function autoUpdateListText(token, newFileName, statusDiv) {
        var listUrl = 'https://github.com' + USERNAME + '/' + REPO + '/contents/' + FOLDER_PATH + '/list.txt';
        var xhr2 = new XMLHttpRequest();
        xhr2.open('GET', listUrl, true);
        xhr2.setRequestHeader('Authorization', 'token ' + token);

        xhr2.onreadystatechange = function() {
            if (xhr2.readyState === 4) {
                var currentText = "";
                var sha = null;
                
                if (xhr2.status === 200) {
                    var resData = JSON.parse(xhr2.responseText);
                    sha = resData.sha;
                    currentText = decodeURIComponent(escape(atob(resData.content))); // Base64デコード
                }

                // 新しいファイル名がまだなければ、改行で末尾に全自動追加
                if (currentText.indexOf(newFileName) === -1) {
                    currentText = currentText.trim() + "\n" + newFileName;
                }

                // UTF-8対応のBase64エンコード
                var updatedBase64 = btoa(unescape(encodeURIComponent(currentText)));

                // GitHubの list.txt を上書きプッシュ
                var xhr3 = new XMLHttpRequest();
                xhr3.open('PUT', listUrl, true);
                xhr3.setRequestHeader('Authorization', 'token ' + token);
                xhr3.setRequestHeader('Content-Type', 'application/json');

                xhr3.onreadystatechange = function() {
                    if (xhr3.readyState === 4) {
                        if (xhr3.status === 200 || xhr3.status === 201) {
                            statusDiv.innerText = "すべて完了しました！DSiにも自動反映されています。";
                            loadGifs(); // 画面の一覧をリロード
                        } else {
                            statusDiv.innerText = "リスト更新に失敗しました。";
                        }
                    }
                };
                
                var bodyData = { message: 'Auto update list.txt for DSi', content: updatedBase64 };
                if (sha) { bodyData.sha = sha; } // 上書き用の識別子
                xhr3.send(JSON.stringify(bodyData));
            }
        };
        xhr2.send(null);
    }

    // --- 3. GIF一覧の読み込み（DSi・スマホ共通） ---
    function loadGifs() {
        var gifArea = document.getElementById('gif-list'); 
        if (!gifArea) return;

        var xhr = new XMLHttpRequest();
        var targetUrl = 'https://' + USERNAME + '.github.io/' + FOLDER_PATH + '/list.txt';
        var cacheBust = '?t=' + new Date().getTime(); // キャッシュ回避
        
        xhr.open('GET', targetUrl + cacheBust, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    parseTextAndRender(xhr.responseText, gifArea);
                } else {
                    gifArea.innerHTML = '<p style="text-align:center; color:#999;">投稿されたGIFはまだありません。<br>(スマホやPCから最初の1件目を投稿すると自動生成されます)</p>';
                }
            }
        };
        try { xhr.send(null); } catch (e) {
            gifArea.innerHTML = '<p style="color:red;">通信エラーが発生しました</p>';
        }
    }

    // テキストファイルを解析して画面に画像を出す（DSi対応ES3構文）
    function parseTextAndRender(textData, gifArea) {
        gifArea.innerHTML = ""; 
        var lines = textData.split('\n');
        var count = 0;

        for (var i = 0; i < lines.length; i++) {
            var fileName = lines[i].replace(/^\s+|\s+$/g, '');
            if (fileName !== "" && fileName.indexOf('.gif') !== -1) {
                var container = document.createElement('div');
                container.className = 'gif-container';

                var img = document.createElement('img');
                img.src = 'https://' + USERNAME + '.github.io/' + FOLDER_PATH + '/' + fileName;

                var titleDiv = document.createElement('div');
                titleDiv.className = 'gif-title';
                var cleanTitle = fileName.replace('.gif', '');
                titleDiv.appendChild(document.createTextNode(cleanTitle));

                container.appendChild(img);
                container.appendChild(titleDiv);
                gifArea.appendChild(container);
                count++;
            }
        }
        if (count === 0) {
            gifArea.innerHTML = '<p style="text-align:center; color:#666;">投稿されたGIFはありません。</p>';
        }
    }

    if (window.addEventListener) {
        window.addEventListener('load', loadGifs, false);
    } else {
        window.onload = loadGifs;
    }
})();
