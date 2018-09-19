import React from 'react'
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import ReactQuill, { Quill } from 'react-quill'
import classnames from 'classnames'
import { defaultTo, get, set } from 'lodash'
// Editor configuration
let BlockEmbed = Quill.import('blots/block/embed')
class Hr extends BlockEmbed {}
Hr.blotName = 'hr'
Hr.tagName = 'hr'
Quill.register({'formats/hr': Hr})

class Multilanguage extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      activeTab: 'en',
      isHtml: defaultTo(this.props.type, false),
      languages: defaultTo(this.props.languages, []),
      value: defaultTo(this.props.value, {})
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  async handleChangeState(path, value) {
    await this.setState(set(this.state, path, value))
    this.props.onChange(this.state.value)
  }

  render(){
    const reactQuillModules = {
      toolbar: {
        container: [
          [{'font': []}, { 'header': [] }, { 'size': [] }],
          [{'background': []},'bold',{'color': []},'code','italic','link','strike',{ 'script': 'sub'},'underline'],
          ['blockquote',{'indent': '-1'}, {'indent': '+1'},{'list': 'ordered'}, {'list': 'bullet'},{'align': []},'direction','code-block'],
          ['formula', 'image','video','clean']
        ]
      }
    }
    return (
      <div>
        <Nav tabs>
          {
            this.state.languages.map(item =>
              <NavItem key={item}>
                <NavLink active={item===this.state.activeTab} onClick={() => this.setState({ activeTab: item})}>{item}</NavLink>
              </NavItem>
            )
          }
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
           {
            this.state.languages.map(item =>
              <TabPane key={item} tabId={item} title={item}>
                { this.state.isHtml
                  ? <ReactQuill modules={reactQuillModules} value={get(this.state, `value[${item}]`, '')} onChange={value => this.handleChangeState(`value[${item}]`, value)} />
                  : <textarea value={get(this.state, `value[${item}]`, '')} className="form-control" rows="4" onChange={e => this.handleChangeState(`value[${item}]`, e.target.value)} />
                }
              </TabPane>
            )
          }
        </TabContent>
        <div className="btn-group">
          <button type="button" className={classnames({'btn btn-default': true}, {'btn-success': !this.state.isHtml} )} onClick={this.handleChangeState.bind(this, 'isHtml', false)}>TEXT</button> 
          <button type="button" className={classnames({'btn btn-default': true}, {'btn-success': this.state.isHtml} )} onClick={this.handleChangeState.bind(this, 'isHtml', true)}>HTML</button> 
        </div>
      </div>
    )
  }
}

export default Multilanguage