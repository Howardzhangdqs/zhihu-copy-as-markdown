import * as JSZip from "jszip";
import { lexer } from "../core/lexer";
import { LexType } from "../core/tokenTypes";
import { parser } from "../core/parser";
import * as utils from "../core/utils";
import savelex from "../core/savelex";


// 生成8位UUID
const getUUID = (): string => {
    return "xxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};


export default async (dom: HTMLElement): Promise<{
    lex: LexType[],
    markdown: string[],
    zip: JSZip,
    title: string,
    itemId: string,
}> => {
    const lex = lexer(dom.childNodes as NodeListOf<Element>);

    const zopQuestion = (() => {
        const element = document.querySelector("[data-zop-question]");
        try {
            if (element instanceof HTMLElement)
                return JSON.parse(decodeURIComponent(element.getAttribute("data-zop-question")));
        } catch { }
        return null;
    })();

    const zop = (() => {
        let element = utils.getParent(dom, "AnswerItem");
        if (!element) element = utils.getParent(dom, "Post-content");

        try {
            if (element instanceof HTMLElement)
                return JSON.parse(decodeURIComponent(element.getAttribute("data-zop")));
        } catch { }

        return null;
    })();

    const zaExtra = (() => {
        const element = document.querySelector("[data-za-extra-module]");
        try {
            if (element instanceof HTMLElement)
                return JSON.parse(decodeURIComponent(element.getAttribute("data-za-extra-module")));
        } catch { }
        return null;
    })();


    const title = utils.getTitle(dom), author = utils.getAuthor(dom);
    const url = utils.getURL(dom);

    // 生成 Markdown 内容
    const contentMarkdown = parser(lex);

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
        title, url, author,
        zop,
        "zop-question": zopQuestion,
        "zop-extra-module": zaExtra,
    }, null, 4));

    const itemId = (zop || {}).itemId || getUUID();

    return { lex, markdown, zip, title: title, itemId };
};