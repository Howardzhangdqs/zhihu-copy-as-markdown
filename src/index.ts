import { lexer } from "./lexer";
import { parser } from "./parser";
import saveLex from "./savelex";
import { saveAs } from "file-saver";
import { MakeButton, getAuthor, getParent, getTitle, getURL } from "./utils";

const main = async () => {

	console.log("Starting…");

	const RichTexts = Array.from(document.querySelectorAll(".RichText")) as HTMLElement[];

	for (let RichText of RichTexts) {

		try {

			if (RichText.parentElement.classList.contains("Editable")) continue;

			if (RichText.children[0].classList.contains("zhihucopier-button")) continue;

			console.log(RichText);

			const lex = lexer(RichText.childNodes as NodeListOf<Element>);
			const markdown = parser(lex);

			const title = getTitle(RichText), author = getAuthor(RichText);
			const url = getURL(RichText);

			console.log("good", lex, markdown, title, author);

			const ButtonZipDownload = MakeButton();
			ButtonZipDownload.innerHTML = "下载全文为Zip";
			ButtonZipDownload.style.borderRadius = "0 1em 1em 0";
			ButtonZipDownload.style.width = "100px";
			ButtonZipDownload.style.paddingRight = ".4em";

			RichText.prepend(ButtonZipDownload);

			ButtonZipDownload.addEventListener("click", async () => {
				try {
					const zopQuestion = (() => {
						const element = document.querySelector("[data-zop-question]");
						try {
							if (element instanceof HTMLElement)
								return JSON.parse(decodeURIComponent(element.getAttribute("data-zop-question")));
						} catch { }
						return null;
					})();

					const zop = (() => {
						let element = getParent(RichText, "AnswerItem");
						if (! element) element = getParent(RichText, "Post-content");

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

					const zip = await saveLex(lex);
					zip.file("info.json", JSON.stringify({
						title, url, author,
						zop,
						"zop-question": zopQuestion,
						"zop-extra-module": zaExtra,
					}, null, 4));

					console.log(zip);
					const blob = await zip.generateAsync({ type: "blob" });
					saveAs(blob, title + ".zip");

					ButtonZipDownload.innerHTML = "下载成功✅";
					setTimeout(() => {
						ButtonZipDownload.innerHTML = "下载全文为Zip";
					}, 1000);
				} catch {
					ButtonZipDownload.innerHTML = "发生未知错误<br>请联系开发者";
					ButtonZipDownload.style.height = "4em";
					setTimeout(() => {
						ButtonZipDownload.style.height = "2em";
						ButtonZipDownload.innerHTML = "下载全文为Zip";
					}, 1000);
				}
			});

			const ButtonCopyMarkdown = MakeButton();
			ButtonCopyMarkdown.innerHTML = "复制为Markdown";
			ButtonCopyMarkdown.style.borderRadius = "1em 0 0 1em";
			ButtonCopyMarkdown.style.paddingLeft = ".4em";
			RichText.prepend(ButtonCopyMarkdown);

			ButtonCopyMarkdown.addEventListener("click", () => {
				try {
					navigator.clipboard.writeText(markdown.join("\n\n"));
					ButtonCopyMarkdown.innerHTML = "复制成功✅";
					setTimeout(() => {
						ButtonCopyMarkdown.innerHTML = "复制为Markdown";
					}, 1000);
				} catch {
					ButtonCopyMarkdown.innerHTML = "发生未知错误<br>请联系开发者";
					ButtonCopyMarkdown.style.height = "4em";
					setTimeout(() => {
						ButtonCopyMarkdown.style.height = "2em";
						ButtonCopyMarkdown.innerHTML = "复制为Markdown";
					}, 1000);
				}
			});
            
		} catch (e) {
			console.log(e);
		}

	}
};


setTimeout(main, 300);

setInterval(main, 1000);