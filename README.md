# md2html

A simple and flexible markdown to html transpiler.

## Install

    npm i md2html

## Usage

### CLI

    node md2html input.md [output.html]
    node md2html input.md -
    cat input.md | node md2html - output.md

Use `-` to read from stdin or to write to stdout.

### JavaScript

```js
const md2html = require('md2html');
const html = md2html(md);
```

## Syntax

The basic Markdown syntax is supported as well as some extra features.
Moreover, Markdown is easily expandable by directly using HTML tags.

- [Basic syntax](https://www.markdownguide.org/basic-syntax/)
- [Extended syntax](https://www.markdownguide.org/extended-syntax/)
- [Hacks](https://www.markdownguide.org/hacks/)
