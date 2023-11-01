# 知乎下载器

一键复制知乎文章/回答为Markdown，下载文章/回答为zip（包含素材图片与文章/回答信息），备份你珍贵的回答与文章。

代码仓库：<https://github.com/Howardzhangdqs/zhihu-copy-as-markdown>

## Usage

1. 安装依赖

```bash
pnpm i
```

2. 测试

```bash
pnpm dev
```

3. 打包

```bash
pnpm build
```

`dist/tampermonkey-script.js` 即为脚本，复制到油猴即可使用。


## 原理

1. 获取页面中所有的富文本框 `DOM`
2. 将 `DOM` 使用 `./src/lexer.ts` 转换为 `Lex`
3. 将 `Lex` 使用 `./src/parser.ts` 转换为 `Markdown`


## TODO

- [ ] 下载文章时同时包含头图
- [ ] TOC解析

