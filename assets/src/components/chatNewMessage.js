import React from 'react'
import PropTypes from 'prop-types'
import { defaultTo } from 'lodash'
import 'components/chatNewMessage.css'

class ChatNewMessage extends React.Component {

  constructor(props) {
    super(props)
    const data = this.props.data || {}
    this.state = { 
      seen: defaultTo(data.seen, false),
      value: defaultTo(data.value, '')
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data)
  }

  render() {
    const { className } = this.props
    return (
      <div id="chatNewMessage" className={className}>
        <div className="headerWrap">

        </div>
        <div className="contentWrap">
        </div>
        <div className="editorWrap">
          
        </div>
      </div>
    )
  }
}

ChatNewMessage.contextTypes = {
  store: PropTypes.object.isRequired
}

export default ChatNewMessage
