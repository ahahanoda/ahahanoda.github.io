// ====== 【設定：変更なし】 ======
const OWNER = 'ahahanoda'; 
const REPO = 'ahahanoda.github.io'; 
const PATH = 'gifs';             
// ==========================================

// ページが読み込まれたら自動でGIF一覧を表示
window.addEventListener('DOMContentLoaded', () => {
    loadGifs();
});

// アップロード処理
document.getElementById('upload-btn').addEventListener('click', async () => {
    const token = document.getElementById('token').value.trim();
    const fileInput = document.getElementById('gif-file');
    const uploadBtn = document.getElementById('upload-btn');
    
    // 1. 入力チェック
    if (!fileInput.files || fileInput.files.length === 0) {
        return alert('ファイルを選択してください。');
    }
    if (!token) {
        return alert('GitHubアクセストークンを入力してください。');
    }

    // ボタンを「アップロード中...」にする
    uploadBtn.disabled = true;
    uploadBtn.innerText = 'アップロード中...';

    // 【修正完了】選択された1つ目のファイルオブジェクトを正しく取得
    const file = fileInput.files[0]; 
    const fileName = `${Date.now()}_${file.name}`;
    
    // 2. ファイルを読み込んでBase64に変換
    const reader = new FileReader();
    
    reader.onload = async () => {
        try {
            // Base64データから純粋なデータ本体（カンマの後の部分）を取り出す
            const content = reader.result.split(',')[1]; 

            // GitHub APIのURL
            const url = `https://github.com{OWNER}/${REPO}/contents/${PATH}/${fileName}`;
            
            // 3. GitHubに送信
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
                fileInput.value = ''; // 選択をクリア
                loadGifs();          // 一覧を更新
            } else {
                const errorData = await response.json();
                alert(`GitHub APIエラー: ${errorData.message}\n\n※トークンを作成する時に「repo」にチェックが入っているか確認してください。`);
                console.error(errorData);
            }
        } catch (error) {
            alert('送信中にエラーが発生しました。\n詳細: ' + error.message);
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
        listArea.innerHTML = ''; 

        let hasGif = false;
        files.forEach(file => {
            if (file.name.toLowerCase().endsWith('.gif')) {
                hasGif = true;
                const img = document.createElement('img');
                img.src = file.download_url; 
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
