const { ipcRenderer } = require('electron')

// Define a key to hide the keyboard
$.fn.keyboard_custom_keys['^hidekey$'] = {
  render: function(kb, $key, modifier) {
    $key.text('hide');
  },
  handler: function(kb, $key) {
    kb.hide();
    document.getElementById('searchfield').blur()
  }
}
// Define the left arrow key (move caret one character to the left)
$.fn.keyboard_custom_keys['^leftarrow$'] = {
  render: function(kb, $key, modifier) {
    $key.text('←');
  },
  handler: function(kb, $key) {
    var box = document.getElementById('searchfield')
    var caret = box.selectionStart
    box.setSelectionRange(caret - 1, caret - 1)
  }
}
// Define the right arrow key (move caret one character to the right)
$.fn.keyboard_custom_keys['^rightarrow$'] = {
  render: function(kb, $key, modifier) {
    $key.text('→');
  },
  handler: function(kb, $key) {
    var box = document.getElementById('searchfield')
    var caret = box.selectionStart
    box.setSelectionRange(caret + 1, caret + 1)
  }
}

$.fn.keyboard_custom_keys['^enterIcon$'] = {
  render: function(kb, $key, modifier) {
    $key.text('\u23ce');
    $key.addClass('action enter');
  },
  handler: function(kb, $key) {
    return '\r';
  }
}

$.fn.keyboard_custom_keys['^shiftIcon$'] = {
  render: function(kb, $key, modifier) {
    $key.text('\u21e7');
    $key.addClass('action shift');
  },
  handler: function(kb, $key) {
    kb.toggleLayout();
    return null;
  }
}

// Load keyboard
var keyboard = $('input:text').keyboard({
  // theme: 'theme-black',
  layout: {
    'normal': [
      '1 2 3 4 5 6 7 8 9 0 {backspace}',
      ['q w e r t y u i o p {sp:1}'],
      ['{sp:2} a s d f g h j k l \' {enterIcon}'],
      ['{shiftIcon} {sp:1} z x c v b n m . {sp:2}'],
      ['{hidekey} {sp:1} {space} {sp:1} {leftarrow} {rightarrow}']
    ],
    'shift': [
      '1 2 3 4 5 6 7 8 9 0  {backspace}',
      ['Q W E R T Y U I O P {sp:1}'],
      ['{sp:2} A S D F G H J K L " {enterIcon}'],
      ['{shiftIcon} {sp:1} Z X C V B N M ? {sp:2}'],
      ['{hidekey} {sp:1} {space} {sp:1} {leftarrow} {rightarrow}']
    ]
  }
});

// Hide virtual keyboard if user clicked outside of its container
$(document).click(function(event) {
  $target = $(event.target);
  if (!$target.is("input#searchfield") &&
    !$target.closest('.virtual-keyboard').length &&
    $('.virtual-keyboard').is(":visible")) {
    $('.virtual-keyboard').hide();
  }
});

// Commit search queries
$(document).keydown(function(event) {
  if ($target.is("input#searchfield") &&
    event.key === 'Enter' && document.getElementById('searchfield').value !== '') {
    console.log(document.getElementById('searchfield').value)
    ipcRenderer.send('search-query', document.getElementById('searchfield').value)
  }
})