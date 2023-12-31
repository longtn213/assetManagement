import React, {useMemo, useState, useEffect} from "react";
import {useHistory} from "react-router-dom";
import {Button, Col, Container, Form, FormControl, InputGroup, Row} from "react-bootstrap";
import AssignmentTable from "../../components/AssignmentTable/AssignmentTable";
import moment from "moment";
import {API_URL, DATE_FORMAT, FILTER_ASM_STATE_OPTIONS} from "../../common/constants";
import './ManageAssignment.css'
import {isMatchExact} from "../../common/config";
import axios from "axios";

const convertDataResponse = res => res.data.map(a => (
    {
        id: a.id,
        assetCode: a.assetCode,
        assetName: a.assetName,
        assignTo: a.assignTo,
        assignBy: a.assignBy,
        assignedDate: moment(a.assignedDate).format(DATE_FORMAT.TO),
        state: a.state
    }
));

const ManageAssignment = () => {
    const history = useHistory();
    const handleCreateAssigmentClicked = () => {
        history.push("/assignment/create");
    }

	const [reloadData, setReloadData] = useState(false); 
	const [assignments, setAssignment] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		axios({
			url: `${API_URL}/admin/assignments`,
			method: 'GET',
		}).then(res => {
			setAssignment(convertDataResponse(res));
			setIsLoading(false);
			setReloadData(false);
		}).catch(err => {
			console.log(err);
			setIsLoading(false);
			setReloadData(false);
			setErrorMessage(`Error: ${err.message}`);
		})
	}, [reloadData]);
    let recentUserId = history.location.state ? history.location.state.firstId : null;

    if (recentUserId) { // user created/edited: move it to the top of the list
        assignments.sort((a, b) => a.id === recentUserId ? -1 : b.id === recentUserId ? 1 : 0);
        window.history.replaceState(null, '');
    }

    const [filterStateOption, setFilterStateOption] = useState('');
    const [dateFilterValue, setDateFilterValue] = useState('');
    const [searchText, setSearchText] = useState('');
	

    const dateFilterFormatted = moment(dateFilterValue, 'YYYY-MM-DD').format(DATE_FORMAT.TO);

    const assignmentsFiltered = useMemo(() => {
        return assignments.filter(assignment => {
            if (dateFilterValue === '') return assignment.state.toLowerCase().includes(filterStateOption.toLowerCase());
            return assignment.state.toLowerCase().includes(filterStateOption.toLowerCase())
                && isMatchExact(assignment.assignedDate, dateFilterFormatted);
        });
    }, [assignments, filterStateOption, dateFilterValue, dateFilterFormatted]);

    const assignmentsSearched = useMemo(() => {
        return assignmentsFiltered.filter(assignment => {
            return assignment.assetCode.toLowerCase().includes(searchText.toLowerCase()) ||
                assignment.assetName.toLowerCase().includes(searchText.toLowerCase()) ||
                assignment.assignTo.toLowerCase().includes(searchText.toLowerCase());
        });
    }, [searchText, assignmentsFiltered]);

	return (
		<div className="mt-4">
			<Container className="px-0">
				<div className="manager__heading pb-3">
					Assignment List
				</div>
				<Form className="manager__action mb-3">
					<Row className="actions__wrapper">
						<Col className='asset select'>
							<Form.Select
								className="action__filter h-75"
								value={filterStateOption}
								onChange={evt => setFilterStateOption(evt.target.value)}
							>
								<option value="">State</option>
								<option value={FILTER_ASM_STATE_OPTIONS.ACCEPTED}>Accepted</option>
								<option value={FILTER_ASM_STATE_OPTIONS.WAITING_FOR_ACCEPTANCE}>Waiting for acceptance</option>
							</Form.Select>
						</Col>
						<Col className='asset calendar'>
							<div className="h-75 date-picker">
								<FormControl
									id="assignedDate"
									type="date"
									className="date-input"
									placeholder="Assigned Date"
									value={dateFilterValue}
									onChange={e => setDateFilterValue(e.target.value)}
								/>
							</div>
						</Col>
						<Col className="">
							<InputGroup className="h-75 search-group">
								<FormControl
									className="search-input"
									value={searchText}
									onChange={evt => setSearchText(evt.target.value)}
								/>
								<Button className="search-button btn-cancel" id="button-addon2" disabled>
									<img src="https://img.icons8.com/ios/22/000000/search--v1.png" alt="search"/>
								</Button>
							</InputGroup>
						</Col>
						<Col className="h-75">
							<Button className="w-100 h-100" onClick={handleCreateAssigmentClicked}>Create new
								assignment</Button>
						</Col>
					</Row>
				</Form>
			</Container>
			<AssignmentTable isLoading={isLoading} errorMessage={errorMessage} assignments={assignmentsSearched} isMyAssignment={false} isRecentUser={recentUserId} reloadData={setReloadData} />
		</div>
	)
}
export default ManageAssignment