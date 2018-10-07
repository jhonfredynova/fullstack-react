import React from 'react'
import { connect } from 'react-redux'
import { clean, compact, defaultTo, isEmpty, isEmail, keys, get, set } from 'lodash'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getPlan } from 'actions/planActions'
import { getUser, saveUser, updateUser } from 'actions/userActions'

class AdminUserSave extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      errors: {
        model: {}
      },
      plans: [],
      model: {
        id: undefined,
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        plan: ''
      }
    }
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      const userId = this.props.match.params.id || ''
      await this.props.dispatch(getPlan({ select: ['id','name'], where: { paymentType: { '!=': 'transaction' } } }))
      await this.setState({ plans: this.props.plan.plans.records })
      await this.props.dispatch(getUser({ populate: false, select: keys(this.state.model), where: { id: userId } }))
      await this.setState({ model: defaultTo(this.props.user.users.records[0], this.state.model) })
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
    let errors = clean(this.state.errors)
    if(isEmpty(this.state.model.firstname)) {
      errors.model.firstname = "Enter firstnames."
    }
    if(isEmpty(this.state.model.lastname)) {
      errors.model.lastname = "Enter lastnames."
    }
    if(isEmpty(this.state.model.username)) {
      errors.model.username = "Enter username."
    }
    if(isEmpty(this.state.model.email)) {
      errors.model.email = "Enter email."
    }
    if(!isEmpty(this.state.model.email) && !isEmail(this.state.model.email)) {
      errors.model.email = "The written email does not have the correct format."
    }
    if(isEmpty(this.state.model.plan)) {
      errors.model.plan = "Select plan."
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
      if(this.state.model.id){
        await this.props.dispatch(updateUser(this.state.model))  
      }else{
        await this.props.dispatch(saveUser(this.state.model))
      }
      this.props.history.push('/admin/security/user')
      this.props.dispatch(setMessage({ type: 'success', message: this.context.t('successfulOperation') }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    return (
      <div id="adminUserSave">
        <NavigationBar 
          title={<h1>{this.state.model.id ? 'Update User' : 'New User'}</h1>} 
          btnLeft={<button className="btn btn-success" onClick={() => this.props.history.push('/admin/security/user')}><i className="fas fa-arrow-left"></i></button>} 
          btnRight={<button className="btn btn-success" onClick={this.handleSubmit.bind(this)}><i className="fas fa-save"></i></button>} />
        <div className="alert alert-warning" role="alert">{this.context.t('requiredFields')}</div>
        <form className="row" onSubmit={this.handleSubmit.bind(this)}>
          <div className="form-group col-md-6">
            <label>Nombres <span>*</span></label>
            <input type="text" className="form-control" value={this.state.model.firstname} onChange={event => this.handleChangeState('model.firstname', event.target.value)} />
            <span className="text-danger">{this.state.errors.model.firstname}</span>
          </div>
          <div className="form-group col-md-6">
            <label>Apellidos <span>*</span></label>
            <input type="text" className="form-control" value={this.state.model.lastname} onChange={event => this.handleChangeState('model.lastname', event.target.value)} />
            <span className="text-danger">{this.state.errors.model.lastname}</span>
          </div>
          <div className="form-group col-md-6">
            <label>Username <span>*</span></label>
            <input type="text" className="form-control" value={this.state.model.username} onChange={event => this.handleChangeState('model.username', event.target.value)} />
            <span className="text-danger">{this.state.errors.model.username}</span>
          </div>
          <div className="form-group col-md-6">
            <label>Email <span>*</span></label>
            <input type="text" className="form-control" value={this.state.model.email} onChange={event => this.handleChangeState('model.email', event.target.value)} />
            <span className="text-danger">{this.state.errors.model.email}</span>
          </div>
          <div className="form-group col-md-6">
            <label>Plan <span>*</span></label>
            <select className="form-control" value={this.state.model.plan} onChange={event => this.handleChangeState('model.plan', event.target.value)}>
              <option>{this.context.t('select')}...</option>
              {
                this.state.plans.map(item => 
                  <option value={item.id}>{item.name}</option>
                )
              }
            </select>
            <span className="text-danger">{this.state.errors.model.plan}</span>
          </div>
          <button type="submit" className="d-none" />
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
    plan: state.plan,
    user: state.user
  }
}

export default connect(mapStateToProps)(AdminUserSave)
