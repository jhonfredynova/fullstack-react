import React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import Sidebar from "react-sidebar"
import { isEmpty, get, set, setDeep, first, last, unionBy } from 'lodash'
import AsyncSelect from 'react-select/lib/Async'
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
      chats: [],
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
      chatMessageQuery: {
        isLoading: false,
        populate: false,
        pageSize: 10,
        select: ['sender','text','seen'],
        sort: [
          { updatedAt: 'DESC' }
        ],
        where: {
          chat: null
        }
      },
      users: [],
      userQuery: {
        pageSize: 10,
        select: ['id','firstname','lastname','email'],
        sort: [
          { firstname: 'ASC' }
        ],
        where: {
          active: true, 
          id: { '!=': session.id },
          or: [
            { firstname: { like: '%' } },
            { lastname: { like: '%' } },
            { email: { like: '%' } },
            { username: { like: '%' } }
          ]
        }
      }
    }
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

  async handleUserSearch(value, callback){
    try{
      if(value.indexOf('%')===-1) value = `%${value}%`
      let where = setDeep(this.state.userQuery.where, 'like', value)
      await this.handleChangeState('userQuery.where', where)
      await this.props.dispatch(getUser(this.state.userQuery))
      let results = this.props.user.users.records
      this.setState({ users: unionBy(results, this.state.users, 'id') })
      callback(results)
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  async handleUserLoad(){
    try{
      await this.props.dispatch(getUser(this.state.userQuery))
      await this.setState({ users: this.props.user.users.records })
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  async handleChatLoad(e){
    try{
      this.handleChangeState('chatQuery.isLoading', true)
      const scroll = get(e, 'target')
      const { chats } = this.state
      if(scroll && scroll.offsetHeight+scroll.scrollTop===scroll.scrollHeight){
        await this.handleChangeState('chatQuery.pageSize', this.state.chatQuery.pageSize+5)
      }
      await this.props.dispatch(getChat(this.state.chatQuery))
      this.handleChangeState('chatQuery.isLoading', false)
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  async handleChatSelection(chat){
    try{
      const oldChat = this.props.chat.chats.records.find(item => item.to.id===chat.to.id)
      chat = oldChat || chat
      this.setState({ chat: chat })
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  async handleChatMessageLoad(e){
    try{
      this.handleChangeState('chatMessageQuery.isLoading', true)
      const scroll = get(e, 'target')
      const { chats } = this.state
      if(scroll &&  scroll.offsetHeight+scroll.scrollTop===scroll.scrollHeight){
        await this.setState({ chatQuery: Object.assign(this.state.chatQuery, { pageSize: this.state.chatQuery.pageSize+5 }) })
      }
      await this.props.dispatch(getChatMessage(this.state.chatMessageQuery))
      this.handleChangeState('chatMessageQuery.isLoading', false)
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  async handleChatMessageSave(chatMessage){
    try{
      this.props.dispatch(showLoading())
      const { session } = this.props.auth
      const chat = {
        ...this.state.chat,
        to: this.state.chat.to.id,
        from: session.id
      }
      if(!chat.id){
        await this.props.dispatch(saveChat(chat))
        chat.id = last(this.props.chat.chats.records).id
        chatMessage.id = chat.id
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
    const { chat, chatQuery, chatMessageQuery, chats, users } = this.state
    const { defaultUser: defaultUserPhoto } = this.props.app.config.images
    const chatHeader = {
      title: isEmpty(chat) ? this.context.t('chatTitle') : <span><img className="rounded-circle" src={chat.to.photo || defaultUserPhoto} alt={chat.to.fullname} height={40} /> {chat.to.fullname}</span>,
      description: isEmpty(chat) ? this.context.t('chatDescription') : chat.to.email
    }
    const chatConversations = (
      <div className="card">
        <div className="card-header">
          <span className="text-left"><h2 className="ml-1"><i className="far fa-edit"></i> {this.context.t('messages')}</h2></span>
          <div className="form-group mb-0">
            <AsyncSelect getOptionLabel={option => <span><span className="small"><i className={classnames({'fas fa-circle text-black-50': true, 'text-success': option.online})} /></span> {option.fullname}</span>} getOptionValue={option => option.id} cacheOptions={true} defaultOptions={users} loadOptions={this.handleUserSearch.bind(this)} onChange={item => this.handleChatSelection({ to: item })} />
          </div>
        </div>
        <div className="card-body" onScroll={this.handleChatLoad.bind(this)}>
          { !chatQuery.isLoading && chats.length===0 &&
            <p className="text-center p-2">{this.context.t('chatConversationsEmpty')}</p>
          }
          {
            chats.map(item => {
              item.to.photo = item.to.photo || defaultUserPhoto
              return <ChatConversation isLoading={chatQuery.isLoading} auth={this.props.auth} className={classnames({'bg-light': item.id===this.state.chat.id})} key={item.id} chat={item} onSelect={this.handleChatSelection.bind(this, item)} />
            })
          }
          <div className={(classnames({'text-center p-2': true, 'd-none': !chatQuery.isLoading}))}><i className="fa fa-spinner fa-spin fa-2x"></i></div>
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
          <ChatMessage isLoading={chatMessageQuery.isLoading} auth={this.props.auth} chat={chat} onScroll={this.handleChatMessageLoad.bind(this)} onSend={this.handleChatMessageSave.bind(this)} />
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
