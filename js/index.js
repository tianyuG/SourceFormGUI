const { ipcRenderer, remote } = require('electron')
var purify = require('dompurify')
var selectAll = false

/*
 * On-screen keyboard
 */

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
  } else if ($target.is("input#searchfield") && selectAll) {
    $target.select();
  }
});

// When coming back from an unsuccessful search, select all text
ipcRenderer.once('select-all-input', (event, message) => {
  $("#searchfield").val(message);
  selectAll = true;
})

/*
 * Search bar
 */

// Commit search queries
$(document).keydown(function(event) {
  if ($target.is("input#searchfield") &&
    event.key === 'Enter') {
    var cleaned = purify.sanitize(document.getElementById('searchfield').value, { SAFE_FOR_TEMPLATES: true })
    console.log(cleaned)
    if (cleaned !== '') {
      ipcRenderer.send('search-committed', cleaned)
    }
  }
});

/*
 * Carousel
 */

// Initialise carousel
var carousel = new Swiper('.swiper-container', {
  direction: 'horizontal',
  autohight: true,
  pagination: {
    el: '.swiper-pagination',
  },
  slidesPerView: 3,
  // centeredSlides: true, // DO NOT use, doesn't work as intended
  // slideToClickedSlide: true, // DO NOT use, doesn't work as intended
  loop: true,
  // DEBUG: Comment the next four lines to disable autoplay
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  }
});

// Show the description for the image in the centre of the carousel
// This works with a carousel that shows three slides at a time
// This is because the looping actually creates phantom slides... 
carousel.on('slideChange', function() {
  logDebug("Carousel - slideChange detected with { previousIndex, activeIndex } == { " + carousel.previousIndex + ", " + carousel.activeIndex + " }.")
  if (Math.abs(carousel.previousIndex - carousel.activeIndex) > 1) {
    logDebug("Carousel: slideChange wrapped around. ignoring.")
  } else if (carousel.previousIndex < carousel.activeIndex) {
    carousel.slides[carousel.activeIndex].getElementsByClassName("swiper-slide-alt")[0].style.display = "none";
    carousel.slides[carousel.activeIndex + 1].getElementsByClassName("swiper-slide-alt")[0].style.display = "block";
    carousel.slides[carousel.activeIndex + 2].getElementsByClassName("swiper-slide-alt")[0].style.display = "none";
  } else {
    carousel.slides[carousel.previousIndex - 1].getElementsByClassName("swiper-slide-alt")[0].style.display = "none";
    carousel.slides[carousel.previousIndex].getElementsByClassName("swiper-slide-alt")[0].style.display = "block";
    carousel.slides[carousel.previousIndex + 1].getElementsByClassName("swiper-slide-alt")[0].style.display = "none";
  }
});

carousel.on('tap', function() {
  logDebug("Carousel - tap received with { activeIndex, clickedIndex } == { " + carousel.activeIndex + ", " + carousel.clickedIndex + " }.")

  if (carousel.activeIndex - carousel.clickedIndex == 0) {
    logDebug("Carousel - tap: clicked on previous slide.")
    carousel.slidePrev()
  } else if (carousel.activeIndex - carousel.clickedIndex == -2) {
    logDebug("Carousel - tap: clicked on next slide.")
    carousel.slideNext()
  } else if (carousel.activeIndex - carousel.clickedIndex == -1) {
    logDebug("Carousel - tap: clicked on the centre slide.")
    // TODO: Load this premade model
  } else {
    logDebug("Carousel - tap: this should not happen...")
  }
});

// Read `../carousel/content.json` and populate the carousel accordingly. 
function populateCarousel() {

}