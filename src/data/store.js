import data from './data.json'
import images from './images/**/*.{jpg,png}'

const getProjectImages = projectId => {
  const found = images[projectId]
  if (found) {
    return found
  }

  console.warn(`Could not find images for project: "${projectId}"`)

  return null
}

const initProject = (project = {}) => {
  const { id, thumbnail } = project
  const images = getProjectImages(id)
  const coverImage = {
    src: images && images.cover && (images.cover.jpg || images.cover.png),
    alt: thumbnail && thumbnail.alt
  }

  return {
    ...project,
    coverImage,
    images: images || {}
  }
}

const store = {
  projects: data.projects.map(initProject)
}

export default store
