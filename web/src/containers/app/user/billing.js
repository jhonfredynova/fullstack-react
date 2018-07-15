import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'

class Billing extends Component {
  render() {
    return (
      <div id="subscription">
        <NavigationBar data={{ title: <h1>Billing</h1> }} />
      </div>
    )
  }
}

Billing.contextTypes = {
  t: PropTypes.func.isRequired
}

export default Billing
