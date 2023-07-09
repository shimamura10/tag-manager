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
  const inputSearchTag = document.querySelector('#input-search-tag');
  const searchTagList = document.querySelector('#search-tag-list');
  const sortColumList = document.querySelector('#sort-colum-list');
  const LSkey = 'informationList'; // ローカルストレージのキー
  const targetTags = []; // 絞り込みに使われているタグのリスト
  let informationWindowKey = ''; // ブックマークウィンドウで操作している情報のキー

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

  // ブックマークが持つ情報のデフォルト値
  const originInformation = {
    name: '',
    url: '',
    tag: [],
    lastUsedTime: 0,
    addedTime: 0,
    usedNumber: 0,
  }

  // タグ検索の追加ボタンを押したときの処理
  document.querySelector('#add-search-tag').addEventListener('click', () => {
    // タグ要素の追加と表示
    if (inputSearchTag.value == '') {return;}
    addSearchTag(inputSearchTag.value);
    inputSearchTag.value = '';
  })

  // リストに追加する情報の入力画面を表示
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
    // ウィンドウを閉じる
    closeWindow();
  });

  document.querySelector('#add-tag-button').addEventListener('click', () => {
    cloneTag();
  });

  function cloneTag(num=1) {
    for (let i = 0; i < num; i++) {
      const cloneTag = addTag.cloneNode(true);
      addedTagSpace.appendChild(cloneTag);
      cloneTag.value = '';
    }
  }

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

  // informationListをローカルストレージに保存
  function save() {
    localStorage.setItem(LSkey, JSON.stringify(informationList))
  }

  // タグによる検索
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

  // 次のキーを返す
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

  // 登録されている情報を消す
  function deliteInformation(key) {
    delete informationList[key];
    document.querySelector(`#${key}`).remove();
    save();
  }

  // ブックマーク情報ウィンドウの外側をクリックすると閉じる
  mask.addEventListener('click', () => {
    closeWindow();
  })

  // 並び変えの処理
  const sortIndicator = document.querySelector('.sort-indicator');
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
  function addSearchTag(searchTag) {
    const tag = document.createElement('a');
    tag.classList.add("searchTag");
    tag.text = searchTag;
    const delButton = document.createElement('input');
    delButton.setAttribute('type', 'button');
    delButton.setAttribute('value', 'X');
    delButton.addEventListener('click', () => {
      delButton.parentElement.remove();
      const ind = targetTags.indexOf(delButton.parentElement.text);
      targetTags.splice(ind, 1);
      search();
    })
    tag.appendChild(delButton);
    searchTagList.appendChild(tag);
    targetTags.push(tag.text);
    search();
  }

  function displaySearchTags(searchString = '') {
    const tagSet = new Set();
    Object.keys(informationList).forEach(key => {
      informationList[key].tag.forEach(tag => {
        tagSet.add(tag);
      })
    });
    const tagList = Array.from(tagSet);
    tagList.sort();
    console.log(tagList);
    const filterTagList = document.querySelector('#filter-tag-list');
    deleteAllChilds(filterTagList);
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
  displaySearchTags();
  const searchInTags = document.querySelector('#search-in-tags');
  searchInTags.addEventListener('keyup', () => {
    displaySearchTags(searchInTags.value);
  })

  function deleteAllChilds(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
}