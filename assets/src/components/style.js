import React from 'react'
import { Style as StyleTag } from 'react-style-tag'

class Style extends React.PureComponent {

  render() {
    return (
      <div id="style">
        <StyleTag>
          {this.props.children}
        </StyleTag>
      </div>
    )
  }
  
}

export default Style
