import  React, { Component } from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import { defaultTo, sortBy } from 'lodash'
import PropTypes from 'prop-types' 
import Numeric from 'components/numeric'
import 'components/planBox.css'

class PlanBox extends Component {

  constructor(props){
    super(props)
    this.state = {
      info: defaultTo(this.props.data.info, {}),
      currentCurrency: defaultTo(this.props.data.currentCurrency, 'USD'),
      currencyConversion: defaultTo(this.props.data.currencyConversion, []),
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState(nextProps.data)
  }

  render() {
    const plan = this.state.info
    const { isLoading} = this.props.data
    let planPrice = { currency: this.state.currentCurrency, value: 0 }
    if(plan.paymentType==='subscription') planPrice = plan.planInfo.price
    if(plan.paymentType==='transaction') planPrice = plan.transactionValue
    return (
      <div id="planBox" className={classnames({'mostPopular': plan.mostPopular, 'hide': isLoading})}>
        <div className="panel panel-default">
          <div className="panel-heading text-center">
            <div id="tag" className={classnames({'hide': !plan.mostPopular})}>
              <i className="glyphicon glyphicon-star"></i> {this.context.t('mostPopular')}
            </div>
            <h2>{plan.name}</h2>
            <Numeric data={{ amount: planPrice.value, display: 'text', decimalScale: 2, from: this.state.currentCurrency, to: planPrice.currency, prefix: '$', currencyConversion: this.state.currencyConversion }} /> {this.state.currentCurrency.toUpperCase()} <small>{this.context.t('perMonth')}</small><br/>
            {
              planPrice.value>0
              ? <Link className="btn btn-success" to={`/buy/${Object.toUrl(plan.name)}`}>{this.context.t('buy')}</Link> 
              : <Link className="btn btn-success" to="/register">{this.context.t('try')}</Link>
            }
          </div>
          <div className="panel-body">
            <ul className="list-unstyled">
              {
                sortBy(plan.features, ['order']).map(item => 
                  <li key={item.id} className={classnames({'text-deleted text-danger': item.quantity===0})}>
                    <i className={item.feature.icon} /> {item.feature.name}
                  </li>
                )
              }
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

PlanBox.contextTypes = {
  t: PropTypes.func.isRequired
}

export default PlanBox
