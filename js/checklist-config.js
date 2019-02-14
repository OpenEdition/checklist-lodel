window.initChecklist = function (docId, context, publi) {
  if (window.checklist == null) return;

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
          attributes : {
            href: "./" + docId
          }
        },
        {
          title: {
            fr: "Éditer",
            en: "Edit"
          },
          icon: "<i class='fas fa-edit'></i>",
          attributes : {
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
          attributes : {
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
      },
      {
        id: "empty",
        icon: "<i class='far fa-question-circle'></i>",
        text: {
          fr: "Aucun test n'est prévu pour ce document.",
          en: "This document can not be checked."
        },
        color: "#999",
        bgcolor: "#eee"
      }
    ],

    // Fonction de calcul du rating affiché dans le report.
    // Prends les statements du report en paramètre et retourne un id de rating.
    computeRating: function (statements, report) {
      if (report.checksCount === 0) return "empty";
      var warning = false;
      for (var i=0; i < statements.length; i++) {
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
    rules: [
      {
        id: "multiple-legendeillustration",
        name: {
          fr: "Fractionnement de la légende"
        },
        description: {
          fr: "<p>La légende de chaque illustration doit tenir dans un unique paragraphe.</p>"
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var selector = ".legendeillustration + .legendeillustration";
          var flag = $(selector).length > 0;
          var statement = this.notify(flag);
          if (statement == null) {
            this.resolve();
          }
          statement.addMarker({
            name: {
              fr: "Fractionnement",
            },
            target: $(selector),
            position: "after"
          });
          this.resolve();
        }
      },
      {
        id: "remplir-pane",
        name: {
          fr: "Remplissage du pane"
        },
        condition: "textes",
        type: "info",
        action: function ($, bodyClasses) {
          for (var i=0; i<3; i++) {
            var statement = this.notify("Notification " + i);
          }
          this.resolve();
        }
      },
      {
        id: "test-publi",
        name: {
          fr: "Test sur les publications"
        },
        condition: "publications",
        type: "danger",
        action: function ($, bodyClasses) {
          this.resolve(true);
        }
      },
      {
        id: "test-timeout",
        name: {
          fr: "Test avec un timeout"
        },
        condition: "textes",
        type: "info",
        action: function ($, bodyClasses) {
          window.setTimeout(() => {
            this.resolve(true);
          }, 1000);
        }
      },
      // etc.
    ]
  })
  .then(function () {
    // Ne pas lancer automatiquement sur les publications.
    if (publi != null) return;
    return checklist.run();
  })
  .catch(console.error);
};
