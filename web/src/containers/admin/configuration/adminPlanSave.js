import React, { Component } from 'react'
import { connect } from 'react-redux'
import Select from 'react-select'
import classnames from 'classnames'
import { cloneDeep, defaults, flow, keys, get, set } from 'lodash'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getPlan, savePlan, updatePlan } from 'actions/planActions'
import Counter from 'components/counter'
import NavigationBar from 'components/navigationBar'
import Numeric from 'components/numeric'

class AdminPlanSave extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: { transactionValue: {} }
      },
      plans: this.props.plan.plans.records,
      model: {
        id: null,
        name: '',
        description: '',
        paymentType: '',
        planCode: '',
        planInfo: null,
        transactionValue: { currency: '', value: '' },
        order: ''
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      plans: nextProps.plan.plans.records
    })
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getPlan({ select: keys(this.state.model), where: { id: this.props.match.params.id } }))
      await this.setState({ model: defaults(this.props.plan.temp, this.state.model) })
      await this.props.dispatch(getPlan({ select: keys(this.state.model), sort: { order: 1 } }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value) {
    if(path==='model.paymentType' && value==='subscription'){
      this.state.model.transactionValue = null
    }
    await this.setState(set(this.state, path, value))
    await this.handleValidate(path)
  }

  async handleValidate(path) {
    let errors = flow(cloneDeep, Object.cleanDeep)(this.state.errors)
    if(Object.isEmpty(this.state.model.name)) {
      errors.model.name = "Enter name."
    }
    if(Object.isEmpty(this.state.model.description)) {
      errors.model.description = "Enter description."
    }
    if (this.state.model.paymentType==='subscription' && Object.isEmpty(this.state.model.planCode)) {
      errors.model.planCode = "Select payu plan."
    }
    if (this.state.model.paymentType==='transaction' && Object.isEmpty(get(this.state.model.transactionValue, 'currency'))) {
      errors.model.transactionValue.currency = "Select transaction currency."
    }
    if (this.state.model.paymentType==='transaction' && Object.isEmpty(get(this.state.model.transactionValue, 'value'))) {
      errors.model.transactionValue.value = "Enter transaction value."
    }
    if(Object.isEmpty(this.state.model.order)) {
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
      if(!flow(cloneDeep, Object.compactDeep, Object.isEmpty)(this.state.errors)){
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('formErrors') }))
        return
      }
      //execute
      this.props.dispatch(showLoading())
      if(this.state.model.id){
        await this.props.dispatch(updatePlan(this.state.model))  
      }else{
        await this.props.dispatch(savePlan(this.state.model))
      }
      this.props.dispatch(hideLoading())
      this.props.history.push('/admin/configuration/plan')
      this.props.dispatch(setMessage({ type: 'success', message: this.context.t('successfulOperation') }))
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const { currencies } = this.props.app.config.appIntl
    const transactionValue = {
      currency: get(this.state.model.transactionValue, 'currency'),
      value: get(this.state.model.transactionValue, 'value')
    }
    return (
      <div id="adminPlanSave">
        <NavigationBar data={{ title: <h1>{this.state.model.id ? 'Update Plan' : 'New Plan'}</h1>, btnLeft: <button className="btn btn-success" onClick={() => this.props.history.push('/admin/configuration/plan')}><i className="glyphicon glyphicon-arrow-left"></i></button>, btnRight: <button className="btn btn-success" onClick={this.handleSubmit.bind(this)}><i className="glyphicon glyphicon-floppy-disk"></i></button> }} />
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
            <span className="text-danger">{this.state.errors.model.value}</span>
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
          <div className={classnames({'form-group col-md-6': true, 'hide': this.state.model.paymentType!=='subscription'})}>
            <label>Plan Code *</label>
            <select className="form-control" value={this.state.model.planCode} onChange={e => this.handleChangeState('model.planCode', e.target.value)}>
              <option value=''>Select...</option>
              {
                this.state.plans.filter(item => item.planCode).map(item => {
                  return <option key={item.id} value={item.planInfo ? item.planInfo.planCode : ''}>{`${item.name} ($${item.planInfo ? (item.planInfo.price.value+' '+item.planInfo.price.currency) : '0'})`}</option>
                })
              }
            </select>
            <span className="text-danger">{this.state.errors.model.planCode}</span>
          </div>
          <div className={classnames({'form-group col-md-6': true, 'hide': this.state.model.paymentType!=='transaction'})}>
            <label>Transaction Value *</label>
            <div className="row">
              <div className="col-xs-4 noPaddingRight">
                <Select placeholder='Select...' className="form-control" options={currencies} optionRenderer={option => option.label} valueRenderer={option => option.label} value={transactionValue.currency} simpleValue={true} clearable={true} autosize={false} onChange={value => this.handleChangeState('model.transactionValue.currency', value)} /> 
                <span className="text-danger">{transactionValue.currency}</span>
              </div>
              <div className="col-xs-8">
                <div className="input-group">
                  <span className="input-group-addon">$</span>
                  <Numeric className="form-control" data={{currencyConversion:this.state.currencyConversion, amount: transactionValue.value, from: transactionValue.currency, to: transactionValue.currency}} onChange={value => this.handleChangeState('model.transactionValue.value', value)} />
                </div>
                <span className="text-danger">{transactionValue.value}</span>
              </div>
            </div>
          </div>
          <div className="form-group col-md-6">
            <label>Order *</label>
            <Counter data={{ value: this.state.model.order, min: 0, max: 100 }} onChange={value => this.handleChangeState('model.order', value)} />
            <span className="text-danger">{this.state.errors.model.order}</span>
          </div>
          <button type='submit' className="hide" />
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
    plan: state.plan
  }
}

export default connect(mapStateToProps)(AdminPlanSave)