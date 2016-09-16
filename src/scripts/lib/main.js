var $ = require('jQuery')
var debounce = require('throttle-debounce').debounce

var window = global

function windowScrollOnHashChange () {
  // code to make the window scroll smoothly on hash change move back by
  var navHeight = $('#navbar-main').outerHeight() + 20
  var scrollHash = function (event) {
    window.scrollBy(0, -navHeight)
  }
  if (window.hash) scrollHash()
  $(window).on('hashchange', scrollHash)
}

function toggleMinimalMenuBar () {
  // show and hide the menu bar background/logo depending on whether the main logo is showing

  var mainLogo = $('#header-logo')
  var nav = $('#navbar-main')
  if (!mainLogo.length) {
    nav.removeClass('nav-minimal')
    return
  }
  var logoOffset, navOffset
  function calculateOffsets () {
    logoOffset = mainLogo.offset().top + (mainLogo.outerHeight() / 2)
    navOffset = nav.offset().top + nav.outerHeight()
  }
  function setNavClasses () {
    if (navOffset < logoOffset) {
      nav.addClass('nav-minimal')
    } else {
      nav.removeClass('nav-minimal')
    }
  }
  function run () {
    calculateOffsets()
    setNavClasses()
  }
  run()
  $(document).ready(run)
  $(document).scroll(debounce(100, run))
  $(document).resize(debounce(100, run))
  nav.mouseover(function () { nav.removeClass('nav-minimal') })
  nav.mouseout(run)
}

$('document').ready(function () {
  windowScrollOnHashChange()
  toggleMinimalMenuBar()
})
