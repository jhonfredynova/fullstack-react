import React from 'react'
import NumberFormat from 'react-number-format'
import { defaultTo, set, isEmpty } from 'lodash'

class Counter extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      max: defaultTo(this.props.max, 100),
      min: defaultTo(this.props.min, 0),
      value: defaultTo(this.props.value, 0)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  async handleChangeState(path, value){
    await this.setState(set(this.state, path, value))
    this.props.onChange(this.state.value)
  }
  
  async handleIncreaseValue() {
    if (this.state.value<this.state.max) {
      this.state.value = isEmpty(this.state.value) ? this.state.min : this.state.value+1
      await this.setState({ value: parseInt(this.state.value, 10) })
      this.props.onChange(this.state.value)
    }
  }  
  
  async handleDecreaseValue() {
    if (this.state.value>this.state.min) {
      this.state.value = isEmpty(this.state.value) ? this.state.min : this.state.value-1
      await this.setState({ value: parseInt(this.state.value, 10) })
      this.props.onChange(this.state.value)
    }
  }
    
  render() {
    return (
      <div>
        <div className="input-group">
          <NumberFormat className="form-control" isNumericString={true} allowEmptyFormatting={false} value={this.state.value} displayType={'input'}  onValueChange={value => this.handleChangeState('value', (isNaN(value.floatValue) ? '' : value.floatValue))} />
  	      <span className="input-group-append">
  	      	<button className="btn btn-danger rounded-0" type="button" onClick={this.handleDecreaseValue.bind(this)}><i className="fa fa-minus" aria-hidden="true"></i></button>
  	        <button className="btn btn-success" type="button" onClick={this.handleIncreaseValue.bind(this)}><i className="fa fa-plus" aria-hidden="true"></i></button>
  	      </span>
	      </div>
      </div>
    )
  }
}

export default Counter
