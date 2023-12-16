import { Token, TokenizerAndRendererExtension, marked } from "marked";
import { getUrlType } from "./util";
import config from "../../config";
import TokenMeta from "../types/TokenMeta";
import URLType from "../types/URLtype";

type ValueType = Array<{
  url: string,
  type: URLType
}>

export const parseLinks = (token: Token)=> {

  let links: Array<string> = []

  const traverse = (node: Token)=> {

    if(node.type == "list")
      node.items.map(n => traverse(n));

    if(node.type == "link")
      links.push(node.href);

    if(Array.isArray(node['tokens']))
      (node as any).tokens.map(n => traverse(n))

  }

  traverse(token);

  return links;
}

export const parseHeading = (token: Token)=> {
  if(!Array.isArray(token["tokens"]) || token["tokens"].length == 0) return '';
  let tokens = token["tokens"];

  for(let i=0;i<tokens.length; i+=1)
    if(tokens[i].type === "text")
      return tokens[i].text.trim();

  return '';
}


const parseTokens = async (markDown: string): Promise<
  Array<TokenMeta<ValueType>>
> => {

  let tokens: Array<TokenMeta<ValueType>> = [];

  const headingExtension: TokenizerAndRendererExtension = {
    name: 'heading',
    renderer(token) {
      let key = parseHeading(token);
      if(key.length > 0 &&  !config.excludeSections.includes(key))
        tokens.push({ depth: token.depth, key });
      return ''
    }
  }

  const listExtension: TokenizerAndRendererExtension = {
    name: 'list',
    renderer(token) {
      if(tokens.at(-1) !== undefined)
        ((tokens.at(-1)) as TokenMeta<ValueType>).val = parseLinks(token).map(url=> {
          return ({url, type: getUrlType(url)})
        });
      return ''
    }
  }

  marked.use({
    pedantic: false,
    gfm: true,
    breaks: true,
    extensions: [headingExtension, listExtension]
  });

  await marked.parse(markDown);

  return tokens;
};

const tokensToJson = (tokens: Array<TokenMeta<ValueType>>)=> {
  let keys: typeof tokens = []
  let res = {}

  const addToObject = (obj: object, keys: Array<string>, value:any)=> {
    if(keys.length == 1) return {...obj, [keys[0]]: value};
    let o, copy = o = JSON.parse(JSON.stringify(obj));
    for(let i=0;i<keys.length-1;i+=1)
    {
      const key = keys[i];
      o = o[key];
    }

    o[keys.at(-1) as string] = {...o[keys.at(-1) as string], ...value};
    return copy;
  }

  tokens.forEach(token => {
    let auxiliaryKeys: typeof tokens = []

    for(let i=0;i<keys.length;i+=1)
      if(keys[i].depth < token.depth)
        auxiliaryKeys.push(keys[i]);

    auxiliaryKeys.push(token);
    keys = auxiliaryKeys;

    res = addToObject(res, keys.map(k => k.key), {
      data: token.val
    });
  });

  return res;
}

const parseMd = async (md: string)=> {
  return tokensToJson(
    await parseTokens(md)
  );
};

export default parseMd;
