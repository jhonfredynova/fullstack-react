import React from 'react'
import PropTypes from 'prop-types'
import { isObject, defaultTo, set } from 'lodash'
import Style from 'components/style'

class Upload extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = { 
      value: defaultTo(this.props.value, [])
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  componentDidMount(){
    try{
      let events = ['dragenter','dragover','dragleave','drop']
      //dropArea
      let dropArea = this.refs.uploadDropArea
      events.forEach(event => dropArea.addEventListener(event, this.handlePreventDefault.bind(this)))
      dropArea.addEventListener('drop', this.handleDropFiles.bind(this))
      //dragArea
      let dragArea = this.refs.uploadDragArea
      dragArea.addEventListener('dragenter', this.handleDragStart.bind(this))
      dragArea.addEventListener('drop', this.handleDragEnd.bind(this))
    }catch(e){
      console.error(e)
    }
  }

  async handleChangeState(path, value){
    this.setState(set(this.state, path, value))
  }

  async handlePreventDefault(e){
    try{
      e.preventDefault()
      e.stopPropagation()
    }catch(e){
      console.error(e)
    }
  }

  async handleChangeInput(e){
    try{
      let files = e.target.files
      this.handleFiles(files)
    }catch(e){
      console.error(e)
    }
  }

  async handleDropFiles(e){
    try{
      let files = (e.dataTransfer).files
      this.handleFiles(files)
    }catch(e){
      console.error(e)
    }
  }

  async handleDragStart(e){
    try{
      if(e.target.draggable){
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', e.target.id)
      }
    }catch(e){
      console.error(e)
    }
  }

  async handleDragEnd(e){
    try{
      if(e.target.draggable){
        e.preventDefault()
        e.stopPropagation()
        let newIndex = parseInt(e.target.id,10)
        let oldIndex = parseInt(2,10)//e.dataTransfer.getData('text')
        e.dataTransfer.clearData()
        const { value } = this.state
        const movedItem = value.find((item, index) => index===oldIndex)
        const remainingItems = value.filter((item, index) => index!==oldIndex)
        const reorderedItems = [
          ...remainingItems.slice(0, newIndex),
          movedItem,
          ...remainingItems.slice(newIndex)
        ]
        this.setState({ value: reorderedItems })
      }
    }catch(e){
      console.error(e)
    }
  }

  async handleFiles(files){
    try{
      const value = [...this.state.value].concat(Array.from(files).slice(0, this.props.maxAllowed-this.state.value.length))
      await this.setState({ value: value })
      this.props.onChange(this.state.value)
    }catch(e){
      console.error(e)
    }
  }

  async handleFileDelete(fileId, e){
    try{
      e.preventDefault()
      e.stopPropagation()
      const { value } = this.state
      this.setState({ value: value.filter((item, index) => index!==fileId) })
    }catch(e){
      console.error(e)
    }
  }

  async handleFilePreview(fileId, file){
    try{
      if(isObject(file)){
        const reader = new FileReader()
        reader.onload = (e) => this.refs[fileId].src = e.target.result
        reader.readAsDataURL(file)
      }
    }catch(e){
      console.error(e)
    }
  }

  render() {
    const { className, defaultValue, legend, maxAllowed } = this.props
    return (
      <div ref="uploadDropArea" id="upload" className={className} onClick={() => this.refs.inputUpload.click()}>
        <div ref="uploadDragArea" className="row justify-content-start align-items-center p-3">
          {
            this.state.value.map((item, index) => 
              <div key={index} className="col m-3 border">
                <span className="closeIcon" onClick={this.handleFileDelete.bind(this,index)}><i className="fas fa-times-circle text-danger" /></span>
                <img ref={index} id={index} src={this.handleFilePreview(index, item)} alt={'upload'} width={150} draggable={true} />
              </div>   
            )
          }
        </div>
        <div className="col-12">{legend}</div>
        <input ref="inputUpload" className="d-none" type="file" name={Date.now()} multiple={maxAllowed>1} onChange={this.handleChangeInput.bind(this)} />
        <Style>
        {`
          #upload{
            cursor: pointer;
            border: 2px dashed #dbdbe2;
          }
          #upload .closeIcon{
            position: absolute;
            top: -12px;
            right: -8px;
          }
        `}
        </Style>
      </div>
    )
  }
}

Upload.contextTypes = {
  store: PropTypes.object.isRequired
}

export default Upload
