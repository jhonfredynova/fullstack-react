import React, { Component } from 'react'
import { connect } from 'react-redux'
import { cloneDeep, flow, get, set } from 'lodash'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getPlan } from 'actions/planActions'
import DatePicker from 'components/datePicker'
import NavigationBar from 'components/navigationBar'
import Numeric from 'components/numeric'
import NotFound from 'components/notFound'
import Seo from 'components/seo'

class Buy extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: { client:{}, creditCard:{}, plan: {} }
      },
      plan: {},
      model: {
        client: {
          fullname: '',
          email: '',
          password: '',
          passwordConfirmation: ''
        },
        creditCard: {
          number: '',
          holder: '',
          expiration: { month: '', year: '' },
          securityCode: ''
        },
        plan: {
          planCode: null,
          trialDays: 0,
        }
      }
    }
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getPlan({ select: ['id', 'name','description','planCode'], populate: ['features','features.feature'] }))
      await this.setState({ plan: this.props.plan.plans.records.find(item => Object.toUrl(item.name)===this.props.match.params.idPlan) })
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
    if(Object.isEmpty(this.state.model.client.fullname)) {
      errors.model.client.fullname = this.context.t('enterFullname')
    }
    if(Object.isEmpty(this.state.model.client.email)) {
      errors.model.client.email = this.context.t('enterEmail')
    }
    if(!Object.isEmpty(this.state.model.client.email) && !Object.isEmail(this.state.model.client.email)) {
      errors.model.client.email = this.context.t('enterEmailFormat')
    }
    if(Object.isEmpty(this.state.model.client.password) || Object.keys(this.state.model.client.password).length<6) {
      errors.model.client.password = this.context.t('enterPasswordMin5Char')
    }
    if(this.state.model.client.password!==this.state.model.client.passwordConfirmation) {
      errors.model.client.passwordConfirmation = this.context.t('enterPasswordNotMatch')
    }
    if(Object.isEmpty(this.state.model.creditCard.number)) {
      errors.model.creditCard.number = this.context.t('enterCreditCardNumber')
    }
    if(Object.isEmpty(this.state.model.creditCard.holder)) {
      errors.model.creditCard.holder = this.context.t('enterCreditCardHolder')
    }
    if(Object.isEmpty(this.state.model.creditCard.expiration.month) || Object.isEmpty(this.state.model.creditCard.expiration.year)) {
      errors.model.creditCard.expiration = this.context.t('enterExpirationDate')
    }
    if(Object.isEmpty(this.state.model.creditCard.securityCode)) {
      errors.model.creditCard.securityCode = this.context.t('enterSecurityCode')
    }
    if(path) errors = set(this.state.errors, path, get(errors, path))
    await this.setState({ errors: errors })
  }

  async handleBuy(e) {
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
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
    
  }

  render() {
    const { isLoading, config } = this.props.app
    const { appIntl } = this.props.app.config
    const { currency: planCurrency, value: planValue } = get(this.state.plan, 'planInfo.price', {})
    const tooltipPayment = (
      <Tooltip id="tooltipPayment">
        {this.context.t('securePaymentInfo')}
      </Tooltip>
    )
    if (isLoading) return null
    if (Object.isEmpty(this.state.plan)) return <NotFound /> 
    return (
      <div id="buy">
        <Seo data={{ title: this.context.t('buyTitle', {planName: this.state.plan.name}), description: this.context.t('buyDescription'), siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.context.t('buyTitle', {planName: this.state.plan.name})}</h1>, subTitle: <h2>{this.context.t('buyDescription')}</h2>, btnLeft: <button className="btn btn-success" onClick={() => this.props.history.push('/price')}><i className="glyphicon glyphicon-arrow-left" /></button> }} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form onSubmit={this.handleBuy.bind(this)}>
          <div className="panel panel-default">
            <div className="panel-heading">{this.context.t('userInfo')}</div>
            <div className="panel-body">
              <div className="row">
                <div className="form-group col-md-6">
                  <label>{this.context.t('fullname')} <span>*</span></label>
                  <input type="text" className="form-control" value={this.state.model.client.fullname} onChange={event => this.handleChangeState('model.client.fullname', event.target.value)} />
                  <p className="text-danger">{this.state.errors.model.client.fullname}</p>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('email')} <span>*</span></label>
                  <input type="text" className="form-control" value={this.state.model.client.email} onChange={event => this.handleChangeState('model.client.email', event.target.value)} />
                  <p className="text-danger">{this.state.errors.model.client.email}</p>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('password')} <span>*</span></label>
                  <input type="text" className="form-control" value={this.state.model.client.password} onChange={event => this.handleChangeState('model.client.password', event.target.value)} />
                  <p className="text-danger">{this.state.errors.model.client.password}</p>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('passwordConfirmation')} <span>*</span></label>
                  <input type="text" className="form-control" value={this.state.model.client.passwordConfirmation} onChange={event => this.handleChangeState('model.client.passwordConfirmation', event.target.value)} />
                  <p className="text-danger">{this.state.errors.model.client.passwordConfirmation}</p>
                </div>
              </div>  
            </div>
          </div>
          <div className="panel panel-default">
            <div className="panel-heading">{this.context.t('creditCardInfo')}</div>
            <div className="panel-body">
              <div className="row">
                <div className="form-group col-md-6">
                  <label>{this.context.t('creditCardNumber')} <span>*</span></label>
                  <input type="text" className="form-control" value={this.state.model.creditCard.number} onChange={event => this.handleChangeState('model.creditCard.number', event.target.value)} />
                  <p className="text-danger">{this.state.errors.model.creditCard.number}</p>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('creditCardHolder')} <span>*</span></label>
                  <input type="text" className="form-control" value={this.state.model.creditCard.holder} onChange={event => this.handleChangeState('model.creditCard.holder', event.target.value)} />
                  <p className="text-danger">{this.state.errors.model.creditCard.holder}</p>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('expirationDate')} <span>*</span></label>
                  <DatePicker data={this.state.model.creditCard.expiration} onChange={value => this.handleChangeState('model.creditCard.expiration', value)}  />
                  <p className="text-danger">{this.state.errors.model.creditCard.expiration}</p>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('securityCode')} <span>*</span></label>
                  <div className="row">
                    <div className="col-sm-7">
                      <input type="text" className="form-control" value={this.state.model.creditCard.securityCode} onChange={event => this.handleChangeState('model.creditCard.securityCode', event.target.value)} />
                    </div>
                    <div className="col-sm-5">
                      <div className="vcenter">
                        <i className="fa fa-credit-card fa-2x"></i> {this.context.t('creditCardCvc')}
                      </div>
                    </div>
                  </div>
                  <p className="text-danger">{this.state.errors.model.creditCard.securityCode}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="form-group text-right">
            <label className="checkbox-inline text-left">
              <input type="checkbox" /> <span dangerouslySetInnerHTML={{__html: this.context.t('acceptTerms', { url: "/terms" }) }} />
            </label>
            <div dangerouslySetInnerHTML={{__html: this.context.t('subscriptionWarnings') }} />
            <h3 className="d-inline paddingRight">
              <span className="label label-default"><Numeric data={{ amount: planValue, display: 'text', decimalScale: 2, from: config.appPreferences.currency, to: planCurrency, prefix: '$', currencyConversion: appIntl.currencyConversion, suffix: ` ${config.appPreferences.currency.toUpperCase()}` }} /></span>
            </h3> 
            <OverlayTrigger placement="top" overlay={tooltipPayment}>
              <button type="submit" className="btn btn-success btn-lg d-inline">
                <i className="glyphicon glyphicon-lock"></i> {this.context.t('securePayment')}
              </button>
            </OverlayTrigger>
          </div>
        </form>
      </div>
    )
  }
}

Buy.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    plan: state.plan,
    subscription: state.subscription
  }
}

export default connect(mapStateToProps)(Buy)
