const areObjectEqual = (a, b) => {
  for (const key in a) {
    if (a[key] !== b[key]) {
      return false
    }
  }

  return true
}

const useMemoRef = (getter, deps) => {
  let temp = null
  const copyDeps = () => deps.map(dep => Object.assign({}, dep))
  let lastDeps = deps && copyDeps()
  const hasDeps = deps != null
  const ref = {
    current: null
  }

  const areDepsEqual = () => {
    const equal = lastDeps.map((dep, i) => {
      return areObjectEqual(dep, deps[i])
    })

    lastDeps = copyDeps()

    return equal.includes(false) === false
  }

  const getCurrentValue = () => (temp ? temp : (temp = getter()))

  Object.defineProperty(ref, 'current', {
    set(value) {
      if (temp === null) temp = value
    },
    get() {
      if (hasDeps) {
        if (areDepsEqual()) {
          return getCurrentValue()
        }

        return (temp = getter())
      }

      return getCurrentValue()
    }
  })

  return Object.seal(ref)
}

export default useMemoRef
