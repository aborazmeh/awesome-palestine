/*
  * Converts readme.md links to JSON format
*/

import { readFileSync, writeFileSync } from "fs";
import parseMd from "./lib/parse-md";

const MD_FILE_PATH = "../../README.md";
const DIST_FILE_PATH = "./data/awesome-palestine.json";

writeFileSync(
  DIST_FILE_PATH,
  JSON.stringify((await parseMd(
    readFileSync(MD_FILE_PATH, "utf-8")
  )))
);




