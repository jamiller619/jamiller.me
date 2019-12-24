const useLoaded = callback => {
  const startTime = Date.now()
  const state = {
    itemsToLoad: 0,
    itemsLoaded: 0
  }

  const handleLoadComplete = () => {
    state.itemsLoaded = state.itemsLoaded + 1

    if (state.itemsToLoad > 0 && state.itemsLoaded === state.itemsToLoad) {
      callback({
        totalItemsLoaded: state.itemsLoaded,
        duration: Date.now() - startTime
      })
    }
  }

  return loadHandler => {
    state.itemsToLoad = state.itemsToLoad + 1

    return loadHandler
      ? { ...loadHandler(handleLoadComplete) }
      : {
          onLoad: handleLoadComplete
        }
  }
}

export default useLoaded
