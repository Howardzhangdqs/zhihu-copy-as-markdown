import * as JSZip from "jszip";
import { TokenType, type LexType } from "./tokenTypes";
import { downloadAndZip } from "./download2zip";
import { parser } from "./parser";

export default async (
	lex: LexType[],
	assetsPath: string = "assets"
): Promise<JSZip> => {

	const zip = new JSZip();

	// 检查是否有任何需要下载的媒体文件
	let hasMedia = false;

	for (let token of lex) {
		if (token.type === TokenType.Figure || token.type === TokenType.Gif || token.type === TokenType.Video) {
			hasMedia = true;
			break;
		}
	}

	if (hasMedia) {

		const assetsFolder = zip.folder(assetsPath);

		for (let token of lex) {
			if (token.type === TokenType.Figure) {
				const { file_name } = await downloadAndZip(token.src, assetsFolder);
				token.localSrc = `./${assetsPath}/${file_name}`;
				token.local = true;
			} else if (token.type === TokenType.Video) {
				const { file_name } = await downloadAndZip(token.src, assetsFolder);
				token.localSrc = `./${assetsPath}/${file_name}`;
				token.local = true;
			} else if (token.type === TokenType.Gif) {
				const { file_name } = await downloadAndZip(token.src, assetsFolder);
				token.localSrc = `./${assetsPath}/${file_name}`;
				token.local = true;
			}

		};

	}

	const markdown = parser(lex).join("\n\n");

	zip.file("index.md", markdown);

	return zip;
};