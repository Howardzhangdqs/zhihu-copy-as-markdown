import * as JSZip from "jszip";
import { TokenType, type LexType } from "./tokenTypes";
import { downloadAndZip } from "./download2zip";
import { parser } from "./parser";

export default async (
	lex: LexType[],
	assetsPath: string = "assets"
): Promise<JSZip> => {

	const zip = new JSZip();

	let FigureFlag = false;

	for (let token of lex) {
		if (token.type === TokenType.Figure) {
			FigureFlag = true;
			break;
		};
	};

	if (FigureFlag) {

		const assetsFolder = zip.folder(assetsPath);

		for (let token of lex) {
			if (token.type === TokenType.Figure) {
				const { file_name } = await downloadAndZip(token.src, assetsFolder);
				token.src = `./${assetsPath}/${file_name}`;
			};
		};

		const markdown = parser(lex).join("\n\n");

		zip.file("index.md", markdown);
	}

	return zip;
};