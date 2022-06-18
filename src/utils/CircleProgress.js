import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

class CircleProgress extends React.Component {
    
    constructor(props){
        super(props)
       
    }
   
   
    render() {
        return (
            <div style={this.props.style != undefined ? this.props.style : {}} className="center flip">
                <CircularProgressbar
                    value={100 - this.props.percentage}
                    
                    styles={buildStyles({
                    
                
                    // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                    strokeLinecap: 'butt',
                
                    // Text size
                    textSize: '0px',
                
                    // How long animation takes to go from one percentage to another, in seconds
                    pathTransitionDuration: 0.5,
                
                    // Can specify path transition in more detail, or remove it entirely
                    // pathTransition: 'none',
                
                    // Colors
                    
                    pathColor: '#FED339',
                    trailColor: 'none',
                    })}
                />
               
                
            </div>
            

        );
    }
}
export default CircleProgress;