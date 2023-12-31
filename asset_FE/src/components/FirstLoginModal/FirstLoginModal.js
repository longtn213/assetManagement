import React, {useState} from 'react';
import {Button, Col, Form, InputGroup, Modal, Row} from "react-bootstrap";
import * as Yup from 'yup';
import {useFormik} from 'formik';
import axios from "axios";
import {BsFillEyeSlashFill, BsFillEyeFill} from "react-icons/all";
import {API_URL, USER_STATUS} from "../../common/constants";

const Schema = Yup.object().shape({
    newPassword: Yup.string()
        .required("Required")
        .matches(/^\S+$/, "Password can not contain whitespace character.")
        .min(8, "Password is too short, must be at least 8 characters.")
        .matches(/^(?=.*[a-z])/, "Password must have at least 1 lowercase letter.")
        .matches(/^(?=.*[A-Z])/, "Password must have at least 1 uppercase letter.")
        .matches(/^(?=.*[0-9])/, "Password must have at least 1 digit.")
        .matches(/^(?=.*[!@#$%^&*])/, "Password must have at least 1 special character."),
    confirmPassword: Yup.string()
        .required("Required")
        .when("newPassword", {
            is: val => (val && val.length > 0 ? true : false),
            then: Yup.string().oneOf(
                [Yup.ref("newPassword")],
                "New password and confirm password not match."
            )
        })
});

const FirstLoginModal = ({show, handleClose, setAccount}) => {

    const initialValues = {
        newPassword: "",
        confirmPassword: ""
    }

    const submit = async (values) => {
        await axios({
            method: 'PUT',
            url: `${API_URL}/account/resetPassword?password=${values.confirmPassword}`,
        }).then(() => {
            setAccount(prevState => ({
                ...prevState,
                status: USER_STATUS.ACTIVE
            }));
            handleClose();
        }).catch((err) => {
            console.log(err)
        });
    }

    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: submit,
        validationSchema: Schema,
    });

    const [isHided, setIsHided] = useState({
        newPassword: true,
        confirmPassword: true
    })

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            backdrop="static"
            animation={true}
            size="md"
            id="homeModal"
        >
            <Modal.Header
                closeButton=''
                className="text-danger"
                style={{backgroundColor: "#9fa2a34f", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}
            >
                <Modal.Title>Change password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p style={{margin: "0"}}>This is the first time you login.</p>
                <p>You have to change your password to continue.</p>
                <form onSubmit={formik.handleSubmit}>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="4">New password</Form.Label>
                        <Col sm="6">
                            <InputGroup id="input-group-header">
                                <Form.Control
                                    id="formPass"
                                    type={isHided.newPassword ? "password" : "text"}
                                    name="newPassword"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.newPassword}
                                    isInvalid={formik.touched.newPassword && formik.errors.newPassword}
                                />
                                <Button variant="outline-secondary" id="eye-addon"
                                        onClick={() => {
                                            setIsHided(prevState => ({
                                                ...prevState,
                                                newPassword: !isHided.newPassword
                                            }));
                                        }}
                                >
                                    {isHided.newPassword ? <BsFillEyeFill/> : <BsFillEyeSlashFill/>}
                                </Button>
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.newPassword}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="4">Confirm password</Form.Label>
                        <Col sm="6">
                            <InputGroup id="input-group-header">
                                <Form.Control
                                    id="formPass"
                                    type={isHided.confirmPassword ? "password" : "text"}
                                    name="confirmPassword"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.confirmPassword}
                                    isInvalid={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                />
                                <Button variant="outline-secondary" id="eye-addon"
                                        onClick={() => {
                                            setIsHided(prevState => ({
                                                ...prevState,
                                                confirmPassword: !isHided.confirmPassword
                                            }));
                                        }}
                                >
                                    {isHided.confirmPassword ? <BsFillEyeFill/> : <BsFillEyeSlashFill/>}
                                </Button>
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.confirmPassword}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>
                    </Form.Group>
                    <div className="col-sm-10 p-1 d-flex justify-content-end">
                        <Button type="submit" className="btn-primary"
                                disabled={!formik.values.newPassword ||
                                    !formik.values.confirmPassword || formik.errors.confirmPassword}
                                onClick={handleClose}
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </Modal.Body>

        </Modal>
    );
};

export default FirstLoginModal;