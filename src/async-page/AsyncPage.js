import { useEffect, useState, useRef } from 'react'

const error = page =>
  Error(
    `AsyncPage render returned "${typeof page}". Check console for more information.`
  )

const renderPage = (renders, props) => {
  return new Promise((resolve, reject) => {
    renders().then(page => {
      if (page.default) {
        resolve(page.default(props))
      } else {
        console.error('AsyncPage render returned invalid with props: ', props)

        reject(error(page.default))
      }
    })
  })
}

const AsyncPage = ({ renders, ...props }) => {
  const isMounted = useRef(false)
  const [{ page }, setState] = useState({
    page: null
  })

  useEffect(() => {
    isMounted.current = true
    renderPage(renders, props).then(page => {
      if (isMounted.current) {
        setState({ page })
      }
    })

    return () => {
      isMounted.current = false
    }
  }, [page != null])

  return page ? page : null
}

export default AsyncPage
