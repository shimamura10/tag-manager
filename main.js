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
  const LSkey = 'informationList';
  const informationList = JSON.parse(localStorage[LSkey]);
  const originInformation = {
    name: 'sampleName',
    url: 'sampleUrl',
    tag: ['sampleTag1', 'sampleTag2'],
  }

  informationList['key-1'] = (Object.assign({}, originInformation));

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
    // ウィンドウを閉じる
    mask.classList.add('hidden');
    addWindow.classList.add('hidden');
    // 情報を読み込む
    const cloneInformation = Object.assign({}, originInformation);
    cloneInformation.name = addName.value;
    cloneInformation.url = addUrl.value;
    cloneInformation.tag = [];
    for (let i = 0; i < addedTagSpace.children.length; i++) {
      const tag = addedTagSpace.children[i];
      cloneInformation.tag.push(tag.value);
    }
    const key = 'key-' + String(Object.keys(informationList).length + 1);
    informationList[key] = cloneInformation;
    console.log(informationList);

    // 情報を書き込む
    displayInformation(cloneInformation, key);
    save(informationList);
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
    console.log(cloneTbody.id);
    // const name = document.querySelector('#sample .display-name');
    const name = document.querySelector(`#${key} .display-name`);
    name.text  = information.name;
    name.setAttribute("href", information.url);
    information.tag.forEach(infoTag => {
      if (infoTag == '') {return;}
      const newTag = document.createElement('a');
      newTag.classList.add('display-tag');
      newTag.text = infoTag;
      // document.querySelector('#sample .tag-th').appendChild(newTag);
      document.querySelector(`#${key} .tag-th`).appendChild(newTag);
    });
  }

  // informationListをローカルストレージに保存
  function save(informationList) {
    localStorage.setItem(LSkey, JSON.stringify(informationList))
  }
}