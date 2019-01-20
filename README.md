# django-tinymce-widget

TinyMCE 富文本编辑器的的 Django 插件，可供 Django Admin 的 textarea、自定义表单的 textarea 使用，完成所见即所得的富文本编辑，插件可以自定义到 form 中，可以方便地在前端表单或者 Django admin 后台里集成。本插件只是简单配置并通过 Django 的模板将 TinyMCE 集成到 Django，更为复杂的使用请见 [TinyMCE](https://www.tiny.cloud/)。

快速示例 [django_quickstart](https://github.com/creaink/django_quickstart)。

![效果图](https://i.loli.net/2019/01/20/5c442b4feaa28.png)

## Installation

使用 git clone 将本仓库拷贝到本地

```shell
$ git clone https://github.com/creaink/django-tinymce-widget.git
```

将 `django_tinymce_widget` 文件夹复制到 Django 工程的所在目录下（或者自定义的 app/extra_apps），同时在 Django 工程的 `settings.py` 文件里 `INSTALLED_APPS` 里加入插件的引用。

```python
INSTALLED_APPS = [
    ...
    'django_tinymce_widget',
    ...
]
```

## Examples

### Normal Form

将插件引入到 form 中，在 app 下新建 `forms.py` 文件用于存放表单：

```python
from django import forms
from django_tinymce_widget import TinyMCE_Widget

class ArticleForm(forms.Form):
    titile = forms.CharField(max_length=100)
    content = forms.CharField(widget=TinyMCE_Widget(width=1010))
```

创建一个表单视图

```python
# views.py
from django.views.generic import FormView
from .forms import ArticleForm

class ArticleView(FormView):
    template_name = 'article.html'
    form_class = ArticleForm
    success_url = '/'

    def form_valid(self, form):
        # do something
        return super().form_valid(form)
```

再创建表单和视图对应的模板文件 `templates/article.html`：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <!-- 引入 widget 的静态资源 -->
    {{ form.media }}
</head>
<body>
    <form method="post">{% csrf_token %}
        {{ form.as_p }}
        <input type="submit" value="Post Artilce" />
    </form>
</body>
</html>
```

之后添加表单视图的路由 url，然后访问即可。

```python
urlpatterns = [
    path('test/', view=ArticleView.as_view(), name='aricle'),
]
```

### Admin Form

在上面的基础上可以在 `forms.py` 文件里添加 admin 所用的表单类，注意这里的 form 只需要在元类里指定下特殊的字段对应的 widget 即可，如 `Article` 的 `content`：

```python
from django_tinymce_widget import TinyMCE_Widget

class ArticleAdminForm(forms.ModelForm):
    class Meta:
        fields = '__all__'
        widgets = {
            'content': TinyMCE_Widget(width=1010)
        }
```

在 `admin.py` 文件里创建对应的 admin，将 form 设置为上面的 `ArticleAdmin`：

```python
from .models import Article
from .forms import ArticleAdminForm

class ArticleAdmin(admin.ModelAdmin):
    form = ArticleAdminForm
    search_fields = ('title', )

admin.site.register(Article, ArticleAdmin)
```

## Documentation

在创建插件实例时候可以提供一些简单的配置，这都是基于 `templates/django_tinymce_widget/editor.html` 下的预置 TinyMCE 的配置模板的基础之上进行的修改，如果你熟悉 TinyMCE 的配置使用或者想高度自定义，可以使用 `config_js` 配置项指定你自定义的 TinyMCE 配置 JavaScript 文件，注意事项见 [Use Config File](###ConfigFile)。

### Basic Config

初始化参数

| 参数名 | 说明 |
| - | - |
| width | 插件的宽度单位 px，默认 800px |
| height | 插件的高度度单位 px，默认 650px |
| img_upload_url | 后台存储图片的接口 url |
| img_field | 后台存储图片的字段名 |
| content_css | 外部样式 css 文件，针对编辑器内的内容 |
| table_css | 布尔变量，外部样式中使用了 table 相关需为 True |
| config_js | 提供的配置文件 |
| **kwargs | 其他自定义配置 |

### Use Bootstrap

默认的表格样式是加入 bootstrap 的 `table table-striped table-hover table-bordered table-condensed` 但需要通过 content_css 来引入 bootstrap 文件同时需要在渲染的页面里引入 bootstrap：

```python
TinyMCE_Widget(content_css='/static/bootstrap/css/bootstrap.min.css')
```

### Upload Image

需要通过 `img_upload_url` 来确定后端接受图片上传的请求，为 POST 请求，表单 `img_field` 为上传的图片字段名，需要和后端一致，[后端程序示例](https://docs.djangoproject.com/en/2.0/topics/http/file-uploads/#basic-file-uploads)，或者参考 Django_quiclstart 里的示例：

```python
# view.py
def handle_uploaded_file(f):
    path = os.path.join(settings.MEDIA_ROOT, f.name)
    with open(path, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
    return filepath_to_uri( os.path.join(settings.MEDIA_URL + f.name) )

def ImageHandler(request):
    # 简单的示范，可以使用 imageFild
    img_url = handle_uploaded_file(request.FILES["img"])
    return HttpResponse('{"img":"%s"}'%(img_url), status=201)

# url.py
urlpatterns = [
    path('img/', ImageHandler, name='img'),
]

```

注意请求的响应成功应该为 **状态码为 201** 的 json 键值响应，其中键为 `img_field` ，数据为上传图片的生成的 url，例如 `{'img': 'http://your-site/upload/xxx.jpg'}`

### Other Config

可以通过 `**kwargs` 将自定义的一些参数传递作为 `tinymce.init` 初始化的参数，仅限简单的非 nested 数据。

### ConfigFile

指定 TinyMCE 的初始化 JavaScript 文件用以覆盖插件预制的配置，配置文件编写时候注意需要绑定的 DOM 的 ID 的形式为 `id_{{ name }}` ，name 即为表单的字段名。

## TODO

- [ ] 增加[脑图](http://naotu.baidu.com)功能插件, 参考 [leanote](https://github.com/leanote/tinymce)。
