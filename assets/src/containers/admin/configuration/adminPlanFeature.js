import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Nav, NavItem, NavLink } from 'reactstrap'
import { set } from 'lodash'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Pager from 'components/pager'
import { hideLoading, showLoading, setPreference, setMessage, PREFERENCE } from 'actions/appActions'
import { getPlan, getPlanFeature, updatePlanFeature, deletePlanFeature } from 'actions/planActions'

class AdminPlanFeature extends React.PureComponent {

  constructor(props) {
    super(props)
    const { appPreferences } = this.props.app.config
    this.state = {
      plan: {},
      planFeatures: this.props.plan.features,
      planFeaturesQuery: {
        activePage: 1,
        pageSize: appPreferences[PREFERENCE.ADMIN_PAGINATION],
        select: ['id','plan','feature','order','quantity'],
        sort: [
          { order: 'ASC' }
        ],
        where: {
          active: true,
          plan: this.props.match.params.id
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      planFeatures: nextProps.plan.features
    })
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      const planId = this.props.match.params.id || ''
      await this.props.dispatch(getPlan({ select: ['id','name'], where: {id: planId } }))
      await this.setState({ plan: this.props.plan.plans.records[0] })
      await this.props.dispatch(getPlanFeature(this.state.planFeaturesQuery))
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
      await this.setState({ planFeaturesQuery: Object.assign(this.state.planFeaturesQuery, data) })
      await this.props.dispatch(getPlanFeature(this.state.planFeaturesQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeTab(activeTab){
    try{
      await this.handleChangeState('planFeaturesQuery.where.active', activeTab) 
      this.handleChangeSearch(this.state.planFeaturesQuery)
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleDeleteData(data){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(deletePlanFeature(data))
      await this.props.dispatch(getPlanFeature(this.state.planFeaturesQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleRestoreData(item){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(updatePlanFeature({ id: item.id, active: true }))
      await this.props.dispatch(getPlanFeature(this.state.planFeaturesQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {    
    const activeTab = this.state.planFeaturesQuery.where.active ? 1 : 2
    const { isLoading } = this.props.app
    const { records } = this.state.planFeatures
    return (
      <div id="adminPlanFeature">
        <NavigationBar
          title={<h1>{this.state.plan.name}</h1>} 
          description={<h2>Features</h2>}
          btnLeft={<button className="btn btn-success" onClick={() => this.props.history.push(`/admin/configuration/plan`)}><i className="fas fa-arrow-left"></i></button>}  
          btnRight={<button className="btn btn-success" onClick={() => this.props.history.push(`/admin/configuration/plan/${this.props.match.params.id}/feature/new`)}><i className="fas fa-plus"></i></button>} />
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
        <Pager isLoading={isLoading} query={this.state.planFeaturesQuery} items={this.state.planFeatures} onChange={this.handleChangeSearch.bind(this)}>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Quantity</th>
                <th className="text-center">Options</th>
              </tr>
            </thead>
            <tbody>
              {
                records.map((item, index) => 
                  <tr key={index}>
                    <td>{item.order}</td>
                    <td>{item.feature.name}</td>
                    <td>{item.quantity}</td>
                    <td className="text-center">
                      {
                        activeTab===1 ?
                        <div>
                          <Link to={`/admin/configuration/plan/${this.state.plan.id}/feature/${item.id}`} className="btn btn-success mr-1"><i className="fas fa-edit"></i></Link> 
                          <button className="btn btn-danger" onClick={() => this.handleDeleteData({ feature: item.id })}><i className="fas fa-minus"></i></button>
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

AdminPlanFeature.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app,
    plan: state.plan
  }
}

export default connect(mapStateToProps)(AdminPlanFeature)
