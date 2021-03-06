import _ from 'lodash'
import React from 'react'
import { DropButton } from 'grommet'

import InnerModal from './InnerModal.jsx'
import DropButtonContent from './DropButtonContent.jsx'



class ButtonTasks extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			current_task: {
				name: "",
				preformedOptions: [],
				availableOptions: [],
				handler: (() => {})
			},
			dropDownOpen: false,
			modalOpen: false
		};

		this.changeCurrentTask = this.changeCurrentTask.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
	}

	changeCurrentTask(task) {
		this.setState({
			current_task: task
		});

		this.openModal();
	}

	openModal() {
		this.setState({
			modalOpen: true
		});
	}

	closeModal() {
		this.setState({
			modalOpen: false
		});
	}

	render() {
		const { tasks } = this.props;

		return (
			<span>
				<DropButton
					label="Launch Task"
					open={this.state.dropDownOpen}
					onOpen={() => this.setState({ dropDownOpen: true })}
					onClose={() => this.setState({ dropDownOpen: false })}
					dropContent={
						<DropButtonContent
							tasks={tasks}
							onClose={() => this.setState({ dropDownOpen: false })}
							changeCurrentTask={this.changeCurrentTask}
						/>
					}
					primary
				/>
				{
					this.state.modalOpen && (
						<InnerModal
							project_uuid={this.props.project_uuid}
							dicts={this.props.dicts}
							open={this.state.modalOpen}
							task={this.state.current_task}
							openModal={this.openModal.bind(this)}
							closeModal={this.closeModal.bind(this)}
						/>
					)
				}
			</span>
		)
	}

}

export default ButtonTasks;