import React from 'react'
import styled from '/tachyons/styled'

const Letter = styled('span', 'dib')

const Word = styled('span', 'dib', {
  style: {
    overflow: 'hidden',
    marginRight: '0.25em'
  }
})

const makeLetter = (letter, i) => {
  return <Letter key={`${letter}-${i}`}>{letter}</Letter>
}

const makeWord = (word, i) => {
  return <Word key={`${word}-${i}`}>{word.split('').map(makeLetter)}</Word>
}

const TextSplitter = ({ children }) => {
  const words = children.split(' ')

  return words.map(makeWord)
}

export default TextSplitter
