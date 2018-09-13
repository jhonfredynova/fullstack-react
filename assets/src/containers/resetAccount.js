import React from 'react'
import { connect } from 'react-redux'
import { cloneDeep, clean, compact, flow, isEmpty, isEmail, get, set } from 'lodash'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { resetUser } from 'actions/userActions'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class ResetAccount extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      model: {
        password: '',
        passwordConfirmation: '',
        token: ''
      }
    }
  }

  async handleChangeState(path, value) {
    await this.setState(set(this.state, path, value))
    await this.handleValidate(path)
  }

  async handleValidate(path){
    let errors = flow(cloneDeep, clean)(this.state.errors)
    if(isEmail(this.state.model.password) || Object.keys(this.state.model.password.trim()).length<6) {
      errors.model.password = this.context.t('enterPasswordMin5Char')
    }
    if (!isEmail(this.state.model.password) && this.state.model.password!==this.state.model.passwordConfirmation) {
      errors.model.passwordConfirmation = this.context.t('enterPasswordNotMatch')
    }
    if(path) errors = set(this.state.errors, path, get(errors, path))
    await this.setState({ errors: errors })
  }

  async handleForgot(e){
    try{
      e.preventDefault()
      //validate
      await this.handleValidate()
      if(!flow(cloneDeep, compact, isEmpty)(this.state.errors)){
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('formErrors') }))
        return
      }
      //execute
      await this.props.dispatch(showLoading())
      await this.setState({ model: {...this.state.model, token: this.props.match.params.token } })
      await this.props.dispatch(resetUser(this.state.model))
      this.props.history.push('/login')
      await this.props.dispatch(setMessage({ type: 'success', message: this.props.user.temp.message }))
      await this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      await this.props.dispatch(hideLoading())
    }
  }

  render() {
    return (
      <div>
        <Seo title={this.context.t('resetAccountTitle')} description={this.context.t('resetAccountDescription')} siteName={this.context.t('siteName')} />
        <NavigationBar
          title={<h1>{this.context.t('resetAccountTitle')}</h1>} 
          description={<h2>{this.context.t('resetAccountDescription')}</h2>} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form className="row" onSubmit={this.handleForgot.bind(this)}>
            <div className="form-group col-md-6">
              <label>{this.context.t('password')} *</label>
              <input type="password" className="form-control" onChange={e => this.handleChangeState('model.password', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.password}</span>
            </div>
            <div className="form-group col-md-6">
              <label>{this.context.t('passwordConfirm')} *</label>
              <input type="password" className="form-control" onChange={e => this.handleChangeState('model.passwordConfirmation', e.target.value)} />
              <span className="text-danger">{this.state.errors.model.passwordConfirmation}</span>
            </div>
            <div className="form-group col-md-12 text-right">
              <button type="submit" className="btn btn-success">
                {this.context.t('savePassword')}
              </button>
            </div>  
        </form>
      </div>
    )
  }
}

ResetAccount.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(ResetAccount)

