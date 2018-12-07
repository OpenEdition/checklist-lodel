// Ajouter des ancres aux paragraphes
$(function () {
  $(".ckl-field-text > .ckl-field-value > p.texte").each(function (index) {
    var num = index + 1;
    $(this).attr("id", "p" + num);
  });
});
