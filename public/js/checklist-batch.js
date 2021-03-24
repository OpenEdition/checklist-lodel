(function() {
	var tagZeroTitle = "Tout le site";
	var runningClass = "batch-running";
	var doneClass = "batch-done";
	var $body = $(document.body);

	// Page init
	// =========

	function initTagify($input) {
		if (Tagify == null) {
			console.error("Tagify not found");
			return;
		}

		var input = $input.get(0);
		var tagifyOptions = {
			keepInvalidTags: false,
			enforceWhitelist: true,
			editTags: false,
			originalInputValueFormat: function(values) {
				return values.map(function(item) {
					return item.value;
				}).join(",");
			}
		};
		if (window.tagifyWhitelist) {
			tagifyOptions.dropdown = {
				closeOnSelect: false,
				enabled: 0,
				classname: "publi-list",
				searchKeys: ["value", "title", "description"],
				maxItems: 5,
				highlightFirst: true
			};
			tagifyOptions.templates = {
				tag(tagData){
					var description = tagData.description ? " <small>(" + tagData.description.trim().toLowerCase() + ")</small>" : "";
					var text = tagData.value === "0" ? tagZeroTitle : tagData.value + description;
					return `
						<tag title="${(tagData.title || tagData.value)}"
							contenteditable='false'
							spellcheck='false'
							tabIndex="-1"
							class="${this.settings.classNames.tag} ${tagData.class ? tagData.class : ""}"
							${this.getAttributes(tagData)}>
								<x title='' class="${this.settings.classNames.tagX}" role='button' aria-label='remove tag'></x>
								<div>
									<span class="${this.settings.classNames.tagText}">${text}</span>
								</div>
						</tag>`
				},
				dropdownItem: function(item) {
					return `
						<div ${this.getAttributes(item)}
							class='${this.settings.classNames.dropdownItem} ${item.class ? item.class : ""}'
							tabindex="0"
							role="option">
								${ item.description ? `<span class="tag-description">${item.description}</span>` : "" }
								<span class="tag-title">${item.title}</span>
								${ item.value !== "0" ? `<span class="tag-id">${item.value}</span>` : "" }
						</div>
					`
				}
			};
			tagifyOptions.whitelist = window.tagifyWhitelist;
			tagifyOptions.callbacks = {
				"add": function(e) {
					const {data, index, tag, tagify} = e.detail;
					var id = data.value;
					var tags = $input.val().split(",");
					if (id === "0" && tags.length > 1) {
						tagify.removeAllTags();
						tagify.addTags("0");
						return;
					}
					if (id !== "0" && tags.length > 1) {
						tagify.removeTags(tagZeroTitle);
					}
				}
			};
		}
		return new Tagify(input, tagifyOptions);
	}

	function initOptions() {
		var cache = checklist.ui.cache;
		var isPaperActive = !cache.getFilter("tag-paper");
		if (isPaperActive) {
			$("#display-paper").prop( "checked", true );
		}
	}

	// User input getters
	// ==================

	function getOptions() {
		var options = {};
		$(".ckl-batch-option input").each(function() {
			var name = $(this).attr("name");
			var val = $(this).prop("checked");
			options[name] = val;
		});
		return options;
	}

	// CSV Export
	// ==========

	function getDocById(docs, id) {
		return docs.find(function(doc) {
			return doc.id === id;
		})
	}

	function downloadCSV(filename, data) {
		var blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
		
		if (navigator.msSaveBlob) { // IE 10+
			navigator.msSaveBlob(blob, filename);
			return;
		}
		var link = document.createElement("a");
		if (link.download !== undefined) { // Check for browser support
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else {
			alert("L'export CSV n'est pas pris en charge par votre navigateur. Veuillez utiliser une version récente de Mozilla Firefox, Chromium ou Google Chrome.")
		}
	}

	function runBatch(ids, options) {
		// Progress bar init
		var $bar = $(".ckl-batch-progress-bar");
		var setProgress = function(rate, uncap) {
			var width = rate ? rate * 100 : 0;
			if (!uncap && width > 95) {
				width = 95;
			}
			$bar.width(String(width) + "%");
		};
		setProgress(0);

		// Get documents data
		$.ajax({
			url : "?do=_checklist_get",
			type : "GET",
			data: "documents=" + ids,
			dataType : 'json'
		})
		.done(function(data, textStatus) {
			if (data.length === 0) {
				alert("Cette publication ne contient pas de documents vérifiables.");
				return;
			}

			var docs = data.map(function(doc) {
				return {
					docId: doc.id,
					href: doc.href,
					context: doc.context
				}
			});

			// Init progress bar listener
			var total = docs.length;
			var count = 0;
			var updateProgress = function() {
				count++;
				setProgress(count / total);
			};
			checklist.on("checker.done", updateProgress);

			// Run Checklist
			checklist.runBatch({ docs: docs, reloadSources: true })
			// Update UI and clear listeners
			.then(function(checkers) {
				var progressBarTransitionDuration = 500;
				checklist.removeListener("checker.done", updateProgress);
				setProgress(1, true);
				return new Promise((resolve, reject) => {
					setTimeout(function () {
						return resolve(checkers);
					}, progressBarTransitionDuration + 200);
				});
			})
			// Get statements from returned checkers
			.then(function(checkers) {
				var statements = checkers.reduce(function(res, checker) {
					if (options.displayError && checker.error) {
						res.push(checker);
						return res;
					}

					var checkerStatements = checker.getStatements();

					if (options.displayPaper === false) {
						checkerStatements = checkerStatements.filter(function(s) {
							return s.tags.includes("paper") === false;
						});
					}

					if (options.displayOk && checkerStatements.length === 0) {
						res.push({ docId: checker.docId, ok: true });
						return res;
					}

					return res.concat(checkerStatements);
				}, []);

				if (statements.length === 0) {
					alert("Cette requête a produit un fichier CSV vide.");
					return;
				}

				// Create table
				var colHeaders = '"Publication", "Document", "Type", "État", "Message", "Tag", "Total" \r\n';

				var table = statements.reduce(function(res, s) {
					var id = s.docId;
					var doc = getDocById(data, id);
					var eol = "\r\n";

					// Error
					if (s.error) {
						var errMsg = s.error.message;
						return res + '"' + doc.idpubli + '","' + id + '","' + doc.type + '","error","' + errMsg + '",,' + eol;
					}

					// OK = checker with no statement
					if (s.ok) {
						return res + '"' + doc.idpubli + '","' + id + '","' + doc.type + '","ok",,,' + eol;
					}
					
					// Statement
					var tk = checklist.ui.tk;
					var tags = s.tags.join(", ");
					return res + '"' + doc.idpubli + '","' + id + '","' + doc.type + '","' + s.type + '","' + tk(s.name) + '","' + tags + '","' + s.count + '"' + eol;
				}, colHeaders);

				var sitename = checklist.getConfig("namespace");
				var filename = sitename + "-" + ids.replace(/\D+/g, "-").replace(/^0$/, "site") + ".csv";
				downloadCSV(filename, table);
				
				// Update UI
				$body.removeClass(runningClass).addClass(doneClass);
				var refreshUI = function() {
					$body.removeClass(doneClass);
					setProgress(0);
				};
				$(".ckl-content input").one("change", refreshUI);
			});
		})
		.fail(function(err) {
			console.error(err);
			// Lodel session is probably expired => reload page in order to show login form
			setTimeout(function() {
				document.location.reload();
			}, 2000);
		});
	}

	// Main
	// ====

	$(function() {
		if (window.checklist == null) {
			console.error("checklist not found");
			return;
		};

		var $input = $("#ckl-batch-input");
		var tagify = initTagify($input);
		initOptions();

		$("#ckl-batch-btn").on("click", function() {
			if ($body.hasClass(runningClass)) return;
			$body.addClass(runningClass);
			
			var ids = $input.val();
			if (ids == null || ids.trim() === "") {
				ids = "0";
				tagify.addTags(tagZeroTitle);
			}
			var options = getOptions();
			runBatch(ids, options);
		});
	});
})();