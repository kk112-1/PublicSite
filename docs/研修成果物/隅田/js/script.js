$(function(){
  //上スライド
  $("#drawer-toggle").click(function(){
    $(this).toggleClass("open");
    $("#global-nav").slideToggle("open");
  });


});