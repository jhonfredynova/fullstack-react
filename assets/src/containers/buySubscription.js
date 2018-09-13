import React from 'react'
import { connect } from 'react-redux'
import { cloneDeep, clean, compact, flow, isEmpty, isEmail, get, set, range } from 'lodash'
import { Tooltip } from 'reactstrap'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { createSubscription } from 'actions/paymentActions'
import { getPlan } from 'actions/planActions'
import { getUser } from 'actions/userActions'
import NavigationBar from 'components/navigationBar'
import Numeric from 'components/numeric'
import Seo from 'components/seo'

class BuySubscription extends React.PureComponent {

  constructor(props) { 
    super(props)
    this.state = {
      errors: {
        model: { client:{}, creditCard:{ expiration: {} }, plan: {} }
      },
      plan: {},
      acceptTerms: false,
      showTooltipPayment: false,
      model: {
        client: {
          id: undefined,
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
          info: null,
          trialDays: 0,
        }
      }
    }
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getPlan({ select: ['id', 'name','description','planCode','paymentType'], where: { permalink: this.props.match.params.idPlan } }))
      const plan = this.props.plan.plans.records[0]
      if(!plan || plan.paymentType!=='subscription'){
        this.props.history.push('/')
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('planNotFound') }))
        return
      }
      if(plan.id===this.props.app.config.plans.free){
        this.props.history.push('/register')
        return 
      }
      await this.setState({ plan: plan })
      await this.setState({ model: set(this.state.model, 'plan.info', plan) })
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

  async handleBlurEmail() {
    try{
      if(this.state.errors.model.client.email || isEmpty(this.state.model.client.email)) return
      this.props.dispatch(showLoading()) 
      await this.props.dispatch(getUser({ populate: false, select: ['id','email','firstname','lastname'], where: { email: this.state.model.client.email } }))
      const { records: user } = this.props.user.users
      this.state.model.client = Object.assign(this.state.model.client, {
        id: get(user[0], 'id', undefined),
        fullname: get(user[0], 'fullname', ''),
      })
      await this.setState({ model: this.state.model })
      await this.handleValidate()
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleValidate(path) {
    let errors = flow(cloneDeep, clean)(this.state.errors)
    if(isEmpty(this.state.model.client.fullname)) {
      errors.model.client.fullname = this.context.t('enterFullname')
    }
    if(isEmpty(this.state.model.client.email)) {
      errors.model.client.email = this.context.t('enterEmail')
    }
    if(!isEmpty(this.state.model.client.email) && !isEmail(this.state.model.client.email)) {
      errors.model.client.email = this.context.t('enterEmailFormat')
    }
    if(isEmpty(this.state.model.client.password) || Object.keys(this.state.model.client.password).length<6) {
      errors.model.client.password = this.context.t('enterPasswordMin5Char')
    }
    if(this.state.model.client.password!==this.state.model.client.passwordConfirmation) {
      errors.model.client.passwordConfirmation = this.context.t('enterPasswordNotMatch')
    }
    if(isEmpty(this.state.model.creditCard.number)) {
      errors.model.creditCard.number = this.context.t('enterCreditCardNumber')
    }
    if(isEmpty(this.state.model.creditCard.holder)) {
      errors.model.creditCard.holder = this.context.t('enterCreditCardHolder')
    }
    if(isEmpty(this.state.model.creditCard.expiration.month)) {
      errors.model.creditCard.expiration.month = this.context.t('enterExpirationMonth')
    }
    if(isEmpty(this.state.model.creditCard.expiration.year)) {
      errors.model.creditCard.expiration.year = this.context.t('enterExpirationYear')
    }
    if(isEmpty(this.state.model.creditCard.securityCode)) {
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
      if(!flow(cloneDeep, compact, isEmpty)(this.state.errors)){
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
      this.props.history.push('/buy/response?transactionState=7')
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
    if(isEmpty(this.state.plan)) return null
    return (
      <div id="buy">
        <Seo title={this.context.t('buyTitle', {planName: this.state.plan.name})} description={this.context.t('buyDescription')} siteName={this.context.t('siteName')} />
        <NavigationBar 
          title={<h1>{this.context.t('buyTitle', {planName: this.state.plan.name})}</h1>} 
          description={<h2>{this.context.t('buyDescription')}</h2>} 
          btnLeft={<button className="btn btn-success" onClick={() => this.props.history.goBack()}><i className="fas fa-arrow-left" /></button>} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form onSubmit={this.handleBuy.bind(this)}>
          <div className="card mb-4">
            <div className="card-header">{this.context.t('userInfo')}</div>
            <div className="card-body">
              <div className="row">
                <div className="form-group col-md-6">
                  <label>{this.context.t('email')} <span>*</span></label>
                  <input type="text" className="form-control" value={this.state.model.client.email} onBlur={this.handleBlurEmail.bind(this)} onChange={event => this.handleChangeState('model.client.email', event.target.value)} />
                  <span className="text-danger">{this.state.errors.model.client.email}</span>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('fullname')} <span>*</span></label>
                  <input type="text" className="form-control" disabled={this.state.model.client.id} value={this.state.model.client.fullname} onChange={event => this.handleChangeState('model.client.fullname', event.target.value)} />
                  <span className="text-danger">{this.state.errors.model.client.fullname}</span>
                </div>
                <div className={classnames({"form-group col-md-6": true, 'hide': this.state.model.client.id})}>
                  <label>{this.context.t('password')} <span>*</span></label>
                  <input type="password" className="form-control" value={this.state.model.client.password} onChange={event => this.handleChangeState('model.client.password', event.target.value)} />
                  <span className="text-danger">{this.state.errors.model.client.password}</span>
                </div>
                <div className={classnames({"form-group col-md-6": true, 'hide': this.state.model.client.id})}>
                  <label>{this.context.t('passwordConfirm')} <span>*</span></label>
                  <input type="password" className="form-control" value={this.state.model.client.passwordConfirmation} onChange={event => this.handleChangeState('model.client.passwordConfirmation', event.target.value)} />
                  <span className="text-danger">{this.state.errors.model.client.passwordConfirmation}</span>
                </div>
              </div>  
            </div>
          </div>
          <div className="card mb-4">
            <div className="card-header">{this.context.t('creditCardInfo')}</div>
            <div className="card-body">
              <div className="row">
                <div className="form-group col-md-6">
                  <label>{this.context.t('creditCardNumber')} <span>*</span></label>
                  <Numeric amount={this.state.model.creditCard.number} display='input' format='#### #### #### ####' className="form-control" onChange={value => this.handleChangeState('model.creditCard.number', value)} />
                  <span className="text-danger">{this.state.errors.model.creditCard.number}</span>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('creditCardHolder')} <span>*</span></label>
                  <input type="text" className="form-control" value={this.state.model.creditCard.holder} onChange={event => this.handleChangeState('model.creditCard.holder', event.target.value)} />
                  <span className="text-danger">{this.state.errors.model.creditCard.holder}</span>
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('expirationDate')} <span>*</span></label>
                  <div className="row">
                    <div className="col-6 pr-0">
                      <select className="form-control" value={this.state.model.creditCard.expiration.month} onChange={event => this.handleChangeState('model.creditCard.expiration.month', event.target.value)}>
                        <option>{this.context.t('month')}</option>
                        {
                          range(1,13).map(item => 
                            <option key={item} value={item}>{item}</option>
                          )
                        }
                      </select>
                      <span className="text-danger">{this.state.errors.model.creditCard.expiration.month}</span>
                    </div>
                    <div className="col-6">
                      <select className="form-control" value={this.state.model.creditCard.expiration.year} onChange={event => this.handleChangeState('model.creditCard.expiration.year', event.target.value)}>
                        <option>{this.context.t('year')}</option>
                        {
                          range(currentYear,currentYear+11).map(item => 
                            <option key={item} value={item}>{item}</option>
                          )
                        }
                      </select>
                      <span className="text-danger">{this.state.errors.model.creditCard.expiration.year}</span>
                    </div>
                  </div>                  
                </div>
                <div className="form-group col-md-6">
                  <label>{this.context.t('securityCode')} <span>*</span></label>
                  <div className="row">
                    <div className="col-6 pr-0">
                      <Numeric amount={this.state.model.creditCard.securityCode} display='input' format='###' className="form-control" onChange={value => this.handleChangeState('model.creditCard.securityCode', value)} />
                    </div>
                    <div className="col-6 small d-flex align-items-center">
                      <i className="far fa-credit-card fa-2x pr-1"></i> {this.context.t('creditCardCvc')}
                    </div>
                  </div>
                  <span className="text-danger">{this.state.errors.model.creditCard.securityCode}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="form-group text-right">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" defaultChecked={this.state.acceptTerms} onClick={e => this.handleChangeState('acceptTerms', !this.state.acceptTerms)} />
              <label className="form-check-label" dangerouslySetInnerHTML={{__html: this.context.t('acceptTerms', { url: "/terms" }) }}></label>
            </div>
            <div dangerouslySetInnerHTML={{__html: this.context.t('subscriptionWarnings') }} />
            <h3 className={classnames({"d-inline-block": true, 'hide': isLoading})}>
              <span className="badge badge-secondary mr-1"><Numeric amount={planPrice.value} display='text' decimalScale={2} from={config.appPreferences.currency} to={planPrice.currency} prefix='$' currencyConversion={appIntl.currencyConversion} suffix={` ${config.appPreferences.currency.toUpperCase()}`} thousandSeparator=','  /></span>
            </h3>
            <button id="tooltipPayment" type="submit" className="btn btn-success btn-lg">
              <i className="fas fa-lock"></i> {this.context.t('securePayment')}
            </button>
            <Tooltip target="tooltipPayment" placement="top" isOpen={this.state.showTooltipPayment} toggle={() => this.handleChangeState('showTooltipPayment', !this.state.showTooltipPayment)}>
              {this.context.t('securePaymentInfo')}
            </Tooltip>
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
    plan: state.plan,
    user: state.user
  }
}

export default connect(mapStateToProps)(BuySubscription)
