// Checklist tools and initialisation
// ==================================

window.getField = function($, ...names) {
  var selectors = names.map(function(name) {
    return "[data-field='" + name + "'] .ckl-field-value";
  });
  return $(selectors.join(", "));
}

window.getFile = function($, ...types) {
  var selector = types.map(function(type) {
    return ".ckl-fichier-type:contains(" + type + ")";
  }).join(", ");
  var $type = $(selector);
  var $file = $type.siblings(".ckl-fichier-document").eq(0);
  return $file;
}

// Return true if filesize from field is greater than maxSizeMo
window.fileIsTooBig = function(fileinfo, maxSizeMo) {
  if (fileinfo == null) return false;
  var unit = fileinfo.charAt(fileinfo.length - 1);
  if (unit === "k") return false;
  var filesize = parseFloat(fileinfo.replace(",", "."));
  return filesize > maxSizeMo;
}

// http://stackoverflow.com/questions/990904/javascript-remove-accents-in-strings
window.latinize = function(str) {
  return str.normalize('NFKD').replace(/[\u0300-\u036f]/g, "");
};

// http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
window.deromanize = function(roman) {
  var roman = roman.toUpperCase().split(''),
    lookup = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 },
    num = 0, val = 0;
  while (roman.length) {
    val = lookup[roman.shift()];
    num += val * (val < lookup[roman[0]] ? -1 : 1);
  }
  return num;
}

window.isUpperCase = function(str){
  return str === str.toUpperCase();
}

window.isLowerCase = function(str) {
  return str === str.toLowerCase();
}

window.initChecklist = function ({ sitename, docId, lang, context, publi, showBatch, em }) {
  if (window.checklist == null || window.checklistRules == null) throw Error("checklist and rules are required");

  // Distinction index/document (cf #53)
  var isIndex = $(".ckl-main.ckl-index").length > 0;
  var thisDocumentFr = isIndex ? "Cet index" : "Ce document";
  var thisDocumentEn = isIndex ? "This index" : "This document";

  // Configuration de checklist
  var checklistConfig = {
    parent: "#ckl-pane",

    docId: docId,

    // Prefixe des clés du localStorage
    namespace: sitename,

    // Langues de l'interface. On utilise le sélecteur de langue de Lodel.
    langs: [{code: lang}],

    // Lien vers la home de Checklist
    homeHref: "?do=_checklist_view",

    // Boutons
    buttonsCreator: function (docId, context) {
      if (context.home) return;
      return [
        {
          title: {
            fr: "Voir côté Site",
            en: "View Online"
          },
          icon: "<i class='far fa-eye'></i>",
          attributes: {
            href: context.url || "./" + docId
          }
        },
        {
          title: {
            fr: "Éditer",
            en: "Edit"
          },
          icon: "<i class='fas fa-edit'></i>",
          attributes: {
            href: (
              context.publications || context.textes ?
                "./lodel/edition/index.php?do=view&id=" + docId :
                context.auteurs ?
                  "./lodel/admin/index.php?do=list&lo=persons&idtype=" + docId :
                  "./lodel/admin/index.php?do=list&lo=entries&idtype=" + docId
            ),
          }
        },
        {
          title: {
            fr: "Voir côté Édition",
            en: "View in Backoffice"
          },
          condition: "publications",
          icon: "<i class='fas fa-stream'></i>",
          attributes: {
            href: "./lodel/edition/index.php?id=" + docId
          }
        },
        showBatch ? 
        {
          title: {
            fr: "Exporter",
            en: "Export"
          },
          condition: "publications",
          icon: "<i class='fas fa-table'></i>",
          attributes: {
            href: "./?do=_checklist_view&view_tab=batch&input=" + docId
          }
        } : null,
        {
          title: {
            fr: "Réimporter la source",
            en: "Upload Source"
          },
          condition: "textes",
          icon: "<i class='fas fa-file-upload'></i>",
          attributes: {
            href: "./lodel/edition/oochargement.php?reload=1&identity=" + docId
          }
        },
        {
          title: {
            fr: "Télécharger la source",
            en: "Download Source"
          },
          condition: "textes && !extension-xml",
          icon: "<i class='far fa-file-word'></i>",
          attributes: {
            href: "./lodel/edition/index.php?do=download&type=source&id=" + docId
          }
        },
        {
          title: {
            fr: "Télécharger la source (XML)",
            en: "Download Source (XML)"
          },
          condition: "textes",
          icon: "<i class='far fa-file-code'></i>",
          attributes: {
            href: "./lodel/edition/index.php?do=download&type=tei&id=" + docId
          }
        }
      ];
    },

    // Liste des types utilisés dans les règles et configuration de leur affichage dans l'interface
    types: [
      {
        id: "danger",
        name: {
          fr: "Avertissements",
          en: "Danger"
        },
        color: "#e57373"
      },
      {
        id: "warning",
        name: {
          fr: "Recommandations",
          en: "Warning"
        },
        color: "#ffc107"
      },
      {
        id: "info",
        name: {
          fr: "Informations",
          en: "Information"
        },
        color: "#8bc34a"
      }
    ],

    // Liste des notes attribuées aux documents et configuration de leur affichage dans l'interface
    ratings: [
      {
        id: "excellent",
        icon: "<i class='far fa-laugh-wink '></i>",
        text: {
          fr: thisDocumentFr + " est très bien composé.",
          en: thisDocumentEn + " is very well formated."
        },
        color: "#292d32",
        bgcolor: "#c5e1a5"
      },
      {
        id: "good",
        icon: "<i class='far fa-smile'></i>",
        text: {
          fr: thisDocumentFr + " est correctement composé.",
          en: thisDocumentEn + " is well formated."
        },
        color: "#292d32",
        bgcolor: "#ffe082"
      },
      {
        id: "bad",
        icon: "<i class='far fa-meh'></i>",
        text: {
          fr: thisDocumentFr + " contient des erreurs de composition.",
          en: thisDocumentEn + " contains issues."
        },
        color: "#292d32",
        bgcolor: "#ef9a9a"
      }
    ],

    // Fonction de calcul du rating affiché dans le report.
    // Prends les statements du report en paramètre et retourne un id de rating.
    computeRating: function (statements, report) {
      var warning = false;
      for (var i = 0; i < statements.length; i++) {
        var statement = statements[i];
        var type = statement.type;
        if (type === "danger") return "bad";
        if (type === "warning") warning = true;
      }
      return warning ? "good" : "excellent";
    },

    // Fonction de création du contexte.
    context: context,

    // Informations sur la publication.
    publi: publi,

    // Liste des règles.
    // Pour la création des id, on respecte le format suivant si possible :
    // <nom du champ>:<objet du test>(<detail optionnel>)[<type optionnel>]
    rules: window.checklistRules
  };

  // Liste des filtres utilisés dans l'interface (OEJ seulement)
  if (em === "oej") {
    checklistConfig.filters = [
      {
        id: "tag-paper",
        name: {
          fr: "Publication papier",
          en: "Print"
        }
      }
    ];
  }

  // Traductions spécifiques selon le template.
  if (context.home) {
    checklistConfig.translations = {
      fr: {
        "toc-control-done": "Félicitations&nbsp;! Les " + (context.tab === "auteurs" ? "auteurs" : "index") + " ont été intégralement contrôlés.",
        "toc-control-info": "Cette page vous aide à vérifier la qualité des " + (context.tab === "auteurs" ? "auteurs" : "index") + " du site."
      },
      en: {
        "toc-control-done": "Congratulations! " + (context.tab === "auteurs" ? "Authors" : "Indexes") + " have been fully checked.",
        "toc-control-info": "This page helps you to check the quality of the website " + (context.tab === "auteurs" ? "authors" : "indexes") + "."
      }
    };

    if (context.tab === "issues") {
      checklistConfig.paneMessage = {
        fr: "Checklist est un outil de contrôle de la qualité des contenus de votre site. Utilisez cette page pour démarrer la vérification.",
        en: "Checklist is a quality control tool for your site. Use this page to start checking contents."
      }
    }
  }

  window.checklist.init(checklistConfig)
    .then(function () {
      if (context.textes || context.indexes || context.auteurs) {
        return checklist.run();
      }
      if (context.home) {
        $("[data-children-ids]").each(function() {
          var $target = $(this);
          var docIds = $target.attr("data-children-ids").split(/,\s*/);
          checklist.ui.createStackedbarFromCache($target, docIds);
        });
      }
    })
    .catch(console.error);
};
