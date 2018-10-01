import React from 'react'
import PropTypes from 'prop-types'
import { defaultTo, set } from 'lodash'

class ChatConversation extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = { 
      chat: defaultTo(this.props.chat, {})
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  handleChangeState(path, value){
    this.setState(set(this.state, path, value))
  }

  handleSelectChat(chat){
    if(this.props.onSelect){
      this.props.onSelect(chat)
    }
  }

  render() {
    const { className } = this.props
    const { chat } = this.state
    const lastMessage = chat.messages.shift()
    return (
      <div id="chatConversation" className={className}>
        <div className="media border-top border-bottom pt-2 bg-light btn text-left" onClick={this.handleSelectChat.bind(this, chat)}>
          <img className="align-self-start mr-3 rounded-circle" src={chat.to.photo} height={30} alt={chat.to.fullname} />
          <div className="media-body">
            <h5 className="mt-0">
              { chat.to.fullname }
            </h5>
            { lastMessage && <p>{lastMessage.value}</p> }
          </div>
        </div>
      </div>
    )
  }
}

ChatConversation.contextTypes = {
  store: PropTypes.object.isRequired
}

export default ChatConversation
