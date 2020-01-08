import React from 'react'
import store from '/data/store'
import content from './content/*.js'

const getData = id => {
  const project = store.projects.filter(p => p.id === id)

  if (project.length !== 1) throw Error(`Project "${id}" not found!`)

  return project[0]
}

const ProjectContent = ({ id }) => {
  const data = getData(id)
  const Project = content[data.title.replace(/ /gu, '')].default

  return <Project />
}

export default ProjectContent
