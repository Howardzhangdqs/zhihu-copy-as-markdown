import { lexer } from "./core/lexer";
import { parser } from "./core/parser";
import saveLex from "./core/savelex";
import { saveAs } from "file-saver";
import { MakeButton, getAuthor, getParent, getTitle, getURL } from "./core/utils";
import NormalItem from "./situation/NormalItem";
import * as JSZip from "jszip";
import PinItem from "./situation/PinItem";

const main = async () => {

	console.log("Starting…");

	const RichTexts = Array.from(document.querySelectorAll(".RichText")) as HTMLElement[];

	for (let RichText of RichTexts) {
		
		try {

			// 去掉重复的按钮
			let RichTextChilren = Array.from(RichText.children) as HTMLElement[];

			for (let i = 1; i < RichTextChilren.length; i++) {
				const el = RichTextChilren[i];
				if (el.classList.contains("zhihucopier-button")) el.remove();
				else break;
			}
		} catch { }

		try {

			if (RichText.parentElement.classList.contains("Editable")) continue;

			if (RichText.children[0].classList.contains("zhihucopier-button")) continue;

			if (RichText.children[0].classList.contains("Image-Wrapper-Preview")) continue;

			if (getParent(RichText, "PinItem")) {
				const richInner = getParent(RichText, "RichContent-inner");
				if (richInner && richInner.querySelector(".ContentItem-more")) continue;
			};


			const ButtonContainer = document.createElement("div");
			RichText.prepend(ButtonContainer);
			ButtonContainer.classList.add("zhihucopier-button");

			let result: {
				markdown: string[],
				zip: JSZip,
				title: string,
			};

			if (getParent(RichText, "PinItem")) {
				console.log("想法", RichText);

				const richInner = getParent(RichText, "RichContent-inner");

				if (richInner && richInner.querySelector(".ContentItem-more")) continue;

				const res = await PinItem(RichText);

				result = {
					markdown: res.markdown,
					zip: res.zip,
					title: res.title,
				};
			} else {
				console.log("回答", RichText);
				const res = await NormalItem(RichText);

				result = {
					markdown: res.markdown,
					zip: res.zip,
					title: res.title,
				};
			};

			const ButtonZipDownload = MakeButton();
			ButtonZipDownload.innerHTML = "下载全文为Zip";
			ButtonZipDownload.style.borderRadius = "0 1em 1em 0";
			ButtonZipDownload.style.width = "100px";
			ButtonZipDownload.style.paddingRight = ".4em";

			ButtonContainer.prepend(ButtonZipDownload);

			ButtonZipDownload.addEventListener("click", async () => {
				try {
					const blob = await result.zip.generateAsync({ type: "blob" });
					saveAs(blob, result.title + ".zip");

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
			ButtonContainer.prepend(ButtonCopyMarkdown);

			ButtonCopyMarkdown.addEventListener("click", () => {
				try {
					navigator.clipboard.writeText(result.markdown.join("\n\n"));
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