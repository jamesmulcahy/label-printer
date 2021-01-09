import React from 'react';

export default class Row extends React.Component {
    render() {
        return (
            <fieldset name={this.props.name}>
            <table>
                <tbody>
                <tr>
                    <td>
                        <label htmlFor="text">Text</label>
                    </td>
                    <td>
                    <textarea name="text" id="text" rows="2" defaultValue={this.props.text}
                              onChange={this.props.cb(this.props.name, "text")}/>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label htmlFor="count">Count</label>
                    </td>
                    <td>
                        <input type="number" pattern="\d*" id="count" name="count" min="0" max="20" readOnly={false}
                               defaultValue={this.props.count} onChange={this.props.cb(this.props.name, "count")}/>                    </td>
                </tr>
                </tbody>
            </table>
            </fieldset>
        );
    }
}
