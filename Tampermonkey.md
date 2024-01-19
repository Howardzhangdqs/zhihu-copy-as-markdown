# 知乎下载器

一键复制知乎文章/回答/想法为Markdown，下载文章/回答/想法为zip（包含素材图片与文章/回答/想法信息），备份你珍贵的回答与文章。

代码仓库：<https://github.com/Howardzhangdqs/zhihu-copy-as-markdown>


安装完毕后会在每个回答、想法、文章的左上角出现两个`复制为Markdown`和`下载全文为Zip`按钮，点击即可复制和下载。

每个问题的标题上会多出一个`批量下载`按钮，点击后即可下载该问题下所有已经加载的回答为单个Zip。

![截图](https://github.com/Howardzhangdqs/zhihu-copy-as-markdown/raw/main/resources/screenshot1.png)

`下载全文为Zip`和`批量下载`都会将所有的内容（包括图片、视频等附件）一同打包并下载，备份您和他人的劳动成果。


## 原理

1. 获取页面中所有的富文本框 `DOM`
2. 将 `DOM` 使用 `./src/core/lexer.ts` 转换为 `Lex`
3. 将 `Lex` 使用 `./src/core/parser.ts` 转换为 `Markdown`


## TODO

- 下载文章时同时包含头图
- TOC解析
- Markdown纯文本转义

