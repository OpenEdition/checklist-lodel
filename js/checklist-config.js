window.initChecklist = function (docId, context, publi) {
  if (window.checklist == null) return;

  // NOTE: ES2016 here
  function getField($, ...names) {
    var selectors = names.map(function(name) {
      return "[data-field='" + name + "'] .ckl-field-value";
    });
    return $(selectors.join(", "));
  }

  // NOTE: ES2016 here
  function getFile($, ...types) {
    var selector = types.map(function(type) {
      return ".ckl-fichier-type:contains(" + type + ")";
    }).join(", ");
    var $type = $(selector);
    var $file = $type.siblings(".ckl-fichier-document").eq(0);
    return $file;
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

      {
        id: "datepublipapier:existence",
        name: {
          fr: "Absence de la date de publication papier",
        },
        description: {
          fr: "<p>Ce numéro ou ce document n’a pas de date de publication papier. Cette information est obligatoire pour les revues ayant une édition papier.</p>",
        },
        condition: "publications || textes",
        type: "danger",
        tags: ["paper"],
        action: function ($, bodyClasses) {
          var field = getField($, "datepublipapier").text();
          var flag = !field || field.length === 0 || field === "0000-00-00";
          this.resolve(flag);
        }
      },

      {
        id: "title:quality(br)",
        name: {
          fr: "Saut de ligne dans le titre ou le sous titre",
        },
        description: {
          fr: "<p>Des sauts de ligne sont utilisés dans le titre ou le sous-titre de ce document ou de cette publication. Ils doivent constituer un seul paragraphe sans retour à la ligne.</p>",
        },
        condition: "publications || textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var $fields = getField($, "titre", "soustitre");
          var $br = $fields.find("br");
          var flag = $br.length > 0;
          var statement = this.notify(flag);
          if (statement) {
            statement.addMarker({
              name: {
                fr: "Saut de ligne",
              },
              target: $br,
              position: "before"
            });
          }
          this.resolve();
        }
      },

      {
        id: "images:quality",
        name: {
          fr: "Image non affichée",
        },
        description: {
          fr: "<p>Certaines images du document ne sont pas affichées dans Lodel. Cela peut être un problème de format d'image ou de structure du fichier source.</p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var $fields = getField($, "texte");
          var $broken = $fields.find("p:contains([Image non convertie])");
          var flag = $broken.length > 0;
          var statement = this.notify(flag);
          if (statement) {
            statement.addMarker({
              name: {
                fr: "Image non affichée",
              },
              target: $broken,
              position: "after"
            });
          }
          this.resolve();
        }
      },

      {
        id: "imageaccroche:existence",
        name: {
          fr: "Pas de couverture",
        },
        description: {
          fr: "<p>La couverture est manquante. Il est conseillé d’ajouter une couverture aux numéros quand c’est possible.</p>",
        },
        condition: "publications",
        type: "info",
        tags: ["paper"],
        action: function ($, bodyClasses) {
          var $coverType = $(".ckl-fichier-type:contains(imageaccroche), .ckl-fichier-type:contains(couverture1)");
          if ($coverType.length > 1) return this.reject("More than 1 cover file was found.");
          this.resolve($coverType.length === 0);
        }
      },

      {
        id: "imageaccroche:quality",
        name: {
          fr: "La couverture n'est pas au format attendu",
        },
        description: {
          fr: "<p>Les couvertures doivent être aux formats JPG ou PNG.</p>",
        },
        condition: "publications",
        type: "info",
        tags: ["paper"],
        action: function ($, bodyClasses) {
          var $cover = getFile($, "imageaccroche", "couverture1");
          if ($cover.length === 0) return this.resolve();
          var mime = $cover.attr("data-document-mime");
          var flag = mime !== "image/jpeg" && mime !== "image/png";
          this.resolve(flag);
        }
      },

      {
        id: "texte:existence",
        name: {
          fr: "Pas de texte dans le document",
        },
        description: {
          fr: "<p>Le document ne contient pas de texte courant. Tout le contenu de la publication doit être disponible dans tous les formats, y compris le HTML.</p>",
        },
        condition: "textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var text = getField($, "texte").text().trim();
          var flag = text.length === 0;
          this.resolve(flag);
        }
      },

      {
        id: "title:existence",
        name: {
          fr: "Document sans titre",
        },
        description: {
          fr: "<p>La métadonnée « Titre » des publications et documents est obligatoire.</p>",
        },
        condition: "publications || textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var titre = getField($, "titre").text().trim();
          var flag = titre.length === 0 || titre === "Document sans titre";
          this.resolve(flag);
        }
      },

      {
        id: "lang:existence",
        name: {
          fr: "Absence de la métadonnée de langue",
        },
        description: {
          fr: "<p>La langue de cette publication ou de ce document est absente ou n'est pas reconnue. Elle est obligatoire.</p>",
        },
        condition: "publications || textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var text = getField($, "langue").text().trim();
          var flag = text.length === 0;
          this.resolve(flag);
        }
      },

      {
        id: "facsimile:quality(format)[publications]",
        name: {
          fr: "Fac-similé non PDF",
        },
        description: {
          fr: "<p>Le fichier attaché en tant que fac-similé n’est pas un document PDF.</p>",
        },
        condition: "publications",
        type: "danger",
        action: function ($, bodyClasses) {
          var $file = getFile($, "facsimile");
          if ($file.length !== 1) return this.resolve();
          var mime = $file.attr("data-document-mime");
          var flag = mime !== "application/pdf";
          this.resolve(flag);
        }
      },

      {
        id: "facsimile:quality(format)[textes]",
        name: {
          fr: "Fac-similé non PDF",
        },
        description: {
          fr: "<p>Le fichier attaché en tant que fac-similé n’est pas un document PDF.</p>",
        },
        condition: "textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var $field = getField($, "alterfichier");
          if ($field.length === 0) return this.resolve();
          var mime = $field.attr("data-facsimile-mime");
          var flag = mime !== "image/application/pdf";
          this.resolve(flag);
        }
      },

      {
        id: "numero:existence",
        name: {
          fr: "Absence de la numérotation",
        },
        description: {
          fr: "<p>La numérotation du numéro n’est pas définie, elle est à renseigner dans le formulaire d’édition du numéro.</p>",
        },
        condition: "publications",
        type: "danger",
        action: function ($, bodyClasses) {
          var $field = getField($, "numero");
          var flag = !$field || $field.length === 0 || $field.text().trim() === "";
          this.resolve(flag);
        }
      },

      {
        id: "title:quality(href)",
        name: {
          fr: "Lien hypertexte dans le titre ou dans un intertitre",
        },
        description: {
          fr: "<p>Des liens hypertextes se trouvent dans le titre ou les intertitres du document, il faut les supprimer.</p>",
        },
        condition: "textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var $titre = getField($, "titre");
          var $intertitres = getField($, "texte").find(":header");
          var $both = $titre.add($intertitres);
          var $links = $both.find("a:not([href^='#'])");
          var flag = $links.length > 0;
          var statement = this.notify(flag);
          if (statement) {
            statement.addMarker({
              name: {
                fr: "Lien hypertexte",
              },
              target: $links,
              position: "after"
            });
          }
          this.resolve();
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
