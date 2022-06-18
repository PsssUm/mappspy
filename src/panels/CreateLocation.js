import React from 'react';
import { getRandomLocation, getLocations, getRandomInt, addLocation } from '../utils/Utils';
import left from '../img/left.svg'
import custom from '../img/custom.png'


class CreateLocation extends React.Component {
   
	constructor(props){
		super(props)
		this.state = {
            name : ""
        }
        this.nameChanged = this.nameChanged.bind(this)
	}
	componentDidMount(){
        console.log("location : " + location)
	}
	nameChanged(event){
        if (event){
            var value = event.target.value
            this.setState({name : value})
        }
    }
    ready = () => {
        addLocation({img : custom, name : this.state.name})
        this.props.openView('main')
        this.props.updateLocations()
    }
	render() {
        const name = this.state.name
        var isError = name.length < 2 || name.length > 60
        return(
            <div className="main_container gradient_bg">
                <div onClick={this.props.back} className="left_cont">
                    <img className="left" src={left}/>
                </div>
                <div>
                    <p className="create_title">Как назовём новую локацию?</p>
                    <input value={this.name} onChange={this.nameChanged} className="player_count_input" />
                    <p style={isError ? {color : '#FF8979'} : {}} className="player_desc hover">Длина названия должна быть не более 60 символов и не менее 2</p>
                </div>
                
                <div style={isError || this.state.name == "" || this.state.name == undefined ? {opacity : 0.2, pointerEvents : 'none'} : {}} onClick={this.ready} className="btn hover player_btn">Готово</div>
            </div>)
        
	}
  }
  export default CreateLocation;
