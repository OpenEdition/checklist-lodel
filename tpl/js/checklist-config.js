window.initChecklist = function (sitename, docId, context, publi) {
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

  // http://stackoverflow.com/questions/990904/javascript-remove-accents-in-strings
  function latinize(str) {
    return str.normalize('NFKD').replace(/[\u0300-\u036f]/g, "");
  };

  // Intialisation de checklist
  window.checklist.init({
    parent: "#ckl-pane",

    docId: docId,

    // Prefixe des clés du localStorage
    namespace: sitename,

    // Langue de l'interface
    lang: "fr",

    // Boutons
    buttonsCreator: function (docId, context) {
      return [
        {
          title: {
            fr: "Voir en ligne",
            en: "View online"
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
        color: "#292d32",
        bgcolor: "#c5e1a5"
      },
      {
        id: "good",
        icon: "<i class='far fa-smile'></i>",
        text: {
          fr: "Ce document est correctement composé.",
          en: "This document is well formated."
        },
        color: "#292d32",
        bgcolor: "#ffe082"
      },
      {
        id: "bad",
        icon: "<i class='far fa-meh'></i>",
        text: {
          fr: "Ce document contient des erreurs de composition.",
          en: "This document contains issues."
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
    rules: [
      {
        id: "datepubli:existence",
        name: {
          fr: "Absence de la date de publication électronique",
        },
        description: {
          fr: "<p>Ce numéro ou ce document n’a pas de date de publication électronique. Cette information est obligatoire.</p><p>Voir : <a  href=\"http://www.maisondesrevues.org/84\">http://www.maisondesrevues.org/84</a></p>",
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
          fr: "<p>Ce numéro ou ce document n’a pas de date de publication papier. Cette information est obligatoire pour les revues ayant une édition papier.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/84\">http://www.maisondesrevues.org/84</a> et <a href=\"http://www.maisondesrevues.org/804#tocto1n4\">http://www.maisondesrevues.org/804#tocto1n4</a></p>",
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
          fr: "<p>Des sauts de ligne sont utilisés dans le titre ou le sous-titre de ce document ou de cette publication. Ils doivent constituer un seul paragraphe sans retour à la ligne.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/1295\">http://www.maisondesrevues.org/1295</a> et <a href=\"http://www.maisondesrevues.org/804#tocto1n4\">http://www.maisondesrevues.org/804#tocto1n4</a></p>",
        },
        condition: "publications || textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var $fields = getField($, "titre", "soustitre");
          var $bad = $fields.find("br");
          var marker = {
            name: {
              fr: "Saut de ligne",
            },
            target: $bad,
            position: "before"
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "images:existence",
        name: {
          fr: "Image non affichée",
        },
        description: {
          fr: "<p>Certaines images du document ne sont pas affichées dans Lodel. Cela peut être un problème de format d'image ou de structure du fichier source.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/155\">http://www.maisondesrevues.org/155</a></p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var $texte = getField($, "texte");
          var $bad = $texte.find("img")
            .filter(function() {
              return this.naturalWidth != null && this.naturalWidth === 0 && this.naturalHeight != null && this.naturalHeight === 0;
            })
            .add($texte.find("p:contains([Image non convertie])"));
          var marker = {
            name: {
              fr: "Image non affichée",
            },
            target: $bad,
            position: "append",
            highlight: true
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "imageaccroche:existence",
        name: {
          fr: "Pas de couverture",
        },
        description: {
          fr: "<p>La couverture est manquante. Il est conseillé d’ajouter une couverture aux numéros quand c’est possible.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/792\">http://www.maisondesrevues.org/792</a></p>",
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
          fr: "<p>Les couvertures doivent être aux formats JPG ou PNG.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/792\">http://www.maisondesrevues.org/792</a></p>",
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
          fr: "<p>La langue de cette publication ou de ce document est absente ou n'est pas reconnue. Elle est obligatoire.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/85\">http://www.maisondesrevues.org/85</a></p>",
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
          fr: "<p>Le fichier attaché en tant que fac-similé n’est pas un document PDF.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/612\">http://www.maisondesrevues.org/612</a></p>",
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
          fr: "<p>Le fichier attaché en tant que fac-similé n’est pas un document PDF.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/793\">http://www.maisondesrevues.org/793</a></p>",
        },
        condition: "textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var $field = getField($, "alterfichier");
          if ($field.length === 0) return this.resolve();
          var mime = $field.attr("data-document-mime");
          var flag = mime !== "application/pdf";
          this.resolve(flag);
        }
      },

      {
        id: "numero:existence",
        name: {
          fr: "Absence de la numérotation",
        },
        description: {
          fr: "<p>La numérotation du numéro n’est pas définie, elle est à renseigner dans le formulaire d’édition du numéro.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/804#tocfrom1n4\">http://www.maisondesrevues.org/804#tocfrom1n4</a></p>",
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
          var $headers = getField($, "texte").find(":header");
          var $bad = $titre.add($headers).find("a:not([href^='#'])");
          var marker = {
            name: {
              fr: "Lien hypertexte",
            },
            target: $bad,
            position: "append",
            highlight: true
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "imageaccroche:quality(size)",
        name: {
          fr: "Couverture de taille insuffisante",
        },
        description: {
          fr: "<p>La couverture est de taille insuffisante. Elle doit mesurer au moins 1400 pixels de large.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/792\">http://www.maisondesrevues.org/792</a></p>",
        },
        condition: "publications",
        type: "info",
        action: function ($, bodyClasses) {
          var $cover = getFile($, "couverture1");
          if ($cover.length === 0) return this.resolve();
          var width = $cover.attr("data-document-imagewidth");
          this.resolve(width < 1400);
        }
      },

      {
        // TODO: possibilite de merger cette regle avec title:quality(br) et d'utiliser un statement alternatif pour changer le type affiché.
        id: "headings:quality(br)",
        name: {
          fr: "Saut de ligne dans un intertitre ou titre alternatif",
        },
        description: {
          fr: "<p>Des sauts de lignes sont présents dans les intertitres ou les titres alternatifs, ils doivent être supprimés.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/1303?lang=en#tocto1n2\">http://www.maisondesrevues.org/1303?lang=en#tocto1n2</a></p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var $intertitres = getField($, "texte").find(":header");
          var $headers = getField($, "altertitre").find(".ckl-field-ml-value");
          var $bad = $intertitres.add($headers).find("br");
          var marker = {
            name: {
              fr: "Saut de ligne",
            },
            target: $bad,
            position: "before",
            highlight: true
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "texte:quality(paragraph-lowercase)",
        name: {
          fr: "Caractère minuscule en début de paragraphe",
        },
        description: {
          fr: "<p>Certains paragraphes commencent par une minuscule.</p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var $p = getField($, "texte").find("p").not(".citation, .paragraphesansretrait, blockquote, ol, ul, li, table, table *");
          
          var $bad = $p.filter(function() {
            var text = $(this).text();
            if (text.length < 2) return false;

            var sub = text.substring(0, 2);
            var isList = /[\/.):–—-]/.test(sub[1]);
            if (isList) return false;
            
            var lowerCase = sub[0].toLowerCase();
            var upperCase = sub[0].toUpperCase();
            return sub[0] === lowerCase && lowerCase !== upperCase;
          });
          var marker = {
            name: {
              fr: "Minuscule",
            },
            target: $bad,
            position: "prepend"
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "texte:quality(quote-style)",
        name: {
          fr: "Mauvais style de citation",
        },
        description: {
          fr: "<p>Certains paragraphes sont peut-être des citations non stylées.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/1303#tocto1n3\">http://www.maisondesrevues.org/1303#tocto1n3</a></p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var $p = getField($, "texte").find("p.texte");
          var $bad = $p.filter(function () {
            var text = $(this).text();
            return text.charAt(0).match(/[«"“]/) && text.slice(-50).match(/[”"»]/);
          });
          var marker = {
            name: {
              fr: "Citation",
            },
            target: $bad,
            position: "prepend"
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "texte:quality(list-style)",
        name: {
          fr: "Listes mal formatées",
        },
        description: {
          fr: "<p>Certains paragraphes sont peut-être des listes mal formatées.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/91\">http://www.maisondesrevues.org/91</a></p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var $p = getField($, "texte").children();
          var prevIndex = -1;
          var lists = [];
          var re = /^([0-9A-z]{1,3}(?=[\/.):–—‑-])|[•●∙◊–—>-](?= ))/;

          $p.each(function (index) {
            // Exclude some elements
            if ($(this).is(":not(p), .titreillustration")) return false;

            // Match bullets to test their existence
            var text = $(this).text();
            var match = text.match(re);
            if (match == null) return;
            
            // Group lists depending on element index
            var isNewList = lists.length === 0 || index > prevIndex + 1;
            if (isNewList) {
              lists.push([$(this)]);
            } else {
              lists[lists.length - 1].push($(this));
            }
            prevIndex = index;
          });
          
          // Ignore lists which contains a single item
          var $bad = lists.reduce(function ($bad, list) {
            if (list.length < 2) return $bad;
            var $list = list.reduce(jQuery.merge);
            return $bad.add($list);
          }, $());

          var marker = {
            name: {
              fr: "Liste",
            },
            target: $bad,
            position: "prepend"
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "texte:quality(unknown-styles)",
        name: {
          fr: "Styles inconnus utilisés",
        },
        description: {
          fr: "<p>Des styles dans votre document source n'ont pas été reconnus. Certains éléments n'ont peut-être pas été interprétés correctement par Lodel. Merci de reprendre votre fichier source et d'appliquer les styles adéquats.</p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var styles = "p.remerciements, p.texte, p.paragraphesansretrait, p.creditillustration, p.crditsillustration, p.epigraphe, p.citation, p.citationbis, p.citationter, p.titreillustration, p.legendeillustration, p.question, p.reponse, p.separateur, p.encadre, p.code, p.notesbaspage, p.mathml, p.latex, p.mathlatex";
          var $bad = getField($, "texte").children("p").not(styles);

          if ($bad.length === 0) return this.resolve();

          var statement = this.notify($bad.length);
          $bad.each(function () {
            var $el = $(this);
            var classname = $el.attr("class");
            statement.addMarker({
              name: {
                fr: "Style inconnu&nbsp: " + classname,
              },
              target: $el,
              position: "prepend"
            });
          });
          this.resolve();
        }
      },

      {
        id: "texte:quality(notes-numbering)",
        name: {
          fr: "Incohérence dans la numérotation des notes",
        },
        description: {
          fr: "<p>La numérotation des notes de bas de page et notes de fin du document ne suit pas un ordre logique.</p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          function getBad (fieldName) {
            var $p = getField($, fieldName).children("p");
            if ($p.length === 0) return $();
            var firstNum = 0;
            return $p.filter(function (index) {
              var $a = $(this).children("a[id^=ftn]").first();
              var num = parseInt($a.text());
              if (index === 0) {
                firstNum = num;
                return false;
              }
              return num !== index + firstNum;
            });
          }

          var $bad = getBad("notesbaspage").add(getBad("notefin"));
          var marker = {
            name: {
              fr: "Numérotation incohérente",
            },
            target: $bad,
            position: "prepend",
            highlight: true
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "title:quality(ponctuation)",
        name: {
          fr: "Ponctuation à la fin du titre ou d’un intertitre",
        },
        description: {
          fr: "<p>Un ou plusieurs intertitres du document se terminent par un signe de ponctuation, ce qui n’est pas typographiquement correct.</p>",
        },
        condition: "textes",
        type: "info",
        action: function ($, bodyClasses) {
          var $titre = getField($, "titre");
          var $headers = getField($, "texte").find(":header");
          var $bad = $titre.add($headers).filter(function () {
            var text = $(this).text().trim();
            return text.match(/[^\.:;=, ]{2,}[\.:;=,]$/) // Ne pas matcher les mots d'une seule lettre suivies d'un point
          });
          var marker = {
            name: {
              fr: "Ponctuation",
            },
            target: $bad,
            position: "append"
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "texte:quality(champs)",
        name: {
          fr: "Champs ou liens parasites",
        },
        description: {
          fr: "<p>Le document source contient des codes de champs, des signets ou des liens internes qui doivent être supprimés.</p>",
        },
        condition: "textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var $field = getField($, "texte");

          // Links
          var $bad = $field.find("a[href ^= '#id_']");

          // Orphan Text and Elements
          var allowedTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "ol", "ul", "pre", "address", "blockquote", "dl", "div", "hr", "table"];
          $field.contents().each(function () {
            var isElement = this.nodeType === 1;
            var isText = this.nodeType === 3;
            var isEmptyText = isText && this.textContent.trim() === "";
            var isBlock = isElement && allowedTags.indexOf(this.tagName.toLowerCase()) !== -1;
            if ((!isElement && !isText) || isEmptyText || isBlock) return;

            var $prev = $(this).prev(".ckl-orphan");
            if ($prev.length > 0) {
              $(this).appendTo($prev);
              return;
            }
            $(this).wrap("<div class='ckl-orphan'></div>");
          });

          var $bad = $bad.add($field.find(".ckl-orphan"));
          var marker = {
            name: {
              fr: "Champ ou lien parasite",
            },
            target: $bad,
            position: "prepend",
            highlight: true
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "index:quality(format)",
        name: {
          fr: "Composition des index",
        },
        description: {
          fr: "<p>Certaines entrées d’index ne sont peut-être pas correctement composées.</p><p>Voir <a href='http://www.maisondesrevues.org/804'>http://www.maisondesrevues.org/804</a></p>",
        },
        condition: "publications || textes || indexes",
        type: "warning",
        action: function ($, bodyClasses) {
          var re = /( [-–—.-] |[;,] |[/\\]|\.$)/g;
          var $bad = $(".ckl-entry").filter(function () {
            var text = $(this).text().trim();
            return text.match(re) != null;
          });
          var marker = {
            name: {
              fr: "Composition",
            },
            target: $bad,
            position: "append"
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "summary:quality",
        name: {
          fr: "Hiérarchie du plan incohérente",
        },
        description: {
          fr: "<p>Les intertitres du document ne se suivent pas hiérarchiquement. Il ne faut pas utiliser un intertitre de deuxième niveau (“Titre 2”) qui ne suivrait pas un intertitre de premier niveau (“Titre 1”).</p><p>Voir : <a href=\"http://www.maisondesrevues.org/90\">http://www.maisondesrevues.org/90</a></p>",
        },
        condition: "textes",
        type: "danger",
        action: function ($, bodyClasses) {
          var $li = $(".ckl-a-toc ul li");
          var $bad = $li.filter(function () {
            var level = Number($(this).attr("data-toc-level"));
            if (level === 1) return false;
            var $parent = $(this).parents("li[data-toc-level='" + (level - 1) + "']");
            return $parent.length !== 1;
          });
          var marker = {
            name: {
              fr: "Hiérarchie incohérente",
            },
            target: $bad,
            position: "prepend",
            highlight: true
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "index:quality(duplicates)",
        name: {
          fr: "Vérifier les doublons d’index",
        },
        description: {
          fr: "<p>Certaines entrées d’index sont peut-être des doublons. Nous vous conseillons de renseigner les mots-clés au singulier et en minuscule lorsqu'il s'agit de noms communs.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/221\">http://www.maisondesrevues.org/221</a></p>",
        },
        condition: "indexes || auteurs",
        type: "warning",
        action: function ($, bodyClasses) {
          var list = {};
          $(".ckl-entry").each(function () {
            var id = latinize($(this).text()).replace(/\W/g, "").toLowerCase();
            list[id] = list[id] ? list[id].add($(this)) : $(this);
          });
          
          var $bad = Object.keys(list).reduce(function ($res, id) {
            if (list[id].length > 1) {
              $res = $res.add(list[id]);
            }
            return $res;
          }, $());

          var marker = {
            name: {
              fr: "Doublon",
            },
            target: $bad,
            position: "append",
            highlight: true
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "author:quality(format)",
        name: {
          fr: "Format de nom d’auteur",
        },
        description: {
          fr: "<p>Certains noms d’auteurs ne respectent pas le format attendu ou contiennent des caractères inconnus. Les noms doivent être composés en minuscules avec une majuscule initiale.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/222\">http://www.maisondesrevues.org/222</a></p>",
        },
        condition: "publications || textes || indexes || auteurs",
        type: "warning",
        action: function ($, bodyClasses) {
          var forbiddenChars = /[0-9!#%*,/\:;?@\[\]_\{\}]/g
          var $bad = $(".ckl-personne").filter(function () {
            var firstname = $(this).find(".ckl-personne-firstname").text().trim();
            var familyname = $(this).find(".ckl-personne-familyname").text().trim();
            if (!firstname || !familyname) return true;
            var text = latinize(firstname + familyname);           
            return text === text.toUpperCase() || text[0] === text[0].toLowerCase || text.match(forbiddenChars);
          });
          var marker = {
            name: {
              fr: "Mauvais format de nom",
            },
            target: $bad,
            position: "prepend",
            highlight: true
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "links:quality",
        name: {
          fr: "Lien(s) à vérifier",
        },
        description: {
          fr: "<p>Certains liens semblent incorrects. Vérifiez notamment que les URL ne contiennent pas de marques de ponctuation indésirables (point final, virgule, etc.).</p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          function isValidURL (url) {
            var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
            return regex.test(url) && url.trim().substr(-1).match(/[).,;\]]/) === null;
          }

          var $a = $(".ckl-content p a[href]:not(.footnotecall, .endnotecall, .FootnoteSymbol, .EndnoteSymbol, [href^=mailto])");
          var $bad = $a.filter(function () {
            var url = $(this).attr("href");
            return !isValidURL(url);
          });

          var marker = {
            name: {
              fr: "Lien à vérifier",
            },
            target: $bad,
            position: "append",
            highlight: true
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "note:quality(point)",
        name: {
          fr: "Note précédée par un point",
        },
        description: {
          fr: "<p>Une ou plusieurs notes de bas de page commencent par un point. Il est recommandé de le supprimer.</p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var $notes  = getField($, "notesbaspage", "notefin").find("p");
          var $bad = $notes.filter(function () {
            var $clone = $(this).clone();
            $clone.children("a[id^=ftn]").remove();
            var text = $clone.text();
            return /^\s*\./.test(text);
          });

          var marker = {
            name: {
              fr: "Point à supprimer",
            },
            target: $bad,
            position: "prepend"
          };
          this.resolve($bad.length, marker);
        }
      },

      {
        id: "facsimile:quality(filesize)[publications]",
        name: {
          fr: "Fac-similé de poids trop important",
        },
        description: {
          fr: "<p>Le poids du fac-similé PDF de la publication n'est pas adapté pour une bonne diffusion. Nous recommandons de charger des PDF de 30 Mo maximum.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/612\">http://www.maisondesrevues.org/612</a></p>",
        },
        condition: "publications",
        type: "warning",
        action: function ($, bodyClasses) {
          var maxFilesize = 30;
          var $file = getFile($, "facsimile");
          if ($file.length === 0) return this.resolve();
          var filesize = parseInt($file.attr("data-document-filesize"));
          this.resolve(filesize > maxFilesize);
        }
      },

      {
        id: "facsimile:quality(filesize)[textes]",
        name: {
          fr: "Fac-similé de poids trop important",
        },
        description: {
          fr: "<p>Le poids du fac-similé PDF du document n'est pas adapté pour une bonne diffusion. Nous recommandons de charger des PDF de 10 Mo maximum.</p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var maxFilesize = 10;
          var $facsimile = getField($, "alterfichier");
          if ($facsimile.length === 0) return this.resolve();
          var filesize = parseInt($facsimile.attr("data-document-filesize"));
          this.resolve(filesize > maxFilesize);
        }
      },

      {
        id: "facsimile:existence[publications]",
        name: {
          fr: "Absence du fac-similé",
        },
        description: {
          fr: "<p>Aucun fac-similé PDF n’est associé à cette publication. Un PDF sera automatiquement généré. Si vous souhaitez qu'un PDF composé par vos soins soit diffusé, vous devez l'attacher à cette publication. Il doit s'agir du PDF final, sans traits de coupe ni hirondelles.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/612\">http://www.maisondesrevues.org/612</a></p>",
        },
        condition: "publications",
        type: "info",
        tags: ["paper"],
        action: function ($, bodyClasses) {
          // TODO: fusionner avec facsimile:quality(filesize) ?
          var $file = getFile($, "facsimile");
          if ($file.length === 0) return this.resolve(true);
          var filesize = parseInt($file.attr("data-document-filesize"));
          this.resolve(filesize === 0);
        }
      },

      {
        id: "facsimile:existence[textes]",
        name: {
          fr: "Absence du fac-similé",
        },
        description: {
          fr: "<p>Aucun fac-similé PDF n’est associé à ce document. Un PDF sera automatiquement généré. Si vous souhaitez qu'un PDF composé par vos soins soit diffusé, vous devez l'attacher à ce document. Il doit s'agir du PDF final, sans traits de coupe ni hirondelles.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/793\">http://www.maisondesrevues.org/793</a></p>",
        },
        condition: "textes",
        type: "info",
        tags: ["paper"],
        action: function ($, bodyClasses) {
          // TODO: fusionner avec facsimile:quality(filesize) ?
          var $facsimile = getField($, "alterfichier");
          if ($facsimile.length === 0) return this.resolve(true);
          var filesize = parseInt($facsimile.attr("data-document-filesize"));
          this.resolve(filesize === 0);
        }
      },

      {
        id: "pagination:existence",
        name: {
          fr: "Absence de pagination",
        },
        description: {
          fr: "<p>Si le document existe en version imprimée il est fortement recommandé d’en préciser la pagination au format attendu. Cette métadonnée génère la citation bibliographique papier.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/1295\">http://www.maisondesrevues.org/1295</a></p>",
        },
        condition: "textes",
        type: "info",
        tags: ["paper"],
        action: function ($, bodyClasses) {
          var $pagination = getField($, "pagination");
          var flag = $pagination.length === 0 || $pagination.text().length === 0;
          this.resolve(flag);
        }
      },

      {
        id: "pagination:quality",
        name: {
          fr: "Erreur de pagination",
        },
        description: {
          fr: "<p>La pagination de la version papier n’est pas correctement renseignée, le format attendu est page de début-page de fin, exemple 12-72.</p><p>Voir : <a href=\"http://www.maisondesrevues.org/1295\">http://www.maisondesrevues.org/1295</a></p>",
        },
        condition: "textes",
        type: "warning",
        tags: ["paper"],
        action: function ($, bodyClasses) {
          var $pagination = getField($, "pagination");
          if ($pagination.length === 0) return this.resolve();
          var text = $pagination.text().trim();
          var flag = (!/^[a-z0-9]+(-[a-z0-9]+)?$/.test(text));
          this.resolve(flag);
        }
      },

      {
        id: "souspartie:quality",
        name: {
          fr: "Sous-partie vide",
        },
        description: {
          fr: "<p>Le sommaire de la publication inclut une ou plusieurs sous-parties qui ne contiennent aucun document. Cette construction est incorrecte.</p>",
        },
        condition: "publications",
        type: "danger",
        action: function ($, bodyClasses) {
          // FIXME: add marker "Sous-partie vide" in publication
          var $bad = $(".checklist-toc-section-contents:empty");
          this.resolve($bad.length);
        }
      },

      {
        id: "bibliography:quality(nom-auteur)",
        name: {
          fr: "Absence de nom d'auteur dans une entrée bibliographique",
        },
        description: {
          fr: "<p>Un tiret remplace le nom de l'auteur déjà cité dans l'entrée précédente : cela pose problème pour le moissonage de Bilbo.</p> <p>Voir : <a href='http://www.maisondesrevues.org/680'>http://www.maisondesrevues.org/680</a></p>",
        },
        condition: "textes",
        type: "warning",
        action: function ($, bodyClasses) {
          var dashes = /^\s?[\-\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A\u2E3B\u2E40\u301C\u3030\u30A0\uFE31\uFE32\uFE58\uFE63\uFF0D\u005F\u02CD\u0331\u0332\u2017\uFF3F]/u;
          var $biblio = getField($, "bibliographie");
          var $bad = $biblio.find("p").filter(function () {
            return dashes.test($(this).text());
          });

          var marker = {
            name: {
              fr: "Tirets",
            },
            target: $bad,
            position: "prepend",
            highlight: true
          };
          this.resolve($bad.length, marker);
        }
      }
    ]
  })
    .then(function () {
      // Ne pas lancer automatiquement sur les publications.
      if (publi != null) return;
      return checklist.run();
    })
    .catch(console.error);
};
