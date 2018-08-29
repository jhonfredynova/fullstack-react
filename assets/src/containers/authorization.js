import React from 'react'
import { connect } from 'react-redux'
import { includes } from 'lodash'
import PropTypes from 'prop-types'
import { setMessage } from 'actions/appActions'

export default function(ComposedComponent, requiredLevels, mustHaveAll) {
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
      const { isLoading } = props.app
      const { isAuthenticated, session } = props.auth
      if(isLoading) return
      if(!isAuthenticated) {
        await props.history.push('/login')
        props.dispatch(setMessage({ type: 'error', message: this.context.t('authNotLogin') }))
        return
      }else if(isAuthenticated && !includes(requiredLevels, session.permissions, mustHaveAll)){
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