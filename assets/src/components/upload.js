import React from 'react'
import PropTypes from 'prop-types'
import { defaultTo, set } from 'lodash'
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
      let dropArea = this.refs.divUpload
      let events = ['dragenter','dragover','dragleave','drop']
      events.forEach(event => dropArea.addEventListener(event, this.handlePreventDefault))
      dropArea.addEventListener('drop', this.handleDrop)
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

  async handleDrop(e){
    try{
      let files = (e.dataTransfer).files
      this.handleFiles(files)
    }catch(e){
      console.error(e)
    }
  }

  async handleFiles(files){
    try{
      files = Array.from(files).slice(0, this.props.maxAllowed)
      await this.setState({ value: files })
      this.props.onChange(this.state.value)
    }catch(e){
      console.error(e)
    }
  }

  async handleFilePreview(imgId, file){
    try{
      if(!file.size) return file
      let reader = new FileReader()
      reader.onload = (e) => this.refs[imgId].src = e.target.result
      reader.readAsDataURL(file)
    }catch(e){
      console.error(e)
    }
  }

  render() {
    const value = [].concat(this.state.value)
    const { className, defaultValue, legend, maxAllowed } = this.props
    return (
      <div ref="divUpload" id="upload" className={`row justify-content-start p-3 ${className}`} onClick={() => this.refs.inputUpload.click()}>
        {
          value.map((item, index) => 
            <div key={index} className="col mb-3">
              <img ref={index} src={this.handleFilePreview(index, item)} alt={'upload'} width={200} />
            </div>   
          )
        }
        <div className="col-12">{legend}</div>
        <input ref="inputUpload" className="d-none" type="file" name={Date.now()} multiple={maxAllowed>1} onChange={this.handleChangeInput.bind(this)} />
        <Style>
        {`
          #upload{
            cursor: pointer;
            border: 2px dashed #dbdbe2;
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
