import React, { Component } from 'react'
import { connect } from 'react-redux'
import { cloneDeep, defaultTo, flow, keys, get, set } from 'lodash'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getUser, saveUser, updateUser } from 'actions/userActions'

class AdminUserSave extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      model: {
        id: undefined,
        firstname: '',
        lastname: '',
        username: '',
        email: ''
      }
    }
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getUser({ where: { id: this.props.match.params.id }, select: keys(this.state.model) }))
      await this.setState({ model: defaultTo(this.props.user.temp, this.state.model) })
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
    if(Object.isEmpty(this.state.model.firstname)) {
      errors.model.firstname = "Enter firstnames."
    }
    if(Object.isEmpty(this.state.model.lastname)) {
      errors.model.lastname = "Enter lastnames."
    }
    if(Object.isEmpty(this.state.model.username)) {
      errors.model.username = "Enter username."
    }
    if(Object.isEmpty(this.state.model.email)) {
      errors.model.email = "Enter email."
    }
    if(!Object.isEmpty(this.state.model.email) && !Object.isEmail(this.state.model.email)) {
      errors.model.email = "The written email does not have the correct format."
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
        await this.props.dispatch(updateUser(this.state.model))  
      }else{
        await this.props.dispatch(saveUser(this.state.model))
      }
      this.props.dispatch(hideLoading())
      this.props.history.push('/admin/security/user')
      this.props.dispatch(setMessage({ type: 'success', message: this.context.t('successfulOperation') }))
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    return (
      <div id="adminUserSave">
        <NavigationBar data={{ title: <h1>{this.state.model.id ? 'Update User' : 'New User'}</h1>, btnLeft: <button className="btn btn-success" onClick={() => this.props.history.push('/admin/security/user')}><i className="glyphicon glyphicon-arrow-left"></i></button>, btnRight: <button className="btn btn-success" onClick={this.handleSubmit.bind(this)}><i className="glyphicon glyphicon-floppy-disk"></i></button> }} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form className="row" onSubmit={this.handleSubmit.bind(this)}>
          <div className="form-group col-md-6">
            <label>Nombres <span>*</span></label>
            <input type="text" className="form-control" value={this.state.model.firstname} onChange={event => this.handleChangeState('model.firstname', event.target.value)} />
            <p className="text-danger">{this.state.errors.model.firstname}</p>
          </div>
          <div className="form-group col-md-6">
            <label>Apellidos <span>*</span></label>
            <input type="text" className="form-control" value={this.state.model.lastname} onChange={event => this.handleChangeState('model.lastname', event.target.value)} />
            <p className="text-danger">{this.state.errors.model.lastname}</p>
          </div>
          <div className="form-group col-md-6">
            <label>Username <span>*</span></label>
            <input type="text" className="form-control" value={this.state.model.username} onChange={event => this.handleChangeState('model.username', event.target.value)} />
            <p className="text-danger">{this.state.errors.model.username}</p>
          </div>
          <div className="form-group col-md-6">
            <label>Email <span>*</span></label>
            <input type="text" className="form-control" value={this.state.model.email} onChange={event => this.handleChangeState('model.email', event.target.value)} />
            <p className="text-danger">{this.state.errors.model.email}</p>
          </div>
          <button type="submit" className="hide" />
        </form>
      </div>
    )
  }
}

AdminUserSave.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    user: state.user
  }
}

export default connect(mapStateToProps)(AdminUserSave)
