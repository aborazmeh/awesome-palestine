module.exports = {
  plugins: [
    require("remark-frontmatter"),
    [
      require("remark-stringify"),
      {
        bullet: "-",
        listItemIndent: "1",
      },
    ],
  ],
}
