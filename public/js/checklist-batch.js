function getDocById(docs, id) {
	return docs.find(function(doc) {
		return doc.id === id;
	})
}

$(function() {
	if (window.checklist == null) return;

	var tk = checklist.ui.tk;

	$("#ckl-batch-btn").on("click", function() {
		var input = $("#ckl-batch-input").val();
		if (input == null || input.trim() === "") {
			input = 0;
		}
		$.ajax({
			url : "?do=_checklist_get",
			type : "GET",
			data: "documents=" + input,
			dataType : 'json'
		})
		.done(function(data, textStatus) {
			var docs = data.map(function(doc) {
				return {
					docId: doc.id,
					href: doc.context.url,
					context: doc.context
				}
			});
			checklist.runBatch({ docs: docs }).then(function(checkers) {
				// TODO: add option to display documents with no statement
				var statements = checkers.reduce(function(res, checker) {
					if (checker.error) return; // TODO: handle errors
					var checkerStatements = checker.getStatements();
					return res.concat(checkerStatements);
				}, []);

				var colHeaders = '"Publication", "Document", "Type", "Règle", "Notification", "Niveau", "Total" \r\n';

				var table = statements.reduce(function(res, s) {
					var id = s.docId;
					var doc = getDocById(data, id);
					return res + '"' + doc.idpubli + '","' + id + '","' + doc.type + '","' + s.id + '","' + tk(s.name) + '","' + s.type + '","' + s.count + '"\r\n';
				}, colHeaders);

				console.log(table);
			});
			// TODO: CSV file download
		})
		.fail(console.error);
	});
});