import React from 'react'
import { connect } from 'react-redux'
import { cloneDeep, clean, compact, flow, isEmpty, isEmail, get, set } from 'lodash'
import { Tooltip } from 'reactstrap'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { createTransaction } from 'actions/paymentActions'
import { getPlan } from 'actions/planActions'
import { getUser } from 'actions/userActions'
import NavigationBar from 'components/navigationBar'
import Numeric from 'components/numeric'
import Seo from 'components/seo'

class BuyTransaction extends React.PureComponent {

  constructor(props) { 
    super(props)
    this.state = {
      acceptTerms: false,
      errors: {
        model: { client:{}, plan: {} }
      },
      plan: {},
      showTooltipPayment: false,
      model: {
        client: {
          id: undefined,
          fullname: '',
          email: '',
          password: '',
          passwordConfirmation: ''
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
      await this.props.dispatch(getPlan({ select: ['id', 'name','description','planCode','paymentType','transactionValue'], where: { permalink: this.props.match.params.idPlan } }))
      const plan = this.props.plan.plans.records[0]
      if(!plan || plan.paymentType!=='transaction'){
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
    if(!this.state.model.client.id){
      if(isEmpty(this.state.model.client.password) || Object.keys(this.state.model.client.password).length<6) {
        errors.model.client.password = this.context.t('enterPasswordMin5Char')
      }
      if(this.state.model.client.password!==this.state.model.client.passwordConfirmation) {
        errors.model.client.passwordConfirmation = this.context.t('enterPasswordNotMatch')
      }
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
      await this.props.dispatch(createTransaction(this.state.model))
      const formData = this.props.payment.temp
      let element = null
      for(let key in formData){
        element = document.createElement('input')
        element.type = 'hidden'
        element.name = key
        element.value = formData[key]
        document.forms.formCheckout.append(element)
      }
      document.forms.formCheckout.submit()
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const { isLoading, config } = this.props.app
    const { appIntl } = this.props.app.config
    const planPrice = this.state.plan.transactionValue
    if(isEmpty(this.state.plan)) return null
    return (
      <div id="buy">
        <Seo title={this.context.t('buyTitle', {planName: this.state.plan.name})} description={this.context.t('buyDescription')} siteName={this.context.t('siteName')} />
        <NavigationBar
          title={<h1>{this.context.t('buyTitle', {planName: this.state.plan.name})}</h1>} 
          description={<h2>{this.context.t('buyDescription')}</h2>} 
          btnLeft={<button className="btn btn-success" onClick={() => this.props.history.goBack()}><i className="fas fa-arrow-left" /></button>} />
        <form id="formCheckout" method="post" action="https://checkout.payulatam.com/ppp-web-gateway-payu/" onSubmit={this.handleBuy.bind(this)}>
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
          <div className="form-group text-right">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" defaultChecked={this.state.acceptTerms} onClick={e => this.handleChangeState('acceptTerms', !this.state.acceptTerms)} />
              <label className="form-check-label" dangerouslySetInnerHTML={{__html: this.context.t('acceptTerms', { url: "/terms" }) }}></label>
            </div>
            <div className="clearfix" />
            <h3 className={classnames({"d-inline": true, 'hide': isLoading})}>
              <span className="badge badge-secondary mr-1"><Numeric amount={planPrice.value} display='text' decimalScale={2} from={config.appPreferences.currency} to={planPrice.currency} prefix='$' currencyConversion={appIntl.currencyConversion} suffix={` ${config.appPreferences.currency.toUpperCase()}`} thousandSeparator=',' /></span>
            </h3> 
            <button id="tooltipPayment" type="submit" className="btn btn-success btn-lg">
              <i className="fas fa-lock"></i> {this.context.t('securePayment')}
            </button>
            <Tooltip placement="top" isOpen={this.state.showTooltipPayment} target="tooltipPayment" toggle={() => this.handleChangeState("showTooltipPayment", !this.state.showTooltipPayment)}>
              {this.context.t('securePaymentInfo')}
            </Tooltip>
          </div>
        </form>
      </div>
    )
  }
}

BuyTransaction.contextTypes = {
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

export default connect(mapStateToProps)(BuyTransaction)
