import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Nav, NavItem, NavLink } from 'reactstrap'
import { set } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Pager from 'components/pager'
import { hideLoading, showLoading, setPreference, setMessage, PREFERENCE } from 'actions/appActions'
import { getRol, deleteRol, updateRol } from 'actions/rolActions'

class AdminRol extends React.PureComponent {

  constructor(props) {
    super(props)
    const { appPreferences } = this.props.app.config
    this.state = {
      roles: this.props.rol.roles,
      rolesQuery: {
        pageSize: appPreferences[PREFERENCE.ADMIN_PAGINATION],
        select: ['id','active','createdAt','updatedAt','name'],
        sort: [
          { name: 'ASC' }
        ],
        where: {
          active: true,
          name: { like: '%' }
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
      await this.props.dispatch(updateRol({ id: item.id, active: true }))
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
        <NavigationBar 
          title={<h1>Roles</h1>} 
          btnRight={<button className="btn btn-success" onClick={() => this.props.history.push('/admin/security/rol/new')}><i className="fas fa-plus"></i></button>} />
        <Nav className="mb-4" tabs>
          <NavItem>
            <NavLink active={activeTab===1} onClick={() => { this.handleChangeState('rolesQuery.where.active', true); this.handleChangeSearch(this.state.rolesQuery) }}>
              Active
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={activeTab===2} onClick={() => { this.handleChangeState('rolesQuery.where.active', false); this.handleChangeSearch(this.state.rolesQuery) }}>
              Inactive
            </NavLink>
          </NavItem>
        </Nav>
        <Pager isLoading={isLoading} query={this.state.rolesQuery} items={this.state.roles} onChange={this.handleChangeSearch.bind(this)}>
          <Table striped condensed hover responsive>
            <thead>
              <tr>
                <th>Created</th>
                <th>Modified</th>
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
                    <td>{item.name}</td>
                    <td className="text-center">
                      {
                        activeTab===1 ?
                        <div>
                          <Link to={`/admin/security/rol/${item.id}`} className="btn btn-success mr-1"><i className="fas fa-edit"></i></Link> 
                          <button className="btn btn-danger" onClick={() => this.handleDeleteData(item)}><i className="fas fa-minus"></i></button>
                        </div> : 
                        <div>
                          <button className="btn btn-success" onClick={() => this.handleRestoreData(item)}><i className="fas fa-check"></i></button>
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
