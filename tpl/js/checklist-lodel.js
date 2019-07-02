$(function () {
  // Ajouter des ancres aux paragraphes
  $(".ckl-field-text > .ckl-field-value > p.texte").each(function (index) {
    var num = index + 1;
    $(this).attr("id", "p" + num);
  });

  // Largetable
  $(".ckl-field-text table").largetable();
});
