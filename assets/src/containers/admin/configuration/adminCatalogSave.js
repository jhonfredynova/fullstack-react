import React from 'react'
import { connect } from 'react-redux'
import Select from 'react-select'
import { cloneDeep, clean, compact, defaults, flow, keys, get, set, isEmpty } from 'lodash'
import PropTypes from 'prop-types'
import Counter from 'components/counter'
import NavigationBar from 'components/navigationBar'
import Multilanguage from 'components/multilanguage'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getCatalog, saveCatalog, updateCatalog } from 'actions/catalogActions'

class AdminCatalogSave extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      catalogs: this.props.catalog.catalogs.records,
      errors: {
        model: {}
      },
      model: {
        id: undefined,
        parent: null,
        name: '',
        value: {},
        thumbnail: '',
        order: ''
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      catalogs: nextProps.catalog.catalogs.records
    })
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getCatalog({ select: keys(this.state.model), sort: [{name: 'ASC'}], where: { active: true } }))
      await this.props.dispatch(getCatalog({ populate: false, select: keys(this.state.model), where: {id: this.props.match.params.id} }))
      await this.setState({ model: defaults(this.props.catalog.temp, this.state.model) })
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
    const { appLanguages } = this.props.app.config
    let errors = flow(cloneDeep, clean)(this.state.errors)
    if(isEmpty(this.state.model.name)) {
      errors.model.name = "Enter name."
    }
    if(isEmpty(this.state.model.order)) {
      errors.model.order = "Enter order."
    }
    if(appLanguages.find(key => isEmpty(this.state.model.value[key]))) {
      errors.model.value = "Enter values."
    }
    if(path) errors = set(this.state.errors, path, get(errors, path))
    await this.setState({ errors: errors })
  }

  async handleSubmit(e) {
    try{
      if(e) e.preventDefault()
      //validate
      await this.handleValidate()
      if(!flow(cloneDeep, compact, isEmpty)(this.state.errors)){
        this.props.dispatch(setMessage({ type: 'error', message: this.context.t('formErrors') }))
        return
      }
      //execute
      this.props.dispatch(showLoading())      
      if(this.state.model.id){
        await this.props.dispatch(updateCatalog(this.state.model))  
      }else{
        await this.props.dispatch(saveCatalog(this.state.model))
      }
      this.props.dispatch(hideLoading())
      this.props.history.goBack()
      this.props.dispatch(setMessage({ type: 'success', message: this.context.t('successfulOperation') }))
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const { config } = this.props.app
    const parentCatalogs = this.state.catalogs.filter(item => item.id!==this.props.match.params.id).map((item, index) => {
      return { label: item.name, id: item.id }
    })
    return (
      <div id="adminCatalogSave">
        <NavigationBar 
          title={<h1>{this.state.model.id ? 'Update Catalog' : 'New Catalog'}</h1>} 
          btnLeft={<button className="btn btn-success" onClick={() => this.props.history.goBack()}><i className="fas fa-arrow-left"></i></button>} 
          btnRight={<button className="btn btn-success" onClick={this.handleSubmit.bind(this)}><i className="fas fa-save"></i></button>} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form className="row" onSubmit={this.handleSubmit.bind(this)}>
          <div className="form-group col-md-6">
            <label>Parent Catalog</label>
            <Select className="form-control" options={parentCatalogs} valueKey='id' value={this.state.model.parent} simpleValue={true} clearable={true} autosize={false} onChange={value => this.handleChangeState('model.parent', value)} />
            <span className="text-danger">{this.state.errors.model.parent}</span>
          </div>
          <div className="form-group col-md-6">
            <label>Name *</label>
            <input type="text" className="form-control" value={this.state.model.name} onChange={e => this.handleChangeState('model.name', e.target.value)} />
            <span className="text-danger">{this.state.errors.model.name}</span>
          </div>
          <div className="form-group col-md-6">
            <label>Thumbnail</label>
            <input type="text" className="form-control" value={this.state.model.thumbnail} onChange={e => this.handleChangeState('model.thumbnail', e.target.value)} />
            <span className="text-danger">{this.state.errors.model.thumbnail}</span>
          </div>
          <div className="form-group col-md-6">
            <label>Order *</label>
            <Counter value={this.state.model.order} min={0} max={100} onChange={value => this.handleChangeState('model.order', value)} />
            <span className="text-danger">{this.state.errors.model.order}</span>
          </div>
          <div className="form-group col-md-12">
            <label>Value *</label>
            <Multilanguage languages={config.appLanguages} type='html' value={this.state.model.value} onChange={value => this.handleChangeState('model.value', value)} />
            <span className="text-danger">{this.state.errors.model.value}</span>
          </div>
          <button type="submit" className="hide" />
        </form>
      </div>
    )
  }
}

AdminCatalogSave.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    catalog: state.catalog
  }
}

export default connect(mapStateToProps)(AdminCatalogSave)
