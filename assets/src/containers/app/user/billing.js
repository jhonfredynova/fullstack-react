import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'

class Billing extends Component {
  render() {
    return (
      <div id="subscription">
        <NavigationBar data={{ title: <h1>{this.context.t('billingTitle')}</h1>, subTitle: <h2>{this.context.t('billingDescription')}</h2> }} />
      </div>
    )
  }
}

Billing.contextTypes = {
  t: PropTypes.func.isRequired
}

export default Billing
