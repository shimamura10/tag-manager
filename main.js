'use strict'

{
  const addButton = document.querySelector('#add-button');
  const mask = document.querySelector('.mask');
  const informationWindow = document.querySelector('.add-window');
  const selectButton = document.querySelector('#select-button');
  const mainTable = document.querySelector('#main-table');
  const originTbody = document.querySelector('#origin-tbody');
  const addName = document.querySelector('#add-name');
  const addUrl = document.querySelector('#add-url');
  const addTag = document.querySelector('.add-tag');
  const addedTagSpace = document.querySelector('#added-tag-space');
  const searchTagList = document.querySelector('#search-tag-list');
  const sortColumList = document.querySelector('#sort-colum-list'); // ソート項目を指定するドロップダウンリスト
  const sortIndicator = document.querySelector('.sort-indicator'); //昇順降順を示すアイコン
  const LSkey = 'informationList'; // ローカルストレージのキー
  const targetTags = []; // 絞り込みに使われているタグのリスト
  let informationWindowKey = ''; // ブックマークウィンドウで操作している情報のキー
  // ブックマークが持つ情報のデフォルト値
  const originInformation = {
    name: '',
    url: '',
    tag: [],
    lastUsedTime: 0,
    addedTime: 0,
    usedNumber: 0,
  }

  // 起動時の処理
  // ローカルストレージから情報を読み込む
  let informationList = {};
  if (!(localStorage[LSkey] == "undefined" || typeof localStorage[LSkey] == "undefined")) {
    informationList = JSON.parse(localStorage[LSkey]);
  }
  // informationListの内容を表示
  Object.keys(informationList).forEach(key => {
    displayInformation(key);
  })
  // ブックマークリストの並び変え
  sort();
  // filterウィンドウにタグを表示
  displaySearchTags();

  // ブックマークの登録
  // 登録ボタンの処理を設定
  addButton.addEventListener('click', () => {
    mask.classList.remove('hidden');
    informationWindow.classList.remove('hidden');
    informationWindow.classList.add('add');
  });
  // ブックマーク情報ウィンドウの決定ボタンの処理
  selectButton.addEventListener('click', () => {
    if (informationWindow.classList.contains('add')) { //登録ボタンを押したときの処理
      informationWindowKey = nextKey();
      informationWindow.classList.remove('add');
    } else if (informationWindow.classList.contains('edit')) { //editボタンを押したときの処理
      deliteInformation(informationWindowKey);
      informationWindow.classList.remove('edit');
    }
    // 情報を読み込む
    const cloneInformation = Object.assign({}, originInformation);
    cloneInformation.name = addName.value;
    cloneInformation.url = addUrl.value;
    cloneInformation.tag = [];
    cloneInformation.addedTime = Date.now();
    for (let i = 0; i < addedTagSpace.children.length; i++) {
      const tag = addedTagSpace.children[i];
      if (tag.value == '') {continue;}
      cloneInformation.tag.push(tag.value);
    }
    informationList[informationWindowKey] = cloneInformation;
    // 情報を表示する
    displayInformation(informationWindowKey);
    save();
    // Sort順で並び変える
    sort();
    // ウィンドウを閉じる
    closeWindow();
  });
  // 登録ウィンドウでタグを増やすボタンの設定
  document.querySelector('#add-tag-button').addEventListener('click', () => {
    cloneTag();
  });
  // ブックマーク情報ウィンドウの外側をクリックすると閉じる
  mask.addEventListener('click', () => {
    closeWindow();
  })
  // 次に登録するブックマークのキーを返す
  function nextKey() {
    let tmp = localStorage['keyNum'];
    if (typeof tmp == "undefined") {
      tmp = 1;
    }
    localStorage['keyNum'] = Number(tmp) + 1;
    return 'key-' + tmp;
  }
  // ブックマーク情報ウィンドウを閉じる
  function closeWindow() {
    mask.classList.add('hidden');
    informationWindow.classList.add('hidden');
    addName.value = '';
    addUrl.value = '';
    const l = addedTagSpace.children.length;
    for (let i = 0; i < l; i++) {
      if (i == 0) {
        addedTagSpace.children[i].value = '';
      } else {
        addedTagSpace.lastElementChild.remove();
      }
    }
  }

  // ソートの処理
  // sortColumListとsortIndicatorに従ってソートする
  function sort() {
    const colum = sortColumList.value;
    // ソートされたキーのリストを作成
    const informationOrder = Object.keys(informationList);
    informationOrder.sort((a,b) => {
      if (sortIndicator.classList.contains('asc')) {
        return informationList[a][colum] - informationList[b][colum];
      } else if (sortIndicator.classList.contains('desc')) {
        return informationList[b][colum] - informationList[a][colum];
      }
    });
    // 表の中身を全削除
    while (mainTable.firstChild) {
      mainTable.removeChild(mainTable.firstChild);
    }
    // ソートされた順に表に表示
    informationOrder.forEach((key) => {
      displayInformation(key);
    })
    search();
  }
  sortColumList.addEventListener('change', () => {
    sort();
  });
  // 昇順、降順の切り替え
  sortIndicator.addEventListener('click', () => {
    if (sortIndicator.classList.contains('asc')) {
      sortIndicator.classList.replace('asc', 'desc');
    } else if (sortIndicator.classList.contains('desc')) {
      sortIndicator.classList.replace('desc', 'asc');
    }
    sort();
  });

  // フィルター関連
  // フィルターボタンにイベントを設定
  document.querySelector('#filter-button').addEventListener('click', () => {
    document.querySelector('#filter-window').classList.toggle('hidden');
  });
  // フィルターウィンドウを消すボタンの設定
  document.querySelector('#filter-window > button').addEventListener('click', () => {
    document.querySelector('#filter-window').classList.add('hidden');
  });
    // タグ検索ボックスの設定
    const searchInTags = document.querySelector('#search-in-tags');
    searchInTags.addEventListener('keyup', () => {
      displaySearchTags(searchInTags.value);
    });
  // 絞り込みに使うタグをページに表示する
  function addSearchTag(searchTag) {
    // 絞り込みタグのhtml要素を作成
    const tag = document.createElement('a');
    tag.classList.add("searchTag");
    tag.text = searchTag;
    // 絞り込みタグを消すボタンを付ける
    const delButton = document.createElement('input');
    delButton.setAttribute('type', 'button');
    delButton.setAttribute('value', 'X');
    delButton.addEventListener('click', () => {
      delButton.parentElement.remove();
      const ind = targetTags.indexOf(delButton.parentElement.text);
      targetTags.splice(ind, 1);
      search();
    });
    tag.appendChild(delButton);
    searchTagList.appendChild(tag);  // 作成した絞り込みタグを表示
    targetTags.push(tag.text); // 絞り込みタグの内部的なリストに追加
    search(); // 絞り込みタグに従って表示するブックマークを選びなおす
  }
  // searchStringを含むタグのみを表示する
  function displaySearchTags(searchString = '') {
    // 現存する全タグをtagSetに入れる
    const tagSet = new Set();
    Object.keys(informationList).forEach(key => {
      informationList[key].tag.forEach(tag => {
        tagSet.add(tag);
      })
    });
    const tagList = Array.from(tagSet);
    tagList.sort(); // アルファベット順にする
    // 表示されているタグを全部消す
    const filterTagList = document.querySelector('#filter-tag-list');
    deleteAllChilds(filterTagList);
    // 全タグのうちsearchStringを含むものだけ表示する
    // searchStringが空のときは全部表示
    tagList.forEach(tag => {
      if (searchString == '' || tag.indexOf(searchString) != -1){
        const tagli = document.createElement('li');
        tagli.classList.add('filter-tag');
        tagli.textContent = tag;
        tagli.addEventListener('click', () => {
          addSearchTag(tagli.textContent);
        });
        filterTagList.appendChild(tagli);
      }
    });
  }

  // 使いまわす処理
  // informationをサイト上のリストに追加
  function displayInformation(key) {
    const information = informationList[key]
    const cloneTbody = originTbody.cloneNode(true);
    cloneTbody.id = key;
    mainTable.appendChild(cloneTbody);
    const name = document.querySelector(`#${key} .display-name`);
    name.text  = information.name;
    name.setAttribute("href", information.url);
    name.addEventListener('click', () => {
      informationList[key].lastUsedTime = Date.now();
      informationList[key].usedNumber += 1;
      save();
    })
    information.tag.forEach(infoTag => {
      if (infoTag == '') {return;}
      const newTag = document.createElement('li');
      newTag.classList.add('display-tag');
      newTag.textContent = infoTag;
      document.querySelector(`#${key} .tag-ul`).appendChild(newTag);
    });
    // deleteボタンの追加
    const deleteButton = document.querySelector(`#${key} .delete-button`);
    deleteButton.addEventListener('click', () => {
      if (confirm("本当に削除しますか？")){
        const key = deleteButton.closest('.main-tbody').id;
        deliteInformation(key);
      }
      });
    // editボタンの追加
    const editButton = document.querySelector(`#${key} .edit-button`);
    editButton.addEventListener('click', () => {
      const key = editButton.closest('.main-tbody').id;
      // ブックマーク情報ウィンドウに現在の情報を表示
      mask.classList.remove('hidden');
      informationWindow.classList.remove('hidden');
      informationWindow.classList.add('edit');
      informationWindowKey = key;
      addName.value = informationList[key].name;
      addUrl.value = informationList[key].url;
      cloneTag(informationList[key].tag.length-1);
      informationList[key].tag.forEach((tag,i) => {
        addedTagSpace.children[i].value = tag;
      });
    });
  }

  // 登録されている情報を消す
  function deliteInformation(key) {
    delete informationList[key];
    document.querySelector(`#${key}`).remove();
    save();
  }

  // 登録ウィンドウのタグ入力欄をnum個増やす
  function cloneTag(num=1) {
    for (let i = 0; i < num; i++) {
      const cloneTag = addTag.cloneNode(true);
      addedTagSpace.appendChild(cloneTag);
      cloneTag.value = '';
    }
  }

  // informationListをローカルストレージに保存
  function save() {
    localStorage.setItem(LSkey, JSON.stringify(informationList))
  }

  // タグによる検索（絞り込み）
  function search() {
    if (targetTags.length == 0) { //絞り込みなし
      Object.keys(informationList).forEach(key => {
        document.querySelector(`#${key}`).classList.remove('hidden');
      });
    } else { // 絞り込みあり
      Object.keys(informationList).forEach(key => {
        let ok = true;
        targetTags.forEach(targetTags => {
          let ok2 = false;
          informationList[key].tag.forEach(tag => {
            if (tag == targetTags) {
              ok2 = true;
              return;
            }
          });
          if (!ok2) {
            ok = false;
            return;
          }
        });
        if (ok) {
          document.querySelector(`#${key}`).classList.remove('hidden');
        } else {
          document.querySelector(`#${key}`).classList.add('hidden');
        }
      });
    }
  }

  // parentの子要素を全部削除
  function deleteAllChilds(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

}