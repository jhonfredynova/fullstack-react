import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'react-bootstrap'
import { clean, compact, get, set, sortBy, range, flow, cloneDeep, toUrl, isEmpty } from 'lodash'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage, deleteMessage } from 'actions/appActions'
import { me } from 'actions/authActions'
import { createSubscription, updateCreditCard } from 'actions/paymentActions'
import { getPlan } from 'actions/planActions'
import { updateUser } from 'actions/userActions'
import moment from 'moment'
import NavigationBar from 'components/navigationBar'
import Numeric from 'components/numeric'
import PlanBox from 'components/planBox'

class Subscription extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: { client: {}, creditCard: { expiration: {} }, plan: {} }
      },
      showModalCreditCard: false,
      showModalSubscription: false,
      plans: this.props.plan.plans.records,
      model: {
        client: {
          fullname: '',
          email: ''
        },
        creditCard: {
          number: '',
          holder: '',
          expiration: { month: '', year: '' },
          securityCode: ''
        },
        plan: {
          info: null,
          trialDays: 0
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      plans: nextProps.plan.plans.records
    })
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getPlan({ select: ['id', 'name','description','order','paymentType','planCode','transactionValue'] }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value) {
    await this.setState(set(this.state, path, value))
  }

  async handleValidate(path) {
    let errors = flow(cloneDeep, clean)(this.state.errors)
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

  async handleCloseCreditCard(){
    try{
      clean(this.state.model.creditCard, '')
      clean(this.state.errors.model.creditCard)
      this.props.dispatch(deleteMessage())
      this.handleChangeState('showModalCreditCard', false) 
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleUpdateCreditCard(e){
    try{
      if(e) e.preventDefault()
      //validate
      await this.handleValidate()
      if(!flow(cloneDeep, compact, isEmpty)(this.state.errors.model.creditCard)){
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('formErrors') }))
        return
      }
      //execute
      this.props.dispatch(showLoading())
      const { session } = this.props.auth
      await this.props.dispatch(updateCreditCard(Object.assign(this.state.model.creditCard, {
        clientCode: session.clientCode
      })))
      await this.props.dispatch(me())
      await this.handleCloseCreditCard()
      this.props.dispatch(setMessage({ type: 'success', message: this.props.payment.temp.message }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleCloseSubscription(){
    try{
      this.state.model.plan.info = null
      this.props.dispatch(deleteMessage())
      this.handleChangeState('showModalSubscription', false) 
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleUpdateSubscription(e){
    try{
      if(e) e.preventDefault()
      //validate
      await this.handleValidate()
      if(!flow(cloneDeep, compact, isEmpty)(this.state.errors.model.subscription)){
        this.props.dispatch(setMessage({ type: 'success', message: this.context.t('formErrors') }))
        return
      }
      //execute
      this.props.dispatch(showLoading())
      const { session } = this.props.auth
      const { free: planFree } = this.props.app.config.plans
      const planSelected = this.state.model.plan.info
      //cancel or suspend subscription
      if(planSelected.id===planFree){
        await this.props.dispatch(updateUser({ id: session.id, plan: planFree }))
        await this.props.dispatch(me())
        await this.handleCloseSubscription()
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('subscriptionCanceled') }))
        this.props.dispatch(hideLoading())
        return
      }
      //wrong plan
      if(planSelected.paymentType!=='subscription'){
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('subscriptionPlanError') }))
        this.props.dispatch(hideLoading())
        return
      }
      //subscription
      this.state.model.client.fullname = session.fullname
      this.state.model.client.email = session.email
      this.state.model.creditCard.token = get(session.clientInfo, 'creditCards[0].token')
      await this.props.dispatch(createSubscription(this.state.model))
      await this.props.dispatch(me())
      await this.handleCloseSubscription()
      await this.props.dispatch(setMessage({ type: 'success', message: this.props.payment.temp.message }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const { session } = this.props.auth
    const { isLoading, config } = this.props.app
    const currentYear = (new Date()).getFullYear()
    const creditCards = get(session.clientInfo, 'creditCards', [])
    const subscription = get(session.clientInfo, 'subscriptions[0]', {})
    const planSelected = this.state.model.plan.info || {}
    this.state.plans.forEach(item => {
      item.url = '/register'
      if(item.paymentType==='subscription') item.url = `/buy/subscription/${toUrl(item.name)}`
      if(item.paymentType==='transaction') item.url = `/buy/transaction/${toUrl(item.name)}`
    })
    return (
      <div id="subscription">
        <NavigationBar data={{ title: <h1>{this.context.t('subscriptionTitle')}</h1>, subTitle: <h2>{this.context.t('subscriptionDescription')}</h2> }} />
        <div className="row">
          <div className="col-md-12 col-xs-12">
            <div className="panel panel-default">
              <div className="panel-heading">{this.context.t('paymentMethods')}</div>
              <div className="panel-body">
                <div className={classnames({'hide': creditCards.length>0})}>
                  <p className="alert alert-warning">{this.context.t('noPaymentMethods')}</p>
                  <button className="btn btn-success" onClick={() => this.handleChangeState('showModalCreditCard', true)}>{this.context.t('createCreditCard')}</button>
                </div>
                <div className={classnames({'hide': creditCards.length===0})}>
                  {
                    creditCards.map(item => 
                      <p key={item.token}><i className="glyphicon glyphicon-credit-card" /> {item.number} {item.type}</p>
                    )
                  }                  
                  <button className="btn btn-success" onClick={() => this.handleChangeState('showModalCreditCard', true)}>{this.context.t('updateCreditCard')}</button>
                </div>
              </div>
            </div>
            <Modal show={this.state.showModalCreditCard} onHide={this.handleCloseCreditCard.bind(this)}>
              <Modal.Header backdrop={true} closeButton>
                <Modal.Title>{creditCards.length===0 ? this.context.t('createCreditCard') : this.context.t('updateCreditCard')}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form id="formCreditCard" onSubmit={this.handleUpdateCreditCard.bind(this)}>
                  <div className="row">
                    <div className="form-group col-md-12 col-xs-12">
                      <label>{this.context.t('creditCardNumber')} <span>*</span></label>
                      <Numeric data={{ amount: this.state.model.creditCard.number, display: 'input', format: '#### #### #### ####' }} className="form-control" onChange={value => this.handleChangeState('model.creditCard.number', value)} />
                      <span className="text-danger">{this.state.errors.model.creditCard.number}</span>
                    </div>
                    <div className="form-group col-md-12 col-xs-12">
                      <label>{this.context.t('creditCardHolder')} <span>*</span></label>
                      <input type="text" className="form-control" value={this.state.model.creditCard.holder} onChange={event => this.handleChangeState('model.creditCard.holder', event.target.value)} />
                      <span className="text-danger">{this.state.errors.model.creditCard.holder}</span>
                    </div>
                    <div className="form-group col-md-12 col-xs-12">
                      <label>{this.context.t('expirationDate')} <span>*</span></label>
                      <div className="row">
                        <div className="col-xs-6">
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
                        <div className="col-xs-6">
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
                    <div className="form-group col-md-12 col-xs-12">
                      <label>{this.context.t('securityCode')} <span>*</span></label>
                      <div className="row">
                        <div className="col-sm-7">
                          <Numeric data={{ amount: this.state.model.creditCard.securityCode, display: 'input', format: '###' }} className="form-control" onChange={value => this.handleChangeState('model.creditCard.securityCode', value)} />
                        </div>
                        <div className="col-sm-5">
                          <div className="align-middle">
                            <i className="fa fa-credit-card fa-2x"></i> {this.context.t('creditCardCvc')}
                          </div>
                        </div>
                      </div>
                      <span className="text-danger">{this.state.errors.model.creditCard.securityCode}</span>
                    </div>
                    <button type="submit" className="hide" />
                  </div>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <button className="btn btn-success" onClick={this.handleUpdateCreditCard.bind(this)}>{this.context.t('save')}</button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
        <div className="alert alert-info">
          <p>
            {this.context.t('subscriptionCurrent', { planName: session.plan.name })}
            <span className={classnames({'hide': !isEmpty(subscription)})}> {this.context.t('subscriptionNoCharges')}</span>
            <span className={classnames({'hide': isEmpty(subscription)})}> {this.context.t('subscriptionNextPayment', { date: moment(subscription.currentPeriodStart).format('DD/MM/YYYY') })}</span>
          </p>
          <p className={classnames({'hide': !session.nextPlan})}>
            Proximo a cambiar al (Plan Premium) <button className="btn btn-danger"><i className="fa fa-times" /> Cancelar</button>
          </p>
        </div>
        <Modal show={this.state.showModalSubscription} onHide={this.handleCloseSubscription.bind(this)}>
          <Modal.Header backdrop={true} closeButton>
            <Modal.Title>{this.context.t('updateSubscription')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className={classnames({'hide': isEmpty(subscription)})}>{this.context.t('subscriptionChangePlan', { date: moment(subscription.currentPeriodStart).format('DD/MM/YYYY') })}</p>
            <p className={classnames({'hide': !isEmpty(subscription)})}>{this.context.t('subscriptionChangePlanImmediately')}</p>
            <p className={classnames({'alert alert-warning': true, 'hide': planSelected.id!==config.plans.free })}>{this.context.t('subscriptionPlanFree')}</p>
            <p className={classnames({'alert alert-warning': true, 'hide': creditCards.length>0})}>{this.context.t('subscriptionNoPaymentMethods')}</p>
          </Modal.Body>
          <Modal.Footer>
            <button className={classnames({'btn btn-success': true, 'hide': creditCards.length>0})} onClick={() => this.handleChangeState('showModalCreditCard', true)}>{this.context.t('createCreditCard')}</button>
            <button className={classnames({'btn btn-success': true, 'hide': creditCards.length===0})} onClick={this.handleUpdateSubscription.bind(this)}>{this.context.t('continue')}</button>
          </Modal.Footer>
        </Modal>
        <div className="row">
          {
            sortBy(this.state.plans, ['order']).map(item =>
              <div key={item.id} className="col-md-4 col-xs-12">
                <PlanBox data={{ isLoading: isLoading, app: this.props.app, info: item, selected: session.plan.id }} onClick={() => { if(item.id===session.plan.id) return; this.handleChangeState('showModalSubscription', true); this.handleChangeState('model.plan.info', item) }  }/>
              </div>
            )
          }
        </div>
      </div>
    )
  }
}

Subscription.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    auth: state.auth,
    plan: state.plan,
    payment: state.payment
  }
}

export default connect(mapStateToProps)(Subscription)
