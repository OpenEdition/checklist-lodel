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
  var homeUrl = location.protocol + "//" + location.host + location.pathname + "?do=_checklist_view&document=0";
  var $selects = $(".ckl-issues-filter");
  var $clearBtn = $(".ckl-issue-filters-clear");

  $selects.each(function() {
    if (this.value === "") return;
    $clearBtn.removeClass("hidden");
    return false;
  });

  $selects.on("change", function() {
    var url = homeUrl;
    $selects.each(function() {
      var key = this.dataset.filter;
      var value = this.value;
      if (!value) return;
      url = url + "&filter_" + key + "=" + value;
    });
    window.location.href = url;
  });

  $clearBtn.on("click", function() {
    window.location.href = homeUrl;
  });
});
