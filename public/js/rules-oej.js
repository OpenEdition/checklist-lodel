// OEJ rules
// =========

window.checklistRules = [
  {
    id: "texte:quality(unexpected-tags)",
    name: {
      fr: "Balises indésirables",
      en: "Unwanted tags"
    },
    description: {
      fr: "<p>Il existe des balises HTML indésirables dans les métadonnées du volume (comme <code>&lt;div&gt;</code> ou <code>&lt;iframe&gt;</code>). Elles peuvent bloquer la génération du PDF et de l’ePub mais aussi nuire à l’affichage web.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/872\">Coller sans mise en forme et balises indésirables dans les formulaires Lodel</a></p>",
      en: "<p>There are unwanted HTML tags in the volume metadata (such as <code>&lt;div&gt;</code> or <code>&lt;iframe&gt;</code>). They can block the generation of the PDF and ePub but also interfere with the web display.</p>"
    },
    condition: "publications",
    type: "danger",
    displayCount: true,
    action: function ($) {
      var $fields = getField($, "introduction", "description", "ndlr", "resume", "extrait");
      var $bad = $fields.find("iframe, div:not([class^='ckl-'])");
      this.resolve($bad.length);
    }
  },

  {
    id: "title:quality(uppercase)",
    name: {
      fr: "Titre en majuscules",
      en: "Title in uppercase"
    },
    description: {
      fr: "<p>Les titres tout en majuscules sont une mauvaise pratique et posent des problèmes d’accessibilité, il est conseillé d’utiliser les majuscules seulement en début de phrase et sur les noms propres.</p>",
      en: "<p>Headings in all uppercase are bad practice and cause accessibility problems, it is advisable to use uppercase only at the beginning of sentences and on proper names.</p>"
    }, 
    condition: "textes",
    type: "warning",
    action: function ($) {
      var $titre = getField($, "titre");
      var titre = $titre.text().trim();
      var flag = titre === titre.toUpperCase();
      var marker = {
        name: {
          fr: "Majuscules",
          en: "Uppercase"
        },
        target: $titre,
        position: "append",
        highlight: true
      };
      this.resolve(flag, marker);
    }
  },

  {
    id: "titreillustration:quality(position)",
    name: {
      fr: "Titre illustration sans illustration",
      en: "Illustration title without any illustration"
    },
    description: {
      fr: "<p>Un ou plusieurs titres d’illustrations ne sont pas suivis, comme attendu, par une illustration, un tableau ou un média embarqué. L’ordre recommandé pour les métadonnées portant sur les illustrations, tableau et média embarqué est le suivant&nbsp;: titre, illustration, légende, crédits. Il est important de respecter cet ordre pour la bonne génération de la table des illustrations et pour des raisons d’accessibilité.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/638\">Traitement des images</a></p>",
      en: "<p>One or several illustration titles aren’t followed by an illustration, table or embedded media, as should be expected. The recommended order for illustration metadata is: title, illustration, caption, credits. It is important to respect this order for the proper generation of the table of illustrations and for accessibility reasons.</p>"
    },
    condition: "textes",
    type: "warning",
    displayCount: true,
    action: function ($) {
      var hasTags = function($el, tags) {
        return tags.some(function(tag) {
          return $el.is(tag) || ($el.find(tag).length > 0);
        });
      };

      var $bad = $(".titreillustration").filter(function() {
        if ($(this).is("div")) return true;
        var $next = $(this).next();
        var isValid = hasTags($next, ["img", "table", "iframe", "object", "embed"]);
        return !isValid;
      });

      var marker = {
        name: {
          fr: "Position",
          en: "Position"
        },
        target: $bad,
        position: "prepend",
        highlight: true
      };

      this.resolve($bad.length, marker);
    }
  },

  {
    id: "descriptionauteur:existence",
    name: {
      fr: "Description d’auteur manquante",
      en: "Missing author description"
    },
    description: {
      fr: "<p>Il est recommandé d’ajouter une description d’auteur si elle existe. Attention à bien utiliser la fonction \"Coller sans mise en forme\" afin de ne pas importer de mise en forme ou balise problématiques.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/872\">Coller sans mise en forme et balises indésirables dans les formulaires Lodel</a></p>",
      en: "<p>It is recommended to add an author description if it exists. Be careful to use the \"Paste without formatting\" function so as not to import problematic formatting or tags.</p>"
    },
    condition: "publications",
    type: "warning",
    action: function ($) {
      var $fields = getField($, "auteur", "directeurdelapublication", "editeurscientifique", "traducteur");
      var $personnes = $fields.find(".ckl-personne");
      var $descriptions = $fields.find(".ckl-personne-description");
      var flag = $personnes.length - $descriptions.length;
      this.resolve(flag);
    }
  },

  {
    id: "datepubli:existence",
    name: {
      fr: "Absence de la date de publication électronique",
      en: "Missing date of online publication"
    },
    description: {
      fr: "<p>Ce numéro ou ce document n’a pas de date de publication électronique. Cette information est obligatoire.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/44\">Créer un numéro dans Lodel</a> ou <a href=\"https://objs-fr.hypotheses.org/49\">Styler les métadonnées de l’article</a></p>",
      en: "<p>This issue or document has no date of online publication . This information is required.</p>"
    },
    condition: "publications || textes",
    type: "danger",
    action: function ($) {
      var field = getField($, "datepubli").text();
      var flag = !field || field.length === 0 || field === "0000-00-00";
      this.resolve(flag);
    }
  },

  {
    id: "datepublipapier:existence",
    name: {
      fr: "Absence de la date de publication papier",
      en: "Missing date of publication (print edition)"
    },
    description: {
      fr: "<p>Ce numéro ou ce document n’a pas de date de publication papier. Cette information est obligatoire pour les revues ayant une édition papier.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/44\">Créer un numéro dans Lodel</a>",
      en: "<p>This issue or document has no date of publication. This information is required for journals with a paper edition.</p>"
    },
    condition: "(publications || textes) && !numeroouvert",
    type: "danger",
    tags: ["paper"],
    action: function ($) {
      var $field = getField($, "datepublipapier");
      var date = $field.text();
      var flag = $field.length === 0 || date.length === 0 || date === "0000-00-00";
      var marker = {
        name: {
          fr: "Date vide",
          en: "Empty date"
        },
        target: $field,
        position: "after",
        highlight: $field
      };
      this.resolve(flag, marker);
    }
  },

  {
    id: "images:quality(size)",
    name: {
      fr: "Taille ou poids d'images trop important",
      en: "Image size or weight too large"
    },
    description: {
      fr: "<p>L’unité éditoriale comporte des illustrations dont la résolution est trop grande (nous recommandons de ne pas dépasser 7&nbsp;millions de pixels) ou le poids est trop important (dépasse 5&nbsp;Mo).</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/731\">Précis de stylage</a></p>",
      en: "<p>In this document, there are some illustrations which are either too large in resolution (we recommend not exceeding 7&nbsp;million pixels) or too large in size (exceeding 5&nbsp;MB).</p>"
    },
    condition: "textes",
    type: "warning",
    action: function ($) {
      var maxSize = 5;
      var maxResolution = 7000000;

      var badFiles = [];
      
      $(".ckl-image").each(function() {
        var src = this.dataset.imageSrc;

        var size = this.dataset.imageSize;
        if (fileIsTooBig(size, maxSize)) {
          return badFiles.push(src);
        };

        var width = Number(this.dataset.imageWidth);
        var height = Number(this.dataset.imageWidth);
        var resolution = width * height;
        if (resolution > maxResolution) {
          return badFiles.push(src);
        };
      });

      var contextIsArticle = $($.root).is("body");
      if (!contextIsArticle) {
        return this.resolve(badFiles.length);
      }

      var $textes = getField($, "texte", "annexe", "bibliographie", "notesbaspage", "notefin");
      var $img = $textes.find("img");
      var $bad = $img.filter(function() {
        var smallSrc = this.src;
        return badFiles.some(function(badSrc) {
          var sourceSrc = smallSrc.replace(/^.*(docannexe\/.*)(-small\d*)(\.[A-z0-9]+$)/, "$1$3");
          return sourceSrc === badSrc;
        });
      });

      var marker = {
        name: {
          fr: "Image trop grande",
          en: "Image too big"
        },
        target: $bad,
        position: "after",
        highlight: true
      };
      this.resolve($bad.length, marker);
    }
  },

  {
    id: "title:quality(br)",
    name: {
      fr: "Saut de ligne dans le titre ou le sous titre",
      en: "Line break in title or subtitle"
    },
    description: {
      fr: "<p>Des sauts de ligne sont utilisés dans le titre ou le sous-titre de ce document ou de cette publication. Ils doivent constituer un seul paragraphe sans retour à la ligne.</p><p>Voir </p><ul><li><a href=\"https://objs-fr.hypotheses.org/49\">Styler les métadonnées de l’article</a></li><li><a href=\"https://objs-fr.hypotheses.org/44\">Créer un numéro dans Lodel</a></li></ul>",
      en: "<p>Line breaks must be removed from the title or subtitle of this document or publication.</p>"
    },
    condition: "publications || textes",
    type: "danger",
    displayCount: true,
    action: function ($) {
      var $fields = getField($, "titre", "soustitre");
      var $bad = $fields.find("br");
      var marker = {
        name: {
          fr: "Saut de ligne",
          en: "Line break"
        },
        target: $bad,
        position: "before",
        highlight: $bad.parent()
      };
      this.resolve($bad.length, marker);
    }
  },

  {
    id: "images:existence",
    name: {
      fr: "Image non affichée",
      en: "Image not displayed"
    },
    description: {
      fr: "<p>Certaines images du document ne sont pas affichées dans Lodel. Cela peut être un problème de format d'image ou de structure du fichier source.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/638\">Traitement des images</a></p>",
      en: "<p>Some images of the document are not displayed by Lodel. This may be an issue with image format or structure of the source file.</p>"
    },
    condition: "textes",
    type: "danger",
    displayCount: true,
    action: function ($) {
      var $phpFileExistsIndicators = $("[data-image-exists='0']");
      var $imagesNonConverties = $(".image_error");

      var $textes = getField($, "texte", "annexe", "bibliographie", "notesbaspage", "notefin");
      var $img = $textes.find("img");
      var $imagesUnsupportedExt = $img.filter(function() {
        var src = $(this).attr("src");
        var re = /\.(jpg|jpeg|png|gif|svg)$/i;
        return !re.test(src);
      });

      var count = $imagesNonConverties.length + $phpFileExistsIndicators.length + $imagesUnsupportedExt.length;
      
      var contextIsArticle = $($.root).is("body");
      if (!contextIsArticle) {
        return this.resolve(count);
      }

      var badSrc = [];
      $phpFileExistsIndicators.each(function() {
        var src = $(this).attr("data-image-src");
        if (badSrc.indexOf(src) > -1) return;
        badSrc.push(src);
      });

      var $bad = $img.filter(function() {
        var src = $(this).attr("src");
        return badSrc.indexOf(src) > -1;
      })
      .add($imagesNonConverties)
      .add($imagesUnsupportedExt);

      var marker = {
        name: {
          fr: "Image non affichée",
          en: "Image not displayed"
        },
        target: $bad,
        position: "after",
        highlight: true
      };
      this.resolve(count, marker);
    }
  },

  {
    id: "imageaccroche:existence",
    name: {
      fr: "Pas de couverture",
      en: "Missing cover"
    },
    description: {
      fr: "<p>La couverture est manquante. Il est conseillé d’ajouter une couverture aux numéros quand c’est possible.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/257\">Ajouter une couverture de numéro de revue</a></p>",
      en: "<p>Cover is missing. It is recommended to attach covers to issues when possible.</p>"
    },
    condition: "publications && !numeroouvert",
    type: "info",
    tags: ["paper"],
    action: function ($) {
      var $coverType = $(".ckl-fichier-type:contains(imageaccroche), .ckl-fichier-type:contains(couverture1)");
      this.resolve($coverType.length === 0);
    }
  },

  {
    id: "imageaccroche:duplicate",
    name: {
      fr: "Plusieurs couvertures",
      en: "Too many covers"
    },
    description: {
      fr: "<p>Plusieurs couvertures sont associées à cette publication. Seule une couverture doit être ajoutée.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/257\">Ajouter une couverture de numéro de revue</a></p>",
      en: "<p>Several covers are joined to this publication. Only a single cover should be.</p>"
    },
    condition: "publications",
    type: "info",
    action: function ($) {
      var $coverType = $(".ckl-fichier-type:contains(imageaccroche), .ckl-fichier-type:contains(couverture1)");
      this.resolve($coverType.length > 1);
    }
  },

  {
    id: "imageaccroche:quality",
    name: {
      fr: "La couverture n'est pas au format attendu",
      en: "Cover is not in the expected format"
    },
    description: {
      fr: "<p>Les couvertures doivent être aux formats JPG ou PNG.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/257\">Ajouter une couverture de numéro de revue</a></p>",
      en: "<p>Covers must be in JPG or PNG formats.</p>"
    },
    condition: "publications && !numeroouvert",
    type: "info",
    tags: ["paper"],
    action: function ($) {
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
      en: "Missing body text"
    },
    description: {
      fr: "<p>Le document ne contient pas de texte courant. Tout le contenu de la publication doit être disponible dans tous les formats, y compris le HTML.</p>",
      en: "<p>Document contains no body text. The whole content of the publication should be available in all formats, including HTML.</p>"
    },
    condition: "textes",
    type: "danger",
    action: function ($) {
      var text = getField($, "texte").text().trim();
      var flag = text.length === 0;
      this.resolve(flag);
    }
  },

  {
    id: "title:existence",
    name: {
      fr: "Document sans titre",
      en: "Untitled document"
    },
    description: {
      fr: "<p>La métadonnée « Titre » des publications et documents est obligatoire.</p>",
      en: "<p>“Title” metadata is required in publications and documents.</p>"
    },
    condition: "publications || textes",
    type: "danger",
    action: function ($) {
      var $titre = getField($, "titre");
      var titre = $titre.text().trim();
      var flag = titre.length === 0 || titre === "Document sans titre";
      var marker = {
        name: {
          fr: "Document sans titre",
          en: "Untitled document"
        },
        target: $titre,
        position: "append",
        highlight: true
      };
      this.resolve(flag, marker);
    }
  },

  {
    id: "lang:existence",
    name: {
      fr: "Absence de la métadonnée de langue",
      en: "Missing language metadata"
    },
    description: {
      fr: "<p>La langue de cette publication ou de ce document est absente ou n'est pas reconnue. Elle est obligatoire.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/44\">Créer un numéro dans Lodel</a> et <a href=\"https://objs-fr.hypotheses.org/49\">Styler les métadonnées de l’article</a></p>",
      en: "<p>The language of this issue or document is missing or not recognized. It is required.</p>"
    },
    condition: "publications || textes",
    type: "danger",
    action: function ($) {
      var text = getField($, "langue").text().trim();
      var flag = text.length === 0;
      this.resolve(flag);
    }
  },

  {
    id: "facsimile:quality(format)[publications]",
    name: {
      fr: "Fac-similé non PDF",
      en: "Facsimile is not a PDF"
    },
    description: {
      fr: "<p>Le fichier attaché en tant que fac-similé n’est pas un document PDF.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/268\">Comment importer le fac-similé de son numéro</a></p>",
      en: "<p>The file attached as a facsimile is not a PDF document.</p>"
    },
    condition: "publications",
    type: "danger",
    action: function ($) {
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
      en: "Facsimile is not a PDF"
    },
    description: {
      fr: "<p>Le fichier attaché en tant que fac-similé n’est pas un document PDF.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/268\">Comment importer le fac-similé d’un article</a></p>",
      en: "<p>The file attached as a facsimile is not a PDF document.</p>"
    },
    condition: "textes",
    type: "danger",
    action: function ($) {
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
      en: "Missing issue number"
    },
    description: {
      fr: "<p>La numérotation du numéro n’est pas définie, elle est à renseigner dans le formulaire d’édition du numéro.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/44\">Créer un numéro dans Lodel</a></p>",
      en: "<p>Issue number is not defined. It must be filled in the publication edit form.</p>"
    },
    condition: "publications",
    type: "danger",
    action: function ($) {
      var $field = getField($, "numero");
      var flag = !$field || $field.length === 0 || $field.text().trim() === "";
      this.resolve(flag);
    }
  },

  {
    id: "title:quality(href)",
    name: {
      fr: "Lien hypertexte dans le titre ou dans un intertitre",
      en: "Hyperlink in the title or a heading"
    },
    description: {
      fr: "<p>Des liens hypertextes se trouvent dans le titre ou les intertitres du document, il faut les supprimer.</p>",
      en: "<p>There are hyperlinks in the title or the headings of the document. They must be removed.</p>"
    },
    condition: "textes",
    type: "danger",
    displayCount: true,
    action: function ($) {
      var $titre = getField($, "titre");
      var $headers = getField($, "texte").find(":header");
      var $bad = $titre.add($headers).find("a:not([href^='#'])");
      var marker = {
        name: {
          fr: "Lien hypertexte",
          en: "Hyperlink"
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
      en: "Small cover"
    },
    description: {
      fr: "<p>La couverture est de taille insuffisante. Elle doit mesurer au moins 1400 pixels de large.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/257\">Ajouter une couverture de numéro de revue</a></p>",
      en: "<p>Cover is too small. It must be at least 1400 pixels wide.</p>"
    },
    condition: "publications",
    type: "info",
    action: function ($) {
      var $cover = getFile($, "couverture1");
      if ($cover.length === 0) return this.resolve();
      var width = $cover.attr("data-document-imagewidth");
      this.resolve(width < 1400);
    }
  },

  {
    id: "headings:quality(br)",
    name: {
      fr: "Saut de ligne dans un intertitre ou titre alternatif",
      en: "Line break in a heading or translated title"
    },
    description: {
      fr: "<p>Des sauts de lignes sont présents dans les intertitres ou les titres alternatifs, ils doivent être supprimés.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/51\">Styler un texte</a></p>",
      en: "<p>Line breaks must be removed from headings or translated titles.</p>"
    },
    condition: "textes",
    type: "warning",
    displayCount: true,
    action: function ($) {
      var $intertitres = getField($, "texte").find(":header");
      var $headers = getField($, "altertitre").find(".ckl-field-ml-value");
      var $bad = $intertitres.add($headers).find("br");
      var marker = {
        name: {
          fr: "Saut de ligne",
          en: "Line break"
        },
        target: $bad,
        position: "before",
        highlight: $bad.parent()
      };
      this.resolve($bad.length, marker);
    }
  },

  {
    id: "texte:quality(paragraph-lowercase)",
    name: {
      fr: "Caractère minuscule en début de paragraphe",
      en: "Lowercase character at the beginning of a paragraph"
    },
    description: {
      fr: "<p>Certains paragraphes commencent par une minuscule.</p>",
      en: "<p>Some paragraphs start with a lowercase letter.</p>"
    },
    condition: "textes",
    type: "warning",
    displayCount: true,
    action: function ($) {
      var $p = getField($, "texte").find("p").not(".citation, .citationbis, .citationter, .paragraphesansretrait");
      
      var $bad = $p.filter(function() {
        if ($(this).parent("li, td, blockquote").length > 0) return;

        var text = $(this).text().trim();
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
          en: "Lowercase"
        },
        target: $bad,
        position: "prepend",
        highlight: true
      };
      this.resolve($bad.length, marker);
    }
  },

  {
    id: "texte:quality(quote-style)",
    name: {
      fr: "Mauvais style de citation&nbsp;?",
      en: "Bad quote style?"
    },
    description: {
      fr: "<p>Certains paragraphes sont peut-être des citations non stylées.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/51\">Styler un texte</a></p>",
      en: "<p>Some paragraphs may be unstyled quotes.</p>"
    },
    condition: "textes",
    type: "warning",
    displayCount: true,
    action: function ($) {
      var $p = getField($, "texte").find("p.texte");
      var $bad = $p.filter(function () {
        var text = $(this).text();
        return text.charAt(0).match(/[«"“]/) && text.slice(-50).match(/[”"»]/);
      });
      var marker = {
        name: {
          fr: "Citation",
          en: "Quote"
        },
        target: $bad,
        position: "prepend",
        highlight: true
      };
      this.resolve($bad.length, marker);
    }
  },

  {
    id: "texte:quality(list-style)",
    name: {
      fr: "Listes mal formatées",
      en: "Unformated lists"
    },
    description: {
      fr: "<p>Certains paragraphes sont peut-être des listes mal formatées.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/731\">Précis de stylage</a></p>",
      en: "<p>Some paragraphs may be poorly formatted lists.</p>"
    },
    condition: "textes",
    type: "warning",
    displayCount: true,
    action: function ($) {
      var $p = getField($, "texte").children();
      var prevIndex = -1;
      var lists = [];
      var re = /^((?:[IVXLCDMivxlcdm0-9]{1,3}|[A-z])(?=[\/.):–—‑-])|[•●∙◊–—>-])/;

      $p.each(function (index) {
        // Exclude some elements
        if ($(this).is(":not(p), .titreillustration")) return;

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
          en: "List"
        },
        target: $bad,
        position: "prepend",
        highlight: true
      };
      this.resolve($bad.length, marker);
    }
  },

  {
    id: "texte:quality(unknown-styles)",
    name: {
      fr: "Styles inconnus utilisés",
      en: "Unknown styles"
    },
    description: {
      fr: "<p>Des styles dans votre document source n'ont pas été reconnus. Certains éléments n'ont peut-être pas été interprétés correctement par Lodel. Merci de reprendre votre fichier source et d'appliquer les styles adéquats.</p>",
      en: "<p>Document contains unexpected styles. Some elements may not have been interpreted correctly by Lodel. Please fix the related source file by applying correct styles.</p>"
    },
    condition: "textes",
    type: "warning",
    action: function ($) {
      var allowed = {
        texte: "p.remerciements, p.texte, p.paragraphesansretrait, p.creditillustration, p.crditsillustration, p.epigraphe, p.citation, p.citationbis, p.citationter, p.titreillustration, p.legendeillustration, p.question, p.reponse, p.separateur, p.encadre, p.code, p.mathml, p.latex, p.mathlatex",
        annexe: "p.annexe, p.creditillustration, p.crditsillustration, p.citation, p.citationbis, p.citationter, p.titreillustration, p.legendeillustration",
        bibliographie: "p.bibliographie, p.creditillustration, p.crditsillustration, p.citation, p.citationbis, p.citationter, p.titreillustration, p.legendeillustration",
        notesbaspage: "p.notesbaspage, p.notefin, p.creditillustration, p.crditsillustration, p.citation, p.citationbis, p.citationter, p.titreillustration, p.legendeillustration",
        notefin: "p.notesbaspage, p.notefin, p.creditillustration, p.crditsillustration, p.citation, p.citationbis, p.citationter, p.titreillustration, p.legendeillustration"
      };

      var $bad = $();
      Object.keys(allowed).forEach(function (fieldname) {
        var styles = allowed[fieldname];
        var $els = getField($, fieldname).children("p").not(styles);
        $bad = $bad.add($els);
      });

      var statement = this.notify($bad.length);
      $bad.each(function () {
        var $el = $(this);
        var classname = $el.attr("class");
        statement.addMarker({
          name: {
            fr: classname ? "Style inconnu&nbsp: " + classname : "Style inconnu",
            en: classname ? "Unknown style: " + classname : "Unknown style",
          },
          target: $el,
          position: "prepend",
          highlight: true
        });
      });
      this.resolve();
    }
  },

  {
    id: "texte:quality(notes-numbering)",
    name: {
      fr: "Incohérence dans la numérotation des notes",
      en: "Inconsistent note numbering"
    },
    description: {
      fr: "<p>La numérotation des notes de bas de page et notes de fin du document ne suit pas un ordre logique.</p>",
      en: "<p>The numbering of footnotes and endnotes does not follow a logical order.</p>"
    },
    condition: "textes",
    type: "warning",
    action: function ($) {
      function getBad(fieldName) {
        var $p = getField($, fieldName).children("p");
        if ($p.length === 0) return $();
        var i = -1;
        var firstNum = 0;
        var listIsRoman;
        var getNum = function(value) {
          return listIsRoman ? deromanize(value) : parseInt(value);
        };

        return $p.filter(function () {
          var $a = $(this).find("a[id^=ftn]").first();
          if ($a.length === 0) return false;
          i++;
          var value = $a.text();
          if (i === 0) {
            listIsRoman = /^[IVXLCDM]+$/i.test(value);
            firstNum = getNum(value);
            return false;
          }
          return getNum(value) !== i + firstNum;
        });
      }

      var $bad = getBad("notesbaspage").add(getBad("notefin"));
      var marker = {
        name: {
          fr: "Numérotation incohérente",
          en: "Inconsistent numbering"
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
      en: "Punctuation at the end of title or heading",
    },
    description: {
      fr: "<p>Un ou plusieurs intertitres du document se terminent par un signe de ponctuation, ce qui n’est pas typographiquement correct.</p>",
      en: "<p>One or more headings of the document end with a punctuation mark, which is not typographically correct.</p>"
    },
    condition: "textes",
    type: "info",
    displayCount: true,
    action: function ($) {
      var $titre = getField($, "titre");
      var $headers = getField($, "texte").find(":header");
      var $bad = $titre.add($headers).filter(function () {
        var text = $(this).text().trim();
        return text.match(/[^\.:;=, ]{2,}[\.:;=,]$/) // Ne pas matcher les mots d'une seule lettre suivies d'un point
      });
      var marker = {
        name: {
          fr: "Ponctuation",
          en: "Punctuation"
        },
        target: $bad,
        position: "append",
        highlight: true
      };
      this.resolve($bad.length, marker);
    }
  },

  {
    id: "texte:quality(champs)",
    name: {
      fr: "Champs ou liens parasites",
      en: "Unwanted fields or links"
    },
    description: {
      fr: "<p>Le document source contient des codes de champs, des signets ou des liens internes qui doivent être supprimés.</p>",
      en: "<p>The source document contains field codes, bookmarks, or internal links that must be removed.</p>",
    },
    condition: "textes",
    type: "danger",
    displayCount: true,
    action: function ($) {
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
          en: "Unwanted field or link"
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
      en: "Composition of indexes"
    },
    description: {
      fr: "<p>Certaines entrées d’index ne sont peut-être pas correctement composées.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/49\">Styler les métadonnées de l’article</a></p>",
      en: "<p>Some index entries may not be composed correctly.</p>"
    },
    condition: "publications || textes || indexes",
    type: "warning",
    displayCount: true,
    action: function ($) {
      var re = /( [-–—.-] |[;,] |[/\\]|\.$)/g;
      var $bad = $(".ckl-entry[data-entry-class='indexes']").filter(function () {
        var text = $(this).text().trim();
        return text.match(re) != null;
      });
      var marker = {
        name: {
          fr: "Composition",
          en: "Composition"
        },
        target: $bad,
        position: "append",
        highlight: true
      };
      this.resolve($bad.length, marker);
    }
  },

  {
    id: "summary:quality",
    name: {
      fr: "Hiérarchie du plan incohérente",
      en: "Inconsistent outline"
    },
    description: {
      fr: "<p>Les intertitres du document ne se suivent pas hiérarchiquement. Il ne faut pas utiliser un intertitre de deuxième niveau (“Titre 2”) qui ne suivrait pas un intertitre de premier niveau (“Titre 1”).</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/49\">Précis de stylage</a></p>",
      en: "<p>Document headings don't appear in the hierarchical order. By instance, second level headings (“Heading 2”) must always be used under a first level heading (“Heading 1”).</p>"
    },
    condition: "textes",
    type: "danger",
    action: function ($) {
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
          en: "Inconsistent outline"
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
      en: "Check index duplicates",
    },
    description: {
      fr: "<p>Certaines entrées d’index sont peut-être des doublons. Nous vous conseillons de renseigner les mots-clés au singulier et en minuscule lorsqu'il s'agit de noms communs.</p>",
      en: "<p>Some index entries may be duplicates. In order avoid duplicate entries, we recommend to always use singular and lowercase for common names.</p>"
    },
    condition: "indexes || auteurs || textes",
    type: "warning",
    displayCount: true,
    action: function ($, context) {
      var $parents = context.textes ? $(".ckl-entrytype") : $(document.body);
      var that = this;

      $parents.each(function() {
        var list = {};
        $(this).find(".ckl-entry[data-entry-class='indexes']").each(function () {
          var id = latinize($(this).text()).replace(/\W/g, "").toLowerCase().replace(/s$/, "");
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
            en: "Duplicate"
          },
          target: $bad,
          position: "append",
          highlight: true
        };

        that.notify($bad.length, marker);
      });
      
      this.resolve();
    }
  },

  {
    id: "author:existence",
    name: {
      fr: "Absence d'auteur",
      en: "Missing author"
    },
    description: {
      fr: "<p>Aucun auteur, éditeur scientifique ou collaborateur n'a été indiqué pour ce document.</p>",
      en: "<p>No author, scientific editor or collaborator is specified for this item.</p>"
    },
    condition: "textes",
    type: "info",
    action: function ($) {
      var flag = $(".ckl-personne").length === 0;
      this.resolve(flag);
    }
  },

  {
    id: "author:quality",
    name: {
      fr: "Format de nom d’auteur",
      en: "Author name format"
    },
    description: {
      fr: "<p>Certains noms d’auteurs ne respectent pas le format attendu ou contiennent des caractères inconnus. Les noms doivent être composés en minuscules avec une majuscule initiale.</p>",
      en: "<p>Some author names do not follow the expected format or contain unknown characters. Names must be capitalized.</p>"
    },
    condition: "publications || textes || indexes || auteurs",
    type: "warning",
    displayCount: true,
    action: function ($) {
      var forbiddenChars = /[0-9!#%*,/\:;?@\[\]_\{\}&]/g;
      var $bad = $(".ckl-personne-firstname, .ckl-personne-familyname").filter(function () {
        var text = $(this).text().trim();
        if (!text) return true;

        // Find "et" & "and" in firstname
        if ($(this).hasClass("ckl-personne-firstname")) {
          var matchAnd = text.match(/(?:et|and) (.)/);
          if (matchAnd) {
            var captured = matchAnd[1];
            if (isUpperCase(captured)) return true;
          }
        }

        var latinizedText = latinize(text); 
        
        return isUpperCase(text)
          || isLowerCase(latinizedText[0])
          || latinizedText.match(forbiddenChars);
      });
      var marker = {
        name: {
          fr: "Mauvais format de nom",
          en: "Wrong name format"
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
      en: "Link(s) to check"
    },
    description: {
      fr: "<p>Certains liens semblent incorrects. Vérifiez notamment que les URL ne contiennent pas de marques de ponctuation indésirables (point final, virgule, etc.).</p>",
      en: "<p>Some links appear to be incorrect. URLs must not contain unwanted punctuation marks (endpoint, comma, etc.).</p>"
    },
    condition: "textes",
    type: "warning",
    displayCount: true,
    action: function ($) {
      function isValidURL (url) {
        var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
        return regex.test(url) && url.trim().substr(-1).match(/[).,;\]]/) === null;
      }

      var $a = $(".ckl-content p:not(.ckl-fichier-document) a[href]:not(.footnotecall, .endnotecall, .FootnoteSymbol, .EndnoteSymbol, [href^=mailto])");
      var $bad = $a.filter(function () {
        var url = $(this).attr("href");
        return !isValidURL(url);
      });

      var marker = {
        name: {
          fr: "Lien à vérifier",
          en: "Link to check"
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
      en: "Note preceded by a period"
    },
    description: {
      fr: "<p>Une ou plusieurs notes de bas de page commencent par un point. Il est recommandé de le supprimer.</p>",
      en: "<p>One or more footnotes begin with a period. It is recommended to remove it.</p>"
    },
    condition: "textes",
    type: "warning",
    displayCount: true,
    action: function ($) {
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
          en: "Period to remove"
        },
        target: $bad,
        position: "prepend",
        highlight: true
      };
      this.resolve($bad.length, marker);
    }
  },

  {
    id: "facsimile:quality(filesize)[publications]",
    name: {
      fr: "Fac-similé de poids trop important",
      en: "Large facsimile"
    },
    description: {
      fr: "<p>Le poids du fac-similé PDF de la publication n'est pas adapté pour une bonne diffusion. Nous recommandons de charger des PDF de 30 Mo maximum.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/268\">Comment importer le fac-similé de son numéro</a></p>",
      en: "<p>The size of the facsimile attached to this issue is not suitable for proper distribution. We recommend uploading PDFs of up to 30 MB.</p>"
    },
    condition: "publications",
    type: "warning",
    action: function ($) {
      var $bad = $(".ckl-fichiers .ckl-fichier").filter(function() {
        var type = $(this).find(".ckl-fichier-type").text().trim();
        if (type !== "facsimile" && type !== "couverture1") return false;

        var fileinfo = $(this).find(".ckl-fichier-document").attr("data-document-filesize");
        return fileIsTooBig(fileinfo, 30)
      });
      var flag = $bad.length > 0;
      this.resolve(flag);
    }
  },

  {
    id: "facsimile:quality(filesize)[textes]",
    name: {
      fr: "Fac-similé de poids trop important",
      en: "Large facsimile"
    },
    description: {
      fr: "<p>Le poids du fac-similé PDF du document n'est pas adapté pour une bonne diffusion. Nous recommandons de charger des PDF de 10 Mo maximum.</p>",
      en: "<p>The size of the facsimile attached to this document is not suitable for proper distribution. We recommend uploading PDFs of up to 10 MB.</p>"
    },
    condition: "textes",
    type: "warning",
    action: function ($) {
      var $field = getField($, "alterfichier");
      if ($field.length === 0) return this.resolve();
    
      var fileinfo = $field.attr("data-document-filesize");
      var flag = fileIsTooBig(fileinfo, 10);
      this.resolve(flag);
    }
  },

  {
    id: "facsimile:existence[publications]",
    name: {
      fr: "Absence du fac-similé",
      en: "Missing facsimile"
    },
    description: {
      fr: "<p>Aucun fac-similé PDF n’est associé à cette publication. Un PDF sera automatiquement généré. Si vous souhaitez qu'un PDF composé par vos soins soit diffusé, vous devez l'attacher à cette publication. Il doit s'agir du PDF final, sans traits de coupe ni hirondelles.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/268\">Comment importer le fac-similé de son numéro</a></p>",
      en: "<p>This issue has no attached facsimile. A PDF will be automatically generated. If you want your own PDF file to be distributed instead, please attach it to this issue. This should be the final version with no crop marks.</p>"
    },
    condition: "publications && !numeroouvert",
    type: "info",
    tags: ["paper"],
    action: function ($) {
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
      en: "Missing facsimile"
    },
    description: {
      fr: "<p>Aucun fac-similé PDF n’est associé à ce document. Un PDF sera automatiquement généré. Si vous souhaitez qu'un PDF composé par vos soins soit diffusé, vous devez l'attacher à ce document. Il doit s'agir du PDF final, sans traits de coupe ni hirondelles.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/327\">Comment importer le fac-similé d’un article</a></p>",
      en: "<p>This document has no attached facsimile. A PDF will be automatically generated. If you want your own PDF file to be distributed instead, please attach it to this issue. This should be the final version with no crop marks.</p>"
    },
    condition: "textes && !numeroouvert",
    type: "info",
    tags: ["paper"],
    action: function ($) {
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
      en: "Missing pagination"
    },
    description: {
      fr: "<p>Si le document existe en version imprimée il est fortement recommandé d’en préciser la pagination au format attendu. Cette métadonnée génère la citation bibliographique papier.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/49\">Styler les métadonnées de l’article</a></p>",
      en: "<p>If the document exists in a printed version, it is strongly recommended to specify the pagination in the expected format. This will generate the bibliographic reference of the printed version.</p>"
    },
    condition: "textes && !numeroouvert",
    type: "info",
    tags: ["paper"],
    action: function ($) {
      var $pagination = getField($, "pagination");
      var flag = $pagination.length === 0 || $pagination.text().length === 0;
      this.resolve(flag);
    }
  },

  {
    id: "pagination:quality",
    name: {
      fr: "Erreur de pagination",
      en: "Pagination error"
    },
    description: {
      fr: "<p>La pagination de la version papier n’est pas correctement renseignée, le format attendu est <code>page de début-page de fin</code>, exemple <code>12-72</code>. Le séparateur doit être un tiret quart de cadratin.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/49\">Styler les métadonnées de l’article</a></p>",
      en: "<p>Pagination is not correct, the expected format is <code>start page-end page</code>, example <code>12-72</code>. Separator must be a hyphen-minus.</p>"
    },
    condition: "textes && !numeroouvert",
    type: "warning",
    tags: ["paper"],
    action: function ($) {
      var $pagination = getField($, "pagination");
      if ($pagination.length === 0) return this.resolve();
      var text = $pagination.text().trim();
      var flag = (!/^[a-z0-9]+(-[a-z0-9]+)?$/.test(text));
      var marker = {
        name: {
          fr: "Pagination invalide",
          en: "Invalid pagination"
        },
        target: $pagination,
        position: "after",
        highlight: true
      };
      this.resolve(flag, marker);
    }
  },

  {
    id: "souspartie:quality",
    name: {
      fr: "Sous-partie vide",
      en: "Empty subpart"
    },
    description: {
      fr: "<p>Le sommaire de la publication inclut une ou plusieurs sous-parties qui ne contiennent aucun document. Cette construction est incorrecte.</p>",
      en: "<p>The table of contents contains one or more empty subparts, which is not correct.</p>"
    },
    condition: "publications",
    type: "danger",
    displayCount: true,
    action: function ($) {
      var $bad = $(".checklist-toc-section-contents .checklist-toc-section-contents:empty");
      this.resolve($bad.length);
    }
  },

  {
    id: "bibliography:quality(nom-auteur)",
    name: {
      fr: "Absence de nom d'auteur dans une entrée bibliographique",
      en: "No author's name in a bibliographic entry"
    },
    description: {
      fr: "<p>Un tiret remplace le nom de l'auteur déjà cité dans l'entrée précédente&nbsp; cela pose problème pour le moissonage de Bilbo.</p> <p>Voir <a href=\"https://objs-fr.hypotheses.org/719\">Bilbo, un outil d’annotation automatique des références</a></p>",
      en: "<p>A hyphen stands for the name of the author already mentioned in the previous entry. This causes issues when harvesting bibliography with the Bilbo application.</p>"
    },
    condition: "textes",
    type: "warning",
    action: function ($) {
      var dashes = /^\s?[\-\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A\u2E3B\u2E40\u301C\u3030\u30A0\uFE31\uFE32\uFE58\uFE63\uFF0D\u005F\u02CD\u0331\u0332\u2017\uFF3F]/u;
      var $biblio = getField($, "bibliographie");
      var $bad = $biblio.find("p").filter(function () {
        return dashes.test($(this).text());
      });

      var marker = {
        name: {
          fr: "Tirets",
          en: "Hyphen"
        },
        target: $bad,
        position: "prepend",
        highlight: true
      };
      this.resolve($bad.length, marker);
    }
  },

  {
    id: "datepublipapier:consistency",
    name: {
      fr: "Dates de publication papier incohérentes",
      en: "Inconsistent print publication dates"
    },
    description: {
      fr: "<p>La date de publication papier du document doit être identique à la date de publication papier du numéro.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/44\">Créer un numéro dans Lodel</a> et <a href=\"https://objs-fr.hypotheses.org/49\">Styler les métadonnées de l’article</a></p>",
      en: "<p>Publication dates of the document and the issue must be the same.</p>"
    },
    condition: "textes && !numeroouvert",
    type: "warning",
    tags: ["paper"],
    action: function ($) {
      var articleDate = getField($, "datepublipapier").text();
      var issueDate = getField($, "datepublipapier-parent").text();
      var flag = articleDate !== issueDate;
      this.resolve(flag);
    }
  },

  {
    id: "numeroouvert:quality(historique)",
    name: {
      fr: "Historique non renseigné",
      en: "Missing history"
    },
    description: {
      fr: "<p>Pour les numéros ouverts, il est recommandé de renseigner le champ “Historique de la publication” avec une mention “Numéro ouvert le XXX”.</p><p> Au moment de la clôture du numéro, il est nécessaire de décocher la case “Numéro ouvert” dans l’interface et de compléter le champ “Historique de la publication” avec une mention “Numéro fermé le XXX”.</p>",
      en: "<p>In the case of open issues, it is recommended to fill in the “Publication history” field with the information “Issue open on XXX”.</p><p>When closing the issue, it is necessary to uncheck the “Open number” option and to append to the “Publication history” the information “Number closed on XXX”."
    },
    condition: "publications && numeroouvert",
    type: "danger",
    action: function ($) {
      var $historique = getField($, "historique");
      var flag = $historique.length === 0;
      this.resolve(flag);
    }
  },

  {
    id: "compterendu:quality(metadata)",
    name: {
      fr: "Métadonnées de l’œuvre commentée incomplètes",
      en: "Incomplete metadata about commented work"
    },
    description: {
      fr: "<p>Pour les compte-rendus, il est recommandé de renseigner le titre, l’auteur, la notice bibliographique et la date de publication de l’œuvre commentée. Une ou plusieurs de ces métadonnées sont manquantes.</p><p>Voir <a href=\"https://objs-fr.hypotheses.org/729\">Stylage des recensions</a>.",
      en: "<p>For reviews, it is recommended to provide the title, author, bibliographic record and publication date of the commented work. One or more of these metadata are currently missing.</p>"
    },
    condition: "textes && compterendu",
    type: "warning",
    action: function ($) {
      var $fields = getField($, "noticebibliooeuvre", "titreoeuvre", "datepublicationoeuvre", "auteuroeuvre");
      var flag = $fields.length !== 4;
      this.resolve(flag);
    }
  }
];