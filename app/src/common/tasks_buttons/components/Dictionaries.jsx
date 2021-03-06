import _ from 'lodash'
import React from 'react'

import { Button } from 'grommet'
import { Catalog } from 'grommet-icons'

import DictionariesManager from './DictionariesManager.jsx'


class Dictionaries extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "dictsHidden": true
        };
    }

    render() {
		return (
			<div>
                {!this.state.dictsHidden &&
                    <DictionariesManager
                        project_uuid={this.props.project_uuid}
                        dicts={this.props.dicts}
                        name={this.props.name}
                    />
                }
                <Button
                    onClick={() => this.setState({"dictsHidden": !this.state.dictsHidden})}
                    label={(this.state.dictsHidden ? "Show" : "Hide") + " Dictionaries"}
                    icon={<Catalog />}
                />
            </div>
		)
	}

}

export default Dictionaries;




