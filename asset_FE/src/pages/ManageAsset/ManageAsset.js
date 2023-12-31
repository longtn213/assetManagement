import React, {useEffect, useMemo, useState} from "react";
import {Button, Col, Container, Form, FormControl, InputGroup, Row} from "react-bootstrap";
import {API_URL, FILTER_STATE_OPTIONS} from "../../common/constants";
import AssetTable from "../../components/AssetTable/AssetTable";
import './ManageAsset.css'
import useFetch from "../../hooks/useFetch";
import {useHistory} from "react-router-dom";
import {isMatchExact} from "../../common/config";
import axios from "axios";

const convertDataResponse = res => res.data;

const ManageAsset = () => {
	const history = useHistory();
	let recentAssetId = history.location.state ? history.location.state.firstId : null;
	const handleRedirectCreateAssetPage = () => {
		history.push("/create/asset");
	}

	const [reloadData, setReloadData] = useState(false); // use for retrieve new data after delete
	const [assets, setAssets] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		axios({
			url: `${API_URL}/assets`,
			method: 'GET',
		}).then(res => {
			setAssets(res.data);
			setIsLoading(false);
			setReloadData(false);
		}).catch(err => {
			console.log(err);
			setIsLoading(false);
			setReloadData(false);
			setErrorMessage(`Error: ${err.message}`);
		})
	}, [reloadData]);

	const {
		data: categories,
	} = useFetch([], `${API_URL}/categories`, convertDataResponse);

	const stateKeys = Object.keys(FILTER_STATE_OPTIONS);
	const listStates = stateKeys.map(key => <option key={FILTER_STATE_OPTIONS[key]}
	                                                value={FILTER_STATE_OPTIONS[key]}>{FILTER_STATE_OPTIONS[key]}</option>)
	const listCategories = categories.map(cate => <option key={cate.id}
	                                                      value={cate.categoryName}>{cate.categoryName}</option>);

	const [filterStateOption, setFilterStateOption] = useState('');
	const [filterCategoryOption, setFilterCategoryOption] = useState('');
	const [searchText, setSearchText] = useState('');
	if (recentAssetId) { // user created/edited: move it to the top of the list
		assets.sort((a, b) => a.id === recentAssetId ? -1 : b.id === recentAssetId ? 1 : 0);
		window.history.replaceState(null, '');
	}
	const assetsDefault = useMemo(() => {
		return assets.filter(asset => {
			return !isMatchExact((FILTER_STATE_OPTIONS.RECYCLED).toLowerCase(), asset.state.toLowerCase()) &&
				!isMatchExact((FILTER_STATE_OPTIONS.WAITING_FOR_RECYCLING).toLowerCase(), asset.state.toLowerCase());
		});
	}, [assets]);

	const assetsFiltered = useMemo(() => {
		const assetSource = filterStateOption === "" ? assetsDefault : assets;
		return assetSource.filter(asset => {
			if (filterStateOption === "") return asset.categoryName.toLowerCase().includes(filterCategoryOption.toLowerCase());
			return isMatchExact(filterStateOption.toLowerCase(), asset.state.toLowerCase()) &&
				asset.categoryName.toLowerCase().includes(filterCategoryOption.toLowerCase());
		});
	}, [assets, assetsDefault, filterStateOption, filterCategoryOption]);

	const assetsSearched = useMemo(() => {
		return assetsFiltered.filter(asset => {
				return asset.assetCode.toLowerCase().includes(searchText.toLowerCase()) ||
					asset.assetName.toLowerCase().includes(searchText.toLowerCase());
			}
		);
	}, [searchText, assetsFiltered]);

	return (
		<div className="mt-4">
			<Container className="px-0">
				<div className="manager__heading pb-3">
					Asset List
				</div>
				{/*Action bar*/}
				<Form className="manager__action mb-3">
					<Row className="actions__wrapper">
						<Col className='asset select'>
							<Form.Select
								className="action__filter h-75"
								value={filterStateOption}
								onChange={evt => {
									setFilterStateOption(evt.target.value)
								}}
							>
								<option value="">State</option>
								{listStates}
							</Form.Select>
						</Col>
						<Col className='asset select'>
							<Form.Select
								className="action__filter h-75"
								value={filterCategoryOption}
								onChange={evt => {
									setFilterCategoryOption(evt.target.value)
								}}
							>
								<option value="">Category</option>
								{listCategories}
							</Form.Select>
						</Col>
						<Col className="">
							<InputGroup className="h-75 search-group">
								<FormControl className="search-input"
								             onChange={evt => setSearchText(evt.target.value)}/>
								<Button className="search-button btn-cancel" id="button-addon2" disabled>
									<img src="https://img.icons8.com/ios/22/000000/search--v1.png" alt="search"/>
								</Button>
							</InputGroup>
						</Col>
						<Col className="h-75">
							<Button className="w-100 h-100" onClick={handleRedirectCreateAssetPage}>Create new
								asset</Button>
						</Col>
					</Row>
				</Form>
			</Container>
			<AssetTable assets={assetsSearched} isLoading={isLoading} errorMessage={errorMessage}
			            isRecentAsset={recentAssetId} reloadData={setReloadData}/>
		</div>
	)
}
export default ManageAsset