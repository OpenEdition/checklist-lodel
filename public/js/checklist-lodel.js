$(function () {
  // Ne pas numéroter les images + ajouter des ancres aux paragraphes
  $(".ckl-field-text > .ckl-field-value > p.texte").each(function (index) {
    var isImage = $(this).find("img").length === 1 && $(this).text().trim() === "";
    if (isImage) {
      $(this).attr("data-numbering", "false");
      return;
    }

    var num = index + 1;
    $(this).attr("id", "p" + num);
  });

  // Largetable
  $(".ckl-field-text table").largetable();
});
