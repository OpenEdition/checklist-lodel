function initTagify($input) {
	if (Tagify == null) {
		console.error("Tagify not found");
		return;
	}

	var input = $input.get(0);
	new Tagify(input, {
		pattern: /^[0-9]+$/,
		keepInvalidTags: false,
		originalInputValueFormat: function(values) {
			return values.map(function(item) {
				return item.value;
			}).join(",");
		}
	});
}

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
	}
}

$(function() {
	if (window.checklist == null) {
		console.error("checklist not found");
		return;
	};

	var $input = $("#ckl-batch-input");
	initTagify($input);

	var tk = checklist.ui.tk;

	$("#ckl-batch-btn").on("click", function() {
		var inputVal = $input.val();
		if (inputVal == null || inputVal.trim() === "") {
			inputVal = "0";
		}
		$.ajax({
			url : "?do=_checklist_get",
			type : "GET",
			data: "documents=" + inputVal,
			dataType : 'json'
		})
		.done(function(data, textStatus) {
			if (data.length === 0) {
				alert("Cette publication est introuvable.");
				return;
			}

			var docs = data.map(function(doc) {
				return {
					docId: doc.id,
					href: doc.href,
					context: doc.context
				}
			});
			checklist.runBatch({ docs: docs }).then(function(checkers) {
				var statements = checkers.reduce(function(res, checker) {
					if (checker.error) {
						res.push(checker);
						return res;
					}

					var checkerStatements = checker.getStatements();

					if (checkerStatements.length === 0) {
						res.push({ docId: checker.docId, ok: true });
						return res;
					}

					return res.concat(checkerStatements);
				}, []);

				if (statements.length === 0) {
					alert("Cette requête a produit un fichier CSV vide.");
					return;
				}

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

					// Success = checker with no statement
					if (s.ok) {
						return res + '"' + doc.idpubli + '","' + id + '","' + doc.type + '","ok",,,' + eol;
					}
					
					// Statement
					var tags = s.tags.join(", ");
					return res + '"' + doc.idpubli + '","' + id + '","' + doc.type + '","' + s.type + '","' + tk(s.name) + '","' + tags + '","' + s.count + '"' + eol;
				}, colHeaders);

				var filename = "checklist-" + inputVal.replace(/\D+/g, "-") + ".csv";
				downloadCSV(filename, table);
			});
		})
		.fail(console.error);
	});
});