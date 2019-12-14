import React, { useEffect, useState, useRef } from 'react'

const renderPage = (renders, props) => {
  return new Promise(resolve => {
    renders().then(page => resolve(page.default(props)))
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
