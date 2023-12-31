import React from "react";
import {Button, Col, Form, Row} from "react-bootstrap";
import {ErrorMessage, Formik} from "formik";
import {useHistory, useParams} from "react-router-dom";
import * as Yup from 'yup';
import moment from "moment";
import useFetch from "../../../hooks/useFetch";
import {API_URL, DATE_FORMAT} from "../../../common/constants";
import axios from "axios";
import DatePicker from "react-datepicker";
import {BsFillCalendarDateFill} from "react-icons/all";


const validateForm = Yup.object().shape({
    name:Yup.string().required("Required!"),
    category:Yup.string().required("Required!"),
    specification:Yup.string().required("Required!"),
    installedDate: Yup.date().max(new Date(),"Installed Date is not future day. Please select a different date")
        .required("Invalid date. Please select a different date").nullable(),
})
const convertDataResponse = res =>(
    {
        assetName:res.data.assetName,
        category: res.data.categoryName,
        specification: res.data.specification,
        installedDate: moment(res.data.installedDate).toDate(),
        state: res.data.state
    }
);

const EditAssetPage = () =>{
    const {id} = useParams();
    let history = useHistory();
    const handleRedirectAssetManagePage = () =>{
        history.push("/asset")
    }
    const {
        isLoading,
        data: assets,
        errorMessage
    } = useFetch([], `${API_URL}/assets/${id}`, convertDataResponse);
    console.log(assets)
    const initialValues ={
        name:assets.assetName,
        category:assets.category,
        specification:assets.specification,
        installedDate:assets.installedDate,
        state:assets.state
    }
    console.log("initial" ,initialValues)
    if (isLoading) return "Loading...";
    if (errorMessage) return <div style={{color: "red"}}>{errorMessage}</div>;
    const submit = (values, {resetForm}) => {
        console.log('Form values =', {values});
        // console.log('token=',localStorage.getItem('TOKEN'));
        axios({
            method: 'PUT',
            url: `${API_URL}/assets/${id}`,
            header: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${localStorage.getItem('TOKEN')}`
            },
            data: {
                assetName: values.name,
                categoryName: values.category,
                specification: values.specification,
                installedDate: values.installedDate,
                state:values.state
            }
        }).then((res) => {
            console.log("res = ", res);
            console.log("Edit success");
            history.push("/asset", {firstId: res.data.id});
        }).catch(err => {
            console.log("err = ", err);
            console.log(err.message);
            return <div style={{color: "red"}}>{err}</div>;
        });
        resetForm();
    }
    // const submit = (values,{resetForm}) => {
    //     console.log("value on submit =",values);
    //     history.push("/asset")
    //     resetForm();
    // }
    return(
        <div className="app-page">
            <div className="row">
                <div className="col-lg-2"/>
                <div className="col-lg-8">
                    <div className="app-content__title">Edit Asset</div>
                    <Formik
                        enableReinitialize={true}
                        initialValues={initialValues}
                        validationSchema={validateForm}
                        onSubmit={submit}
                    >
                        {({
                              values,
                              errors,
                              touched,
                              handleBlur,
                              handleChange,
                              handleSubmit,
                              setFieldValue
                          }) => (
                            <Form onSubmit={handleSubmit}>
                                <Form.Group as={Row} className="mb-3" controlId="formTextFirstName">
                                    <Form.Label column sm="3">Name</Form.Label>
                                    <Col sm="6">
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            defaultValue={values.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.name && errors.name}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.name}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                                <Form.Control.Feedback type="invalid">
                                    {errors.name}
                                </Form.Control.Feedback>
                                <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
                                    <Form.Label column sm="3">Category</Form.Label>
                                    <Col sm="6">
                                        <Form.Select
                                            name="category"
                                            value={values.category}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.category && errors.category}
                                            disabled={true}
                                        >
                                            <option value={values.category} label={values.category}/>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.category}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3" controlId="exampleFormControlTextarea">
                                    <Form.Label column sm="3">Specification</Form.Label>
                                    <Col sm="6">
                                        <Form.Control rows={4}
                                            as="textarea"
                                            name="specification"
                                            value={values.specification}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.specification && errors.specification}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.specification}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-2"/>
                                <Form.Group as={Row} className="mb-2" controlId="formTextBirthDate">
                                    <Form.Label column sm="3">Installed Date</Form.Label>
                                    <Col sm="6" className="date-form">
                                        <DatePicker
                                            className="form-control "
                                            dateFormat={DATE_FORMAT.DATE_PICKER}
                                            selected={values.installedDate}
                                            name="installedDate"
                                            onChange={(date) => {
                                                setFieldValue('installedDate', date);
                                            }}
                                            onBlur={handleBlur}
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            todayButton={"Today"}
                                        />
                                        <BsFillCalendarDateFill className="icon-form"/>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-2">
                                    <Col sm="3"/>
                                    <Col sm="6">
                                        <ErrorMessage name="installedDate">
                                            {msg => <div className="errorMessage">{msg}</div>}
                                        </ErrorMessage>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
                                    <Form.Label column sm="3">State</Form.Label>
                                    <Col sm="6">
                                        <div className="mb-3">
                                            <Form.Check
                                                label="Available"
                                                name="state"
                                                type="radio"
                                                value="Available"
                                                checked={values.state === "Available"}
                                                onChange={handleChange}
                                            />
                                            <Form.Check
                                                label="Not Available"
                                                name="state"
                                                type="radio"
                                                value="Not Available"
                                                checked={values.state === "Not Available"}
                                                onChange={handleChange}
                                            />
                                            <Form.Check
                                                label="Waiting for recycling"
                                                name="state"
                                                type="radio"
                                                value="Waiting for recycling"
                                                checked={values.state === "Waiting for recycling"}
                                                onChange={handleChange}
                                            />
                                            <Form.Check
                                                label="Recycled"
                                                name="state"
                                                type="radio"
                                                value="Recycled"
                                                checked={values.state === "Recycled"}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </Col>
                                </Form.Group>


                                <div className="group-btn">
                                    <Button type="submit" className="btn-primary"
                                            disabled={!values.name || !values.specification ||!values.installedDate}
                                    >
                                        Save
                                    </Button>
                                    <Button className="btn-cancel" type="reset" onClick={handleRedirectAssetManagePage}>
                                        Cancel
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
                <div className="col-lg-2"/>
            </div>
        </div>
    )
}
export default EditAssetPage
