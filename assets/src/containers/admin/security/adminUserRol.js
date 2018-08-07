import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table } from 'react-bootstrap'
import classnames from 'classnames'
import { set } from 'lodash'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Pager from 'components/pager'
import { hideLoading, showLoading, setPreference, setMessage, PREFERENCE } from 'actions/appActions'
import { getUser, getUserRol, deleteUserRol } from 'actions/userActions'

class AdminUserRol extends Component {

  constructor(props) {
    super(props)
    const { appPreferences } = this.props.app.config
    this.state = {
      user: {},
      userRoles: this.props.user.roles,
      userRolesQuery: {
        pageSize: appPreferences[PREFERENCE.ADMIN_PAGINATION],
        sort: [
          { name: 'ASC' }
        ],
        where: {
          name: { like: '' },
          user: this.props.match.params.id
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      userRoles: nextProps.user.roles
    })
  }
  
  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getUser({ where: { id: this.props.match.params.id } }))
      await this.setState({ user: this.props.user.temp })
      await this.props.dispatch(getUserRol(this.state.userRolesQuery))
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
      await this.setState({ userRolesQuery: Object.assign(this.state.userRolesQuery, data) })
      await this.props.dispatch(getUserRol(this.state.userRolesQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleDeleteData(data){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(deleteUserRol(data))
      await this.props.dispatch(getUserRol(this.state.userRolesQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const { isLoading } = this.props.app
    const { records } = this.state.userRoles
    return (
      <div className={classnames({'hide': isLoading})}>
        <NavigationBar data={{ title: <h1>Roles</h1>, subTitle: <h2>{this.state.user.username}</h2>, btnLeft: <button className="btn btn-success" onClick={() => this.props.history.push('/admin/security/user')}><i className="glyphicon glyphicon-arrow-left"></i></button>, btnRight: <button className="btn btn-success" onClick={() => this.props.history.push(`/admin/security/user/${this.props.match.params.id}/rol/new`)}><i className="glyphicon glyphicon-plus"></i></button> }} />
        <Pager isLoading={isLoading} data={this.state.userRolesQuery} items={this.state.userRoles} onChange={this.handleChangeSearch.bind(this)}>
          <Table striped condensed hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th className="text-center">Options</th>
              </tr>
            </thead>
            <tbody>
              {
                records.map((item, index) => 
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td className="text-center">
                      <button className="btn btn-danger" onClick={() => this.handleDeleteData({ user: this.state.user.id, rol: item.id })}><i className="glyphicon glyphicon-minus"></i></button>
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

AdminUserRol.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app,
    user: state.user
  }
}

export default connect(mapStateToProps)(AdminUserRol)
