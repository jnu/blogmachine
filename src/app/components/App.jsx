import React, { Component } from 'react';
import { connect } from 'react-redux';


class App extends Component {

    render() {
        return (
            <div className='App'>
                The Main app Layout
                { this.props.children }
            </div>
        );
    }

}

export default App;
