import React, { Component } from 'react'
import { connect } from 'react-redux'
import { sortBy } from 'lodash'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getPlan } from 'actions/planActions'
import NavigationBar from 'components/navigationBar'
import PlanBox from 'components/planBox'
import Seo from 'components/seo'

class Price extends Component {

  constructor(props) {
    super(props)
    this.state = {
      plans: this.props.plan.plans.records
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      plans: nextProps.plan.plans.records
    })
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getPlan({ select: ['id', 'name','description','order','payuPlan'], populate: ['features', 'features.feature'] }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const { isLoading, config } = this.props.app
    const { appPreferences } = config
    const plans = this.state.plans.map(item => {
      item.mostPopular = item.id===config.planStandard
      return item
    })
    return (
      <div id="price">
        <Seo data={{ title: this.context.t('priceTitle'), description: this.context.t('priceDescription'), siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.context.t('priceTitle')}</h1>, subTitle: <h2>{this.context.t('priceDescription')}</h2> }} />
        <div className="row">
          {
            sortBy(plans, ['order']).map(item =>
              <div key={item.id} className="col-md-4">
                <PlanBox data={{ isLoading: isLoading, info: item, currency: appPreferences.currency, currencyConversion: config.appIntl.currencyConversion }} />
              </div>
            )
          }
        </div>
      </div>
    )
  }
}

Price.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    plan: state.plan
  }
}

export default connect(mapStateToProps)(Price)
