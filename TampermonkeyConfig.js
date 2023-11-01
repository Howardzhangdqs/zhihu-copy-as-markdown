import fs from "fs";
import md5 from "md5";

const packageInfo = JSON.parse(fs.readFileSync("./package.json", "utf-8").toString());

export const UserScriptContent = fs
	.readFileSync("./dist/bundle.min.js", "utf-8")
	.toString()
	.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "").trim();

export const UserScript = {
	"name"       : "知乎下载器",
	"namespace"  : "http://howardzhangdqs.eu.org/",
	"source"     : "https://github.com/Howardzhangdqs/zhihu-copy-as-markdown",
	"version"    : packageInfo.version + "-" + md5(UserScriptContent).slice(0, 6),
	"description": "一键复制知乎文章/回答为Markdown，下载文章/回答为zip（包含素材图片与文章/回答信息），备份你珍贵的回答与文章。",
	"author"     : packageInfo.author,
	"match"      : [
	    "*:\/\/www.zhihu.com\/*",
	    "*:\/\/zhuanlan.zhihu.com\/*"
	],
	"license": packageInfo.license,
	"icon"   : "https://static.zhihu.com/heifetz/favicon.ico",
	"grant"  : "none",
};