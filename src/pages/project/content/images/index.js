import images from './**/*.{jpg,png}'

const getImage = dir => src => {
  const [name, ext] = src.split('.')

  return images[dir][name][ext]
}

export default getImage
