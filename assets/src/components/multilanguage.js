import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import ReactQuill from 'react-quill'
import shortid from 'shortid'
import classnames from 'classnames'
import { defaultTo, get, set } from 'lodash'

export default class Multilanguage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isHtml: defaultTo(this.props.data.type, false),
      languages: defaultTo(this.props.data.languages, []),
      value: defaultTo(this.props.data.value, '')
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data)
  }

  async handleChangeState(path, value) {
    await this.setState(set(this.state, path, value))
    if(path==='value') this.props.onChange(this.state.value)
  }

  render(){
    const reactQuillColors = ['#FF0000','#001F3F','#0074D9','#7FDBFF','#39CCCC','#3D9970','#2ECC40','#01FF70','#FFDC00','#FF851B','#FF4136','#85144B','#F012BE','#B10DC9','#111111','#AAAAAA']
    const reactQuillModules = {
      toolbar: {
        container: [
          [{'font': []}, { 'header': [1, 2, 3, false] }, { 'size': ['small', 'large', 'huge', false] }],
          [{'background': reactQuillColors},'bold',{'color': reactQuillColors},'code','italic','link','strike',{ 'script': 'sub'},'underline'],
          ['blockquote',{'indent': '-1'}, {'indent': '+1'},{'list': 'ordered'}, {'list': 'bullet'},{'align': [false,'center','right','justify']},'direction','code-block'],
          ['formula', 'image','video','clean']
        ]
      }
    }
    return (
      <div>
        <Tabs id={shortid.generate()} defaultActiveKey={0}>
          {
            this.state.languages.map((item, index) =>
              <Tab key={index} eventKey={index} title={item}>
                { this.state.isHtml
                  ? <ReactQuill modules={reactQuillModules} value={get(this.state, `value[${item}]`, '')} onChange={value => this.handleChangeState(`value[${item}]`, value)} />
                  : <textarea value={get(this.state, `value[${item}]`, '')} className="form-control" rows="4" onChange={e => this.handleChangeState(`value[${item}]`, e.target.value)} />
                }
              </Tab>
            )
          }
        </Tabs>
        <div className="btn-group">
          <button type="button" className={classnames({'btn btn-default': true}, {'btn-success': !this.state.isHtml} )} onClick={this.handleChangeState.bind(this, 'isHtml', false)}>TEXT</button> 
          <button type="button" className={classnames({'btn btn-default': true}, {'btn-success': this.state.isHtml} )} onClick={this.handleChangeState.bind(this, 'isHtml', true)}>HTML</button> 
        </div>
      </div>
    )
  }
}