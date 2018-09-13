import React from 'react'
import { connect } from 'react-redux'
import { sortBy, toUrl } from 'lodash'
import PropTypes from 'prop-types'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getPlan } from 'actions/planActions'
import NavigationBar from 'components/navigationBar'
import PlanBox from 'components/planBox'
import Seo from 'components/seo'

class Price extends React.PureComponent {

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
      await this.props.dispatch(getPlan({ select: ['id', 'name','description','order','paymentType','planCode','transactionValue'] }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const { isLoading, config } = this.props.app
    this.state.plans.forEach(item => {
      item.url = '/register'
      if(item.paymentType==='subscription') item.url = `/buy/subscription/${toUrl(item.name)}`
      if(item.paymentType==='transaction') item.url = `/buy/transaction/${toUrl(item.name)}`
    })
    return (
      <div id="price">
        <Seo title={this.context.t('priceTitle')} description={this.context.t('priceDescription')} siteName={this.context.t('siteName')} />
        <NavigationBar
          title={<h1>{this.context.t('priceTitle')}</h1>}
          description={<h2>{this.context.t('priceDescription')}</h2>} />
        <div className="row">
          {
            sortBy(this.state.plans, ['order']).map(item =>
              <div key={item.id} className="col">
                <PlanBox isLoading={isLoading} app={this.props.app} info={item} popular={config.plans.standard} onClick={() => this.props.history.push(item.url)} />
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
