const OWNER = 'ahahanoda';
const REPO = 'ahahanoda.github.io';
const PATH = 'gifs'; // GIFを保存するフォルダ

// アップロード処理
// アップロード処理（状況が分かる進化版）
document.getElementById('upload-btn').addEventListener('click', async () => {
    const token = document.getElementById('token').value;
    const fileInput = document.getElementById('gif-file');
    const uploadBtn = document.getElementById('upload-btn');
    
    if (!fileInput.files.length) return alert('ファイルを選択してください');
    if (!token) return alert('GitHubアクセストークンを入力してください');

    // ボタンを無効化して進行中であることを分かりやすくする
    uploadBtn.disabled = true;
    uploadBtn.innerText = 'アップロード中...';

    const file = fileInput.files[0]; // [0] が抜けていた場合はここで修正
    const fileName = `${Date.now()}_${file.name}`;
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        try {
            const content = reader.result.split(',')[1]; // Base64のデータ本体を確実に取得

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
                alert('アップロード完了！');
                fileInput.value = '';
                loadGifs();
            } else {
                const errorData = await response.json();
                alert(`GitHub APIエラー: ${errorData.message}`);
                console.error(errorData);
            }
        } catch (error) {
            alert('通信エラーが発生しました。コンソールを確認してください。');
            console.error(error);
        } finally {
            // ボタンを元に戻す
            uploadBtn.disabled = false;
            uploadBtn.innerText = 'アップロード';
        }
    };
});

// 一覧表示処理
async () => {
    const url = `https://github.com{OWNER}/${REPO}/contents/${PATH}`;
    const response = await fetch(url);
    if (!response.ok) return;

    const files = await response.json();
    const listArea = document.getElementById('gif-list');
    listArea.innerHTML = '';

    files.forEach(file => {
        if (file.name.endsWith('.gif')) {
            const img = document.createElement('img');
            img.src = file.download_url; // GitHub上の生の画像URL
            img.className = 'gif-item';
            listArea.appendChild(img);
        }
    });
}
