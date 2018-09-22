import React from 'react'
import PropTypes from 'prop-types'
import { defaultTo, set } from 'lodash'

class ChatConversation extends React.PureComponent {

  constructor(props) {
    super(props)
    const data = this.props.data || {}
    this.state = { 
      value: defaultTo(data.value, '')
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data)
  }

  async handleChangeState(path, value){
    this.setState(set(this.state, path, value))
  }

  render() {
    const { className } = this.props
    return (
      <div id="chatConversation" className={className}>
      </div>
    )
  }
}

ChatConversation.contextTypes = {
  store: PropTypes.object.isRequired
}

export default ChatConversation
