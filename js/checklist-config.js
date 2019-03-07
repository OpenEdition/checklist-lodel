window.initChecklist = function (docId, context, publi) {
  if (window.checklist == null) return;

  // NOTE: ES2016 here
  function getField($, ...names) {
    var selectors = names.map(function (name) {
      return "[data-field='" + name + "'] .ckl-field-value";
    });
    return $(selectors.join(", "));
  }

  // Intialisation de checklist
  window.checklist.init({
    parent: "#ckl-pane",

    docId: docId,

    // Prefixe des clés du localStorage
    // TODO: utiliser ici le nom court du site
    namespace: "foobar",

    // Langue de l'interface
    lang: "fr",

    // Boutons
    buttonsCreator: function (docId, context) {
      return [
        {
          title: {
            fr: "Voir",
            en: "View"
          },
          icon: "<i class='far fa-eye'></i>",
          attributes: {
            href: "./" + docId
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
            fr: "Parcourir",
            en: "Browse"
          },
          condition: "publications",
          icon: "<i class='fas fa-stream'></i>",
          attributes: {
            href: "./lodel/edition/index.php?id=" + docId
          }
        },
        {
          title: {
            fr: "Réimporter la source",
            en: "Upload source"
          },
          condition: "textes",
          icon: "<i class='fas fa-file-upload'></i>",
          attributes: {
            href: "./lodel/edition/oochargement.php?reload=1&identity=" + docId
          }
        },
        {
          title: {
            fr: "Télécharger la source au format .doc",
            en: "Download source in .doc"
          },
          condition: "textes",
          icon: "<i class='far fa-file-word'></i>",
          attributes: {
            href: "./lodel/edition/index.php?do=download&type=source&id=" + docId
          }
        },
        {
          title: {
            fr: "Télécharger la source au format XML TEI",
            en: "Download XML"
          },
          condition: "textes",
          icon: "<i class='far fa-file-code'></i>",
          attributes: {
            href: "./lodel/edition/index.php?do=download&type=source&id=" + docId
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
        color: "#ed5740"
      },
      {
        id: "warning",
        name: {
          fr: "Recommandations",
          en: "Warning"
        },
        color: "#f8d14c"
      },
      {
        id: "info",
        name: {
          fr: "Informations",
          en: "Information"
        },
        color: "#3d9cdf"
      }
    ],

    // Liste des filtres utilisés dans l'interface
    filters: [
      {
        id: "tag-paper",
        name: {
          fr: "Publication papier",
          en: "Print"
        }
      }
    ],

    // Liste des notes attribuées aux documents et configuration de leur affichage dans l'interface
    ratings: [
      {
        id: "excellent",
        icon: "<i class='far fa-laugh-wink '></i>",
        text: {
          fr: "Ce document est très bien composé.",
          en: "This document is well formated"
        },
        color: "#3c763d",
        bgcolor: "#dff0d8"
      },
      {
        id: "good",
        icon: "<i class='far fa-smile'></i>",
        text: {
          fr: "Ce document est correctement composé.",
          en: "This document is well formated."
        },
        color: "#31708f",
        bgcolor: "#d9edf7"
      },
      {
        id: "bad",
        icon: "<i class='far fa-meh'></i>",
        text: {
          fr: "Ce document contient des erreurs de composition.",
          en: "This document contains issues."
        },
        color: "#a94442",
        bgcolor: "#f2dede"
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
    rules: [
      {
        id: "datepubli:existence",
        name: {
          fr: "Absence de la date de publication électronique",
        },
        description: {
          fr: "<p>Ce numéro ou ce document n’a pas de date de publication électronique. Cette information est obligatoire.</p>",
        },
        condition: "publications || textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var field = getField($, "datepubli").text();
          var flag = !field || field.length === 0 || field === "0000-00-00";
          this.resolve(flag);
        }
      },

    ]
  })
  .then(function () {
    // Ne pas lancer automatiquement sur les publications.
    if (publi != null) return;
    return checklist.run();
  })
  .catch(console.error);
};
