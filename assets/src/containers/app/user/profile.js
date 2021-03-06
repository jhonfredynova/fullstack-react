import React from 'react'
import { connect } from 'react-redux'
import { Tooltip } from 'reactstrap'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { clean, compact, defaults, isEmail, keys, get, set, omit, isEmpty, pick } from 'lodash'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getUser, updateUser } from 'actions/userActions'
import NavigationBar from 'components/navigationBar'
import Upload from 'components/upload'

class Profile extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      changePassword: false,
      showTooltipEmail: false,
      userPassports: [],
      model: {
        id: undefined,
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
      await this.props.dispatch(getUser({ select: keys(omit(this.state.model,['passwordConfirmation'])), where:{ id: session.id } }))
      const user = this.props.user.users.records[0]
      this.setState({ userPassports: user.passports })
      this.setState({ model: defaults(pick(user, keys(this.state.model)), this.state.model) })
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

  async handleValidate(path) {
    let errors = clean(this.state.errors)
    if(isEmpty(this.state.model.firstname)) {
      errors.model.firstname = this.context.t('enterFirstname')
    }
    if(isEmpty(this.state.model.lastname)) {
      errors.model.lastname = this.context.t('enterLastname')
    }
     if(isEmpty(this.state.model.username)) {
      errors.model.username = this.context.t('enterUsername')
    }
    if(!isEmpty(this.state.model.email) && !isEmail(this.state.model.email)) {
      errors.model.email = this.context.t('enterEmailFormat')
    }
    if(this.state.changePassword) {
      if(isEmpty(this.state.model.password) || Object.keys(this.state.model.password).length<6) {
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
      if(!isEmpty(compact(this.state.errors))){
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('formErrors') }))
        return
      }
      //execute
      this.props.dispatch(showLoading())
      if (!this.state.changePassword) this.state.model = omit(this.state.model, ['password', 'passwordConfirmation'])
      await this.props.dispatch(updateUser(omit(this.state.model, ['email'])))  
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
    const photo = [].concat(this.state.model.photo)
    const { defaultUser: defaultUserPhoto } = this.props.app.config.images
    return (
      <div id="profile">
        <NavigationBar
          title={<h1>{this.context.t('profileTitle')}</h1>} 
          description={<h2>{this.context.t('profileDescription')}</h2>} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form className="row" onSubmit={this.handleSubmit.bind(this)}>
          <div className="col-md-6">
            <div className="form-group text-center">
              <h3>{`${this.state.model.firstname} ${this.state.model.lastname}`}</h3>
              <Upload legend={this.context.t('uploadPhoto')} maxAllowed={5} defaultValue={defaultUserPhoto} value={photo} onChange={value => this.handleChangeState('model.photo', value)} />
            </div>
            <div className="alert alert-secondary">
              Passports: 
              {
                this.state.userPassports.map(item => {
                  let iconClass = ''
                  switch(item.provider){
                    default:
                      iconClass = 'far fa-envelope'
                      break
                    case 'facebook-token':
                      iconClass = 'fab fa-facebook'
                      break
                    case 'google-token':
                      iconClass = 'fab fa-google'
                      break
                  }
                  return <i key={item.provider} className={`${iconClass} ml-2`} />
                })
              }
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>{this.context.t('firstname')} *</label>
              <input type="text" className="form-control" value={this.state.model.firstname} onChange={e => this.handleChangeState('model.firstname', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.firstname}</span>
            </div>
            <div className="form-group">
              <label>{this.context.t('lastname')} *</label>
              <input type="text" className="form-control" value={this.state.model.lastname} onChange={e => this.handleChangeState('model.lastname', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.lastname}</span>
            </div>
            <div className="form-group">
              <label>{this.context.t('username')} *</label>
              <input type="text" className="form-control" value={this.state.model.username} onChange={e => this.handleChangeState('model.username', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.username}</span>
            </div>
            <div className="form-group">
              <label>{this.context.t('email')} *</label>
              <div className="input-group">
                <span id="tooltipEmail" className="input-group-addon">
                  <i className={classnames({'fas fa-remove text-danger': !this.state.model.emailConfirmed, 'fas fa-check text-success': this.state.model.emailConfirmed})} />
                </span>
                <Tooltip target="tooltipEmail" placement="top" isOpen={this.state.showTooltipEmail} toggle={() => this.handleChangeState('showTooltipEmail', !this.state.showTooltipEmail)}>
                  { this.state.model.emailConfirmed ? this.context.t('emailConfirmed') : this.context.t('emailUnconfirmed') }
                </Tooltip>
                <label className="form-control">{this.state.model.email}</label>
              </div>
              <span className="text-danger">{this.state.errors.model.email}</span>
            </div>
            <div className="alert alert-info">
              <input type="checkbox" checked={this.state.changePassword} onChange={e => this.handleChangeState('changePassword', !this.state.changePassword)} /> Do you want to change your password?
            </div>
            <div className={classnames({"form-group": true, "d-none": !this.state.changePassword})}>
              <label>{this.context.t('password')} *</label>
              <input type="password" className="form-control" value={this.state.model.password} onChange={e => this.handleChangeState('model.password', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.password}</span>
            </div>
            <div className={classnames({"form-group": true, "d-none": !this.state.changePassword})}>
              <label>{this.context.t('passwordConfirm')} *</label>
              <input type="password" className="form-control" value={this.state.model.passwordConfirmation} onChange={e => this.handleChangeState('model.passwordConfirmation', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.passwordConfirmation}</span>
            </div>
            <div className="form-group text-right">
              <button type="submit" className="btn btn-success btn-lg">{this.context.t('save')}</button>
            </div>
          </div>
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
