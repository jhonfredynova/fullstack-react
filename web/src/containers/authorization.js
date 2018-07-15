import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { setMessage } from 'actions/appActions'

export default function(ComposedComponent, requiredPermissions, hasAll) {
  class Authorization extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        renderComponent: false
      }
    }

    componentWillMount() {
      this.handleAuthentication(this.props)
    }

    componentWillUpdate(nextProps) {
      this.handleAuthentication(nextProps)
    }

    async handleAuthentication(props){
      const { isAuthenticated, session } = props.auth
      const isAuthorized = session ? session.hasPermissions(requiredPermissions, hasAll) : false
      if (!isAuthenticated) {
        await props.history.push('/login')
        props.dispatch(setMessage({ type: 'error', message: this.context.t('authNotLogin') }))
        return
      }else if(isAuthenticated && !isAuthorized){
        await props.history.push('/')
        props.dispatch(setMessage({ type: 'error', message: this.context.t('authNotPriviliges') }))
        return
      }
      if(!this.state.renderComponent) this.setState({ renderComponent: true })
    }

    render() {
      return (
        <div>
          {this.state.renderComponent ? <ComposedComponent {...this.props} /> : null }
        </div>
      )
    }
  }

  Authorization.contextTypes = {
    t: PropTypes.func.isRequired
  }

  function mapStateToProps(state) {
    return {
      app: state.app,
      auth: state.auth
    }
  }

  return connect(mapStateToProps)(Authorization)
}