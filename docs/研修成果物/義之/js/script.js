//ハンバーガーメニュー
$(function(){
    $('.hamburger-menu').on('click', function() {
      $(this).toggleClass('hamburger-menu-active');
      $('.sp').toggleClass('is-active');
    })
  })