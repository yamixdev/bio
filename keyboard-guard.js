'use strict';

document.addEventListener('keydown', (event) => {
  if (event.key === 'F12' && event.cancelable) event.preventDefault();
}, { capture: true });
