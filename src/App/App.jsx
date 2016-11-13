import React, { Component } from 'react';
import { Link } from 'react-router';
import { withData } from 'dreija';
import {
    isFetching
} from 'dreija/helpers';
import eyeClosePng from '../../assets/img/eye_close.png';
import eyeOpenPng from '../../assets/img/eye_open.png';



const HIDE_STYLE = { display: 'none' };


@withData({
    derive: state => ({ isFetchingSomething: isFetching(state) })
})
class App extends Component {

    render() {
        const { isFetchingSomething } = this.props;
        return (
            <div className="App">
                <header className="App-header">
                    <address className="App-header-logo">
                        <Link to="/" className="Link">JNU</Link>
                    </address>
                    <nav className="App-header-nav">
                        <Link to="/post/about" className="Link">about</Link>
                        <Link to="/post/contact" className="Link">contact</Link>
                    </nav>
                </header>
                <aside className="App-sidebar">
                    <img src={ eyeOpenPng } style={ isFetchingSomething ? HIDE_STYLE : {} } />
                    <img src={ eyeClosePng } style={ !isFetchingSomething ? HIDE_STYLE : {} } />
                </aside>
                <main className="App-main">
                    <div className="App-main-wrapper">
                        { this.props.children }
                    </div>
                </main>
            </div>
        );
    }

}

export default App;
