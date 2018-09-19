import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Nav, NavItem, NavLink } from 'reactstrap'
import classnames from 'classnames'
import { get, set } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Pager from 'components/pager'
import { hideLoading, showLoading, setPreference, setMessage, PREFERENCE } from 'actions/appActions'
import { getCatalog, deleteCatalog, updateCatalog } from 'actions/catalogActions'

class AdminCatalog extends React.PureComponent {
  
  constructor(props) {
    super(props)
    const { appPreferences } = this.props.app.config
    this.state = {
      catalogParent: null,
      catalogs: this.props.catalog.catalogs,
      catalogsQuery: {
        activePage: 1,
        pageSize: appPreferences[PREFERENCE.ADMIN_PAGINATION],
        select: ['id','active','createdAt','updatedAt','name','parent'],
        sort: [
          { name: 'ASC' },
          { order: 'ASC' }
        ],
        where: {
          active: true,
          parent: null,
          or: [
            { name: { like: '%' } }
          ]
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      catalogs: nextProps.catalog.catalogs
    })
  }

  async componentWillMount() {
    try{
      const parentId = get(this.props.match.params, 'id', null)
      this.props.dispatch(showLoading())
      await this.setState({ catalogsQuery: set(this.state.catalogsQuery, 'where.parent', parentId) })
      await this.props.dispatch(getCatalog({ where: { id: parentId } }))
      await this.setState({ catalogParent: this.props.catalog.catalogs.records[0] })
      await this.props.dispatch(getCatalog(this.state.catalogsQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async componentWillUpdate(nextProps, nextState){
    try{
      const { id: previousId } = this.props.match.params
      const { id: nextId } = nextProps.match.params
      if(previousId!==nextId){
        this.props.match.params.id = nextId
        this.componentWillMount()
      }
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
      await this.setState({ catalogsQuery: Object.assign(this.state.catalogsQuery, data) })
      await this.props.dispatch(getCatalog(this.state.catalogsQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeTab(activeTab){
    try{
      await this.handleChangeState('catalogsQuery.where.active', activeTab) 
      this.handleChangeSearch(this.state.catalogsQuery)
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleDeleteData(item){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(deleteCatalog(item))
      await this.props.dispatch(getCatalog(this.state.catalogsQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleRestoreData(item){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(updateCatalog({ id: item.id, active: true }))
      await this.props.dispatch(getCatalog(this.state.catalogsQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const activeTab = this.state.catalogsQuery.where.active ? 1 : 2
    const { isLoading } = this.props.app
    const { records } = this.state.catalogs
    return (
      <div>
        <NavigationBar 
          title={<h1>Catalogs</h1>} 
          description={<h2>{get(this.state.catalogParent,'name', 'All')}</h2>} 
          btnLeft={<button className={classnames({'btn btn-success': true, 'd-none': !this.state.catalogParent})} onClick={() => this.props.history.goBack()}><i className="fas fa-arrow-left"></i></button>} 
          btnRight={<button className="btn btn-success" onClick={() => this.props.history.push('/admin/configuration/catalog/new')}><i className="fas fa-plus"></i></button>} />
        <Nav className="mb-4" tabs>
          <NavItem>
            <NavLink active={activeTab===1} onClick={() => this.handleChangeTab(true) }>
              Active
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={activeTab===2} onClick={() => this.handleChangeTab(false) }>
              Inactive
            </NavLink>
          </NavItem>
        </Nav>
        <Pager isLoading={isLoading} query={this.state.catalogsQuery} items={this.state.catalogs} onChange={this.handleChangeSearch.bind(this)}>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Created</th>
                <th>Modified</th>
                <th>Name</th>
                <th>Children</th>
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
                    <td>{get(item, 'children.length', 0)}</td>
                    <td className="text-center">
                      {
                        activeTab===1 ?
                        <div>
                          <Link to={`/admin/configuration/catalog/${item.id}`} className="btn btn-success mr-1"><i className="fas fa-edit"></i></Link> 
                          <Link to={`/admin/configuration/catalog/${item.id}/children`} className="btn btn-success mr-1"><i className="fas fa-list"></i></Link> 
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

AdminCatalog.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app,
    catalog: state.catalog
  }
}

export default connect(mapStateToProps)(AdminCatalog)
