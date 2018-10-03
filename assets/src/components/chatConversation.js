import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { defaultTo, set, last } from 'lodash'

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
    const lastMessage = last(chat.messages)
    return (
      <div id="chatConversation" className={className}>
        <div className="media border-top border-bottom pt-2 btn text-left align-items-center" onClick={this.handleSelectChat.bind(this, chat)}>
          <span className="mr-2 small"><i className={classnames({'fas fa-circle text-black-50': true, 'text-success': chat.to.online})} /></span>
          <img className="align-self-start mr-3 rounded-circle" src={chat.to.photo} height={40} alt={chat.to.fullname} />
          <div className="media-body text-truncate">
            <h5 className="mt-0 mb-0">
              {chat.to.fullname}
            </h5>
            { lastMessage && <p className="font-italic small text-truncate p-0 m-0">{lastMessage.text}</p> }
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
