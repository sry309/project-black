import _  from 'lodash'
import React from 'react'
import { Link } from 'react-router-dom'

import { Button, Icon, Table } from 'semantic-ui-react'


class ProjectsListLine extends React.Component
{

    constructor(props) {
        super(props);
    }

    delete_project(project_uuid) {
        if (confirm("Are you sure you want to delete?")) {
            this.props.onDelete(project_uuid);
        }
    }

    render() {
        return (
            <Table.Row>
                <Table.Cell>{this.props.project.project_uuid}</Table.Cell>
                <Table.Cell>{this.props.project.project_name}</Table.Cell>
                <Table.Cell>
                    <Link to={"/project/" + this.props.project.project_uuid}>
                        <Button icon>
                            <Icon name='unhide' />
                        </Button>
                    </Link>
                    <Button
                        icon
                        color="red" 
                        onClick={
                            () => {
                                this.delete_project(this.props.project.project_uuid);
                            }
                        }
                    >
                        <Icon name='trash' />
                    </Button>
                </Table.Cell>
            </Table.Row>
        )
    }

}

export default ProjectsListLine;
