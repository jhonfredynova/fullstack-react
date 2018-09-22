import React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import Sidebar from "react-sidebar"
import { isEmpty, set } from 'lodash'
import Select from 'react-select'
import ChatConversation from 'components/chatConversation'
import ChatMessage from 'components/chatMessage'
import NavigationBar from 'components/navigationBar'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getChat, getChatMessage, saveChat, saveChatMessage } from 'actions/chatActions'
import { getUser } from 'actions/userActions'
import { Style } from 'react-style-tag'
const sidebarMql = window.matchMedia(`(min-width: 768px)`)

class Chat extends React.PureComponent {

  constructor(props){
    super(props)
    const { session } = this.props.auth
    this.handleMediaQuery = this.handleMediaQuery.bind(this)
    this.handlePressKey = this.handlePressKey.bind(this);
    this.state = {
      sidebarDocked: sidebarMql.matches,
      sidebarMql: sidebarMql,
      sidebarOpen: false,
      chat: null,
      chats: this.props.chat.chats,
      users: this.props.user.users,
      chatQuery: {
        isLoading: false,
        pageSize: 10,
        select: ['updatedAt','id','from'],
        sort: [
          { updatedAt: 'DESC' }
        ],
        where: {
          to: session.id
        }
      },
      chatMessageQuery: {
        isLoading: false,
        pageSize: 10,
        select: ['createdAt','value','seen'],
        sort: [
          { updatedAt: 'DESC' }
        ],
        where: {
          chat: null
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      chats: nextProps.chat.chats,
      users: nextProps.user.users
    })
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      this.state.sidebarMql.addListener(this.handleMediaQuery)
      document.addEventListener('keydown', this.handlePressKey, false)
      await this.props.dispatch(getChat(this.state.chatQuery))
      this.props.dispatch(getUser({ select: ['id','firstname','lastname'], where: { active: true }}))
      const lastChat = this.props.chat.chats.records.shift()
      if(lastChat){
        await this.handleChangeState('chatQuery.where.chat', lastChat.id)
        await this.props.dispatch(getChatMessage(this.state.chatQuery))
      }
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  componentWillUnmount() {
    try{
      this.state.sidebarMql.removeListener(this.handleMediaQuery)
      document.removeEventListener('keydown', this.handlePressKey, false);
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value){
    this.setState(set(this.state, path, value))
  }

  async handleMediaQuery(){
    try{
      this.setState({ sidebarDocked: this.state.sidebarMql.matches, sidebarOpen: false });
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handlePressKey(e){
    try{
      if(e.keyCode===27) {
        this.setState({ sidebarOpen: false })
      }
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChatLoad(chat){
    try{
      this.props.dispatch(showLoading())
      if(this.state.chat.id){
        await this.handleChangeState('chatMessageQuery.chat', this.state.chat.id)
        await this.props.dispatch(getChatMessage(this.state.chatMessageQuery))
      }
      this.setState({ chat: chat })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChatSave(data){
    try{
      this.props.dispatch(showLoading())
      if(!this.state.chat.id){
        this.state.chat.id = await this.props.dispatch(saveChat(this.state.chat))
      }
      data.chat = this.state.chat.id
      this.props.dispatch(saveChatMessage(data))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }
  
  async handleChatScroll(event){
    try{
      const { target: element } = event
      const { records, recordsTotal } = this.state.chats
      if(records.length+1<recordsTotal && element.offsetHeight+element.scrollTop===element.scrollHeight){
        this.props.dispatch(showLoading())
        await this.setState({ chatQuery: Object.assign(this.state.chatQuery, { pageSize: this.state.chatQuery.pageSize+5 }) })
        await this.props.dispatch(getChat(this.state.chatQuery))
        this.props.dispatch(hideLoading())
      }
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChatMessageScroll(event){
    try{
      const { target: element } = event
      const { records, recordsTotal } = this.state.chats
      if(records.length+1<recordsTotal && element.offsetHeight+element.scrollTop===element.scrollHeight){
        this.props.dispatch(showLoading())
        await this.setState({ chatQuery: Object.assign(this.state.chatQuery, { pageSize: this.state.chatQuery.pageSize+5 }) })
        await this.props.dispatch(getChat(this.state.chatQuery))
        this.props.dispatch(hideLoading())
      }
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render(){
    const { isLoading } = this.props.app
    const { records: chats } = this.state.chats
    const { records: chatMessages } = this.state.chatMessages
    const { records: users } = this.state.users
    const chatConversations = (
      <div className="card">
        <div className="card-header">
          <span className="text-left"><h2>{this.context.t('messages')}</h2></span>
        </div>
        <div className="card-body" onScroll={this.handleChatScroll.bind(this)}>
          <div className="form-group mb-0">
            <Select className="form-control" placeholder={`${this.context.t('search')}...`} options={users} optionRenderer={item => <span>{item.fullname}</span>} valueRenderer={item => <span>{item.fullname}</span>} valueKey='id' simpleValue={true} clearable={true} autosize={false} onChange={item => this.handleChatLoad.bind(this, item)} />
          </div>
          { !isLoading && chats.length===0 &&
            <p className="text-center p-2">{this.context.t('chatConversationsEmpty')}</p>
          }
          {
            chats.map(item => <ChatConversation key={item.id} info={item} onSelect={this.handleChatLoad.bind(this, item)} />)
          }
          <div className={(classnames({'text-center p-2': true, 'd-none': !isLoading}))}><i className="fa fa-spinner fa-spin fa-2x"></i></div>
        </div>
      </div>
    )
    return (
      <div id="chat">
        <Sidebar rootClassName='sidebarRoot' sidebarClassName='sidebar' contentClassName='sidebarContent' overlayClassName='sidebarOverlay' docked={this.state.sidebarDocked} sidebar={chatConversations} open={this.state.sidebarOpen} onSetOpen={() => this.handleChangeState('sidebarOpen',false)}>
          <NavigationBar 
            title={<h1>{this.context.t('chatTitle')}</h1>} 
            description={<h2>{this.context.t('chatDescription')}</h2>} 
            btnLeft={(this.state.sidebarDocked ? null : <button className="btn btn-success" onClick={() => this.handleChangeState('sidebarOpen', !this.state.sidebarOpen)}><i className="fas fa-right" /></button>)} />
          <ChatMessage isLoading={isLoading} messages={chatMessages} onScroll={this.handleChatMessageScroll.bind(this)} onSend={this.handleChatMessageSave.bind(this)} />
        </Sidebar>
        <Style>
        {`
          #chat{
            margin-top: 20px;
            position: relative;
            height: 600px;
          }
          #chat .card{
            margin-bottom: 0px;
            width: 250px;
          }
          #chat .card .card-header{
            max-height: 58px;
            padding: 8px;
          }
          #chat .card .card-header h2{
            font-size: 22px;
            margin: 5px 0px;
          }
          #chat .card .card-body{
            height: 540px;
            padding: 0px;
            overflow: auto;
          }
          @media only screen and (max-width: 768px) {
            #chat .card .card-body{
              height: auto;
            }
          }
          /* sidebar */
          #chat .sidebar{
            position: absolute;
            background-color: white;
            z-index: 1050!important;
            overflow-y: visible!important;
          }
          #chat .sidebarRoot{
            padding: 15px
          }
          #chat .sidebarContent{
            overflow-y: hidden!important;
            padding-left: 15px;
          }
          #chat .sidebarOverlay{
            z-index: 1040!important;
          }
          @media only screen and (max-width: 768px) {
            #chat .sidebar{
              position: fixed!important;
            }
          }
          /* infinityScroll */
          #chat .infinite-scroll-component{
            width: 250px;
          } 
        `}
        </Style>
      </div>
    )
  }
}

Chat.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    auth: state.auth,
    chat: state.chat,
    user: state.user
  }
}

export default connect(mapStateToProps)(Chat)
