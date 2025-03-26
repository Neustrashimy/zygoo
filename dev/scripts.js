
// 定数の宣言
const SHORTCUT_STORAGE_KEY = 'quickShortcutsData'; // ショートカットデータの保存キー
const DEFAULT_SHORTCUTS = [
    { id: Date.now(), name: "Wikipedia", url: "https://www.wikipedia.org/", favicon: null },
    { id: Date.now() + 1, name: "GitHub", url: "https://github.com/", favicon: null }
  ];
const ENGINE_STORAGE_KEY = 'selectedSearchEngine'; // 選択された検索エンジンの保存キー
const SEARCH_ENGINE_LIST_KEY = 'searchEngineList'; // デフォルト検索エンジンリストの保存キー
const DEFAULT_SEARCH_ENGINES = [ // デフォルト検索エンジンリスト
    { name: "DuckDuckGo", value: "https://duckduckgo.com/?q=" },
    { name: "Google", value: "https://www.google.com/search?q=" },
    { name: "Bing", value: "https://www.bing.com/search?q=" },
    { name: "Yahoo!", value: "https://search.yahoo.com/search?p=" },
    { name: "Wolfarm Alpha", value: "https://www.wolframalpha.com/input?i=" }
];


// ── ユーティリティ関数 ─────────────────────────────

// 入力欄をクリアする
function clearModalInputs() {
    document.getElementById('modalLinkName').value = '';
    document.getElementById('modalLinkURL').value = '';
}

// ローカルストレージからショートカットを読み込み、DOMに表示する
function loadShortcuts() {
    let shortcuts = JSON.parse(localStorage.getItem(SHORTCUT_STORAGE_KEY));
    // localStorage にショートカットがなければデフォルトのものを設定
    if (!shortcuts) {
      shortcuts = DEFAULT_SHORTCUTS;
      localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(shortcuts));
    }
    const container = document.getElementById('shortcutsContainer');
    container.querySelectorAll('.shortcut-item').forEach(item => item.remove());
    shortcuts.forEach(shortcut => {
      appendShortcut(shortcut);
    });
  }

// ショートカットをDOMに追加する
function appendShortcut(shortcut) {
    const container = document.getElementById('shortcutsContainer');
    const a = document.createElement('a');
    a.href = shortcut.url;
    a.target = '_blank';
    a.className = 'shortcut-item';
    a.dataset.id = shortcut.id; // 一意の識別子
    a.setAttribute('draggable', 'true');

    // faviconまたはフォールバック画像
    const img = document.createElement('img');
    img.src = shortcut.favicon ? shortcut.favicon : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAPYQAAD2EAdWsr3QAAAKfSURBVFhH7ddPiFVlGMfxj6M4pVnoKJpIIUwDMtUMCgYqodiAC42woP8tJAaKihZKtdCFG3UjQkRF+Af/bWSQVookIkl/oEVDmikzFGgbSaKFuEmnzXMuZx7uuffc2eTCL1w49/c77/s+532f9znv4T7/M9Oy0IbZGMJqPIF5uIsb+BXncAF3csMq6gawGJ9gE77BeVzGTUzHQjwdwQ3gK3yKW7mjqfAuxvEOHshmExZgF65ifTY7YQYO4Wv0ZLMGy/AzPshGHabhCD5DVzY74OFYrveyUVCVA1uxEi9jAn14Pt/UghH8HteP4Fu8H8FMotnT9WIYb8fgItE+wnL82+Y3hHWl/v7BG/iiZg45jleyGNk9hmeykdiJLVnEvjr58CiuxBM3o04QVQEsia07adnzEryAEy0KySh2xz7vlOv4E4NlMQfwLM4mrcwAPsar2ajJ2RijQQ5gGS4mraAbx/AmLmWzJhdjjAY5gHn4K2kFW6LWf5+NDriB+WUhB1BVF+A1fJ7F2HLX2iRmwUQeIwfwd8xCM5bGG6/MKnyJD2N52gWxIF5gDXIAv6E/aQVFUSp4DIexOSrfixHEinRfmf4Yo0EO4EKqYmXuYGbp//7YEUXSjkYQK0v3ZNZFWa5kSUxzs1wYwdq4fg6nk1/Qh0VZDO1qRd+TGImClHkJR+P6QIcvJ9iDbVlsRn/MwqykT49pXo7vIgfq0hdPPzsbVezAwSxiDX7Bj3gqmxXMwk/YkI1WdOFkHK3ymg1HQr6V9GY8iFNxnuyY7siHI3goeYNx0GjF4/gB27PRCV2x1a7g9TgntmNOtBmvSOYp0RtFZwx7YwcU3wXz8WSU6oP4I5Zubu6kGXl929GDjVGC+9KHyaU4853B7dzwPvcs/wGbbnxUbJlLKgAAAABJRU5ErkJggg==';
    //img.src = shortcut.favicon ? shortcut.favicon : 'fallback.png';
    a.appendChild(img);

    // ショートカット名を表示
    const span = document.createElement('span');
    span.textContent = shortcut.name;
    a.appendChild(span);

    // 削除ボタンの作成とイベント設定
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.style.display = 'none';
    a.appendChild(deleteBtn);

    // 削除ボタン：クリック時に確認→削除
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm("Delete this shortcut?" + "\n" + shortcut.name)) {
            deleteShortcut(shortcut.id);
            a.remove();
        }
    });

    // ドラッグ＆ドロップのイベント登録
    a.addEventListener('dragstart', handleDragStart);
    a.addEventListener('dragover', handleDragOver);
    a.addEventListener('drop', handleDrop);
    a.addEventListener('dragend', handleDragEnd);

    // ホバーで一定時間後に削除ボタンを表示
    let hoverTimer;
    a.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
            deleteBtn.style.display = 'block';
        }, 1000);
    });
    a.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        deleteBtn.style.display = 'none';
    });

    // 「＋」ボタンの前に挿入
    const addButton = document.getElementById('addShortcutBtn');
    container.insertBefore(a, addButton);
}

// DOM上のショートカット順序に合わせて localStorage を更新する
function updateShortcutsOrder() {
    const container = document.getElementById('shortcutsContainer');
    const shortcutElements = container.querySelectorAll('.shortcut-item');
    let shortcuts = JSON.parse(localStorage.getItem(SHORTCUT_STORAGE_KEY)) || [];
    const newOrder = [];
    shortcutElements.forEach(elem => {
        const id = elem.dataset.id;
        const found = shortcuts.find(item => item.id == id);
        if (found) {
            newOrder.push(found);
        }
    });
    localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(newOrder));
}

// 指定されたIDのショートカットを削除する
function deleteShortcut(id) {
    let shortcuts = JSON.parse(localStorage.getItem(SHORTCUT_STORAGE_KEY)) || [];
    shortcuts = shortcuts.filter(item => item.id !== id);
    localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(shortcuts));
}

// 検索エンジン一覧を読み込み、<select> を更新する関数
function loadSearchEngines() {
    let engines = JSON.parse(localStorage.getItem(SEARCH_ENGINE_LIST_KEY));
    if (!engines) {
        engines = DEFAULT_SEARCH_ENGINES;
        localStorage.setItem(SEARCH_ENGINE_LIST_KEY, JSON.stringify(engines));
    }
    const engineSelect = document.getElementById('engineSelect');
    engineSelect.innerHTML = ''; // 既存のオプションをクリア
    engines.forEach(engine => {
        const option = document.createElement('option');
        option.value = engine.value;
        option.textContent = engine.name;
        engineSelect.appendChild(option);
    });
    // 保存されている選択値があれば復元
    const savedEngine = localStorage.getItem(ENGINE_STORAGE_KEY);
    if (savedEngine) {
        engineSelect.value = savedEngine;
    }
}





// ── ドラッグ＆ドロップ関連のハンドラ ─────────────────────────────

let dragSrcEl = null;

function handleDragStart(e) {
    dragSrcEl = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (dragSrcEl !== this) {
        const container = document.getElementById('shortcutsContainer');
        container.insertBefore(dragSrcEl, this);
        updateShortcutsOrder();
    }
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}


// ── DOMContentLoaded時の初期設定・イベント登録 ─────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    loadShortcuts(); // ショートカットの読み込み
    loadSearchEngines(); // 検索エンジンリストの読み込み

    // 検索エンジン選択の復元
    const savedEngine = localStorage.getItem(ENGINE_STORAGE_KEY);
    if (savedEngine) {
        document.getElementById('engineSelect').value = savedEngine;
    }

    // 検索エンジン選択変更時の保存
    document.getElementById('engineSelect').addEventListener('change', (e) => {
        localStorage.setItem(ENGINE_STORAGE_KEY, e.target.value);
    });

    // 検索フォームの送信処理
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('searchInput').value;
        const engine = document.getElementById('engineSelect').value;
        const url = engine + encodeURIComponent(query);
        window.open(url, '_self');
    });



    // モーダル（ショートカット追加）の要素
    const modal = document.getElementById('modal');
    const addShortcutBtn = document.getElementById('addShortcutBtn');
    const cancelShortcutBtn = document.getElementById('cancelShortcutBtn');

    // 「＋」ボタンでショートカット追加モーダルを表示
    addShortcutBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // ショートカット追加モーダルのキャンセルボタン
    cancelShortcutBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        clearModalInputs();
    });

    // ショートカット追加モーダルの「保存」ボタン
    document.getElementById('saveShortcutBtn').addEventListener('click', async () => {
        const name = document.getElementById('modalLinkName').value.trim();
        const url = document.getElementById('modalLinkURL').value.trim();
        if (name && url) {
            const newShortcut = { id: Date.now(), name, url, favicon: null };
            let shortcuts = JSON.parse(localStorage.getItem(SHORTCUT_STORAGE_KEY)) || [];
            shortcuts.push(newShortcut);
            localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(shortcuts));
            appendShortcut(newShortcut);
            modal.style.display = 'none';
            clearModalInputs();
        } else {
            alert('Input fields cannot be empty.');
        }
    });

    // ── データ表示・編集モーダルの設定 ─────────────────────────────

    // 「Import/Export」リンククリックで、JSON内容を表示
    document.getElementById('dataModalLink').addEventListener('click', (e) => {
        e.preventDefault();
        const dataTextArea = document.getElementById('dataTextArea');
        const shortcuts = JSON.parse(localStorage.getItem(SHORTCUT_STORAGE_KEY)) || [];
        const selectedEngine = localStorage.getItem(ENGINE_STORAGE_KEY) || DEFAULT_SEARCH_ENGINES[0].value;
        const engines = JSON.parse(localStorage.getItem(SEARCH_ENGINE_LIST_KEY)) || DEFAULT_SEARCH_ENGINES;
        const combinedData = {
            shortcuts: shortcuts,
            selectedSearchEngine: selectedEngine,
            searchEngines: engines
        };
        dataTextArea.value = JSON.stringify(combinedData, null, 2);
        document.getElementById('dataModal').style.display = 'flex';
        // 例として全選択状態にする処理も入れる場合
        setTimeout(() => {
            dataTextArea.focus();
            dataTextArea.select();
        }, 100);
    });

    // データ編集モーダルの「保存」ボタン：JSONをパースしてlocalStorage更新
    document.getElementById('saveDataBtn').addEventListener('click', () => {
        const dataTextArea = document.getElementById('dataTextArea');
        try {
          const newData = JSON.parse(dataTextArea.value);
          if (newData.shortcuts) {
            localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(newData.shortcuts));
          }
          if (newData.selectedSearchEngine) {
            localStorage.setItem(ENGINE_STORAGE_KEY, newData.selectedSearchEngine);
            document.getElementById('engineSelect').value = newData.selectedSearchEngine;
          }
          if (newData.searchEngines) {
            localStorage.setItem(SEARCH_ENGINE_LIST_KEY, JSON.stringify(newData.searchEngines));
            loadSearchEngines(); // <select> を再構築
          }
          loadShortcuts();
          document.getElementById('dataModal').style.display = 'none';
        } catch (err) {
          alert('Invalid JSON: ' + err);
        }
      });

    // データ編集モーダルの「クリップボードにコピー」ボタンのイベント設定
    document.getElementById('copyDataBtn').addEventListener('click', () => {
        const dataTextArea = document.getElementById('dataTextArea');
        navigator.clipboard.writeText(dataTextArea.value)
            .then(() => {
                alert("Copied!");
            })
            .catch((err) => {
                alert("Copy failed: " + err);
            });
    });

    // データ編集モーダルの「キャンセル」ボタン
    document.getElementById('cancelDataBtn').addEventListener('click', () => {
        document.getElementById('dataModal').style.display = 'none';
    });


});
