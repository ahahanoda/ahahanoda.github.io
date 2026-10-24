// あなたのGitHub情報に書き換えてください
const USERNAME = "ahahanoda"; 
const REPO = "ahahanoda.github.io";
const FOLDER_PATH = "gifs"; // GIFが入っているフォルダ名

async function loadGifs() {
  const gifArea = document.getElementById('gifArea'); // GIFを表示するHTMLのID
  gifArea.innerHTML = ""; // 一旦クリア

  try {
    // GitHubのContents APIを叩いて、フォルダ内のファイル一覧を取得する（トークンなしの公開APIでOK）
    const response = await fetch(`https://api.github.com${USERNAME}/${REPO}/contents/${FOLDER_PATH}`);
    const files = await response.json();

    // フォルダ内のファイルを1つずつ処理
    files.forEach(file => {
      // 拡張子が .gif のファイルだけを対象にする
      if (file.name.endsWith('.gif')) {
        const img = document.createElement('img');
        
        // 重要: github.io の生の画像URL（または file.download_url）を指定する
        img.src = `https://${USERNAME}.github.io/${FOLDER_PATH}/${file.name}`;
        
        img.style.width = '200px'; // 見やすさの調整
        img.style.margin = '10px';
        
        gifArea.appendChild(img);
      }
    });
  } catch (error) {
    console.error("GIFの読み込みに失敗しました:", error);
  }
}

// ページを開いた時と、投稿が成功した後にこの関数を呼ぶ
window.onload = loadGifs;
