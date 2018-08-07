import React, { Component } from 'react'
import { connect } from 'react-redux'
import Select from 'react-select'
import { cloneDeep, defaults, flow, keys, get, set } from 'lodash'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Counter from 'components/counter'
import { getCatalog } from 'actions/catalogActions'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getPlan, getPlanFeature, savePlanFeature, updatePlanFeature } from 'actions/planActions'


class AdminPlanFeatureSave extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      plan: {},
      planFeatures: this.props.catalog.catalogs.records,
      model: {
        id: undefined,
        plan: null,
        feature: null,
        quantity: '',
        order: ''
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      planFeatures: nextProps.catalog.catalogs.records
    })
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      const { config } = this.props.app
      const { id: idPlan, idFeature } = this.props.match.params
      await this.props.dispatch(getPlan({ select: ['id','name'], where: { id: idPlan } }))
      await this.setState({ plan: this.props.plan.temp })
      await this.setState({ model: Object.assign(this.state.model, { plan: this.state.plan.id }) })
      await this.props.dispatch(getCatalog({ select: ['id','name'], where: { 'parent': config.catalogs.planFeatures } }))
      await this.props.dispatch(getPlanFeature({ populate: false, select: keys(this.state.model), where: { id: idFeature } }))
      await this.setState({ model: defaults(this.props.plan.temp, this.state.model) })
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
    if(Object.isEmpty(this.state.model.feature)) {
      errors.model.feature = "Select a feature."
    }
    if(Object.isEmpty(this.state.model.quantity)) {
      errors.model.quantity = "Enter quantity."
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
      if (this.state.model.id) {
        await this.props.dispatch(updatePlanFeature(this.state.model))
      }else{
        await this.props.dispatch(savePlanFeature(this.state.model))
      }
      this.props.dispatch(hideLoading())
      this.props.history.push(`/admin/configuration/plan/${this.props.match.params.id}/feature`)
      this.props.dispatch(setMessage({ type: 'success', message: this.context.t('successfulOperation') }))
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    return (
      <div id="adminPlanFeatureSave">
        <NavigationBar data={{ title: <h1>{this.state.plan.name}</h1>, subTitle: <h2>Feature</h2>, btnLeft: <button className="btn btn-success" onClick={() => this.props.history.push(`/admin/configuration/plan/${this.props.match.params.id}/feature`)}><i className="glyphicon glyphicon-arrow-left"></i></button>, btnRight: <button className="btn btn-success" onClick={this.handleSubmit.bind(this)}><i className="glyphicon glyphicon-floppy-disk"></i></button> }} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form className="row" onSubmit={this.handleSubmit.bind(this)}>
          <div className="form-group col-md-6">
            <label>Feature <span>*</span></label>
            <Select className="form-control" options={this.state.planFeatures} valueKey='id' labelKey='name' value={this.state.model.feature} clearable={true} autosize={false} onChange={value => this.handleChangeState('model.feature', value.id)} />
            <p className="text-danger">{this.state.errors.model.feature}</p>
          </div>
          <div className="form-group col-md-6">
            <label>Quantity <span>*</span></label>
            <Counter data={{ value: this.state.model.quantity, min: -1, max: 100 }} onChange={value => this.handleChangeState('model.quantity', value)} />
            <p className="text-danger">{this.state.errors.model.quantity}</p>
          </div>
          <div className="form-group col-md-6">
            <label>Order <span>*</span></label>
            <Counter data={{ value: this.state.model.order, min: 0, max: 100 }} onChange={value => this.handleChangeState('model.order', value)} />
            <p className="text-danger">{this.state.errors.model.order}</p>
          </div>
          <button type="submit" className="hide" />
        </form>
      </div>
    )
  }
}

AdminPlanFeatureSave.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    catalog: state.catalog,
    plan: state.plan
  }
}

export default connect(mapStateToProps)(AdminPlanFeatureSave)
