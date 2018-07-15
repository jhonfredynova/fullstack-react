import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import NavigationBar from 'components/navigationBar'
import PropTypes from 'prop-types'

class NotFound extends Component {

  render(){
    return (
      <div className="text-center">
        <NavigationBar data= {{ title: <h1>{this.context.t('notFoundTitle')}</h1>, btnLeft: <button className="btn btn-success" onClick={() => this.context.router.history.goBack()}><i className="glyphicon glyphicon-arrow-left"></i></button> }} />
        <h1><i className="fa fa-chain-broken fa-2x"></i></h1>
        <p>{this.context.t('notFoundDescription')}</p>
        <p><Link to="/">{this.context.t('goHomePage')}</Link></p>
      </div>
    )
  }
}

NotFound.contextTypes = {
  router: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
}

export default NotFound
