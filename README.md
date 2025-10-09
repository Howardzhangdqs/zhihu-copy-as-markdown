# 知乎下载器

一键复制知乎文章/回答/想法为Markdown，下载文章/回答/想法为zip（包含素材图片与文章/回答/想法信息），**支持直接保存到本地 Obsidian 笔记**，备份你珍贵的回答与文章。

安装地址：<https://greasyfork.org/zh-CN/scripts/478608>

安装完毕后会在每个回答、想法、文章的左上角出现三个按钮：`复制为Markdown`、`下载全文为Zip`、`保存到Obsidian`，点击即可复制、下载或保存到 Obsidian。

每个问题的标题上会多出两个按钮：`批量下载` 和 `批量保存到Obsidian`，点击后即可下载/保存该问题下所有已经加载的回答。

![截图](resources/screenshot1.png)

`下载全文为Zip`和`批量下载`都会将所有的内容（包括图片、视频等附件）一同打包并下载，备份您和他人的劳动成果。

## 新功能：保存到 Obsidian

现在支持直接将知乎内容保存到本地 Obsidian vault！

### 功能特点

- ✅ **直接保存到本地**：使用 File System Access API 直接保存文件到本地 Obsidian 路径
- ✅ **支持中文路径**：完美支持包含中文的文件路径
- ✅ **自动管理附件**：图片和视频自动保存到 `Attachments` 子文件夹
- ✅ **智能路径引用**：Markdown 中的图片链接自动转换为 Obsidian 兼容的相对路径格式
- ✅ **批量保存**：支持一键保存问题下的所有回答到统一文件夹

### 使用方法

1. **单个回答保存**：
   - 点击回答左上角的 `保存到Obsidian` 按钮
   - 首次使用会提示选择 Obsidian vault 目录
   - 选择后会自动保存 Markdown 文件到 vault 根目录
   - 图片会自动保存到 `Attachments` 子文件夹

2. **批量保存**：
   - 点击问题标题旁的 `批量保存到Obsidian` 按钮
   - 会创建以问题标题命名的文件夹
   - 所有回答的 Markdown 文件保存到该文件夹
   - 所有附件统一保存到 `Attachments` 子文件夹

### 浏览器要求

- 需要使用 **Chrome 86+** 或 **Edge 86+** 浏览器（支持 File System Access API）
- Firefox 和 Safari 暂不支持直接文件系统访问功能

### 重要说明

⚠️ **首次使用时**，点击"保存到Obsidian"按钮会弹出目录选择器，请选择您的 Obsidian vault 根目录。选择后会被记住，之后无需重复选择。

⚠️ **权限授予**：浏览器会请求访问所选目录的权限，请点击"允许"以继续。这是浏览器的安全机制，所有操作都在本地完成，不涉及网络传输。

### 文件结构示例

单个回答保存：
```
Your Obsidian Vault/
├── Attachments/
│   ├── image1.jpg
│   └── image2.png
└── 回答标题-12345678.md
```

批量保存：
```
Your Obsidian Vault/
└── 问题标题/
    ├── Attachments/
    │   ├── image1.jpg
    │   ├── image2.png
    │   └── image3.jpg
    ├── 回答1-12345678.md
    ├── 回答2-87654321.md
    └── 问题描述.md
```

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
- [ ] Markdown纯文本转义

