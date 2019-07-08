/*
--------------------------------------------------------------------------------
Returns a list of album names for every file.
Can be based on anything, e.g. directory name, date, metadata keywords...
e.g. `Holidays/London/IMG_00001.jpg` -> `Holidays/London`
--------------------------------------------------------------------------------
*/
const moment = require('moment')
const path = require('path')

interface File {
  path: string,
  meta: {
    keywords: string[],
    date: string
  }
}

type TokenFunction = (file: File) => string
type TokenMap = {
  [key: string]: TokenFunction
}

const TOKEN_REGEX = /%[a-z]+/g
const DATE_REGEX = /{[^}]+}/g

const TOKEN_FUNC: TokenMap = {
  '%path': (file: File) => path.dirname(file.path)
}

function create (pattern: string) {
  const cache = {
    usesTokens: TOKEN_REGEX.test(pattern),
    usesDates: DATE_REGEX.test(pattern),
    usesKeywords: pattern.indexOf('%keywords') > -1
  }
  // return a standard mapper function (file => album names)
  return function (file: File) {
    var album = pattern
    // replace known tokens
    if (cache.usesTokens) {
      album = album.replace(TOKEN_REGEX, token => replaceToken(file, token))
    }
    if (cache.usesDates) {
      album = album.replace(DATE_REGEX, format => replaceDate(file, format))
    }
    // create one album per keyword if required
    if (cache.usesKeywords) {
      return file.meta.keywords.map(k => album.replace('%keywords', k))
    } else {
      return [album]
    }
  }
}

function replaceToken (file: File, token: string): string {
  const fn = TOKEN_FUNC[token]
  return fn ? fn(file) : token
}

function replaceDate (file: File, format: string): string {
  const fmt = format.slice(1, -1)
  return moment(file.meta.date).format(fmt)
}

export { create }
