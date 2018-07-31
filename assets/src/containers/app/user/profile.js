import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { cloneDeep, defaults, flow, keys, get, set, omit } from 'lodash'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getUser, updateUser } from 'actions/userActions'
import NavigationBar from 'components/navigationBar'

class Profile extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      changePassword: false,
      model: {
        id: null,
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        emailConfirmed: null,
        photo: '',
        password: '',
        passwordConfirmation: ''
      }
    }
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      const { session } = this.props.auth
      await this.props.dispatch(getUser({ where:{ id: session.id }, select: keys(omit(this.state.model,['passwordConfirmation'])) }))
      await this.setState({ model: defaults(this.props.user.temp, this.state.model) })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value) {
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
    if (!Object.isEmpty(this.state.model.email) && !Object.isEmail(this.state.model.email)) {
      errors.model.email = this.context.t('enterEmailFormat')
    }
    if (this.state.changePassword) {
      if(Object.isEmpty(this.state.model.password) || Object.keys(this.state.model.password).length<6) {
        errors.model.password = this.context.t('enterPasswordMin5Char')
      }
      if(this.state.model.password!==this.state.model.passwordConfirmation) {
        errors.model.passwordConfirmation = this.context.t('enterPasswordNotMatch')
      }
    }
    if(path) errors = set(this.state.errors, path, get(errors, path))
    await this.setState({ errors: errors })
  }

  async handleSubmit(e){
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
      if (!this.state.changePassword) this.state.model = omit(this.state.model, ['password', 'passwordConfirmation'])
      await this.props.dispatch(updateUser(this.state.model))  
      this.setState({
        changePassword: false,
        model: Object.assign(this.state.model, {
          password: '',
          passwordConfirmation: ''
        })
      })
      this.props.dispatch(setMessage({ type: 'success', message: this.context.t('successfulOperation') }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const tooltipEmail = (
      <Tooltip id="tooltipEmail">
        { this.state.model.emailConfirmed ? this.context.t('emailConfirmed') : this.context.t('emailUnconfirmed') }
      </Tooltip>
    )
    return (
      <div id="profile">
        <NavigationBar data={{ title: <h1>{this.context.t('profileTitle')}</h1>, subTitle: <h2>{this.context.t('profileDescription')}</h2>, btnRight: <button className="btn btn-success" onClick={this.handleSubmit.bind(this)}><i className="glyphicon glyphicon-floppy-disk"></i></button> }} />
          <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
          <form className="row" onSubmit={this.handleSubmit.bind(this)}>
            <div className="form-group col-md-6">
              <label>{this.context.t('firstname')} *</label>
              <input type="text" className="form-control" value={this.state.model.firstname} onChange={e => this.handleChangeState('model.firstname', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.firstname}</span>
            </div>
            <div className="form-group col-md-6">
              <label>{this.context.t('lastname')} *</label>
              <input type="text" className="form-control" value={this.state.model.lastname} onChange={e => this.handleChangeState('model.lastname', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.lastname}</span>
            </div>
            <div className="form-group col-md-6">
              <label>{this.context.t('username')} *</label>
              <input type="text" className="form-control" value={this.state.model.username} onChange={e => this.handleChangeState('model.username', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.username}</span>
            </div>
            <div className="form-group col-md-6">
              <label>{this.context.t('email')} *</label>
              <div className="input-group">
                <span className="input-group-addon">
                  <OverlayTrigger placement="top" overlay={tooltipEmail}>
                    <i className={classnames({'glyphicon glyphicon-remove text-danger': !this.state.model.emailConfirmed, 'glyphicon glyphicon-ok text-success': this.state.model.emailConfirmed})} />
                  </OverlayTrigger>
                </span>
                <input type="text" className="form-control" value={this.state.model.email} onChange={e => this.handleChangeState('model.email', e.target.value)} />
              </div>
              <span className="text-danger">{this.state.errors.model.email}</span>
            </div>
            <div className="form-group col-md-12">
              <div className="alert alert-warning">
                <input type="checkbox" checked={this.state.changePassword} onChange={e => this.handleChangeState('changePassword', !this.state.changePassword)} /> Do you want to change your password?
              </div>
            </div>
            <div className={classnames({"form-group col-md-6": true, "hide": !this.state.changePassword})}>
              <label>{this.context.t('password')} *</label>
              <input type="password" className="form-control" value={this.state.model.password} onChange={e => this.handleChangeState('model.password', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.password}</span>
            </div>
            <div className={classnames({"form-group col-md-6": true, "hide": !this.state.changePassword})}>
              <label>{this.context.t('passwordConfirm')} *</label>
              <input type="password" className="form-control" value={this.state.model.passwordConfirmation} onChange={e => this.handleChangeState('model.passwordConfirmation', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.passwordConfirmation}</span>
            </div>
            <button type="submit" className="hide" />
        </form>
      </div>
    )
  }
}

Profile.contextTypes = {
  t: PropTypes.func.isRequired
}


function mapStateToProps(state, props) {
  return {
    app: state.app,
    auth: state.auth,
    user: state.user
  }
}

export default connect(mapStateToProps)(Profile)
