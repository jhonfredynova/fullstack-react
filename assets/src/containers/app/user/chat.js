import React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import Sidebar from "react-sidebar"
import { isEmpty, get, set, first, last } from 'lodash'
import Select from 'react-select'
import ChatConversation from 'components/chatConversation'
import ChatMessage from 'components/chatMessage'
import NavigationBar from 'components/navigationBar'
import Style from 'components/style'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getChat, getChatMessage, saveChat, saveChatMessage } from 'actions/chatActions'
import { onEvent, EVENT } from 'actions/socketActions'
import { getUser } from 'actions/userActions'
const sidebarMql = window.matchMedia(`(min-width: 768px)`)

class Chat extends React.PureComponent {

  constructor(props){
    super(props)
    const { session } = this.props.auth
    this.handleMediaQuery = this.handleMediaQuery.bind(this)
    this.handlePressKey = this.handlePressKey.bind(this)
    this.state = {
      sidebarDocked: sidebarMql.matches,
      sidebarMql: sidebarMql,
      sidebarOpen: false,
      chat: {},
      chats: this.props.chat.chats,
      chatQuery: {
        isLoading: false,
        pageSize: 10,
        select: ['updatedAt','id','from','to'],
        sort: [
          { updatedAt: 'DESC' }
        ],
        where: {
          from: session.id
        }
      },
      users: this.props.user.users,
      userQuery: {
        pageSize: 10,
        select: ['id','firstname','lastname','email'],
        sort: [
          { firstname: 'ASC' }
        ],
        where: {
          active: true, 
          id: { '!=': session.id }
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
      await this.handleChatLoad()
      const { records: chats } = this.props.chat.chats
      await this.setState({ chat: first(chats) })
      await this.handleUserLoad()
      this.props.dispatch(onEvent(EVENT.CHAT, (data) => this.handleChatLoad() ))
      this.props.dispatch(onEvent(EVENT.USER, (data) => this.handleUserLoad() ))
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

  async handleUserLoad(){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getUser(this.state.userQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChatLoad(e){
    try{
      this.props.dispatch(showLoading())
      const scroll = get(e, 'target')
      const { records, recordsTotal } = this.state.chats
      if(records.length+1<recordsTotal && scroll && scroll.offsetHeight+scroll.scrollTop===scroll.scrollHeight){
        await this.handleChangeState('chatQuery.pageSize', this.state.chatQuery.pageSize+5)
      }
      await this.props.dispatch(getChat(this.state.chatQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChatMessageLoad(e){
    try{
      this.props.dispatch(showLoading())
      const scroll = get(e, 'target')
      const { records, recordsTotal } = this.state.chats
      if(records.length+1<recordsTotal && scroll &&  scroll.offsetHeight+scroll.scrollTop===scroll.scrollHeight){
        await this.setState({ chatQuery: Object.assign(this.state.chatQuery, { pageSize: this.state.chatQuery.pageSize+5 }) })
      }
      await this.props.dispatch(getChatMessage({ populate: false, select: ['sender','text','seen'], where: { chat: this.state.chat.id } }))
      this.props.dispatch(hideLoading())      
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChatSelection(chat){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getChat({ where: { to: chat.to.id } }))
      this.setState({ chat: first(this.props.chat.chats.records) || chat })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChatSave(message){
    try{
      this.props.dispatch(showLoading())
      const { session } = this.props.auth
      let chat = {
        ...this.state.chat,
        to: this.state.chat.to.id,
        from: session.id
      }
      if(!chat.id){
        await this.props.dispatch(saveChat(chat))
        chat.id = last(this.props.chat.chats.records).id
      }
      let chatMessage = {
        sender: session.id,
        text: message,
        chat: chat.id
      }
      await this.props.dispatch(saveChatMessage(chatMessage))
      chat.messages = chat.messages || []
      chat.messages.push(chatMessage)
      this.setState({ chat: chat })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render(){
    const { chat } = this.state
    const { isLoading } = this.props.app
    const { defaultUser: defaultUserPhoto } = this.props.app.config.images
    const { records: chats } = this.state.chats
    const { records: users } = this.state.users
    const chatHeader = {
      title: isEmpty(chat) ? this.context.t('chatTitle') : <span><img className="rounded-circle" src={chat.to.photo || defaultUserPhoto} alt={chat.to.fullname} height={40} /> {chat.to.fullname}</span>,
      description: isEmpty(chat) ? this.context.t('chatDescription') : chat.to.email
    }
    const chatConversations = (
      <div className="card">
        <div className="card-header">
          <span className="text-left"><h2 className="ml-1"><i className="far fa-edit"></i> {this.context.t('messages')}</h2></span>
          <div className="form-group mb-0">
            <Select className="form-control" placeholder={`${this.context.t('search')}...`} options={users} optionRenderer={item => <span><span className="small"><i className={classnames({'fas fa-circle text-black-50': true, 'text-success': item.online})} /></span> {item.fullname}</span>} valueRenderer={item => <span>{item.fullname}</span>} valueKey='id' simpleValue={false} clearable={true} autosize={false} onChange={item => this.handleChatSelection({ to: item })} />
          </div>
        </div>
        <div className="card-body" onScroll={this.handleChatLoad.bind(this)}>
          { !isLoading && chats.length===0 &&
            <p className="text-center p-2">{this.context.t('chatConversationsEmpty')}</p>
          }
          {
            chats.map(item => {
              item.to.photo = item.to.photo || defaultUserPhoto
              return <ChatConversation isLoading={isLoading} auth={this.props.auth} className={classnames({'bg-light': item.id===this.state.chat.id})} key={item.id} chat={item} onSelect={this.handleChatSelection.bind(this, item)} />
            })
          }
          <div className={(classnames({'text-center p-2': true, 'd-none': !isLoading}))}><i className="fa fa-spinner fa-spin fa-2x"></i></div>
        </div>
      </div>
    )
    return (
      <div id="chat">
        <Sidebar rootClassName='sidebarRoot' sidebarClassName='sidebar' contentClassName='sidebarContent' overlayClassName='sidebarOverlay' docked={this.state.sidebarDocked} sidebar={chatConversations} open={this.state.sidebarOpen} onSetOpen={() => this.handleChangeState('sidebarOpen',false)}>
          <NavigationBar 
            title={<h1>{chatHeader.title}</h1>} 
            description={<h2>{chatHeader.description}</h2>} 
            btnLeft={(this.state.sidebarDocked ? null : <button className="btn btn-success" onClick={() => this.handleChangeState('sidebarOpen', !this.state.sidebarOpen)}><i className="fas fa-arrow-right" /></button>)} />
          <ChatMessage isLoading={isLoading} auth={this.props.auth} chat={chat} onScroll={this.handleChatMessageLoad.bind(this)} onSend={this.handleChatSave.bind(this)} />
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
            max-height: 88px;
            padding: 8px;
          }
          #chat .card .card-header h2{
            font-size: 22px;
            margin: 5px 0px;
          }
          #chat .card .card-body{
            height: 510px;
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
