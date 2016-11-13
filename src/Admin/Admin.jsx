import React, { Component } from 'react';
import { withData } from 'dreija';

@withData({
    derive: () => ({})
})
export default class Admin extends Component {

    render() {
        return (
            <div className="Admin">
                <h2>Admin</h2>
            </div>
        );
    }

}
