const OWNER = 'ahahanoda';
const REPO = 'ahahanoda.github.io';
const PATH = 'gifs'; // GIFを保存するフォルダ

// アップロード処理
document.getElementById('upload-btn').addEventListener('click', async () => {
    const token = document.getElementById('token').value;
    const fileInput = document.getElementById('gif-file');
    if (!fileInput.files.length || !token) return alert('ファイルとトークンを入力してください');

    const file = fileInput.files[0];
    const fileName = `${Date.now()}_${file.name}`;
    
    // ファイルをBase64に変換
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const content = reader.result.split(',')[1]; // Base64のデータ部分のみ

        // GitHub APIへPUTリクエスト
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
            alert('アップロード完了！ページをリロードしてください。');
            loadGifs();
        } else {
            alert('アップロードに失敗しました。');
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
