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

  /* TODO: Paragraphs */
  { pattern: /  \n/g, replace: "<br>" },
  { pattern: /(?<!\n)\n(?![\s-+*])/g, replace: " " },

  /* Emphasis */
  { pattern: /(?<!\\)\*{2}([^\s*](?:.*?[^\s\\])?)\*{2}/g, replace: "<strong>$1</strong>" },
  { pattern: /(?<!\\)_{2}([^\s_](?:.*?[^\s\\])?)_{2}/g, replace: "<strong>$1</strong>" },
  { pattern: /(?<!\\)\*([^\s*](?:.*?[^\s\\])?)\*/g, replace: "<em>$1</em>" },
  { pattern: /(?<!\\)_([^\s_](?:.*?[^\s\\])?)_/g, replace: "<em>$1</em>" },
];


/**
 * Perform a Markdown -> HTML transpilation.
 *
 * @param   {String}  markdown  Markdown text to transpile
 * @return  {String}  Generated HTML
 */
 function transpile(markdown) {
  let html = markdown.toString() + "\n";

  for (let { pattern, replace } of PATTERNS) {
    html = html.replaceAll(pattern, replace);
  }

  return html;
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
