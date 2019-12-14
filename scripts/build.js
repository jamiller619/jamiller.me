const fs = require('fs-extra')
const path = require('path')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')

const ROOT = path.join(__dirname, '../')
const ROOT_DEV = path.join(ROOT, 'dev')
const ROOT_DIST = path.join(ROOT, 'dist/jamiller.me')

const imagesPath = path.join(ROOT_DIST, '*.{jpg,png}')

// Static images used on Github - Parcel won't copy these because they're not referenced
fs.copySync(path.join(ROOT_DEV, 'static'), path.join(ROOT_DIST, 'static'))

const minifyImages = async () => {
  await imagemin([imagesPath], ROOT_DIST, {
    plugins: [
      imageminJpegtran(),
      imageminPngquant({ quality: '65-80' })
    ]
  })
  console.log('images minified!')
}

minifyImages()
