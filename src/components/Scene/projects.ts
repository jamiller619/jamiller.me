export type Project = {
  id: string
  title: string
}

// One entry per original letter. Repeated cards share the same project.
// Fictional projects used as portfolio placeholders.
export const projects: readonly Project[] = [
  { id: 'A', title: 'Afterhours' },
  { id: 'B', title: 'Common Ground' },
  { id: 'C', title: 'Fieldwork' },
  { id: 'D', title: 'Good Measure' },
  { id: 'E', title: 'Offscript' },
  { id: 'F', title: 'Sidecar' },
  { id: 'G', title: 'Still Life' },
  { id: 'H', title: 'Wayfinder' },
]
