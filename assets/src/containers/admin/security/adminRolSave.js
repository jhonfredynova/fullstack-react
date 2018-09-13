import React from 'react'
import { connect } from 'react-redux'
import { cloneDeep, clean, compact, defaults, flow, keys, get, set, isEmpty } from 'lodash'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getRol, saveRol, updateRol } from 'actions/rolActions'

class AdminRolSave extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      model: {
        id: undefined,
        name: '',
        description: ''
      }
    }
  }
  
  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getRol({ select: keys(this.state.model), where: { id: this.props.match.params.id } }))
      await this.setState({ model: defaults(this.props.rol.temp, this.state.model) })
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
    let errors = flow(cloneDeep, clean)(this.state.errors)
    if(isEmpty(this.state.model.name)) {
      errors.model.name = "Enter name."
    }
    if(isEmpty(this.state.model.description)) {
      errors.model.value = "Enter description."
    }
    if(path) errors = set(this.state.errors, path, get(errors, path))
    await this.setState({ errors: errors })
  }

  async handleSubmit(e){
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
        await this.props.dispatch(updateRol(this.state.model))  
      }else{
        await this.props.dispatch(saveRol(this.state.model))
      }
      this.props.dispatch(hideLoading())
      this.props.history.push('/admin/security/rol')
      this.props.dispatch(setMessage({ type: 'success', message: this.context.t('successfulOperation') }))
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    return (
      <div id="adminRolSave">
        <NavigationBar 
          title={<h1>{this.state.model.id ? 'Update Rol' : 'New Rol'}</h1>} 
          btnLeft={<button className="btn btn-success" onClick={() => this.props.history.push('/admin/security/rol')}><i className="fas fa-arrow-left"></i></button>} 
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
            <span className="text-danger">{this.state.errors.model.value}</span>
          </div>
          <button type="submit" className="hide" />
        </form>
      </div>
    )
  }
}

AdminRolSave.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    rol: state.rol
  }
}

export default connect(mapStateToProps)(AdminRolSave)
