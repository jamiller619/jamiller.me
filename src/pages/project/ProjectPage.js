import React from 'react'
import { useParams } from 'react-router-dom'
import store from '/data/store'

const ProjectPage = () => {
  const { id } = useParams()
  const data = store.projects[id]

  return <div style={{ height: 1200 }}>im a product page</div>
}

export default ProjectPage
