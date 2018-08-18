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
    const { isLoading } = this.props.data
    const { info: planInfo } = this.state
    return (
      <div id="planBox" className={classnames({'mostPopular': planInfo.mostPopular, 'hide': isLoading})}>
        <div className="panel panel-default">
          <div className="panel-heading text-center">
            <div id="tag" className={classnames({'hide': !planInfo.mostPopular})}>
              <i className="glyphicon glyphicon-star"></i> {this.context.t('mostPopular')}
            </div>
            <h2>{planInfo.name}</h2>
            <Numeric data={{ amount: planInfo.price.value, display: 'text', decimalScale: 2, from: this.state.currentCurrency, to: planInfo.price.currency, prefix: '$', currencyConversion: this.state.currencyConversion, thousandSeparator: true }} /> {this.state.currentCurrency.toUpperCase()} <small>{this.context.t('perMonth')}</small><br/>
            <Link className="btn btn-success" to={planInfo.buyUrl}>{planInfo.buyText}</Link> 
          </div>
          <div className="panel-body">
            <ul className="list-unstyled">
              {
                sortBy(planInfo.features, ['order']).map(item => 
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
