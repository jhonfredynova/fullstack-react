import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Loading from 'react-loading-bar'
import { defaults, get, isEmpty } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import { setTranslations, setLanguage } from 'redux-i18n'
import Header from 'components/header'
import Footer from 'components/footer'
import Message from 'components/message'
import Style from 'components/style'
import { getConfig, setMessage, deleteMessage, setPreference } from 'actions/appActions'
import { getToken, me } from 'actions/authActions'
import { connectSocket, onEvent, EVENT } from 'actions/socketActions'

class Main extends React.PureComponent {

  async componentWillMount() {
    try{      
      await this.props.dispatch(getConfig())     
      this.props.dispatch(getToken())
      this.props.dispatch(me())
      this.props.dispatch(onEvent(EVENT.CONNECT, (data) => this.props.dispatch(connectSocket()) )) 
      const { config } = this.props.app
      const { session } = this.props.auth      
      const preferences = defaults(get(session, 'preferences'), config.appPreferences)
      this.props.dispatch(setPreference(preferences))
      moment.locale(config.appPreferences.language)      
      this.props.dispatch(setTranslations(config.appIntl.locales))
      this.props.dispatch(setLanguage(config.appPreferences.language))
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message, hideClose: true }))
    }
  }

  async componentWillUpdate(prevProps) {
    try{
      const { config } = this.props.app
      ReactDOM.findDOMNode(this).scrollTop = 0
      if(config.appDisabled && this.props.location.pathname!=='/coming-soon') {
        return this.props.history.push('/coming-soon')
      }
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  async componentDidUpdate(prevProps) {
    try{
      if(this.props.location!==prevProps.location){
        return this.props.dispatch(deleteMessage())
      }
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  render() {
    const { isLoading, config, messages } = this.props.app
    return (
      <div id="main">
        { isLoading && <div className="loading-backdrop" /> }
        <Loading color="green" show={isLoading} showSpinner={false} />
        <Message isLoading={isLoading} messages={messages} />
        <Header isLoading={isLoading} app={this.props.app} auth={this.props.auth} />
        <section className="container-fluid">
          { !isEmpty(config) && this.props.children }
        </section>
        <Footer isLoading={isLoading} app={this.props.app} />
        <Style>
        {`
          img{
            font-size: 0px;
          }
          table td{
            vertical-align: middle!important;
          }
          .loading-backdrop{
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1100;
            background-color: white;
            opacity: 0.2;
          }
          .modal-header {
            background-color: #f5f5f5;
            border-radius: 6px 6px 0px 0px;
          }
          .nav-tabs .nav-link {
            cursor: pointer;
          }
          .ql-editor p{
            margin: 0 0 10px;
          }
          .css-15k3avv {
            z-index: 999!important;
          } 
          .text-deleted{
            text-decoration: line-through;
          }
        `}
        </Style>
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
    auth: state.auth,
    socket: state.socket
  }
}

export default withRouter(connect(mapStateToProps)(Main))
