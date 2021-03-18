$(function() {
	if (window.checklist == null) return;

	$("#ckl-batch-btn").on("click", function() {
		var input = $("#ckl-batch-btn").val();
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
					href: doc.href
				}
			});
			checklist.runBatch({ docs: docs }).then(console.log);
			// TODO: CSV Export
		})
		.fail(console.error);
	});
});