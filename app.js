// ====== 【ahahanodaさんのリポジトリ情報に設定済み】 ======
const OWNER = 'ahahanoda'; 
const REPO = 'ahahanoda.github.io'; 
const PATH = 'gifs';             
// ==========================================================

// ページが読み込まれたら自動でGIF一覧を表示
window.addEventListener('DOMContentLoaded', () => {
    console.log("JavaScriptが正常に読み込まれました");
    loadGifs();
});

// アップロード処理
document.getElementById('upload-btn').addEventListener('click', async () => {
    console.log("アップロードボタンがクリックされました");
    
    const token = document.getElementById('token').value.trim();
    const fileInput = document.getElementById('gif-file');
    const uploadBtn = document.getElementById('upload-btn');
    
    // 入力チェック
    if (!fileInput.files || fileInput.files.length === 0) {
        return alert('ファイルを選択してください。');
    }
    if (!token) {
        return alert('GitHubアクセストークンを入力してください。');
    }

    // ボタンを一時的に無効化
    uploadBtn.disabled = true;
    uploadBtn.innerText = 'アップロード中...';

    const file = fileInput.files[0]; // 【修正】配列の最初のファイルオブジェクトを正しく取得
    const fileName = `${Date.now()}_${file.name}`;
    
    // ファイルをBase64に変換する処理
    const reader = new FileReader();
    
    reader.onload = async () => {
        try {
            console.log("ファイルの読み込み（Base64変換）が完了しました。APIを叩きます。");
            
            // 【重要・大修正】Base64データから純粋なバイナリデータ本体（1番目の要素 [1]）を確実に抽出
            const base64Data = reader.result.split(',');
            if (base64Data.length < 2) {
                throw new Error("ファイルのデータ変換に失敗しました。");
            }
            const content = base64Data[1]; 

            const url = `https://github.com{OWNER}/${REPO}/contents/${PATH}/${fileName}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Upload ${fileName}`,
                    content: content
                })
            });

            if (response.ok) {
                alert('アップロードが正常に完了しました！');
                fileInput.value = ''; // 選択ファイルをクリア
                loadGifs();          // 一覧を再読み込み
            } else {
                const errorData = await response.json();
                alert(`GitHub APIエラー: ${errorData.message}\n\n【確認項目】\nトークンのスコープ（権限）で「repo」にチェックが入っているか再確認してください。`);
                console.error(errorData);
            }
        } catch (error) {
            alert('エラーが発生しました。\n詳細: ' + error.message);
            console.error(error);
        } finally {
            // ボタンを元に戻す
            uploadBtn.disabled = false;
            uploadBtn.innerText = 'アップロード';
        }
    };

    reader.onerror = (err) => {
        alert('ファイルの読み込みに失敗しました。');
        console.error(err);
        uploadBtn.disabled = false;
        uploadBtn.innerText = 'アップロード';
    };

    // 変換を実行
    reader.readAsDataURL(file);
});

// 一覧表示処理
async function loadGifs() {
    const url = `https://github.com{OWNER}/${REPO}/contents/${PATH}`;
    const listArea = document.getElementById('gif-list');
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            listArea.innerHTML = '<p style="color: gray;">GIFがまだありません。最初の1枚をアップロードするとここに表示されます。</p>';
            return;
        }

        const files = await response.json();
        listArea.innerHTML = ''; // 一度クリア

        let hasGif = false;
        files.forEach(file => {
            if (file.name.toLowerCase().endsWith('.gif')) {
                hasGif = true;
                const img = document.createElement('img');
                img.src = file.download_url; // GitHub上の生の画像URL
                img.style.maxWidth = '200px'; 
                img.style.margin = '10px';
                img.style.border = '1px solid #ccc';
                listArea.appendChild(img);
            }
        });

        if (!hasGif) {
            listArea.innerHTML = '<p style="color: gray;">フォルダはありますが、GIFファイルが見つかりません。</p>';
        }
    } catch (error) {
        console.error('一覧の取得に失敗しました:', error);
    }
}
