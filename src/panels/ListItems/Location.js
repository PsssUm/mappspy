import React from 'react';
import custom from '../../img/custom.png'

class Location extends React.Component {
   
	constructor(props){
		super(props)
		
	}
	componentDidMount(){
	
	}
	addLocation = () => {
        if (this.props.location.id == 1){
            this.props.openView('create_location')
        }
    }
	render() {
        console.log("this.props.location = " + JSON.stringify(this.props.location))
        return (
            <div className="location_item">
                <img onClick={this.addLocation} className="location_img" src={this.props.location.name != "" ? custom : this.props.location.img}/>
                {this.props.location.name != "" && <p style={{fontSize : '16px', fontWeight : '600'}} className="center custom_loc_name">{this.props.location.name}</p>}
            </div>
	  )
	}
  }
  export default Location;
