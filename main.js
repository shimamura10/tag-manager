'use strict'

{
  const addButton = document.querySelector('#add-button');
  const mask = document.querySelector('.mask');
  const addWindow = document.querySelector('.add-window');
  const selectButton = document.querySelector('#select-button');
  const mainTable = document.querySelector('#main-table');
  const originTbody = document.querySelector('#origin-tbody');
  const addName = document.querySelector('#add-name');
  const addUrl = document.querySelector('#add-url');
  const addTag = document.querySelector('.add-tag');
  const addedTagSpace = document.querySelector('#added-tag-space');
  const inputSearchTag = document.querySelector('#input-search-tag');
  const displaySearchTag = document.querySelector('#display-search-tag');
  const LSkey = 'informationList';
  const targetTags = [];
  let informationList = {};
  if (!(localStorage[LSkey] == "undefined" || typeof localStorage[LSkey] == "undefined")) {
    informationList = JSON.parse(localStorage[LSkey]);
  }
  const originInformation = {
    name: 'sampleName',
    url: 'sampleUrl',
    tag: ['sampleTag1', 'sampleTag2'],
  }
  // informationList[nextKey()] = (Object.assign({}, originInformation));

  // タグ検索の追加ボタンを押したときの処理
  document.querySelector('#add-search-tag').addEventListener('click', () => {
    // タグ要素の追加と表示
    const tag = document.createElement('a');
    tag.classList.add("searchTag");
    tag.text = inputSearchTag.value;
    const delButton = document.createElement('input');
    delButton.setAttribute('type', 'button');
    delButton.setAttribute('value', 'X');
    delButton.addEventListener('click', () => {
      delButton.parentElement.remove();
      const ind = targetTags.indexOf(delButton.parentElement.text);
      targetTags.splice(ind, 1);
      search();
    })
    tag.appendChild(delButton)
    displaySearchTag.appendChild(tag);
    
    inputSearchTag.value = '';
    targetTags.push(tag.text);
    search();
  })

  // informationListの内容を表示
  Object.keys(informationList).forEach(key => {
    displayInformation(informationList[key], key);
  })


  // リストに追加する情報の入力画面を表示
  addButton.addEventListener('click', () => {
    mask.classList.remove('hidden');
    addWindow.classList.remove('hidden');
  });

  // リストに情報を追加
  selectButton.addEventListener('click', () => {
    // 情報を読み込む
    const cloneInformation = Object.assign({}, originInformation);
    cloneInformation.name = addName.value;
    cloneInformation.url = addUrl.value;
    cloneInformation.tag = [];
    for (let i = 0; i < addedTagSpace.children.length; i++) {
      const tag = addedTagSpace.children[i];
      cloneInformation.tag.push(tag.value);
    }
    // const key = 'key-' + String(Object.keys(informationList).length + 1);
    const key = nextKey();
    // const key = cloneInformation.name + cloneInformation.url;  //主キーは名前＋url
    informationList[key] = cloneInformation;

    // 情報を書き込む
    displayInformation(cloneInformation, key);
    save();
    // ウィンドウを閉じる
    closeWindow();
  });

  document.querySelector('#add-tag-button').addEventListener('click', () => {
    cloneTag();
  });

  // addTag.addEventListener('change', cloneTag);

  function cloneTag() {
    const cloneTag = addTag.cloneNode(true);
    // cloneTag.addEventListener('change', cloneTag);
    addedTagSpace.appendChild(cloneTag);
    cloneTag.value = '';
  }

  // informationをサイト上のリストに追加
  function displayInformation(information, key) {
    const cloneTbody = originTbody.cloneNode(true);
    cloneTbody.id = key;
    mainTable.appendChild(cloneTbody);
    const name = document.querySelector(`#${key} .display-name`);
    name.text  = information.name;
    name.setAttribute("href", information.url);
    information.tag.forEach(infoTag => {
      if (infoTag == '') {return;}
      const newTag = document.createElement('a');
      newTag.classList.add('display-tag');
      newTag.text = infoTag;
      document.querySelector(`#${key} .tag-th`).appendChild(newTag);
    });
    // deleteボタンの追加
    const deleteButton = document.querySelector(`#${key} .delete-button`);
    deleteButton.addEventListener('click', () => {
      const key = deleteButton.parentElement.id;
      delete informationList[key];
      deleteButton.parentElement.remove();
      console.log(informationList);
      save();
      console.log(informationList);
    })
  }

  // informationListをローカルストレージに保存
  function save() {
    localStorage.setItem(LSkey, JSON.stringify(informationList))
    console.log(informationList);
  }

  function search() {
    console.log(targetTags.length);
    if (targetTags.length == 0) { //絞り込みなし
      console.log(informationList);
      Object.keys(informationList).forEach(key => {
        document.querySelector(`#${key}`).classList.remove('hidden');
        console.log(document.querySelector(`#${key}`).classList);
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

  function nextKey() {
    let tmp = localStorage['keyNum'];
    if (typeof tmp == "undefined") {
      tmp = 1;
    }
    localStorage['keyNum'] = Number(tmp) + 1;
    return 'key-' + tmp;
  }

  function closeWindow() {
    mask.classList.add('hidden');
    addWindow.classList.add('hidden');
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

  mask.addEventListener('click', () => {
    closeWindow();
  })
}