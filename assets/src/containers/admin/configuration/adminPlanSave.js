import React from 'react'
import { connect } from 'react-redux'
import Select from 'react-select'
import classnames from 'classnames'
import { clean, compact, defaults, isEmpty, keys, get, set, toUrl } from 'lodash'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getPlan, savePlan, updatePlan } from 'actions/planActions'
import { getSubscriptionPlan } from 'actions/paymentActions'
import Counter from 'components/counter'
import NavigationBar from 'components/navigationBar'
import Numeric from 'components/numeric'

class AdminPlanSave extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: { transactionValue: {} }
      },
      plans: [],
      model: {
        id: undefined,
        name: '',
        description: '',
        paymentType: '',
        planCode: '',
        transactionValue: null,
        order: ''
      }
    }
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      const planId = this.props.match.params.id || ''
      await this.props.dispatch(getPlan({ populate: false, select: keys(this.state.model), where: { id: planId } }))
      await this.setState({ model: defaults(this.props.plan.plans.records[0], this.state.model) })
      await this.props.dispatch(getSubscriptionPlan({ sort: [{name: 'ASC'}] }))
      await this.setState({ plans: this.props.payment.temp })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value) {
    if(path==='model.paymentType'){
      if(isEmpty(value) || value==='transaction') this.state.model.planCode = ''
      if(isEmpty(value) || value==='subscription') this.state.model.transactionValue = null
    }
    await this.setState(set(this.state, path, value))
    await this.handleValidate(path)
  }

  async handleValidate(path) {
    let errors = clean(this.state.errors)
    if(isEmpty(this.state.model.name)) {
      errors.model.name = "Enter name."
    }
    if(isEmpty(this.state.model.description)) {
      errors.model.description = "Enter description."
    }
    if (this.state.model.paymentType==='subscription' && isEmpty(this.state.model.planCode)) {
      errors.model.planCode = "Select plan."
    }
    if (this.state.model.paymentType==='transaction' && isEmpty(get(this.state.model.transactionValue, 'currency'))) {
      errors.model.transactionValue = set(errors.model.transactionValue, 'currency', 'Select transaction currency.')
    }
    if (this.state.model.paymentType==='transaction' && isEmpty(get(this.state.model.transactionValue, 'value'))) {
      errors.model.transactionValue = set(errors.model.transactionValue, 'value',  'Enter transaction value.')
    }
    if(isEmpty(this.state.model.order)) {
      errors.model.order = "Enter order."
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
      this.state.model.permalink = toUrl(this.state.model.name)
      if(this.state.model.id){
        await this.props.dispatch(updatePlan(this.state.model))  
      }else{
        await this.props.dispatch(savePlan(this.state.model))
      }
      this.props.history.push('/admin/configuration/plan')
      this.props.dispatch(setMessage({ type: 'success', message: this.context.t('successfulOperation') }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const { currencies } = this.props.app.config.appIntl
    return (
      <div id="adminPlanSave">
        <NavigationBar 
          title={<h1>{this.state.model.id ? 'Update Plan' : 'New Plan'}</h1>} 
          btnLeft={<button className="btn btn-success" onClick={() => this.props.history.push('/admin/configuration/plan')}><i className="fas fa-arrow-left"></i></button>} 
          btnRight={<button className="btn btn-success" onClick={this.handleSubmit.bind(this)}><i className="fas fa-save"></i></button>} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form className="row" onSubmit={this.handleSubmit.bind(this)}>
          <div className="form-group col-md-6">
            <label>Name *</label>
            <input type="text" className="form-control" value={this.state.model.name} onChange={e => this.handleChangeState('model.name', e.target.value)} />
            <span className="text-danger">{this.state.errors.model.name}</span>
          </div>
          <div className="form-group col-md-6">
            <label>Description *</label>
            <input type="text" className="form-control" value={this.state.model.description} onChange={e => this.handleChangeState('model.description', e.target.value)} />
            <span className="text-danger">{this.state.errors.model.description}</span>
          </div>
          <div className="form-group col-md-6">
            <label>Payment Type</label>
            <select className="form-control" value={this.state.model.paymentType} onChange={e => this.handleChangeState('model.paymentType', e.target.value)}>
              <option value="">Select...</option>
              <option value="subscription">Subscription</option>
              <option value="transaction">Transaction</option>
            </select>
            <span className="text-danger">{this.state.errors.model.paymentType}</span>
          </div>
          <div className={classnames({'form-group col-md-6': true, 'd-none': this.state.model.paymentType!=='subscription'})}>
            <label>Plan Code *</label>
            <select className="form-control" value={this.state.model.planCode} onChange={e => this.handleChangeState('model.planCode', e.target.value)}>
              <option value=''>Select...</option>
              {
                this.state.plans.map(item => {
                  return <option key={item.id} value={item.planCode}>{`${item.description} ($${item.price.value+' '+item.price.currency})`}</option>
                })
              }
            </select>
            <span className="text-danger">{this.state.errors.model.planCode}</span>
          </div>
          <div className={classnames({'form-group col-md-6': true, 'd-none': this.state.model.paymentType!=='transaction'})}>
            <label>Transaction Value *</label>
            <div className="row">
              <div className="col-4 pr-0">
                <Select placeholder='Select...' options={currencies} value={currencies.find(item => item.value===get(this.state.model.transactionValue, 'currency'))} onChange={option => this.handleChangeState('model.transactionValue.currency', option.value)} /> 
                <span className="text-danger">{get(this.state.errors.model.transactionValue, 'currency')}</span>
              </div>
              <div className="col-8">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <Numeric className="form-control" currencyConversion={this.state.currencyConversion} amount={get(this.state.model.transactionValue, 'value', '')} from={get(this.state.model.transactionValue, 'currency')} to={get(this.state.model.transactionValue, 'currency')} onChange={value => this.handleChangeState('model.transactionValue.value', value)} />
                </div>
                <span className="text-danger">{get(this.state.errors.model.transactionValue, 'value')}</span>
              </div>
            </div>
          </div>
          <div className="form-group col-md-6">
            <label>Order *</label>
            <Counter value={this.state.model.order} min={0} max={100} onChange={value => this.handleChangeState('model.order', value)} />
            <span className="text-danger">{this.state.errors.model.order}</span>
          </div>
          <button type='submit' className="d-none" />
        </form>
      </div>
    )
  }
}

AdminPlanSave.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    payment: state.payment,
    plan: state.plan
  }
}

export default connect(mapStateToProps)(AdminPlanSave)
