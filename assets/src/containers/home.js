import React, { Component } from 'react'
import { connect } from 'react-redux'
import { chunk, get, sortBy, toUrl } from 'lodash'
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
      await this.props.dispatch(getCatalog({ where: { 'parent': config.catalogs.planFeatures }, sort: [{ name: 'ASC' }] }))
      await this.props.dispatch(getPlan({ select: ['id','name','description','order','planCode','paymentType','transactionValue'] }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const { config } = this.props.app
    const { appPreferences } = config
    this.state.plans.forEach(item => {
      item.url = '/register'
      if(item.paymentType==='subscription') item.url = `/buy/subscription/${toUrl(item.name)}`
      if(item.paymentType==='transaction') item.url = `/buy/transaction/${toUrl(item.name)}`
    })
    return (
      <div id="home">
        <Seo data={{ title: this.context.t('homeTitle'), description: this.context.t('homeDescription'), keyword: ['jhonfredynova'], siteName: this.context.t('siteName') }} />
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
            sortBy(this.state.plans, ['order']).map(item =>
              <div key={item.id} className="col-md-4 col-xs-12">
                <PlanBox data={{ app: this.props.app,  info: item, popular: config.plans.standard }} onClick={() => this.props.history.push(item.url)} />
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
