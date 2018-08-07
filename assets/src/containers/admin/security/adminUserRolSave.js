import React, { Component } from 'react'
import { connect } from 'react-redux'
import Select from 'react-select'
import { cloneDeep, flow, get, set } from 'lodash'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import { getRol } from 'actions/rolActions'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getUser, saveUserRol } from 'actions/userActions'

class AdminUserRolSave extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      roles: this.props.rol.roles.records,
      user: {
        email: ''
      },
      model: {
        user: '',
        rol: null
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      roles: nextProps.rol.roles.records
    })
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getRol({ select: ['id','name'] }))
      await this.props.dispatch(getUser({ where: { id: this.props.match.params.id }, select: ['id','firstname','lastname','email'] }))    
      await this.setState({ user: this.props.user.temp })
      await this.setState({ model: Object.assign(this.state.model, { user: this.state.user.id }) })
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
    if(Object.isEmpty(this.state.model.rol)) {
      errors.model.rol = "Select rol."
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
      await this.props.dispatch(saveUserRol(this.state.model))
      this.props.dispatch(hideLoading())
      this.props.history.push(`/admin/security/user/${this.props.match.params.id}/rol`)
      this.props.dispatch(setMessage({ type: 'success', message: this.context.t('successfulOperation') }))
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    return (
      <div id="adminUserRolSave">
        <NavigationBar data={{ title: <h1>Add Role</h1>, btnLeft: <button className="btn btn-success" onClick={() => this.props.history.push(`/admin/security/user/${this.props.match.params.id}/rol`)} ><i className="glyphicon glyphicon-arrow-left"></i></button>, btnRight: <button className="btn btn-success" onClick={this.handleSubmit.bind(this)}><i className="glyphicon glyphicon-floppy-disk"></i></button> }} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form className="row" onSubmit={this.handleSubmit.bind(this)}>
          <div className="form-group col-md-6">
            <label>User <span>*</span></label>
            <input type="text" className="form-control" disabled="true" value={`${this.state.user.email}`} />
          </div>
          <div className="form-group col-md-6">
            <label>Rol <span>*</span></label>
            <Select options={this.state.roles} valueKey='id' labelKey='name' value={this.state.model.rol} clearable={false} autosize={false} onChange={value => this.handleChangeState('model.rol', value.id)} />
            <p className="text-danger">{this.state.errors.model.rol}</p>
          </div>
          <button type="submit" className="hide" />
        </form>
      </div>
    )
  }
}

AdminUserRolSave.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    rol: state.rol,
    user: state.user
  }
}

export default connect(mapStateToProps)(AdminUserRolSave)
