$(function () {
  if (window.checklist == null) return;

  // Intialisation de checklist
  window.checklist.init({
    // Définir le parent où l'UI sera intégré.
    // Si cette variable est vide, l'UI ne sera pas créée.
    parent: "body",

    // Prefixe des clés du localStorage
    // Sur Revues.org et OpenEdition Books, utiliser le nom court
    // TODO: utiliser ici le nom court du site
    namespace: "foobar",

    // Langue de l'interface
    lang: "fr",

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
        id: "bad",
        icon: "rating-bad",
        text: {
          fr: "Ce document contient des erreurs de composition.",
          en: "This document contains issues."
        },
        color: "#a94442",
        bgcolor: "#f2dede"
      },
      {
        id: "good",
        icon: "rating-good",
        text: {
          fr: "Ce document est correctement composé.",
          en: "This document is well formated."
        },
        color: "#31708f",
        bgcolor: "#d9edf7"
      },
      {
        id: "excellent",
        icon: "rating-excellent",
        text: {
          fr: "Ce document est très bien composé.",
          en: "This document is well formated"
        },
        color: "#3c763d",
        bgcolor: "#dff0d8"
      }
    ],

    // Fonction de calcul du rating affiché dans le report.
    // Prends les statements du report en paramètre et retourne un id de rating.
    computeRating: function (statements) {
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
    // TODO: calculer dynamiquement
    context: function ($) {
      return {
        "article": true,
        "textes": true,
        "publication": false,
        "motsclesfr": $(".motsclesfr .entry").length
      };
    },

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
          statement.addMarker({
            name: {
              fr: "Fractionnement",
            },
            target: $(selector),
            position: "after"
          });
          this.resolve();
        }
      }
      // etc.
    ]
  })
  .then(function () {
    checklist.run().then(function (checker) {
      console.log(checker);
      console.log("Exécution terminée !");
    });
  });
});
