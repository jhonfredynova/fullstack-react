import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { cloneDeep, flow, get, set } from 'lodash'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { register } from 'actions/authActions'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class Register extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      model: {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        passwordConfirmation: ''
      }
    }
  }

  async handleChangeState(path, value) {
    if (path==='model.email' || path==='model.username') {
      value = value.replace(/\s/g, '')
    }
    await this.setState(set(this.state, path, value))
    await this.handleValidate(path)
  }

  async handleValidate(path) {
    let errors = flow(cloneDeep, Object.cleanDeep)(this.state.errors)
    if(Object.isEmpty(this.state.model.firstname)) {
      errors.model.firstname = this.context.t('enterFirstname')
    }
    if(Object.isEmpty(this.state.model.lastname)) {
      errors.model.lastname = this.context.t('enterLastname')
    }
    if(Object.isEmpty(this.state.model.username)) {
      errors.model.username = this.context.t('enterUsername')
    }
    if(Object.isEmpty(this.state.model.email)) {
      errors.model.email = this.context.t('enterEmail')
    }
    if(!Object.isEmpty(this.state.model.email) && !Object.isEmail(this.state.model.email)) {
      errors.model.email = this.context.t('enterEmailFormat')
    }
    if(Object.isEmpty(this.state.model.password) || Object.keys(this.state.model.password).length<6) {
      errors.model.password = this.context.t('enterPasswordMin5Char')
    }
    if(this.state.model.password!==this.state.model.passwordConfirmation) {
      errors.model.passwordConfirmation = this.context.t('enterPasswordNotMatch')
    }
    if(path) errors = set(this.state.errors, path, get(errors, path))
    await this.setState({ errors: errors })
  }

  async handleRegister(e) {
    try{
      if(e) e.preventDefault()
      //validate
      await this.handleValidate()
      if(!flow(cloneDeep, Object.compactDeep, Object.isEmpty)(this.state.errors)){
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('formErrors') }))
        return
      }   
      //execute
      this.props.dispatch(showLoading())
      await this.props.dispatch(register(this.state.model))
      const { session } = this.props.auth
      this.props.history.push(`/login/${session.currentPassport.provider}/${session.currentPassport.token}`)
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    return (
      <div>
        <Seo data={{ title: this.context.t('registerTitle'), description: this.context.t('registerDescription'), siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.context.t('registerTitle')}</h1>, subTitle: <h2>{this.context.t('registerDescription')}</h2> }} />
        <div className="alert alert-info">{this.context.t('userAlreadyHasAccount', {loginUrl: <Link to="/login">here</Link>})}</div>
        <div className="row">
          <div className="col-md-6">
            <h2 className="text-center">{this.context.t('loginWithSocialNetworks')}</h2>
            <a href={`${process.env.REACT_APP_LOCAL_API_URL}/auth/facebook/`} className="btn btn-lg btn-block btn-social btn-facebook">
              <i className="fa fa-facebook-official"></i> {this.context.t('loginWithFacebook')}
            </a>
            <a href={`${process.env.REACT_APP_LOCAL_API_URL}/auth/google/`} className="btn btn-lg btn-block btn-social btn-google">
              <i className="fa fa-google-plus-square"></i> {this.context.t('loginWithGoogle')}
            </a>
          </div>
          <div className="col-md-6">
            <h2 className="text-center">{this.context.t('loginWithEmail')}</h2>
            <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
            <form onSubmit={this.handleRegister.bind(this)}>
              <div className="form-group">
                <label>{this.context.t('firstname')} <span>*</span></label>
                <input type="text" className="form-control" value={this.state.model.firstname} onChange={event => this.handleChangeState('model.firstname', event.target.value)} />
                <p className="text-danger">{this.state.errors.model.firstname}</p>
              </div>
              <div className="form-group">
                <label>{this.context.t('lastname')} <span>*</span></label>
                <input type="text" className="form-control" value={this.state.model.lastname} onChange={event => this.handleChangeState('model.lastname', event.target.value)} />
                <p className="text-danger">{this.state.errors.model.lastname}</p>
              </div>
              <div className="form-group">
                <label>{this.context.t('username')} <span>*</span></label>
                <input type="text" className="form-control" value={this.state.model.username} onChange={event => this.handleChangeState('model.username', event.target.value)} />
                <p className="text-danger">{this.state.errors.model.username}</p>
              </div>
              <div className="form-group">
                <label>{this.context.t('email')} <span>*</span></label>
                <input type="text" className="form-control" value={this.state.model.email} onChange={event => this.handleChangeState('model.email', event.target.value)} />
                <p className="text-danger">{this.state.errors.model.email}</p>
              </div>
              <div className="form-group">
                <label>{this.context.t('password')} <span>*</span></label>
                <input type="password" className="form-control" value={this.state.model.password} onChange={event => this.handleChangeState('model.password', event.target.value)} />
                <p className="text-danger">{this.state.errors.model.password}</p>
              </div>
               <div className="form-group">
                <label>{this.context.t('passwordConfirm')} <span>*</span></label>
                <input type="password" className="form-control" onChange={event => this.handleChangeState('model.passwordConfirmation', event.target.value)}  />
                <p className="text-danger">{this.state.errors.model.passwordConfirmation}</p>
              </div>
              <div className="form-group text-right">
                <button type="submit" className="btn btn-success btn-lg">{this.context.t('register')}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

Register.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app,
    auth: state.auth
  }
}

export default connect(mapStateToProps)(Register)
