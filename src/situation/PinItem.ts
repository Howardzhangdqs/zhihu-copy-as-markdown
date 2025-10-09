import * as JSZip from "jszip";
import { parser } from "../core/parser";
import { lexer } from "../core/pinsLexer";
import { TokenType } from "../core/tokenTypes";
import type { LexType, TokenFigure } from "../core/tokenTypes";
import * as utils from "../core/utils";
import savelex from "../core/savelex";

export default async (dom: HTMLElement): Promise<{
    lex: LexType[],
    markdown: string[],
    zip: JSZip,
    title: string,
    itemId: string,
}> => {
    const lex = lexer(dom);

    const pinItem = utils.getParent(dom, "PinItem");

    if (pinItem) {

        // 获取图片
        const imgs = Array.from(pinItem.querySelectorAll(".Image-PreviewVague > img")) as HTMLImageElement[];

        imgs.forEach((img) => {
            lex.push({
                type: TokenType.Figure,
                src: img.getAttribute("data-original") || img.getAttribute("data-actualsrc"),
            } as TokenFigure);
        });

    }

    // 生成 Markdown 内容
    const contentMarkdown = parser(lex);

    const { zop, zaExtra } = (() => {
        let el = utils.getParent(dom, "PinItem");

        try {
            if (el)
                return {
                    zop: JSON.parse(decodeURIComponent(el.getAttribute("data-zop"))),
                    zaExtra: JSON.parse(decodeURIComponent(el.getAttribute("data-za-extra-module")))
                };
        } catch { }

        return { zop: null, zaExtra: null };
    })();

    const
        author = utils.getAuthor(dom),
        url = "https://www.zhihu.com/pin/" + zop.itemId;

    // 添加头部信息
    const authorName = author?.name || "未知作者";
    const header = [
        `作者：${authorName}`,
        `链接：${url}`,
        `来源：知乎`,
        `著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。`,
        `---`
    ];

    // 合并头部和内容
    const markdown = [...header, ...contentMarkdown];

    const zip = await savelex(lex);

    zip.file("info.json", JSON.stringify({
        author, url: "https://www.zhihu.com/pin/" + zop.itemId,
        zop,
        "zop-extra-module": zaExtra,
    }, null, 4));

    return {
        lex,
        markdown,
        zip,
        title: "想法",
        itemId: zop.itemId,
    }
};