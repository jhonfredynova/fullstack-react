import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Nav, NavItem } from 'react-bootstrap'
import { set } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Pager from 'components/pager'
import { hideLoading, showLoading, setPreference, setMessage, PREFERENCE } from 'actions/appActions'
import { getUser, deleteUser, updateUser } from 'actions/userActions'

class AdminUser extends Component {

  constructor(props) {
    super(props)
    const { appPreferences } = this.props.app.config
    this.state = {
      users: this.props.user.users,
      usersQuery: {
        pageSize: appPreferences[PREFERENCE.ADMIN_PAGINATION],
        select: ['id','createdAt','updatedAt','firstname','lastname','email'],
        sort: [
          { name: 'ASC' }
        ],
        where: {
          active: true,
          email: { contains: '' }
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      users: nextProps.user.users
    })
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getUser(this.state.usersQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value){
    this.setState(set(this.state, path, value))
  }

  async handleChangeSearch(data){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(setPreference({ [PREFERENCE.ADMIN_PAGINATION]: data.pageSize }))
      await this.setState({ usersQuery: Object.assign(this.state.usersQuery, data) })
      await this.props.dispatch(getUser(this.state.usersQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleDeleteData(item){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(deleteUser(item))
      await this.props.dispatch(getUser(this.state.usersQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleRestoreData(item){
    try{
      this.props.dispatch(showLoading())
      item.active = true
      await this.props.dispatch(updateUser(item))
      await this.props.dispatch(getUser(this.state.usersQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const activeTab = this.state.usersQuery.where.active ? 1 : 2
    const { isLoading } = this.props.app
    const { records } = this.state.users
    return (
      <div>
        <NavigationBar data={{ title: <h1>Users</h1>, btnRight: <button className="btn btn-success" onClick={() => this.props.history.push('/admin/security/user/new')}><i className="glyphicon glyphicon-plus"></i></button> }} />
        <Nav bsStyle="tabs" activeKey={activeTab} onSelect={value => { this.handleChangeState('usersQuery.where.active', value===1); this.handleChangeSearch(this.state.usersQuery) } }>
          <NavItem eventKey={1}>Active</NavItem>
          <NavItem eventKey={2}>Inactive</NavItem>
        </Nav>
        <Pager isLoading={isLoading} data={this.state.usersQuery} items={this.state.users} onChange={this.handleChangeSearch.bind(this)}>
          <Table striped condensed hover responsive>
            <thead>
              <tr>
                <th>Created</th>
                <th>Modified</th>
                <th>Name</th>
                <th>Email</th>
                <th className="text-center">Options</th>
              </tr>
            </thead>
            <tbody>
              {
                records.map((item, index) => 
                  <tr key={index}>
                    <td>{moment(item.createdAt).format('DD/MM/YYYY')}</td>
                    <td>{moment(item.updatedAt).format('DD/MM/YYYY')}</td>
                    <td>{item.firstname}</td>
                    <td>{item.email}</td>
                    <td className="text-center">
                      {
                        activeTab===1 ?
                        <div>
                          <Link to={`/admin/security/user/${item.id}`} className="btn btn-success"><i className="glyphicon glyphicon-edit"></i></Link> 
                          <Link to={`/admin/security/user/${item.id}/rol`} className="btn btn-success"><i className="fa fa-users"></i></Link> 
                          <button className="btn btn-danger" onClick={() => this.handleDeleteData(item)}><i className="glyphicon glyphicon-minus"></i></button>
                        </div> : 
                        <div>
                          <button className="btn btn-success" onClick={() => this.handleRestoreData(item)}><i className="glyphicon glyphicon-ok"></i></button>
                        </div>
                      }
                    </td>
                  </tr>
                )
              }
            </tbody>
          </Table>
        </Pager>
      </div>
    )
  }
}

AdminUser.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app,
    user: state.user
  }
}

export default connect(mapStateToProps)(AdminUser)
