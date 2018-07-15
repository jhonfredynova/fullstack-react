import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Loading from 'react-loading-bar'
import classnames from 'classnames'
import { defaults, get } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import { setTranslations, setLanguage } from 'redux-i18n'
import Header from 'components/header'
import Footer from 'components/footer'
import Message from 'components/message'
import { hideLoading, showLoading, getConfig, getPreference, setMessage, setPreference, deleteMessage } from 'actions/appActions'
import { getToken, me } from 'actions/authActions'
import './main.css'

class Main extends Component {

  constructor(props){
    super(props)
    this.state = {
      appLoaded: false
    }
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getPreference())
      const localPreferences = this.props.app.temp
      await this.props.dispatch(getConfig({ baseCurrency: localPreferences.currency }))
      await this.props.dispatch(getToken())
      await this.props.dispatch(me())
      const { config } = this.props.app
      const { session } = this.props.auth
      const preferences = defaults(get(session, 'preferences', {}), localPreferences, config.appPreferences)
      await this.props.dispatch(setPreference(preferences))
      await moment.locale(config.appPreferences.language)
      await this.props.dispatch(setTranslations(config.appIntl.locales))
      await this.props.dispatch(setLanguage(config.appPreferences.language))
      await this.props.dispatch(hideLoading())
      await this.setState({ appLoaded: true })
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: this.context.t('mainError', { error: e.message}), hideClose: true }))
      this.props.dispatch(hideLoading())
    }
  }

  async componentWillUpdate(prevProps) {
    try{
      const { config, messages } = this.props.app
      ReactDOM.findDOMNode(this).scrollTop = 0
      if (config.appDisabled && this.props.location.pathname!=='/coming-soon') {
        return this.props.history.push('/coming-soon')
      }
      if (this.props.location!==prevProps.location && messages.length>0){
        return this.props.dispatch(deleteMessage())
      }
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  render() {
    const { appLoaded } = this.state
    const { isLoading, messages } = this.props.app
    return (
      <div id="main">
        <div className={classnames({'overlay': isLoading})} />
        <Loading color="green" show={isLoading} showSpinner={false} />
        <Header data={{ appLoaded: appLoaded, app: this.props.app, auth: this.props.auth }} />
        <Message data={{ messages: messages }} />
        <section className="container-fluid">
          {appLoaded ? this.props.children : null}
        </section>
        <Footer data={{ appLoaded: appLoaded, app: this.props.app, auth: this.props.auth }} />
      </div>
    )
  }
}

Main.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app,
    auth: state.auth
  }
}

export default withRouter(connect(mapStateToProps)(Main))
