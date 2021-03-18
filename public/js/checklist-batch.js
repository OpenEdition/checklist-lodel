function getDocById(docs, id) {
	return docs.find(function(doc) {
		return doc.id === id;
	})
}

$(function() {
	if (window.checklist == null) return;

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
				var statements = checkers.reduce(function(res, checker) {
					if (checker.error) return; // TODO: handle errors
					const checkerStatements = checker.getStatements();
					return res.concat(checkerStatements);
				}, []);

				var colHeaders = "id publi; type; id document; test; message; type message; count \r\n";

				var table = statements.reduce(function(res, s) {
					var id = s.docId;
					var doc = getDocById(data, id);
					return res + '"' + doc.idparent + '","' + doc.type + '","' + id + '","' + id + '","' + "TODO: description" + '","' + s.type + '","' + s.count + '"\r\n';
				}, colHeaders);

				console.log(table);
			});
			// TODO: CSV file download
		})
		.fail(console.error);
	});
});