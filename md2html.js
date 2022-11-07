const path = require('path');
const fs = require('fs/promises');


const PATTERNS = [
  /* Cleaning */
  { pattern: /\r\n/g, replace: "\n" },
  { pattern: /\n{3,}/g, replace: "\n\n" },

  /* Headings */
  { pattern: /^(.+)\n=+$/mg, replace: "<h1>$1</h1>" },
  { pattern: /^(.+)\n-+$/mg, replace: "<h2>$1</h2>" },
  { pattern: /^#{1} (.+)$/mg, replace: "<h1>$1</h1>" },
  { pattern: /^#{2} (.+)$/mg, replace: "<h2>$1</h2>" },
  { pattern: /^#{3} (.+)$/mg, replace: "<h3>$1</h3>" },
  { pattern: /^#{4} (.+)$/mg, replace: "<h4>$1</h4>" },
  { pattern: /^#{5} (.+)$/mg, replace: "<h5>$1</h5>" },
  { pattern: /^#{6} (.+)$/mg, replace: "<h6>$1</h6>" },

  /* Lists */
  { pattern: /^([-+*] .+?)\n\n(?![\s-+*])/msg,
    replace: (_, p1) => `<ul>\n${transpileList(p1)}</ul>\n\n` },
  { pattern: /^(\d+\. .+?)\n\n(?!\s|(?:\d+\.))/msg,
    replace: (_, p1) => `<ol>\n${transpileList(p1)}</ol>\n\n` },

  /* Blockquotes */
  { pattern: /^> (.+?)\n\n/msg,
    replace: (_, p1) => `<blockquote>\n${transpileQuote(p1)}</blockquote>\n\n` },

  /* TODO: Paragraphs */
  { pattern: /(?<!^)  \n>*/mg, replace: "<br>" },
  { pattern: /(?<![\n>])\n(?![\s-+*<>]|(?:\d+\.))/g, replace: " " },

  /* Emphasis */
  { pattern: /(?<!\\)\*{2}([^\s*](?:.*?[^\s\\])?)\*{2}/g, replace: "<strong>$1</strong>" },
  { pattern: /(?<!\\)_{2}([^\s_](?:.*?[^\s\\])?)_{2}/g, replace: "<strong>$1</strong>" },
  { pattern: /(?<!\\)\*([^\s*](?:.*?[^\s\\])?)\*/g, replace: "<em>$1</em>" },
  { pattern: /(?<!\\)_([^\s_](?:.*?[^\s\\])?)_/g, replace: "<em>$1</em>" },
];


/**
 * Perform a Markdown -> HTML transpilation in a list item matched by a regex.
 *
 * @param   {String}  _ The whole matched string
 * @param   {String}  p1 Text content
 * @param   {String}  p2 Children items
 * @return  {String}  Generated HTML
 */
const sublistReplacer = (_, p1, p2) => {
  p2 = p2.replaceAll(/^  /mg, "");
  p2 = p2.replaceAll(/^  (?![\s-+*]|(?:\d+\.))/mg, "");
  const text = transpile(p1).trim();
  const children = transpile(p2).trim();
  return `<li>${text}\n${children}\n</li>`;
}

const LIST_PATTERNS = [
  /* Trim newlines in <li> */
  { pattern: /(?<!\n)\n {0,2}(?![\s-+*>]|(?:\d+\.))/g, replace: " " },

  /* Nested lists & block children */
  { pattern: /(?<=^|\n)[-+*] ([^\n]+)\n(\s.+?)(?=(?:\n[-+*])|$)/sg, replace: sublistReplacer },
  { pattern: /(?<=^|\n)\d+\. ([^\n]+)\n(\s.+?)(?=(?:\n\d+\.)|$)/sg, replace: sublistReplacer },

  /* Direct <li> items */
  { pattern: /^[-+*] (.+)$/mg, replace: (_, p1) => `<li>${transpile(p1).trim()}</li>` },
  { pattern: /^\d+\. (.+)$/mg, replace: (_, p1) => `<li>${transpile(p1).trim()}</li>` },
];


/**
 * Perform a transpilation from a list of patterns.
 * Patterns are applied in order.
 *
 * @param   {String}  text  Input text to transpile
 * @param   {Array}   patterns  List of { pattern, replace } objects to apply
 * @return  {String}  Transpiled text
 */
 function _transpile(text, patterns) {
  text = text.trim() + "\n\n";

  for (const { pattern, replace } of patterns) {
    text = text.replace(pattern, replace);
  }

  return text.trim() + "\n";
}


/**
 * Perform a Markdown -> HTML transpilation in a list.
 *
 * @param   {String}  list  Markdown list to transpile
 * @return  {String}  Generated HTML
 */
 function transpileList(list) {
  return _transpile(list, LIST_PATTERNS);
}


/**
 * Perform a Markdown -> HTML transpilation in a quote.
 *
 * @param   {String}  quote  Markdown quote to transpile
 * @return  {String}  Generated HTML
 */
 function transpileQuote(quote) {
  quote = quote.replaceAll(/^> ?/mg, "");
  return transpile(quote);
}


/**
 * Perform a Markdown -> HTML transpilation.
 *
 * @param   {String}  markdown  Markdown text to transpile
 * @return  {String}  Generated HTML
 */
 function transpile(markdown) {
  return _transpile(markdown.toString(), PATTERNS);
}


module.exports = transpile;


/**
 * Command line script.
 *
 * The input and output can be stdin and stdout by replacing
 * the relevant file name with `-`.
 *
 * @param  {String}  in   Input file
 * @param  {String}  out  Output file [optional]
 */
if (require.main == module) {
  const argv = process.argv.slice(2);

  // Change '-' for stdin
  const srcFile = argv[0] == '-' ? '/dev/stdin' : argv[0];
  const srcPath = path.parse(srcFile);

  // Change '-' for stdout
  let dstFile = argv[1] == '-' ? '/dev/stdout' : argv[1];

  // Set default output
  if (argv[0] != '-') {
    dstFile = dstFile ?? `${srcPath.dir}/${srcPath.name}.html`;
  }
  const dstPath = path.parse(dstFile);

  fs.access(srcFile)
    .then(() => fs.access(dstPath.dir))
    .then(() => fs.readFile(srcFile))
    .then(transpile)
    .then(html => fs.writeFile(dstFile, html))
    .catch(console.error);
}
