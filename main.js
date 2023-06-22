'use strict'

{
  const addButton = document.querySelector('#add-button');
  const mask = document.querySelector('.mask');
  const addWindow = document.querySelector('.add-window');
  const selectButton = document.querySelector('#select-button');

  addButton.addEventListener('click', () => {
    mask.classList.remove('hidden');
    addWindow.classList.remove('hidden');
  })

  selectButton.addEventListener('click', () => {
    mask.classList.add('hidden');
    addWindow.classList.add('hidden');
  })
}