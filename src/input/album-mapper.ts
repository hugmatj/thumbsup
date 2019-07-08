/*
--------------------------------------------------------------------------------
Returns all albums that a file should belong to,
based on the --albums-from array of patterns provided
--------------------------------------------------------------------------------
*/

import * as _ from 'lodash'
import path from 'path'
const albumPattern = require('./album-pattern')

type UserPattern = string | Function

class AlbumMapper {

  patterns: Function[]

  constructor (patterns: UserPattern[]) {
    const defaulted = (patterns && patterns.length > 0) ? patterns : ['%path']
    this.patterns = defaulted.map(load)
  }
  getAlbums (file: string) : string[] {
    return _.flatMap(this.patterns, pattern => pattern(file))
  }
}

function load (pattern: UserPattern) : Function {
  // custom mapper file
  if (typeof pattern === 'string' && pattern.startsWith('file://')) {
    const filepath = pattern.slice('file://'.length)
    return require(path.resolve(filepath))
  }
  // string pattern
  if (typeof pattern === 'string') {
    return albumPattern.create(pattern)
  }
  // already a function
  return pattern
}

export { AlbumMapper }
