import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor() { }

}


// ///////////////////////////////////////////////////////////////
// disregard everything below. Simple crap tests


// document.addEventListener('paste', (e) => {

//   console.log(e.clipboardData);
//   console.log(e.clipboardData.items);

//   console.log('--------------------------------');
//   console.log('items');

//   const itemsCount = e.clipboardData.items.length;
//   console.log('items', itemsCount);
//   for (let i = 0; i < itemsCount; i++) {
//     console.log('ITEM', e.clipboardData.items[i]);
//   }

//   console.log('--------------------------------');
//   console.log('files');

//   const filesCount = e.clipboardData.files.length;
//   console.log('files', filesCount);
//   for (let i = 0; i < filesCount; i++) {
//     console.log('FILE', i, e.clipboardData.files.item(i));
//   }

//   console.log('--------------------------------');
//   console.log('getData');

//   console.log('text/plain', e.clipboardData.getData('text'));
//   console.log('text/html', e.clipboardData.getData('text/html'));
//   console.log('image/png', e.clipboardData.getData('image/png'));



// let files = {};
// if (window.clipboardData) { // IE
//   files = window.clipboardData.files;
// } else {
//   files = e.clipboardData.files;
// }
// });










// function checkPageFocus() {
//   if (document.hasFocus()) {
//     console.log('FOCUS');
//   } else {
//     console.log('NOT focus');
//   }
// }

// // Check page focus every 300 milliseconds
// setInterval(checkPageFocus, 300);
