import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Nav, NavItem } from 'react-bootstrap'
import { set } from 'lodash'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Pager from 'components/pager'
import { hideLoading, showLoading, setPreference, setMessage, PREFERENCE } from 'actions/appActions'
import { getPlan, getPlanFeature, updatePlanFeature, deletePlanFeature } from 'actions/planActions'

class AdminPlanFeature extends Component {

  constructor(props) {
    super(props)
    const { appPreferences } = this.props.app.config
    this.state = {
      plan: {},
      planFeatures: this.props.plan.features,
      planFeaturesQuery: {
        pageSize: appPreferences[PREFERENCE.ADMIN_PAGINATION],
        select: ['id','plan','feature','order','quantity'],
        sort: [
          { parent: 'ASC' },
          { order: 'ASC' },
          { name: 'ASC' }
        ],
        where: {
          active: true,
          'feature.name': { contains: '' },
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
      await this.props.dispatch(getPlan({ select: ['id','name'], where: {id: this.props.match.params.id } }))
      await this.setState({ plan: this.props.plan.temp })
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
      item.active = true
      await this.props.dispatch(updatePlanFeature(item))
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
        <NavigationBar data={{ title: <h1>{this.state.plan.name}</h1>, subTitle: <h2>Features</h2>, btnLeft: <button className="btn btn-success" onClick={() => this.props.history.push(`/admin/configuration/plan`)}><i className="glyphicon glyphicon-arrow-left"></i></button>, btnRight: <button className="btn btn-success" onClick={() => this.props.history.push(`/admin/configuration/plan/${this.props.match.params.id}/feature/new`)}><i className="glyphicon glyphicon-plus"></i></button> }} />
        <Nav bsStyle="tabs" activeKey={activeTab} onSelect={value => { this.handleChangeState('planFeaturesQuery.where.active', value===1); this.handleChangeSearch(this.state.planFeaturesQuery) } }>
          <NavItem eventKey={1}>Active</NavItem>
          <NavItem eventKey={2}>Inactive</NavItem>
        </Nav>
        <Pager isLoading={isLoading} data={this.state.planFeaturesQuery} items={this.state.planFeatures} onChange={this.handleChangeSearch.bind(this)}>
          <Table striped condensed hover responsive>
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
                          <Link to={`/admin/configuration/plan/${this.state.plan.id}/feature/${item.id}`} className="btn btn-success"><i className="glyphicon glyphicon-edit"></i></Link> 
                          <button className="btn btn-danger" onClick={() => this.handleDeleteData({ feature: item.id })}><i className="glyphicon glyphicon-minus"></i></button>
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
