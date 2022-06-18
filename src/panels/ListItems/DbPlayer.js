import React from 'react';

class DbPlayer extends React.Component {
   
	constructor(props){
        super(props)
        
		
	}
	componentDidMount(){
	
	}
	
	render() {
        return (
            <div style={{marginBottom : '16px', justifyContent : 'space-between'}} className="player_count_input">
                <p className="db_player_text">{this.props.player.name}</p>
                <p className="db_in_game">{this.props.player.id != -1 ? "в игре" : ""}</p>
            </div>
	  )
	}
  }
  export default DbPlayer;
