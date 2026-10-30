import type { ImageMetadata } from 'astro'
import placeholder1 from '../../assets/blog-placeholder-1.jpg'
import placeholder2 from '../../assets/blog-placeholder-2.jpg'
import placeholder3 from '../../assets/blog-placeholder-3.jpg'
import placeholder4 from '../../assets/blog-placeholder-4.jpg'
import placeholder5 from '../../assets/blog-placeholder-5.jpg'
import placeholderAbout from '../../assets/blog-placeholder-about.jpg'

export type Project = {
  id: string
  title: string
  image: ImageMetadata
}

// One entry per original letter. Repeated cards share the same project.
// Fictional projects used as portfolio placeholders.
export const projects: readonly Project[] = [
  { id: 'A', title: 'Afterhours', image: placeholder1 },
  { id: 'B', title: 'Common Ground', image: placeholder2 },
  { id: 'C', title: 'Fieldwork', image: placeholder3 },
  { id: 'D', title: 'Good Measure', image: placeholder4 },
  { id: 'E', title: 'Offscript', image: placeholder5 },
  { id: 'F', title: 'Sidecar', image: placeholderAbout },
  { id: 'G', title: 'Still Life', image: placeholder1 },
  { id: 'H', title: 'Wayfinder', image: placeholder2 },
]
