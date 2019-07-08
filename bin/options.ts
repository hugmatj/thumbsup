const path = require('path')
import * as args from './args'
// const args = require('./args')

// explicitly pass <process.argv> so we can unit test this logic
// otherwise it pre-loads all process arguments on require()
exports.get = function (argv: string[]) : args.ProgramOptions {
  const opts = args.parse(argv)
  
  // Make input/output folder absolute paths
  opts.input = path.resolve(opts.input)
  opts.output = path.resolve(opts.output)

  // By default, use relative links to the input folder
  if (opts.downloadLinkPrefix) opts.linkPrefix = opts.downloadLinkPrefix
  if (!opts.linkPrefix) {
    opts.linkPrefix = path.relative(opts.output, opts.input)
  }

  // Convert deprecated --download
  if (opts.originalPhotos) opts.downloadPhotos = 'copy'
  if (opts.originalVideos) opts.downloadVideos = 'copy'
  if (opts.downloadPhotos) opts.photoDownload = opts.downloadPhotos
  if (opts.downloadVideos) opts.videoDownload = opts.downloadVideos
  if (opts.photoDownload === 'large') opts.photoDownload = 'resize'
  if (opts.videoDownload === 'large') opts.videoDownload = 'resize'

  // Convert deprecated --albums-from
  replaceInArray(opts.albumsFrom, 'folders', '%path')
  replaceInArray(opts.albumsFrom, 'date', `{${opts.albumsDateFormat}}`)

  // Convert deprecated --css
  if (opts.css) opts.themeStyle = opts.css

  // Add a dash prefix to any --gm-args value
  // We can't specify the prefix on the CLI otherwise the parser thinks it's a thumbsup arg
  if (opts.gmArgs) {
    opts.gmArgs = opts.gmArgs.map(val => `-${val}`)
  }

  return opts
}

function replaceInArray (list: string[], match: string, replacement: string) {
  for (var i = 0; i < list.length; ++i) {
    if (list[i] === match) {
      list[i] = replacement
    }
  }
}
