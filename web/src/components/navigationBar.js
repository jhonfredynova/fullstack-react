import React, { Component } from 'react'
import './navigationBar.css'

class NavigationBar extends Component {

  constructor(props) {
    super(props)
    this.state = {
      title: Object.defaultComponentTo(this.props.data.title, null),
      btnLeft: Object.defaultComponentTo(this.props.data.btnLeft, null),
      btnRight: Object.defaultComponentTo(this.props.data.btnRight, null),
      subTitle: Object.defaultComponentTo(this.props.data.subTitle, null)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data)
  }

  render() {
    return (
      <div id="navigationBar">
        <div className="btn-navigation">{this.state.btnLeft}</div>
        <div className="head-navigation text-center">
          {this.state.title}
          {this.state.subTitle}
        </div>
        <div className="btn-navigation">{this.state.btnRight}</div>
      </div>
    )
  }
}

export default NavigationBar
