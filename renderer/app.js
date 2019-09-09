const { ipcRenderer } = require('electron');
const items = require('./items');

let showModal = document.getElementById('show-modal'),
  closeModal = document.getElementById('close-modal'),
  modal = document.getElementById('modal'),
  addItem = document.getElementById('add-item'),
  itemURL = document.getElementById('url'),
  search = document.getElementById('search');

// Open new file modal
window.newItem = () => {
  showModal.click();
};

window.openItem = items.open;

window.deleteItem = () => {
  let selectedItem = items.getSelectedItem();
  items.delete(selectedItem.index);
};

window.openItemNative = items.openNative;

window.searchItems = () => {
  search.focus();
};

// Filter items with "search"
search.addEventListener('keyup', e => {
  // loop items
  Array.from(document.getElementsByClassName('read-item')).forEach(item => {
    // hide items that doesn't match with search
    let hasMatch = item.innerText.toLowerCase().includes(search.value);
    item.style.display = hasMatch ? 'flex' : 'none';
  });
});

// Navigation with up and down arrows
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    items.changeSelection(e.key);
  }
});

// disable and enable buttons
const toggleModalButtons = () => {
  if (addItem.disabled === true) {
    addItem.disabled = false;
    addItem.style.opacity = 1;
    addItem.innerText = 'Add item';
    closeModal.style.display = 'inline';
  } else {
    addItem.disabled = true;
    addItem.style.opacity = 0.5;
    addItem.innerText = 'Adding...';
    closeModal.style.display = 'none';
  }
};

showModal.addEventListener('click', e => {
  modal.style.display = 'flex';
  itemURL.focus();
});

closeModal.addEventListener('click', e => {
  modal.style.display = 'none';
});

addItem.addEventListener('click', e => {
  //check if url exists
  if (itemURL.value) {
    // Send new item to main process
    ipcRenderer.send('new-item', itemURL.value);
    // Disable modal buttons
    toggleModalButtons();
  }
});

ipcRenderer.on('new-item-success', (e, newItem) => {
  // Add item to "items" node
  items.addItem(newItem, true);

  // Enable modal buttons
  toggleModalButtons();

  // Hide modal and clear value;
  modal.style.display = 'none';

  itemURL.value = '';
});

itemURL.addEventListener('keyup', e => {
  if (e.key === 'Enter') addItem.click();
});
