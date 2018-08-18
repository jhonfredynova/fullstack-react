import React, { Component } from 'react'
import { connect } from 'react-redux'
import { cloneDeep, flow, get, set, range } from 'lodash'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { createSubscription } from 'actions/paymentActions'
import { getPlan } from 'actions/planActions'
import NavigationBar from 'components/navigationBar'
import Numeric from 'components/numeric'
import Seo from 'components/seo'

class BuySubscription extends Component {

  constructor(props) { 
    super(props)
    this.state = {
      errors: {
        model: { client:{}, creditCard:{ expiration: {} }, plan: {} }
      },
      plan: {},
      acceptTerms: false,
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
      await this.props.dispatch(getPlan({ select: ['id', 'name','description','planCode'] }))
      const plan = this.props.plan.plans.records.find(item => Object.toUrl(item.name)===this.props.match.params.idPlan)
      if(!plan || plan.paymentType==='transaction'){
        this.props.history.push('/')
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('planNotFound') }))
        return
      }
      if(plan.id===this.props.app.config.plans.free){
        this.props.history.push('/register')
        return 
      }
      await this.setState({ plan: plan })
      await this.setState({ model: set(this.state.model, 'plan.planCode', plan.planCode) })
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
    if(Object.isEmpty(this.state.model.creditCard.expiration.month)) {
      errors.model.creditCard.expiration.month = this.context.t('enterExpirationMonth')
    }
    if(Object.isEmpty(this.state.model.creditCard.expiration.year)) {
      errors.model.creditCard.expiration.year = this.context.t('enterExpirationYear')
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
      if(!this.state.acceptTerms){
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('mustAcceptTerms') }))
        return
      }
      //execute
      this.props.dispatch(showLoading())
      await this.props.dispatch(createSubscription(this.state.model))
      this.props.history.push('/login')
      this.props.dispatch(setMessage({ type: 'success', message: this.props.payment.temp }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const currentYear = (new Date()).getFullYear()
    const { isLoading, config } = this.props.app
    const { appIntl } = this.props.app.config
    const planPrice = get(this.state.plan.subscriptionInfo, 'price', {})
    const tooltipPayment = (
      <Tooltip id="tooltipPayment">
        {this.context.t('securePaymentInfo')}
      </Tooltip>
    )
    return (
      <div id="buy">
        <Seo data={{ title: this.context.t('buyTitle', {planName: this.state.plan.name}), description: this.context.t('buyDescription'), siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.context.t('buyTitle', {planName: this.state.plan.name})}</h1>, subTitle: <h2>{this.context.t('buyDescription')}</h2>, btnLeft: <button className="btn btn-success" onClick={() => this.props.history.goBack()}><i className="glyphicon glyphicon-arrow-left" /></button> }} />
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
                  <input type="password" className="form-control" value={this.state.model.client.password} onChange={event => this.handleChangeState('model.client.password', event.target.value)} />
                  <p className="text-danger">{this.state.errors.model.client.password}</p>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('passwordConfirm')} <span>*</span></label>
                  <input type="password" className="form-control" value={this.state.model.client.passwordConfirmation} onChange={event => this.handleChangeState('model.client.passwordConfirmation', event.target.value)} />
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
                  <Numeric data={{ amount: this.state.model.creditCard.number, display: 'input', format: '#### #### #### ####' }} className="form-control" onChange={value => this.handleChangeState('model.creditCard.number', value)} />
                  <p className="text-danger">{this.state.errors.model.creditCard.number}</p>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('creditCardHolder')} <span>*</span></label>
                  <input type="text" className="form-control" value={this.state.model.creditCard.holder} onChange={event => this.handleChangeState('model.creditCard.holder', event.target.value)} />
                  <p className="text-danger">{this.state.errors.model.creditCard.holder}</p>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('expirationDate')} <span>*</span></label>
                  <div className="row">
                    <div className="col-sm-6">
                      <select className="form-control" value={this.state.model.creditCard.expiration.month} onChange={event => this.handleChangeState('model.creditCard.expiration.month', event.target.value)}>
                        <option>{this.context.t('month')}</option>
                        {
                          range(1,13).map(item => 
                            <option key={item} value={item}>{item}</option>
                          )
                        }
                      </select>
                      <p className="text-danger">{this.state.errors.model.creditCard.expiration.month}</p>
                    </div>
                    <div className="col-sm-6">
                      <select className="form-control" value={this.state.model.creditCard.expiration.year} onChange={event => this.handleChangeState('model.creditCard.expiration.year', event.target.value)}>
                        <option>{this.context.t('year')}</option>
                        {
                          range(currentYear,currentYear+11).map(item => 
                            <option key={item} value={item}>{item}</option>
                          )
                        }
                      </select>
                      <p className="text-danger">{this.state.errors.model.creditCard.expiration.year}</p>
                    </div>
                  </div>                  
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('securityCode')} <span>*</span></label>
                  <div className="row">
                    <div className="col-sm-7">
                      <Numeric data={{ amount: this.state.model.creditCard.securityCode, display: 'input', format: '###' }} className="form-control" onChange={value => this.handleChangeState('model.creditCard.securityCode', value)} />
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
              <input type="checkbox" defaultChecked={this.state.acceptTerms} onClick={e => this.handleChangeState('acceptTerms', !this.state.acceptTerms)} /> <span dangerouslySetInnerHTML={{__html: this.context.t('acceptTerms', { url: "/terms" }) }} />
            </label>
            <div dangerouslySetInnerHTML={{__html: this.context.t('subscriptionWarnings') }} />
            <h3 className={classnames({"d-inline paddingRight": true, 'hide': isLoading})}>
              <span className="label label-default"><Numeric data={{ amount: planPrice.value, display: 'text', decimalScale: 2, from: config.appPreferences.currency, to: planPrice.currency, prefix: '$', currencyConversion: appIntl.currencyConversion, suffix: ` ${config.appPreferences.currency.toUpperCase()}`, thousandSeparator: ',' }} /></span>
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

BuySubscription.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    payment: state.payment,
    plan: state.plan
  }
}

export default connect(mapStateToProps)(BuySubscription)
