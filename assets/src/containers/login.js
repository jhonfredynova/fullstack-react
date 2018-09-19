import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { clean, compact, get, set, isEmpty } from 'lodash'
import PropTypes from 'prop-types'
import { login, me, setToken } from 'actions/authActions'
import { hideLoading, showLoading, setMessage, setPreference } from 'actions/appActions'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class Login extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      errors: { 
        model: {}
      },
      model: {
        username: '',
        password: ''
      }
    }
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      const { provider, token } = this.props.match.params
      if (provider && token) {
        await this.props.dispatch(setToken({provider: provider, token: token}))
        await this.props.dispatch(me())
        this.props.history.push('/app/dashboard')
        const { session } = this.props.auth
        if (!session) return this.props.dispatch(setMessage({ type: 'error', message: this.context.t('loginError', { provider: provider }) }))
        await this.props.dispatch(setPreference(session.preferences))          
        this.props.dispatch(setMessage({ type: 'success', message: this.context.t('welcomeUser', {username: session.username}) }))
      }
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value) {
    if(path==='model.username'){
      value = value.replace(/\s/g, '')
    }
    await this.setState(set(this.state, path, value))
    await this.handleValidate(path)
  }

  async handleValidate(path){
    let errors = clean(this.state.errors)
    if(isEmpty(this.state.model.username)) {
      errors.model.username = this.context.t('enterEmailOrUsername')
    }
    if(isEmpty(this.state.model.password)) {
      errors.model.password = this.context.t('enterPassword')
    }
    if(path) errors = set(this.state.errors, path, get(errors, path))
    await this.setState({ errors: errors })
  }

  async handleLogin(e){
    try{
      if(e) e.preventDefault()
      //validate
      await this.handleValidate()
      if(!isEmpty(compact(this.state.errors))){
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('formErrors') }))
        return
      }
      //execute
      this.props.dispatch(showLoading())
      await this.props.dispatch(login(this.state.model))
      const { session } = this.props.auth
      this.props.history.push(`/login/${session.currentPassport.provider}/${session.currentPassport.token}`)
      this.props.dispatch(hideLoading())
      this.componentWillMount()
    }catch(e){
      this.props.dispatch(hideLoading())
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  render() {
    return (
      <div id="login">
        <Seo title={this.context.t('loginTitle')} description={this.context.t('loginDescription')} siteName={this.context.t('siteName')} />
        <NavigationBar 
          title={<h1>{this.context.t('loginTitle')}</h1>} 
          description={<h2>{this.context.t('loginDescription')}</h2>} />
	    <div className="alert alert-info" role="alert">
          <p className="mb-0"><Link to="/register">{this.context.t('haveNotAccount')}</Link></p>
          <p className="mb-0"><Link to="/forgot-account">{this.context.t('forgotPassword')}</Link></p>
        </div>
        <div className="row">
          <div className="col-md-6">
            <h2 className="text-center">{this.context.t('loginWithSocialNetworks')}</h2>
            <a href={`${process.env.REACT_APP_LOCAL_API_URL}/auth/facebook`} className="btn btn-lg btn-block btn-social btn-facebook">
              <i className="fab fa-facebook"></i> {this.context.t('loginWithFacebook')}
            </a>
            <a href={`${process.env.REACT_APP_LOCAL_API_URL}/auth/google/`} className="btn btn-lg btn-block btn-social btn-google">
              <i className="fab fa-google-plus"></i> {this.context.t('loginWithGoogle')}
            </a>
          </div>
          <div className="col-md-6">
            <h2 className="text-center">{this.context.t('loginWithEmail')}</h2>
            <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
            <form onSubmit={this.handleLogin.bind(this)}>
              <div className="form-group">
                <label>{this.context.t('username')} <span>*</span></label>
                <input type="text" className="form-control" value={this.state.model.username} onChange={e => this.handleChangeState('model.username', e.target.value)}  />
                <span className="text-danger">{this.state.errors.model.username}</span>
              </div>
              <div className="form-group">
                <label>{this.context.t('password')} <span>*</span></label>
                <input type="password" className="form-control" value={this.state.model.password} onChange={e => this.handleChangeState('model.password', e.target.value)}  />
                <span className="text-danger">{this.state.errors.model.password}</span>
              </div>
              <div className="form-group text-right">
                <button type="submit" className="btn btn-success btn-lg">{this.context.t('login')}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

Login.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    auth: state.auth
  }
}

export default connect(mapStateToProps)(Login)
