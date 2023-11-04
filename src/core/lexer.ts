import type {
	TokenH1,
	TokenH2,
	TokenCode,
	TokenText,
	TokenUList,
	TokenOList,
	TokenFigure,
	TokenBlockquote,
	TokenTextPlain,
	LexType,
	TokenTextType,
	TokenTextBr,
	TokenTextBold,
	TokenTextLink,
	TokenTextItalic,
	TokenTextCode,
	TokenTextInlineMath,
	TokenHR,
	TokenLink,
	TokenTable,
	TokenVideo,
} from "./tokenTypes";

import { TokenType } from "./tokenTypes";
import { ZhihuLink2NormalLink } from "./utils";


/**
 * Tokenizes a NodeListOf<Element> and returns an array of LexType tokens.
 * @param input - The NodeListOf<Element> to tokenize.
 * @returns An array of LexType tokens.
 */
export const lexer = (input: NodeListOf<Element>): LexType[] => {
	const tokens: LexType[] = [];

	for (let i = 0; i < input.length; i++) {
		const node = input[i];
		const tagName = node.tagName.toLowerCase();

		console.log(node, tagName);

		switch (tagName) {

		case "h2": {
			tokens.push({
				type: TokenType.H1,
				text: node.textContent,
				dom: node
			} as TokenH1);
			break;
		}

		case "h3": {
			tokens.push({
				type: TokenType.H2,
				text: node.textContent,
				dom: node
			} as TokenH2);
			break;
		}

		case "div": {
			if (node.classList.contains("highlight")) {
				tokens.push({
					type: TokenType.Code,
					content: node.textContent,
					language: node.querySelector("pre > code").classList.value.slice(9),
					dom: node
				} as TokenCode);
			} else if (node.classList.contains("RichText-LinkCardContainer")) {
				const link = node.firstChild as HTMLAnchorElement;
				tokens.push({
					type: TokenType.Link,
					text: link.getAttribute("data-text"),
					href: ZhihuLink2NormalLink(link.href),
					dom: node as HTMLDivElement
				} as TokenLink);
			} else if (node.querySelector("video")) {
				tokens.push({
					type: TokenType.Video,
					src: node.querySelector("video").getAttribute("src"),
					local: false,
					dom: node
				} as TokenVideo);
			}
			break;
		}

		case "blockquote": {
			tokens.push({
				type: TokenType.Blockquote,
				content: Tokenize(node),
				dom: node as HTMLQuoteElement
			} as TokenBlockquote);
			break;
		}

		case "figure": {
			const img = node.querySelector("img");
			const src = img.getAttribute("data-actualsrc") || img.getAttribute("data-original");
			if (src) {
				tokens.push({
					type: TokenType.Figure, src,
					local: false,
					dom: node as HTMLElement
				} as TokenFigure);
			}
			break;
		}

		case "ul": {
			const childNodes = Array.from(node.querySelectorAll("li"));

			tokens.push({
				type: TokenType.UList,
				content: childNodes.map((el) => Tokenize(el)),
				dom: node,
			} as TokenUList);

			break;
		}

		case "ol": {
			const childNodes = Array.from(node.querySelectorAll("li"));

			tokens.push({
				type: TokenType.Olist,
				content: childNodes.map((el) => Tokenize(el)),
				dom: node,
			} as TokenOList);

			break;
		}

		case "p": {

			tokens.push({
				type: TokenType.Text,
				content: Tokenize(node),
				dom: node as HTMLParagraphElement
			} as TokenText)

			break;
		}

		case "hr": {

			tokens.push({
				type: TokenType.HR,
				dom: node
			} as TokenHR);

			break;
		}

		case "table": {

			const el = node as HTMLTableElement;

			const table2array = (table: HTMLTableElement): string[][] => {
				const res: string[][] = [];
				const rows = Array.from(table.rows);

				for (let row of rows) {
					const cells = Array.from(row.cells);
					res.push(cells.map((cell) => cell.textContent.trim()));
				}

				return res;
			};

			const table = table2array(el);

			tokens.push({
				type: TokenType.Table,
				content: table,
				dom: node,
			} as TokenTable);

			break;
		}
		}

        
		console.log(tokens);
	}

	console.log(tokens);

	return tokens;
};


/**
 * Tokenizes an HTML element or string into an array of TokenTextType objects.
 * @param node The HTML element or string to tokenize.
 * @returns An array of TokenTextType objects representing the tokenized input.
 */
const Tokenize = (node: Element | string): TokenTextType[] => {

	if (typeof node == "string") {
		return [{
			type: TokenType.PlainText,
			text: node,
		} as TokenTextPlain];
	}

	const childs = Array.from(node.childNodes);
	const res: TokenTextType[] = [];

	for (let child of childs) {

		if (child.nodeType == child.TEXT_NODE) {
			res.push({
				type: TokenType.PlainText,
				text: child.textContent,
				dom: child,
			} as TokenTextPlain);
		} else {
			let el = child as HTMLElement;
			switch (el.tagName.toLowerCase()) {
			case "b": {
				res.push({
					type: TokenType.Bold,
					content: Tokenize(el),
					dom: el,
				} as TokenTextBold);
				break;
			}

			case "i": {
				res.push({
					type: TokenType.Italic,
					content: Tokenize(el),
					dom: el,
				} as TokenTextItalic);
				break;
			}

			case "br": {
				res.push({
					type: TokenType.BR,
					dom: el,
				} as TokenTextBr);
				break;
			}
                
			case "code": {
				res.push({
					type: TokenType.InlineCode,
					content: el.innerText,
					dom: el,
				} as TokenTextCode);
				break;
			}

			case "span": {
				if (el.classList.contains("ztext-math")) {
					res.push({
						type: TokenType.InlineMath,
						content: el.getAttribute("data-tex"),
						dom: el,
					} as TokenTextInlineMath);
				} else {
					if (el.children[0].classList.contains("RichContent-EntityWord")) {
						res.push({
							type: TokenType.PlainText,
							text: el.innerText,
							dom: el,
						} as TokenTextPlain);
					}
				}
				break;
			}

			case "a": {
				res.push({
					type: TokenType.InlineLink,
					text: el.textContent,
					href: ZhihuLink2NormalLink((el as HTMLAnchorElement).href),
					dom: el,
				} as TokenTextLink);
				break;
			}
			}
		}
	}

	return res;
};