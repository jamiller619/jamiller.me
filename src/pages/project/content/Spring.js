import React from 'react'
import { Article, Section } from '../shared'
import getImages from './images'

const images = getImages('spring')

const Spring = () => {
  return (
    <Article>
      <Section>
        <h2>New Tabs all day &mdash; err day</h2>
        <p>
          Spend enough time on Chrome and a New Tab page can actually become
          important enough to build something worth looking at. 🤷🏻‍♂️
        </p>
      </Section>
      <Section>
        <figure className="pb4">
          <img className="center db w-100 mb2" src={images('logo.jpg')} />
          <figcaption>
            The hilariously unnecessary logo for Spring - featuring none other
            than Futura.
          </figcaption>
        </figure>
        <figure className="pb4">
          <img
            className="center db w-100 mb2"
            src={images('chrome-window.jpg')}
          />
          <figcaption>
            Spring features a large, full-size background image from Unsplash
            that changes every day.
          </figcaption>
        </figure>
        <img className="center db w-100 mb4" src={images('logo-colors.jpg')} />
      </Section>
    </Article>
  )
}

export default Spring
