import React, { Component } from 'react'
import { connect } from 'react-redux'
import { cloneDeep, clean, compact, flow, isEmpty, get, set } from 'lodash'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { forgotUser } from 'actions/userActions'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class ForgotAccount extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      model: {
        username: ''
      }
    }
  }

  async handleChangeState(path, value) {
    await this.setState(set(this.state, path, value))
    await this.handleValidate(path)
  }

  async handleValidate(path) {
    let errors = flow(cloneDeep, clean)(this.state.errors)
    if (isEmpty(this.state.model.username)) {
      errors.model.username = this.context.t('enterUsernameOrEmail')
    }
    if(path) errors = set(this.state.errors, path, get(errors, path))
    await this.setState({ errors: errors })
  }

  async handleForgot(e) {
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
      await this.props.dispatch(forgotUser(this.state.model))
      this.props.history.push('/')
      await this.props.dispatch(setMessage({ type: 'success', message: this.props.user.temp.message }))
      await this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    return (
      <div>
        <Seo data={{ title: this.context.t('forgotAccountTitle'), description: this.context.t('forgotAccountDescription'), siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.context.t('forgotAccountTitle')}</h1>, subTitle: <h2>{this.context.t('forgotAccountDescription')}</h2> }} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form className="row" onSubmit={this.handleForgot.bind(this)}>
          <div className="form-group col-md-12 col-xs-12">
            <label>{this.context.t('emailOrUsername')} *</label>
            <input type="text" className="form-control" onChange={e => this.handleChangeState('model.username', e.target.value)} />
            <span className="text-danger">{this.state.errors.model.username}</span>
          </div>
          <div className="form-group col-md-12 col-xs-12 text-right">
            <button type="submit" className="btn btn-success">{this.context.t('sendEmail')}</button>
          </div>
        </form>
      </div>
    )
  }
}

ForgotAccount.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(ForgotAccount)

