"use strict";

(function() {
  $('#nav-bar').css('bottom',  1 - $('#nav-bar').height());

  $('#current-view').css('width', $(window).width());
  $('#current-view').css('height', $(window).height() - $('#top-bar').height());
  $('#current-view').css('top', $('#top-bar').height());
})();
