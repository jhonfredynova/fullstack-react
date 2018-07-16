import React, { Component } from 'react'
import { connect } from 'react-redux'
import { chunk, get, sortBy } from 'lodash'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getPlan } from 'actions/planActions'
import { getCatalog } from 'actions/catalogActions' 
import NavigationBar from 'components/navigationBar'
import PlanBox from 'components/planBox'
import Seo from 'components/seo'
import './home.css'

class Home extends Component {

  constructor(props){
    super(props)
    this.state = {
      planFeatures: this.props.catalog.catalogs.records,
      plans: this.props.plan.plans.records
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      planFeatures: nextProps.catalog.catalogs.records,
      plans: nextProps.plan.plans.records
    })
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      const { config } = this.props.app
      await this.props.dispatch(getCatalog({ where: { 'parent': config.catalogPlanFeatures }, sort: { name: 1 } }))
      await this.props.dispatch(getPlan({ select: ['id', 'name','description','order','payuPlan'], populate: ['features', 'features.feature'] }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const { config } = this.props.app
    const { appPreferences } = config
    const plans = this.state.plans.map(item => {
      item.mostPopular = item.id===config.planStandard
      return item
    })
    return (
      <div id="home">
        <Seo data={{ title: this.context.t('homeTitle'), description: this.context.t('homeDescription'), keyword: ['venpad','invoice','bill','expenses'], siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.context.t('homeTitle')}</h1>, subTitle: <h2>{this.context.t('homeDescription')}</h2> }} />
        {
          chunk(sortBy(this.state.planFeatures, ['order']), 2).map((item, index) => 
            <div key={index} className="row">
              {
                item.map(item =>
                  <div key={item.id} className="col-xs-6">
                    <div className="well well-lg">
                      <h2 className="text-center">{item.name}</h2>
                      <h3 className="text-center"><i className={`${item.thumbnail} fa-2x`} /></h3>
                      <article className="text-center" dangerouslySetInnerHTML={{__html: get(item, `value[${appPreferences.language}]`, '') }} />
                    </div>
                  </div>
                )
              }
            </div>
          )
        }
        <div className="row">
          {
            sortBy(plans, ['order']).map(item =>
              <div key={item.id} className="col-md-4">
                <PlanBox data={{ info: item, currency: appPreferences.currency, currencyConversion: config.appIntl.currencyConversion }} />
              </div>
            )
          }
        </div>
      </div>
    )
  }
}

Home.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app,
    catalog: state.catalog,
    plan: state.plan
  }
}

export default connect(mapStateToProps)(Home)
