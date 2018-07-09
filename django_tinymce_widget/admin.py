# -*- coding: utf-8 -*-
from django import forms
from django.utils.safestring import mark_safe
from django.template.loader import render_to_string



class TinyMCE_Widget(forms.Widget):
	'''
	width、height: 编辑器宽度、高度，单位px，默认800px、650px
	img_upload_url、img_field: 处理编辑器上传图片的接口和图片上传时候的字段名，
								和返回json数据里图像的url地址的字段名
	content_css、table_css: 外部css文件，针对编辑器内的内容，是否使用了table样式
	config_js: 使用自定义的tinymce.js配置地址，如果使用其他配置将无用，配置示例config_example.js
	kwargs 支持额外的配置键值对，会转换为tinymce.init时候的json配置键值对
	'''
	template_name = 'django_tinymce_widget/editor.html'

	def __init__(self, *, width=800, height=650,
						img_upload_url=None, img_field=None,
						content_css=None, table_css=True,
						config_js=None, **kwargs):
		super(TinyMCE_Widget, self).__init__()
		self.width = width
		self.height = height

		self.img_upload_url = img_upload_url
		self.img_field = img_field

		self.config_js = config_js
		self.content_css = content_css
		self.table_css = table_css
		self.options = self.kwsafe(**kwargs)

	@classmethod
	def kwsafe(self, **kwargs):
		for key in kwargs:
			if isinstance(kwargs[key], str):
				kwargs[key] = '"%s"' % kwargs[key]
			elif isinstance(kwargs[key], bool):
				kwargs[key] = 1 if kwargs[key] else 0
		return kwargs

	def render(self, name, value, attrs=None, renderer=None):

		context = {
			'name': name,
			'data': value if value is not None else "", # default fill words
			'width': self.width,
			'height': self.height,

			'img_upload_url': self.img_upload_url,
			'img_field': self.img_field,

			'config_js': self.config_js,
			'content_css': self.content_css,
			'table_css': self.table_css,
			'options': self.options
		}
		return mark_safe(render_to_string(self.template_name, context))

	@property
	def media(self):
		'''Media as a dynamic property'''
		css = {
			'all': [
				'/static/django_tinymce_widget/style.css',
			]
		}
		js = [
			"/static/django_tinymce_widget/tinymce.min.js",
		]
		if self.config_js is not None:
			js.append(self.config_js)
		return forms.Media(css=css, js=js)
