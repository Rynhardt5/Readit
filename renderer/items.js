const fs = require('fs');
const { shell } = require('electron');

let items = document.getElementById('items');

// Get readerJS contents
let readerJS;
fs.readFile(`${__dirname}/reader.js`, (err, data) => {
  readerJS = data.toString();
});

exports.getSelectedItem = () => {
  let currentItem = document.getElementsByClassName('read-item selected')[0];

  // Get item index
  let itemIndex = 0;
  let child = currentItem;
  while ((child = child.previousSibling) != null) itemIndex++;

  return { node: currentItem, index: itemIndex };
};

// Set item as selected
exports.select = e => {
  // remove currently selected item
  this.getSelectedItem().node.classList.remove('selected');

  e.currentTarget.classList.add('selected');
};

exports.changeSelection = direction => {
  // get selected item
  let currentItem = this.getSelectedItem().node;

  // handle up or down
  if (direction === 'ArrowUp' && currentItem.previousSibling) {
    currentItem.classList.remove('selected');
    currentItem.previousSibling.classList.add('selected');
  } else if (direction === 'ArrowDown' && currentItem.nextSibling) {
    currentItem.classList.remove('selected');
    currentItem.nextSibling.classList.add('selected');
  }
};

exports.openNative = () => {
  if (!this.storage.length) return;

  let selectedItem = this.getSelectedItem();

  shell.openExternal(selectedItem.node.dataset.url);
};

// Open selected item
exports.open = () => {
  // only if we have items
  if (!this.storage.length) return;

  // Get selected item
  let selectedItem = this.getSelectedItem();

  // get items url
  let contentURL = selectedItem.node.dataset.url;

  let readerWin = window.open(
    contentURL,
    '',
    `
    maxWidth=2000,
    maxHeight=2000,
    width=1200,
    height=800,
    backgroundColor=#DEDEDE,
    nodeIntegration=0,
    contextIsolation=1 
  `
  );

  // Inject javascript
  readerWin.eval(readerJS.replace('{{index}}', selectedItem.index));
};

// track items in storage
exports.storage = JSON.parse(localStorage.getItem('readit-items')) || [];

exports.delete = index => {
  // Remove item from dom, and storage
  items.removeChild(items.childNodes[index]);

  this.storage.splice(index, 1);

  this.save();

  if (this.storage.length) {
    let newSelectedItemIndex = items === 0 ? 0 : index - 1;

    document
      .getElementsByClassName('read-item')
      [newSelectedItemIndex].classList.add('selected');
  }
};

// Listen for "done message"
window.addEventListener('message', e => {
  //delete item at given index
  if (e.data.action === 'delete-reader-item') {
    // Delete item at given index
    this.delete(e.data.itemIndex);

    // close the reader window
    e.source.close();
  }
});

// Persist Storage
exports.save = () => {
  localStorage.setItem('readit-items', JSON.stringify(this.storage));
};

exports.addItem = (item, isNew = false) => {
  // Create a new dom node
  let itemNode = document.createElement('div');

  // Assign "read-item" class
  itemNode.setAttribute('class', 'read-item');

  // Set item url as data attribute
  itemNode.setAttribute('data-url', item.url);

  // Add innerHtml
  itemNode.innerHTML = `<img src="${item.screenshot}" /><h2>${item.title}</h2>`;

  items.appendChild(itemNode);

  // Attach event listener
  itemNode.addEventListener('click', this.select);

  // open an item dbclick
  itemNode.addEventListener('dblclick', this.open);

  // If this is the first item select it
  if (document.getElementsByClassName('read-item').length === 1) {
    itemNode.classList.add('selected');
  }

  // Add item to storage and presist
  if (isNew) {
    this.storage.push(item);
    this.save();
  }
};

// Add items from storage when app loads
this.storage.forEach(item => {
  this.addItem(item);
});
