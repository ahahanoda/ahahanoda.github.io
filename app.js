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
    
    // 【修正：イベントからファイルを安全に引き出す方法に変更】
    const selectedFiles = fileInput.files;
    if (!selectedFiles || selectedFiles.length === 0) {
        return alert('ファイルを選択してください。');
    }
    if (!token) {
        return alert('GitHubアクセストークンを入力してください。');
    }

    uploadBtn.disabled = true;
    uploadBtn.innerText = 'アップロード中...';

    // 1番目のファイルを確実に特定する安全な書き方
    const targetFile = selectedFiles.item(0); 
    const fileName = `${Date.now()}_${targetFile.name}`;
    
    const reader = new FileReader();
    
    reader.onload = async () => {
        try {
            // カンマで分割してデータ本体を取り出す
            const contentArray = reader.result.split(',');
            const content = contentArray[1]; 

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
        alert('ファイルの読み込み（FileReader）に失敗しました。');
        console.error(err);
        uploadBtn.disabled = false;
        uploadBtn.innerText = 'アップロード';
    };

    // 読み込み開始
    reader.readAsDataURL(targetFile);
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
