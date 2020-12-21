import React from 'react';

export default class Row extends React.Component {
    render() {
        return (
            <fieldset name={this.props.name}>
                <label htmlFor="count">Text:&nbsp;
                    <textarea name="text" id="text" rows="2" defaultValue={this.props.text}
                              onChange={this.props.cb(this.props.name, "text")}/>
                </label>
                <br/>
                <label htmlFor="count">Count:&nbsp;
                    <input type="number" id="count" name="count" min="0" max="20" readOnly={false}
                           defaultValue={this.props.count} onChange={this.props.cb(this.props.name, "count")}/>
                </label>
            </fieldset>
        );
    }
}
