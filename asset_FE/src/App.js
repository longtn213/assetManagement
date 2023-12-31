import './App.css'
import React, {useState} from "react";
import {BrowserRouter as Router, NavLink, Route, Switch} from "react-router-dom";
import logoimg from "./assets/images/logonashtech.png"
import ManageAssignment from "./pages/ManageAssignment/ManageAssignment";
import RequestForReturning from "./pages/RequestForReturning/RequestForReturning";
import ManageAsset from "./pages/ManageAsset/ManageAsset";
import ManageUser from "./pages/ManageUser/ManageUser";
import Report from "./pages/Report/Report";
import Header from "./components/Header/Header";
import Login from "./pages/Login/Login";
import CreateUserPage from "./pages/ManageUser/CreateUserPage/CreateUserPage";
import Profile from "./pages/Profile/Profile";
import {API_URL} from "./common/constants";
import useFetch from "./hooks/useFetch";
import EditUserPage from "./pages/ManageUser/EditUserPage/EditUserPage";
import jwt_decode from "jwt-decode";
import EditAssetPage from "./pages/ManageAsset/EditAssetPage/EditAssetPage";
import CreateAssetPage from "./pages/ManageAsset/CreateAssetPage/CreateAssetPage";
import Error from "./pages/Error/Error";
import EditAssignmentPage from "./pages/ManageAssignment/EditAssignmentPage/EditAssignmentPage";
import CreateAssignmentPage from "./pages/ManageAssignment/CreateAssignmentPage/CreateAssignmentPage";
import MyAssignment from "./pages/Home/MyAssignment";
import axios from "axios";

const headerTitle = {
    Home: 'Home',
    User: 'Manage User',
    Asset: 'Manage Asset',
    Assignment: 'Manage Assignment',
    Request: 'Request Of Returning',
    Report: 'Report',
}
const convertDataResponse = res => (
    {
        fullName: `${res.data.lastName} ${res.data.firstName}`,
        userName: res.data.username,
        type: res.data.type,
        status: res.data.status,
    }
);
export default function App() {
    const [headerInfo, setHeaderInfo] = useState(headerTitle.Home);
    const [token, setToken] = useState(localStorage.getItem("TOKEN"));
    const [showNewPass, setShowNewPass] = useState(false);
    const handleShowNewPass = () => setShowNewPass(true);
    const handleCloseNewPass = () => setShowNewPass(false);

    let role = "";
    let curUsername = "";
    if (token) {
        localStorage.setItem("TOKEN", token);
        const decode = jwt_decode(token);
        role = decode.role;
        curUsername = decode.sub;
        if (decode.exp * 1000 <= Date.now()) {
            localStorage.removeItem("TOKEN");
            setToken(null);
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    const {
        data: account,
        setData: setAccount,
    } = useFetch(
        {},
        `${API_URL}/account/user?username=${curUsername}`,
        convertDataResponse);

    return (
        <Router>
            <div>
                <Header
                    header={headerInfo}
                    account={account}
                    token={token}
                    setAccount={setAccount}
                    showNewPass={showNewPass}
                    handleShowNewPass={handleShowNewPass}
                    handleCloseNewPass={handleCloseNewPass}
                />
                <div className="appcontainer">
                    <div className="grid wide">
                        <div className="row app-content">
                            <div className="col col-lg-3 col-md-4 col-sm-2 ">
                                <img className="logo-img" src={logoimg} alt="logo"/>
                                <div className="app-content__title">Online Asset Management</div>
                                {token && <nav className="category">
                                    <ul className="category-list">
                                        <li className="category-item" onClick={() => setHeaderInfo(headerTitle.Home)}>
                                            <NavLink exact activeClassName="selected" className="category-item__link"
                                                     to="/">Home</NavLink>
                                        </li>
                                        {account.type === "Admin" &&
                                            <li className="category-item"
                                                onClick={() => setHeaderInfo(headerTitle.User)}>
                                                <NavLink activeClassName="selected" className="category-item__link"
                                                         to="/user">Manage User</NavLink>
                                            </li>}
                                        {account.type === "Admin" &&
                                            <li className="category-item"
                                                onClick={() => setHeaderInfo(headerTitle.Asset)}>
                                                <NavLink activeClassName="selected" className="category-item__link"
                                                         to="/asset">Manage Asset</NavLink>
                                            </li>}
                                        {account.type === "Admin" &&
                                        <li className="category-item"
                                            onClick={() => setHeaderInfo(headerTitle.Assignment)}>
                                            <NavLink activeClassName="selected" className="category-item__link"
                                                     to="/assignment">Manage Assignment</NavLink>
                                        </li>}
                                        {account.type === "Admin" &&
                                        <li className="category-item"
                                            onClick={() => setHeaderInfo(headerTitle.Request)}>
                                            <NavLink activeClassName="selected" className="category-item__link"
                                                     to="/returning">Request for Returning</NavLink>
                                        </li>
                                        }
                                        {account.type === "Admin" && <li className="category-item"
                                                                         onClick={() => setHeaderInfo(headerTitle.Report)}>
                                            <NavLink activeClassName="selected" className="category-item__link"
                                                     to="/report">Report</NavLink>
                                        </li>}
                                    </ul>
                                </nav>}
                            </div>
                            <div className="col col-lg-9 col-md-8 col-sm-10">
                                <Switch>
                                    <Route path="/" exact>
                                        {token ? <MyAssignment/> : <Login/>}
                                    </Route>
                                    <Route path="/user" exact
                                           render={() => role === "Admin" ? <ManageUser/> :
                                               <Login message="Admin only"/>}
                                    />
                                    <Route path="/asset" exact
                                           render={() => role === "Admin" ? <ManageAsset/> :
                                               <Login message="Admin only"/>}
                                    />
                                    <Route path="/assignment" exact
                                           render={() => token ? <ManageAssignment/> : <Login/>}
                                    />
                                    <Route path="/returning" exact
                                           render={() => token ? <RequestForReturning/> : <Login/>}
                                    />
                                    <Route path="/report" exact
                                           render={() => role === "Admin" ? <Report/> : <Login message="Admin only"/>}
                                    />
                                    <Route path="/login" exact>
                                        <Login/>
                                    </Route>
                                    <Route path="/profile" exact>
                                        <Profile/>
                                    </Route>
                                    <Route path="/create" exact>
                                        {role === "Admin" ? <CreateUserPage/> : <Error message={`Access denied`}/>}
                                    </Route>
                                    <Route path="/edit/:id" exact>
                                        {role === "Admin" ? <EditUserPage token={token}/> :
                                            <Error message={`Access denied`}/>}
                                    </Route>
                                    {role === "Admin" && <Route path="/create/asset" exact>
                                        <CreateAssetPage/>
                                    </Route>}
                                    {role === "Admin" && <Route path="/edit/asset/:id" exact>
                                        <EditAssetPage/>
                                    </Route>}
                                    {role === "Admin" && <Route path="/edit/assignment/:id" exact>
                                        <EditAssignmentPage/>
                                    </Route>}
                                    {role === "Admin" && <Route path="/assignment/create" exact>
                                        <CreateAssignmentPage curUsername={curUsername}/>
                                    </Route>}
                                </Switch>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Router>
    );
}
