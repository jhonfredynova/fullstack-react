import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'

class Subscription extends Component {
  render() {
    return (
      <div id="subscription">
        <NavigationBar data={{ title: <h1>Subscription</h1> }} />
      </div>
    )
  }
}

Subscription.contextTypes = {
  t: PropTypes.func.isRequired
}


export default Subscription
