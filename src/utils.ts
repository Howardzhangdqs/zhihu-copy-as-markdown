import type { AuthorType } from "./types";

/**
 * Converts a Zhihu link to a normal link.
 * @param link - The Zhihu link to convert.
 * @returns The converted normal link.
 */
export const ZhihuLink2NormalLink = (link: string): string => {
	console.log(link);
	const url = new URL(link);

	if (url.hostname == "link.zhihu.com") {
		const target = new URLSearchParams(url.search).get("target");
		console.log(decodeURIComponent(target));
		return decodeURIComponent(target);
	}
	return link;
};


/**
 * Get the parent dom with the class name.
 * @param dom - The dom to get parent.
 * @param className - The class name of the parent.
 * @returns The parent dom.
 */
export const getParent = (dom: HTMLElement, className: string): HTMLElement | false => {
	if (dom == null) return false;
	if (dom.classList.contains(className)) return dom;
	else return getParent(dom.parentElement, className);
};


/**
 * Get the title of the dom.
 * @param dom - The dom to get title.
 * @returns The title of the dom.
 */
export const getTitle = (dom: HTMLElement) => {
	let title_dom;

	// 主页回答
	title_dom = getParent(dom, "AnswerItem")
	if (title_dom) {
		title_dom = title_dom.querySelector(".ContentItem-title > div > a") as HTMLElement;
		if (title_dom != null) return title_dom.innerText;
	}

	// 问题
	title_dom = getParent(dom, "QuestionPage");
	if (title_dom) {
		title_dom = title_dom.querySelector("meta[itemprop=name]") as HTMLMetaElement;
		if (title_dom != null) return title_dom.content;
	}

	// 主页文章
	title_dom = getParent(dom, "ArticleItem");
	if (title_dom) {
		title_dom = title_dom.querySelector("h2.ContentItem-title a") as HTMLElement;
		if (title_dom != null) return title_dom.innerText;
	}

	// 文章
	title_dom = getParent(dom, "Post-NormalMain");
	if (title_dom) {
		title_dom = title_dom.querySelector("header > h1.Post-Title") as HTMLElement;
		if (title_dom != null) return title_dom.innerText;
	}

	return "无标题";
};


/**
 * Get the author of the dom.
 * @param dom - The dom to get author.
 * @returns The author of the dom.
 */
export const getAuthor = (dom: HTMLElement): AuthorType | null => {
	let author, author_dom;

	try {

		// 主页与问题
		author_dom = getParent(dom, "AnswerItem");

		// 主页文章
		if (!author_dom) {
			author_dom = getParent(dom, "ArticleItem");
			if (author_dom) author_dom = author_dom.querySelector(".AuthorInfo-content") as HTMLElement;
		}

		// 文章
		if (!author_dom) {
			author_dom = getParent(dom, "Post-Main");
			if (author_dom) author_dom = author_dom.querySelector(".Post-Author") as HTMLElement;
		}

		if (author_dom) {
			let authorName_dom = author_dom.querySelector(".UserLink-link") as HTMLAnchorElement;
			let authorBadge_dom = author_dom.querySelector(".AuthorInfo-badgeText") as HTMLDivElement;
			if (author_dom != null) return {
				name: authorName_dom.innerText,
				url: authorName_dom.href,
				badge: authorBadge_dom.innerHTML
			};
		}

	} catch (e) {
		console.log(e);
	}

	return null;
};


/**
 * Get the URL of the dom.
 * @param dom - The dom to get URL.
 * @returns The URL of the dom.
 */
export const getURL = (dom: HTMLElement): string => {
	const currentURL = window.location.origin + window.location.pathname;

	// 主页回答
	if (window.location.pathname == "/") {
		let content_dom = getParent(dom, "AnswerItem");
		if (!content_dom) content_dom = getParent(dom, "ArticleItem");
		if (!content_dom) return currentURL + "#WARNING_Failed_to_get_URL";

		return (content_dom.querySelector("a[data-za-detail-view-id]") as HTMLAnchorElement).href;
	}

	return currentURL;
};


/**
 * Make a button element.
 * @returns A button element.
 */
export const MakeButton = (): HTMLButtonElement => {
	const $button = document.createElement("button");
	$button.setAttribute("type", "button");
	$button.classList.add("zhihucopier-button");
	$button.innerText = "";
	$button.style.right = "0";
	$button.style.top = "-2em";
	$button.style.zIndex = "999";
	$button.style.width = "120px";
	$button.style.height = "2em";
	$button.style.backgroundColor = "rgba(85, 85, 85, 0.9)";
	$button.style.color = "white";
	$button.style.outline = "none";
	$button.style.cursor = "pointer";
	$button.style.borderRadius = "1em";
	$button.style.margin = "0 .2em 1em .2em";
	$button.style.fontSize = ".8em";
	return $button;
};