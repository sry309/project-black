import _ from 'lodash'
import { connect } from 'react-redux'

import IPsListFilters from './IPsListFilters.jsx'


function mapStateToProps(state, ownProps) {
    let project_uuid = ownProps.project_uuid;

    let creds_dict = {};
    for (let cred of _.get(state.creds, "current_values", [])) {
        if (creds_dict.hasOwnProperty(cred.target)) {
            creds_dict[cred.target]["values"].push(cred);
        }
        else {
            creds_dict[cred.target] = {
                "values": [cred]
            };
        }
    }

    let ips = JSON.parse(JSON.stringify(state.ips));

    if (ips) {
        for (var ip of ips.data) {
            ip.hostnames = ip.hostnames.sort((a, b) => {
                if (a.host_id < b.host_id) return -1;
                if (a.host_id > b.host_id) return 1;
                return 0
            });
            
            ip.target = ip.ip_address;
            ip.creds = {
                "values": []
            };

            if (state.files.stats.ip.hasOwnProperty(ip.ip_id)) {
                ip.files = state.files.stats.ip[ip.ip_id];
            }
            else {
                ip.files = []
            }

            if (creds_dict.hasOwnProperty(ip.ip_address)) {
                let creds_sorted = creds_dict[ip.ip_address]['values'].sort((a, b) => {
                    if (a.port_number < b.port_number) return -1;
                    if (a.port_number > b.port_number) return 1;
                    if (a.candidate < b.candidate) return -1;
                    if (a.candidate > b.candidate) return 1;
                    return 0
                });
                ip.creds = {
                    'values': creds_sorted
                };
            }

            ip.tasks = {
                "active": [],
                "finished": []
            };

            for (var task_raw of state.tasks.active) {
                if (task_raw.task_type == 'masscan') {
                    let task_splitted = task_raw.target;

                    if (task_splitted.indexOf(ip.ip_address) !== -1) {
                        ip.tasks.active.push(task_raw);
                    }
                }
                else if (task_raw.task_type == 'nmap') {
                    if (task_raw.target == ip.ip_address) {
                        ip.tasks.active.push(task_raw);
                    }
                }
                else if ((task_raw.task_type == 'dirsearch') || (task_raw.task_type == 'patator')) {
                    let task_splitted = task_raw.target.split(':');

                    if (task_splitted.indexOf(ip.ip_address) !== -1) {
                        ip.tasks.active.push(task_raw);
                    }                    
                }
            }

            for (var task_raw of state.tasks.finished) {
                if (task_raw.task_type == 'masscan') {
                    let task_splitted = task_raw.target;

                    if (task_splitted.indexOf(ip.ip_address) !== -1) {
                        ip.tasks.finished.push(task_raw);
                    }
                }
                else if (task_raw.task_type == 'nmap') {
                    if (task_raw.target == ip.ip_address) {
                        ip.tasks.finished.push(task_raw);
                    }
                }                
                else if ((task_raw.task_type == 'dirsearch') || (task_raw.task_type == 'patator')) {
                    let task_splitted = task_raw.target.split(':');

                    if (task_splitted.indexOf(ip.ip_address) !== -1) {
                        ip.tasks.finished.push(task_raw);
                    }                    
                }
            }

            // TODO: sort tasks of each ip to make sure that _.isEqual don't return false
            // every time

            ip.scans = ip.scans.sort((a, b) => {
                if (a.port_number < b.port_number) return -1;
                if (a.port_number > b.port_number) return 1;
                return 0
            });

        }
    }

    return {
        project_uuid: project_uuid,
        tasks: state.tasks,
        ips: ips,
        dicts: state.dicts,
        tasks: state.tasks.active
    }
}


const IPsListWrapper = connect(
    mapStateToProps
)(IPsListFilters)

export default IPsListWrapper
