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
  $(".ckl-field-text table").largetable({ enableMaximize: true });

  // Filtres de la home
  var $selects = $(".ckl-issues-filter");
  $selects.on("change", function() {
    var url = location.protocol + "//" + location.host + location.pathname + "?do=_checklist_view&document=0";
    $selects.each(function() {
      var key = this.dataset.filter;
      var value = this.value;
      if (!value) return;
      url = url + "&filter_" + key + "=" + value;
    });
    window.location.href = url;
  });
});
