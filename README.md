# django-tinymce-widget

TinyMCE富文本编辑器的的Django插件，可供Django Admin的textarea、自定义表单的textarea使用，完成所见即所得的富文本编辑。本插件只是简单配置并通过Django的模板将TinyMCE集成到Django之中，更为复杂的使用请见[TinyMCE](https://www.tiny.cloud/)

## Installation

使用git clone将本仓库拷贝到本地

    $git clone https://github.com/creaink/django-tinymce-widget.git

将工程内的 `django_tinymce_widget` 文件夹复制到Django工程的app所在目录下，同时在Django工程的 `settings.py` 文件里 `INSTALLED_APPS` 里加入插件的引用

```python
INSTALLED_APPS = [
    ...
    'django_tinymce_widget',
    ...
]
```

## Examples

### Normal Form

将插件引入到form中，在app下新建 `forms.py` 文件用于存放表单

```python
class ArticleForm(forms.Form):
    titile = forms.CharField(max_length=100)
    content = forms.CharField(widget=TinyMCE_Widget(width=1010)
```

创建一个表单视图

```python
# views.py
from .forms import ArticleForm
class LoginView(FormView):
    template_name = 'article.html'
    form_class = ArticleForm
    success_url = '/'

    def form_valid(self, form):
        # do something
        return super().form_valid(form)
```

再创建表单和视图对应的模板文件 `templates/article.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <!-- 引入widget的静态资源 -->
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

之后添加表单视图的路由url，然后访问即可

### Admin Form

对应上面的表单可以有如下 model

```python
# models.py
class Article(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
```

将插件引入到form中，在app下新建 `forms.py` 文件用于存放表单，注意这里的form只需要在元类里指定下特殊的字段对应的widget即可，如 `Article` 的 `content`

```python
from django_tinymce_widget import TinyMCE_Widget

class ArticleForm(forms.ModelForm):
    class Meta:
        fields = '__all__'
        widgets = {
            'content': TinyMCE_Widget(width=1010)
        }
```

在 `admin.py` 文件里创建对应的admin，将form设置为上面的 `ArticleAdmin`

```python
from .forms import ArticleForm

class ArticleAdmin(admin.ModelAdmin):
    form = ArticleForm
    search_fields = ('title', )
```

## Documentation

在创建插件实例时候可以提供一些简单的配置，这都是基于 `templates/django_tinymce_widget/editor.html` 下的预置TinyMCE的配置模板的基础之上进行的修改，如果你熟悉TinyMCE的配置使用或者想高度自定义，可以使用 `config_js` 配置项指定你自定义的TinyMCE配置JavaScript文件，注意事项见 [Use Config File](###ConfigFile)

### Basic Config

初始化参数

| 参数名 | 说明 |
| - | - |
| width | 插件的宽度单位px，默认800px |
| height | 插件的高度度单位px，默认650px |
| img_upload_url | 后台存储图片的接口url |
| img_field | 后台存储图片的字段名 |
| content_css | 外部样式css文件，针对编辑器内的内容 |
| table_css | 布尔变量，外部样式中使用了table相关需为True |
| config_js | 提供的配置文件 |
| **kwargs | 其他自定义配置 |

### Use Bootstrap

默认的表格样式是加入bootstrap的 `table table-striped table-hover table-bordered table-condensed` 但需要通过 content_css 来引入 bootstrap 文件同时需要在渲染的页面里引入 bootstrap

```python
TinyMCE_Widget(content_css='/static/bootstrap/css/bootstrap.min.css')
```

### Upload Image

需要通过 `img_upload_url` 来确定后端接受图片上传的请求，为POST请求，表单 `img_field` 为上传的图片字段名，需要和后端一致，[后端程序示例](https://docs.djangoproject.com/en/2.0/topics/http/file-uploads/#basic-file-uploads)

注意请求的响应成功应该为 **状态码为201** 的json键值响应，其中键为 `img_field` ，数据为上传图片的生成的url，例如 `{'img': 'http://your-site/upload/xxx.jpg'}`

### Other Config

可以通过 `**kwargs` 将自定义的一些参数传递作为 `tinymce.init` 初始化的参数，仅限简单的非nested数据

### ConfigFile

指定TinyMCE的初始化JavaScript文件用以覆盖插件预制的配置，配置文件编写时候注意需要绑定的DOM的ID的形式为 `id_{{ name }}` ，name即为表单的字段名
