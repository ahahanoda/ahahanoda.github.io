// ====== 【設定】 ======
const OWNER = 'ahahanoda'; 
const REPO = 'ahahanoda.github.io'; 
const PATH = 'gifs';             
// ====================

// ページが読み込まれたら自動でGIF一覧を表示
window.addEventListener('DOMContentLoaded', () => {
    loadGifs();
});

// アップロード処理
document.getElementById('upload-btn').addEventListener('click', async () => {
    const token = document.getElementById('token').value.trim();
    const fileInput = document.getElementById('gif-file');
    const uploadBtn = document.getElementById('upload-btn');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        return alert('ファイルを選択してください。');
    }
    if (!token) {
        return alert('GitHubアクセストークンを入力してください。');
    }

    uploadBtn.disabled = true;
    uploadBtn.innerText = 'アップロード中...';

    // 選択されたファイルを取得
    const file = fileInput.files[0]; 
    const fileName = `${Date.now()}_${file.name}`;
    
    // ファイルを読み込む
    const reader = new FileReader();
    
    reader.onload = async () => {
        try {
            // AIの誤変換を防ぐため、一番確実な方法でBase64の純粋なデータ部分を抽出します
            const rawResult = reader.result;
            const commaIndex = rawResult.indexOf(',');
            const content = rawResult.substring(commaIndex + 1);

            // GitHub APIのURL
            const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}/${fileName}`;
            
            // GitHubへ送信
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
                fileInput.value = ''; 
                loadGifs();          
            } else {
                const errorData = await response.json();
                alert(`GitHub APIエラー: ${errorData.message}\n\n※トークン作成時に「repo」の権限を入れたか確認してください。`);
                console.error(errorData);
            }
        } catch (error) {
            alert('送信中にエラーが発生しました。\n詳細: ' + error.message);
            console.error(error);
        } finally {
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

    // 読み込みを開始
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
