import React, { Component } from 'react'
import { connect } from 'react-redux'
import { cloneDeep, clean, compact, defaults, flow, isHtml, keys, get, set, isEmpty } from 'lodash'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Multilanguage from 'components/multilanguage'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getLocale, saveLocale, updateLocale } from 'actions/localeActions'

class AdminLocaleSave extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      locales: this.props.locale.locales.records,
      model: {
        id: undefined,
        name: '',
        value: {}
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      locales: nextProps.locale.locales.records
    })
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getLocale({ select: keys(this.state.model), where: {id: this.props.match.params.id} }))
      await this.setState({ model: defaults(this.props.locale.temp, this.state.model) })
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
        await this.props.dispatch(updateLocale(this.state.model))  
      }else{
        await this.props.dispatch(saveLocale(this.state.model))
      }
      this.props.dispatch(hideLoading())
      this.props.history.push('/admin/configuration/locale')
      this.props.dispatch(setMessage({ type: 'success', message: this.context.t('successfulOperation') }))
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const { config } = this.props.app
    return (
      <div id="adminLocaleSave">
        <NavigationBar data={{ title: <h1>{this.state.model.id ? 'Update Locale' : 'New Locale'}</h1>, btnLeft: <button className="btn btn-success" onClick={() => this.props.history.push('/admin/configuration/locale')}><i className="glyphicon glyphicon-arrow-left"></i></button>, btnRight: <button className="btn btn-success" onClick={this.handleSubmit.bind(this)}><i className="glyphicon glyphicon-floppy-disk"></i></button> }} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form className="row" onSubmit={this.handleSubmit.bind(this)}>
          <div className="form-group col-md-12 col-xs-12">
            <label>Name *</label>
            <input type="text" className="form-control" value={this.state.model.name} onChange={e => this.handleChangeState('model.name', e.target.value)} />
            <span className="text-danger">{this.state.errors.model.name}</span>
          </div>
          <div className="form-group col-md-12 col-xs-12">
            <label>Value *</label>
            <Multilanguage data={{ isHtml: isHtml(this.state.model.value.en), languages: config.appLanguages, value: this.state.model.value }} onChange={value => this.handleChangeState('model.value', value)} />
            <span className="text-danger">{this.state.errors.model.value}</span>
          </div>
          <button type="submit" className="hide" />
        </form>
      </div>
    )
  }
}

AdminLocaleSave.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    locale: state.locale
  }
}

export default connect(mapStateToProps)(AdminLocaleSave)
