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
import { getRol, deleteRol, updateRol } from 'actions/rolActions'

class AdminRol extends Component {

  constructor(props) {
    super(props)
    const { appPreferences } = this.props.app.config
    this.state = {
      roles: this.props.rol.roles,
      rolesQuery: {
        pageSize: appPreferences[PREFERENCE.ADMIN_PAGINATION],
        select: ['id','active','createdAt','updatedAt','parent','name'],
        sort: [
          { name: 'ASC' }
        ],
        where: {
          active: true,
          name: { contains: '' }
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      roles: nextProps.rol.roles
    })
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getRol(this.state.rolesQuery))
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
      await this.setState({ rolesQuery: Object.assign(this.state.rolesQuery, data) })
      await this.props.dispatch(getRol(this.state.rolesQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleDeleteData(item){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(deleteRol(item))
      await this.props.dispatch(getRol(this.state.rolesQuery))
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
      await this.props.dispatch(updateRol(item))
      await this.props.dispatch(getRol(this.state.rolesQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const activeTab = this.state.rolesQuery.where.active ? 1 : 2
    const { isLoading } = this.props.app
    const { records } = this.state.roles
    return (
      <div>
        <NavigationBar data={{ title: <h1>Roles</h1>, btnRight: <button className="btn btn-success" onClick={() => this.props.history.push('/admin/security/rol/new')}><i className="glyphicon glyphicon-plus"></i></button> }} />
        <Nav bsStyle="tabs" activeKey={activeTab} onSelect={value => { this.handleChangeState('rolesQuery.where.active', value===1); this.handleChangeSearch(this.state.rolesQuery) } }>
          <NavItem eventKey={1}>Active</NavItem>
          <NavItem eventKey={2}>Inactive</NavItem>
        </Nav>
        <Pager isLoading={isLoading} data={this.state.rolesQuery} items={this.state.roles} onChange={this.handleChangeSearch.bind(this)}>
          <Table striped condensed hover responsive>
            <thead>
              <tr>
                <th>Created</th>
                <th>Modified</th>
                <th>Parent</th>
                <th>Name</th>
                <th className="text-center">Options</th>
              </tr>
            </thead>
            <tbody>
              {
                records.map((item, index) => 
                  <tr key={index}>
                    <td>{moment(item.createdAt).format('DD/MM/YYYY')}</td>
                    <td>{moment(item.updatedAt).format('DD/MM/YYYY')}</td>
                    <td>{item.parent ? item.parent.name : '-'}</td>
                    <td>{item.name}</td>
                    <td className="text-center">
                      {
                        activeTab===1 ?
                        <div>
                          <Link to={`/admin/security/rol/${item.id}`} className="btn btn-success"><i className="glyphicon glyphicon-edit"></i></Link> 
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

AdminRol.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app,
    rol: state.rol
  }
}

export default connect(mapStateToProps)(AdminRol)
