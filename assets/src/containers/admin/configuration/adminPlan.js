import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Nav, NavItem, NavLink } from 'reactstrap'
import classnames from 'classnames'
import { get, set } from 'lodash'
import PropTypes from 'prop-types'
import moment from 'moment'
import NavigationBar from 'components/navigationBar'
import Pager from 'components/pager'
import { hideLoading, showLoading, setPreference, setMessage, PREFERENCE } from 'actions/appActions'
import { getPlan, deletePlan, updatePlan } from 'actions/planActions'

class AdminPlan extends React.PureComponent {

  constructor(props) {
    super(props)
    const { appPreferences } = this.props.app.config
    this.state = {
      plans: this.props.plan.plans,
      plansQuery: {
        activePage: 1,
        pageSize: appPreferences[PREFERENCE.ADMIN_PAGINATION],
        select: ['id','createdAt','updatedAt','name','description','order', 'planCode', 'paymentType','transactionValue'],
        sort: [
          { order: 'ASC' }
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
      plans: nextProps.plan.plans
    })
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getPlan(this.state.plansQuery))
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
      await this.setState({ plansQuery: Object.assign(this.state.plansQuery, data) })
      await this.props.dispatch(getPlan(this.state.plansQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeTab(activeTab){
    try{
      await this.handleChangeState('plansQuery.where.active', activeTab) 
      this.handleChangeSearch(this.state.plansQuery)
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleDeleteData(item){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(deletePlan(item))
      await this.props.dispatch(getPlan(this.state.plansQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleRestoreData(item){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(updatePlan({ id: item.id, active: true }))
      await this.props.dispatch(getPlan(this.state.plansQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const activeTab = this.state.plansQuery.where.active ? 1 : 2    
    const { isLoading } = this.props.app
    const { records } = this.state.plans
    return (
      <div>
        <NavigationBar
          title={<h1>Plans</h1>} 
          btnRight={<button className="btn btn-success" onClick={() => this.props.history.push('/admin/configuration/plan/new')}><i className="fas fa-plus"></i></button>} />
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
        <Pager isLoading={isLoading} query={this.state.plansQuery} items={this.state.plans} onChange={this.handleChangeSearch.bind(this)}>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Order</th>
                <th>Created</th>
                <th>Modified</th>
                <th>Name</th>
                <th>Price</th>
                <th className="text-center">Options</th>
              </tr>
            </thead>
            <tbody>
              {
                records.map((item, index) => 
                  <tr key={index}>
                    <td>{item.order}</td>
                    <td>{moment(item.createdAt).format('DD/MM/YYYY')}</td>
                    <td>{moment(item.updatedAt).format('DD/MM/YYYY')}</td>
                    <td>{item.name}</td>
                    <td className="text-center">
                      <span className={classnames({'d-none': item.paymentType })}>
                        $0
                      </span>
                      <span className={classnames({'d-none': !item.paymentType })}>
                        <span className="d-block">{item.paymentType}</span>
                        <small className={classnames({'text-success d-block': true, 'd-none': item.paymentType!=='subscription'})}>{item.planCode}</small>
                        {item.subscriptionInfo ? `$${get(item, 'subscriptionInfo.price.value', 0)} ${get(item, 'subscriptionInfo.price.currency', '')}` : `$${get(item, 'transactionValue.value', 0)} ${get(item, 'transactionValue.currency', '').toUpperCase()}` }
                      </span>
                    </td>
                    <td className="text-center">
                      {
                        activeTab===1 ?
                        <div>
                          <Link to={`/admin/configuration/plan/${item.id}`} className="btn btn-success mr-1"><i className="fas fa-edit"></i></Link> 
                          <Link to={`/admin/configuration/plan/${item.id}/feature`} className="btn btn-success mr-1"><i className="fas fa-list"></i></Link> 
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

AdminPlan.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app,
    plan: state.plan
  }
}

export default connect(mapStateToProps)(AdminPlan)
