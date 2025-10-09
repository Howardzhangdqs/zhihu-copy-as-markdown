# Release Notes - v0.3.31

## 🎉 重大更新：支持保存到 Obsidian

现在可以直接将知乎内容保存到本地 Obsidian vault，无需手动下载和解压 ZIP 文件！

### ✨ 新功能

#### 1. **保存到 Obsidian**
- 🆕 使用 File System Access API 直接保存文件到本地文件系统
- 🆕 单个回答保存：点击"保存到Obsidian"按钮
- 🆕 批量保存：点击"批量保存到Obsidian"按钮保存问题下所有回答

#### 2. **自动附件管理**
- 📁 自动创建 `Attachments` 文件夹保存图片和视频
- 🔗 Markdown 中图片链接自动转换为 Obsidian 兼容的相对路径
- 📝 文件结构清晰，符合 Obsidian 最佳实践

#### 3. **完美中文支持**
- 🌏 支持中文路径和文件名
- 🔧 自动清理非法字符，确保跨平台兼容
- ✅ 在 Windows/macOS/Linux 上都能正常工作

### 🐛 Bug 修复

- 修复 Gif 和 Video 类型文件可能不被下载的问题
- 修复图片路径与实际保存文件名不一致导致图片无法显示的问题
- 修复 ZIP 文件路径被包含在文件名中导致引用错误的问题

### 📋 浏览器要求

- ✅ Chrome 86+
- ✅ Edge 86+
- ❌ Firefox（不支持 File System Access API）
- ❌ Safari（不支持 File System Access API）

### 📖 使用方法

#### 单个回答保存
1. 点击回答左上角的 **"保存到Obsidian"** 按钮
2. 首次使用会提示选择 Obsidian vault 目录
3. 自动保存 Markdown 文件到 vault 根目录
4. 图片自动保存到 `Attachments` 子文件夹

#### 批量保存
1. 点击问题标题旁的 **"批量保存到Obsidian"** 按钮
2. 会创建以问题标题命名的文件夹
3. 所有回答的 Markdown 文件保存到该文件夹
4. 所有附件统一保存到 `Attachments` 子文件夹

### 📁 文件结构示例

**单个回答保存：**
```
Obsidian Vault/
├── Attachments/
│   ├── v2-abc123.jpg
│   └── v2-def456.png
└── 回答标题-12345678.md
```

**批量保存：**
```
Obsidian Vault/
└── 问题标题/
    ├── Attachments/
    │   ├── image1.jpg
    │   └── image2.png
    ├── 回答1-12345678.md
    ├── 回答2-87654321.md
    └── 问题描述.md
```

### 📚 技术文档

详细的技术实现文档请参阅：[OBSIDIAN_FEATURE.md](./OBSIDIAN_FEATURE.md)

### 🔒 隐私与安全

- ✅ 所有操作都在本地完成
- ✅ 不涉及网络传输
- ✅ 不上传任何数据到服务器
- ✅ 用户完全掌控文件访问权限

---

**完整更新日志：** [UpdateLog.txt](./UpdateLog.txt)

**安装地址：** https://greasyfork.org/zh-CN/scripts/478608
