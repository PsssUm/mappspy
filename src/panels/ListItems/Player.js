import React from 'react';

class Player extends React.Component {
   
	constructor(props){
        super(props)
        
		this.nameChanged = this.nameChanged.bind(this)
	}
	componentDidMount(){
	
	}
	nameChanged(event){
        if (event){
            var value = event.target.value
            this.props.playerNameChanged(value, this.props.index)
        }
    }
	render() {
        return (
            <input style={{marginBottom : '16px', fontFamily : '21px', fontWeight : '700', textAlign : 'left'}} value={this.props.player.name} onChange={this.nameChanged} className="player_count_input" />
	  )
	}
  }
  export default Player;
