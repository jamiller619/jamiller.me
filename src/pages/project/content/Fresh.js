import React from 'react'

import { Article, Section } from '../shared'

const listResetStyle = {
  listStyleType: 'none'
}

/* eslint-disable max-lines-per-function */
const Fresh = props => {
  return (
    <Article {...props}>
      <Section>
        <h3 className="near-black">React</h3>
        <p>
          No doubt, React is great. Fresh was formally inspired by it, among
          others, and retains many of the core concepts of React. But when I was
          first learning the library - I couldn't help but think it could be
          better, especially for the Web.{' '}
        </p>
        <h1 className="red">Fresh. Thinking.</h1>
        <h3>Featuring</h3>
        <ul>
          <li>Built on, for &amp; with, Web Components</li>
          <li>Components as Elements</li>
          <li>Any templating language, JSX by default</li>
          <li>Extensible, and highly efficient SPA Routing</li>
          <li>Easy &amp; predictable State Management</li>
          <li>Lightweight</li>
        </ul>
        <div className="flex-ns items-baseline lh-copy f4 pb3">
          <ul className="w-50-ns mr3-ns">
            <li className="nl4" style={listResetStyle}>
              <h4>Roadmap</h4>
            </li>
            <li>
              Customized Built-in Elements <i>-in progress</i>
            </li>
            <li>Single File Components (SFC) via new "JavaScript/ES" file</li>
          </ul>
          <ul className="w-50-ns">
            <li className="nl4" style={listResetStyle}>
              <h4>Articles (Future)</h4>
            </li>
            <li>JavaScript Won</li>
            <li>Routing and the Modern Web</li>
          </ul>
        </div>
      </Section>
      <Section>
        <h2>
          <span className="emoji">☄️ </span>Elements
        </h2>
        <div className="flex-l items-baseline nt3">
          <div className="w-50-l pr4-l">
            <p>
              At its core, Fresh is a library for creating{' '}
              <a href="https://developers.google.com/web/fundamentals/web-components/customelements">
                Custom Elements.
              </a>{' '}
              Elements in Fresh are the same thing as Components in React. They
              are modular, reusable, and encapsulated definitions of UI
              functionality with access to lifecycle hooks.
            </p>
            <p>
              Elements in Fresh come in two flavors: Class-based which inherit
              from <code className="language-js">Element</code> and is required
              for creating Custom Elements, and Functional, which are pure
              functions that return a DOM element or collection of DOM elements.
            </p>
          </div>
          <div className="w-50-l pl4-l">
            <figure>
              <pre
                // data-src={CodeExamples['className.js.code']}
                className="language-jsx">
                <code />
              </pre>
              <figcaption className="tl">
                A Class-based Element that creates a Custom Element.
              </figcaption>
            </figure>
            <figure>
              <pre
                // data-src={CodeExamples['function.js.code']}
                className="language-jsx">
                <code />
              </pre>
              <figcaption className="tl">
                A Functional Element that returns standard DOM node.
              </figcaption>
            </figure>
          </div>
        </div>
      </Section>
      <Section>
        <i>
          More documentation and examples in progress...
          {/* <a href={model.links.github}>Stay tuned!</a> */}
        </i>
      </Section>
    </Article>
  )
}

export default Fresh
