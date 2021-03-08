// ==UserScript==
// @name         Mozilla web docs alternative pages
// @namespace    http://xvezda.com/
// @version      0.1
// @description  change page not created class links to search hyper links.
// @author       Xvezda
// @match        https://developer.mozilla.org/*/docs/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // Your code here...
  window.onload = function (evt) {
    var pageNotCreated = document.querySelectorAll('a.page-not-created');
    Array.prototype.forEach.call(pageNotCreated, function (el) {
      var locale = location.pathname.split('/')[1] || navigator.language;
      var searchText = el.textContent;
      var url = '/' + locale + '/search?q=' + encodeURIComponent(searchText) +
          '&locale=' + locale + '&locale=en-US';
      // Set link inline styles
      el.style.cursor = 'pointer';
      el.href = url;
    });
  };
})();

