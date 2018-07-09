function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = tinyMCE.$.trim(cookies[i]);
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

tinymce.init({
	// there will be #id_ + filed_name
	selector: "#id_content",
	convert_urls :false,
	relative_urls: false,
	theme: "modern",
	language: "zh_CN",
	branding: false,
	plugins: [
		"advlist autolink lists link image charmap hr anchor pagebreak",
		"searchreplace wordcount visualblocks visualchars code fullscreen",
		"insertdatetime media nonbreaking save table contextmenu directionality",
		"paste textcolor colorpicker textpattern codesample"
	],
	toolbar1: "insertfile undo redo | styleselect | bold italic | forecolor backcolor | \
				alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media",
	codesample_languages: [
		{text: 'C', value: 'c'},
		{text: 'C++', value: 'cpp'},
		{text: 'C#', value: 'csharp'},
		{text: 'Python', value: 'python'},
		{text: 'Java', value: 'java'},
	],
	image_advtab: true,
	height: 650,
	width: 880,
	// 这里引入的CSS对编辑器里的有影响
	content_css: "/static/bootstrap/css/bootstrap.min.css",
	visual_table_class: "table table-striped table-hover table-bordered table-condensed",
	table_default_attributes: {
		// border: '1'  // 去除边界才能显示自定义的 table的class https://github.com/tinymce/tinymce/issues/3742
	},

	// without images_upload_url set, Upload tab won't show up
	images_upload_url: '/api/v1/image_generic/',

	// override default upload handler to simulate successful upload
	images_upload_handler: function (blobInfo, success, failure) {
		var xhr, formData;

		xhr = new XMLHttpRequest();
		xhr.withCredentials = false;
		xhr.open('POST', '/api/v1/image_generic/');
		xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
		xhr.onload = function () {
			var ret_json;
			if (xhr.status != 201) {
				failure('Error: ' + xhr.status);
				return;
			}
			ret_json = JSON.parse(xhr.responseText);
			if (!ret_json || typeof ret_json.img != 'string') {
				failure('Invalid JSON: ' + xhr.responseText);
				return;
			}
			// 成功：将上传的图片返回的引用url传递给success
			success(ret_json.img);
		};
		formData = new FormData();
		// Api接受图片字段名
		formData.append('img', blobInfo.blob(), blobInfo.filename());
		xhr.send(formData);
	},
});
