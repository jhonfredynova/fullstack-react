import  React, { Component } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import classnames from 'classnames'
import { defaultTo, get, sortBy } from 'lodash'
import Numeric from 'components/numeric'
import PropTypes from 'prop-types' 
import 'components/planBox.css'

class PlanBox extends Component {

  constructor(props){
    super(props)
    this.state = {
      info: defaultTo(this.props.data.info, {}),
      popular: defaultTo(this.props.data.popular, null),
      selected: defaultTo(this.props.data.selected, null)
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState(nextProps.data)
  }

  async handleClick(){
    if(this.props.onClick){
      this.props.onClick()
    }
  }

  render() {
    const { isLoading } = this.props.data
    const { config } = this.props.data.app
    const tooltipPlanFree = (
      <Tooltip id="tooltipPlanFree">
        {this.context.t('subscriptionPlanFree')}
      </Tooltip>
    )
    let { info } = this.state
    info.popular = info.id===this.state.popular
    info.selected = info.id===this.state.selected
    info.price = { value: 0, recurrence: '' }
    if(info.paymentType==='subscription'){
      info.price = get(info, 'subscriptionInfo.price', {})
      info.price.recurrence = `/${this.context.t('month')}`
    }
    if(info.paymentType==='transaction'){
      info.price = get(info, 'transactionValue', {})
      info.price.recurrence = ''
    }
    return (
      <div id="planBox" className={classnames({'popular': info.popular, 'selected': info.selected, 'hide': isLoading})} onClick={this.handleClick.bind(this)}>
        <OverlayTrigger trigger={info.id===config.plans.free ? 'hover' : null} placement="top" overlay={tooltipPlanFree}>
          <div className="panel panel-default">
            <div className="panel-heading text-center">
              <div id="popular" className={classnames({'hide': !info.popular})}>
                <i className="glyphicon glyphicon-star"></i>
              </div>
              <div id="selected" className={classnames({'hide': !info.selected})}>
                <i className="glyphicon glyphicon-ok"></i>
              </div>
              <h2>{info.name}</h2>
              <div className="paymentInfo">
                <div className="d-inline text-danger">
                  <Numeric data={{ amount: info.price.value, display: 'text', decimalScale: 2, from: config.appPreferences.currency, to: info.price.currency, prefix: '$', suffix: ` ${config.appPreferences.currency.toUpperCase()}${info.price.recurrence}`, currencyConversion: config.appIntl.currencyConversion, thousandSeparator: ',' }} />
                </div>  
              </div>
            </div>
            <div className="panel-body">
              <ul className="list-unstyled">
                {
                  sortBy(info.features, ['order']).map(item => 
                    <li key={item.id} className={classnames({'text-deleted text-danger': item.quantity===0})}>
                      <i className={item.feature.icon} /> {item.feature.name}
                    </li>
                  )
                }
              </ul>
            </div>
          </div>
        </OverlayTrigger>
      </div>
    )
  }
}

PlanBox.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
}

export default PlanBox
