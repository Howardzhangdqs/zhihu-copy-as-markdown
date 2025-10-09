import * as JSZip from "jszip";
import { LexType, TokenType } from "./tokenTypes";

/**
 * Obsidian 保存器配置
 */
export interface ObsidianConfig {
    /** Obsidian vault 根目录句柄 */
    vaultHandle?: FileSystemDirectoryHandle;
    /** 附件文件夹名称 */
    attachmentFolder: string;
}

/**
 * 保存到 Obsidian 的结果
 */
export interface SaveToObsidianResult {
    success: boolean;
    message: string;
    mdPath?: string;
}

/**
 * 从 localStorage 加载 Obsidian 配置
 */
export function loadObsidianConfig(): ObsidianConfig {
    const config = localStorage.getItem("zhihu-obsidian-config");
    if (config) {
        const parsed = JSON.parse(config);
        return {
            attachmentFolder: parsed.attachmentFolder || "Attachments",
        };
    }
    return {
        attachmentFolder: "Attachments",
    };
}

/**
 * 保存 Obsidian 配置到 localStorage
 */
export function saveObsidianConfig(config: Partial<ObsidianConfig>): void {
    const current = loadObsidianConfig();
    const updated = { ...current, ...config };
    localStorage.setItem("zhihu-obsidian-config", JSON.stringify(updated));
}

/**
 * 清理文件名，移除所有不允许的字符
 * Windows/macOS/Linux 文件系统禁止的字符：< > : " / \ | ? * 以及控制字符
 */
function sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
        return 'untitled';
    }

    return filename
        // 移除所有控制字符（包括换行、回车、制表符等）
        .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
        // 移除或替换文件系统非法字符
        .replace(/[<>:"/\\|?*]/g, '-')
        // 移除 Unicode 零宽字符和其他不可见字符
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // 替换连续空白字符为单个空格
        .replace(/\s+/g, ' ')
        // 移除前后空格
        .trim()
        // 移除连续的点（避免 .. 等）
        .replace(/\.{2,}/g, '.')
        // 移除文件名开头和结尾的点和空格
        .replace(/^[.\s]+|[.\s]+$/g, '')
        // 限制长度（Windows 文件名最大255字节，保守起见限制200字符）
        .substring(0, 200)
        // 再次移除末尾的空格和点
        .replace(/[.\s]+$/, '')
        // 如果清理后为空，使用默认名称
        || 'untitled';
}

/**
 * 请求选择 Obsidian vault 目录
 */
export async function selectObsidianVault(): Promise<FileSystemDirectoryHandle | null> {
    try {
        // 检查浏览器是否支持 File System Access API
        if (!("showDirectoryPicker" in window)) {
            alert("您的浏览器不支持文件系统访问功能，请使用 Chrome 或 Edge 浏览器");
            return null;
        }

        const dirHandle = await (window as any).showDirectoryPicker({
            mode: "readwrite",
        });

        return dirHandle;
    } catch (err) {
        if (err.name !== "AbortError") {
            console.error("选择目录失败:", err);
        }
        return null;
    }
}

/**
 * 生成 Obsidian 兼容的 Markdown 内容
 * 将图片路径转换为 Obsidian 的 [[attachments/filename]] 或 ![](Attachments/filename) 格式
 */
export function generateObsidianMarkdown(
    markdown: string[],
    lex: LexType[],
    config: ObsidianConfig
): string {
    let result = markdown.join("\n\n");

    // 清理附件文件夹名
    const safeAttachmentFolder = sanitizeFilename(config.attachmentFolder);

    // 遍历 lex 找出所有图片和视频，替换路径
    for (const token of lex) {
        if (token.type === TokenType.Figure || token.type === TokenType.Gif) {
            // 优先使用 localSrc，如果没有则使用 src
            const originalSrc = token.local && token.localSrc ? token.localSrc : token.src;

            if (originalSrc) {
                // 从路径中提取文件名
                const filename = originalSrc.split("/").pop();
                // 清理文件名（与保存时保持一致）
                const safeFilename = sanitizeFilename(filename);
                const obsidianPath = `${safeAttachmentFolder}/${safeFilename}`;

                // 替换 Markdown 中的路径 - 尝试多种可能的格式
                result = result.replace(`![](${originalSrc})`, `![](${obsidianPath})`);
                result = result.replace(`![](${token.src})`, `![](${obsidianPath})`);
            }
        } else if (token.type === TokenType.Video) {
            const originalSrc = token.local && token.localSrc ? token.localSrc : token.src;

            if (originalSrc) {
                const filename = originalSrc.split("/").pop();
                // 清理文件名（与保存时保持一致）
                const safeFilename = sanitizeFilename(filename);
                const obsidianPath = `${safeAttachmentFolder}/${safeFilename}`;

                result = result.replace(originalSrc, obsidianPath);
                result = result.replace(token.src, obsidianPath);
            }
        }
    }

    return result;
}

/**
 * 保存 ZIP 内容到 Obsidian vault
 * @param zip JSZip 对象
 * @param title 文件标题
 * @param markdown Markdown 内容数组
 * @param lex Lex 数组
 * @param vaultHandle Obsidian vault 目录句柄
 * @param config Obsidian 配置
 */
export async function saveToObsidian(
    zip: JSZip,
    title: string,
    markdown: string[],
    lex: LexType[],
    vaultHandle: FileSystemDirectoryHandle,
    config: ObsidianConfig
): Promise<SaveToObsidianResult> {
    try {
        // 1. 创建或获取 Attachments 文件夹
        const safeAttachmentFolder = sanitizeFilename(config.attachmentFolder);

        const attachmentDirHandle = await vaultHandle.getDirectoryHandle(
            safeAttachmentFolder,
            { create: true }
        );

        // 2. 保存所有附件文件
        const files = Object.keys(zip.files);
        const attachmentFiles = files.filter(
            (name) => !name.endsWith("info.json") && !name.endsWith(".md")
        );

        for (const filename of attachmentFiles) {
            const file = zip.files[filename];
            if (!file.dir) {
                const content = await file.async("uint8array");
                // 从完整路径中提取文件名（去掉文件夹路径）
                const pureFilename = filename.split("/").pop();
                // 清理文件名
                const safeFilename = sanitizeFilename(pureFilename);

                const fileHandle = await attachmentDirHandle.getFileHandle(safeFilename, {
                    create: true,
                });
                const writable = await fileHandle.createWritable();
                await writable.write(content);
                await writable.close();
            }
        }

        // 3. 生成 Obsidian 兼容的 Markdown
        const obsidianMarkdown = generateObsidianMarkdown(markdown, lex, config);

        // 4. 保存 Markdown 文件到 vault 根目录
        const safeTitle = sanitizeFilename(title);
        const mdFilename = `${safeTitle}.md`;

        const mdFileHandle = await vaultHandle.getFileHandle(mdFilename, {
            create: true,
        });
        const writable = await mdFileHandle.createWritable();
        await writable.write(obsidianMarkdown);
        await writable.close();

        return {
            success: true,
            message: `已保存到 Obsidian: ${mdFilename}`,
            mdPath: mdFilename,
        };
    } catch (err) {
        console.error("保存到 Obsidian 失败:", err);
        return {
            success: false,
            message: `保存失败: ${err.message}`,
        };
    }
}

/**
 * 批量保存到 Obsidian
 */
export async function batchSaveToObsidian(
    items: Array<{
        zip: JSZip;
        title: string;
        markdown: string[];
        lex: LexType[];
        itemId?: string;
    }>,
    vaultHandle: FileSystemDirectoryHandle,
    questionTitle: string
): Promise<SaveToObsidianResult> {
    try {
        const config = loadObsidianConfig();

        // 1. 创建问题文件夹
        const safeQuestionTitle = sanitizeFilename(questionTitle);
        const questionDirHandle = await vaultHandle.getDirectoryHandle(
            safeQuestionTitle,
            { create: true }
        );

        // 2. 创建统一的 Attachments 文件夹
        const safeAttachmentFolder = sanitizeFilename(config.attachmentFolder);
        const attachmentDirHandle = await questionDirHandle.getDirectoryHandle(
            safeAttachmentFolder,
            { create: true }
        );

        // 3. 遍历每个回答
        for (const item of items) {
            // 保存附件
            const files = Object.keys(item.zip.files);
            const attachmentFiles = files.filter(
                (name) => !name.endsWith("info.json") && !name.endsWith(".md")
            );

            for (const filename of attachmentFiles) {
                const file = item.zip.files[filename];
                if (!file.dir) {
                    const content = await file.async("uint8array");
                    // 从完整路径中提取文件名（去掉文件夹路径）
                    const pureFilename = filename.split("/").pop();
                    // 清理文件名
                    const safeFilename = sanitizeFilename(pureFilename);
                    const fileHandle = await attachmentDirHandle.getFileHandle(safeFilename, {
                        create: true,
                    });
                    const writable = await fileHandle.createWritable();
                    await writable.write(content);
                    await writable.close();
                }
            }

            // 生成并保存 Markdown
            const obsidianMarkdown = generateObsidianMarkdown(
                item.markdown,
                item.lex,
                config
            );
            const combinedTitle = `${item.title}-${item.itemId || "unknown"}`;
            const safeTitle = sanitizeFilename(combinedTitle);
            const mdFilename = `${safeTitle}.md`;
            const mdFileHandle = await questionDirHandle.getFileHandle(mdFilename, {
                create: true,
            });
            const writable = await mdFileHandle.createWritable();
            await writable.write(obsidianMarkdown);
            await writable.close();
        }

        return {
            success: true,
            message: `已保存 ${items.length} 个回答到 Obsidian`,
        };
    } catch (err) {
        console.error("批量保存到 Obsidian 失败:", err);
        return {
            success: false,
            message: `保存失败: ${err.message}`,
        };
    }
}
