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
import { getLocale, deleteLocale, updateLocale } from 'actions/localeActions'

class AdminLocale extends React.PureComponent {
  
  constructor(props) {
    super(props)
    const { appPreferences } = this.props.app.config
    this.state = {
      locales: this.props.locale.locales,
      localesQuery: {
        activePage: 1,
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
      locales: nextProps.locale.locales
    })
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getLocale(this.state.localesQuery))
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
      await this.setState({ localesQuery: Object.assign(this.state.localesQuery, data) })
      await this.props.dispatch(getLocale(this.state.localesQuery))      
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeTab(activeTab){
    try{
      await this.handleChangeState('localesQuery.where.active', activeTab) 
      this.handleChangeSearch(this.state.localesQuery)
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleDeleteData(item){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(deleteLocale(item))
      await this.props.dispatch(getLocale(this.state.localesQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleRestoreData(item){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(updateLocale({ id: item.id, active: true }))
      await this.props.dispatch(getLocale(this.state.localesQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const activeTab = this.state.localesQuery.where.active ? 1 : 2
    const { isLoading } = this.props.app
    const { records } = this.state.locales
    return (
      <div>
        <NavigationBar
          title={<h1>Locales</h1>} 
          btnRight={<button className="btn btn-success" onClick={() => this.props.history.push('/admin/configuration/locale/new')}><i className="fas fa-plus"></i></button> } />
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
        <Pager isLoading={isLoading} query={this.state.localesQuery} items={this.state.locales} onChange={this.handleChangeSearch.bind(this)}>
          <Table striped hover responsive>
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
                          <Link to={`/admin/configuration/locale/${item.id}`} className="btn btn-success mr-1"><i className="fas fa-edit"></i></Link> 
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

AdminLocale.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app,
    locale: state.locale
  }
}

export default connect(mapStateToProps)(AdminLocale)
