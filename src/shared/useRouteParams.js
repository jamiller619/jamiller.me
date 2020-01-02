import { useRouteMatch } from 'react-router-dom'

const useRouteParams = route => {
  const match = useRouteMatch(route)

  if (match && match.params) return match.params

  const params = route.split(':').filter(parts => !parts.includes('/'))

  return params.map(param => ({
    [param]: null
  }))
}

export default useRouteParams
