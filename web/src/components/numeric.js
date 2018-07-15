import React, { Component } from 'react'
import NumberFormat from 'react-number-format'
import { defaultTo, set } from 'lodash'

class Numeric extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      amount: defaultTo(this.props.data.amount, ''),
      decimalScale: defaultTo(this.props.data.decimalScale, 0),
      decimalSeparator: defaultTo(this.props.data.decimalSeparator, '.'),
      display: defaultTo(this.props.data.display, 'input'),
      from: defaultTo(this.props.data.from, null),
      placeholder: defaultTo(this.props.data.placeholder, ''),
      prefix: defaultTo(this.props.data.prefix, ''),
      currencyConversion: defaultTo(this.props.data.currencyConversion, []),
      suffix: defaultTo(this.props.data.suffix, ''),
      thousandSeparator: defaultTo(this.props.data.thousandSeparator, ','),
      to: defaultTo(this.props.data.to, null)
    }
  }

  async componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data)
  }

  async handleChangeState(path, value){
    await this.setState(set(this.state, path, value))
    this.props.onChange(this.state.amount)
  }

  render() {
    let amount = this.state.amount
    if(!Object.isEmpty(this.state.currencyConversion)){
      amount = this.state.amount/this.state.currencyConversion[this.state.to.toUpperCase()]
      amount = isNaN(amount) ? this.state.amount : amount
    }
    return (
      <NumberFormat className={this.props.className} decimalScale={this.state.decimalScale} placeholder={this.state.placeholder} allowEmptyFormatting={false} value={amount} displayType={this.state.display} prefix={this.state.prefix} suffix={this.state.suffix} thousandSeparator={this.state.thousandSeparator} decimalSeparator={this.state.decimalSeparator} onValueChange={value => this.handleChangeState('amount', (isNaN(value.floatValue) ? '' : value.floatValue))} />
    )
  }
}

export default Numeric
