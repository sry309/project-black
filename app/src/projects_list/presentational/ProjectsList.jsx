import _  from 'lodash'
import React from 'react'
import {
    Box,
    Button,
    Table,
    TableHeader,
    TableRow,
    TableCell,
    TableBody,
    TextInput
} from 'grommet'
import { Add } from 'grommet-icons'

import ProjectsListLine from "./ProjectsListLine.jsx"


class ProjectsList extends React.Component
{

    constructor(props) {
        super(props);

        this.state = {
            "new_project_name": ""
        }
    }

    render() {
        const projectsLines = _.map(this.props.projects, (x) => {
            return <ProjectsListLine project={x} 
                                     key={x.project_uuid} 
                                     onDelete={this.props.onDelete}/>
        });

        projectsLines.push(
            <TableRow key="add_new_project">
                <TableCell></TableCell>
                <TableCell>
                    <TextInput
                        placeholder="name"
                        value={this.state.new_project_name}
                        onChange={(e) => this.setState({
                            "new_project_name" : e.target.value
                        })}
                    />
                </TableCell>
                <TableCell>
                    <Button
                        icon={<Add />}
                        hoverIndicator={true}
                        onClick={() => {
                            this.props.submitNewProject(this.state.new_project_name);
                            this.setState({
                                "new_project_name": ""
                            });
                        }}
                    />
                </TableCell>
            </TableRow>
        );

        return (
            <Box>
                <Table alignSelf="stretch">
                    <TableHeader>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Project Name</TableCell>
                            <TableCell>Control</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projectsLines}
                    </TableBody>
                </Table>
            </Box>
        )
    }

}

export default ProjectsList;
