import React, { useState } from "react";
import Select from "react-select";
import { useNavigate } from 'react-router-dom';
import { Input, Button, Form, FormGroup, Label } from "reactstrap";
import '../styles/CreateProfile.css'; // Import custom CSS

const CreateProfile = () => {
    const [role, setRole] = useState("student");
    const [details, setDetails] = useState({
        usn: "",
        fullName: "",
        clubName: "",
        eventName: "",
        eventDescription: ""
    });

    const navigate = useNavigate();

    const roleOptions = [
        { value: "student", label: "Student" },
        { value: "organizer", label: "Organizer" },
        { value: "supervisor", label: "Supervisor" }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDetails({ ...details, [name]: value });
    };

    const handleRoleChange = (selectedOption) => {
        setRole(selectedOption.value);

        if (selectedOption.value === "supervisor") {
            setDetails({ ...details, clubName: "college", eventName: "", eventDescription: "" });
        } else {
            setDetails({ ...details, clubName: "", eventName: "", eventDescription: "" });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Profile Details: ", details);
        navigate("/dashboard");
    };

    return (
        <div className="profile-container">
            <h2 className="form-title">Create Profile</h2>
            <Form onSubmit={handleSubmit}>
                <FormGroup className="form-group">
                    <Label for="usn" className="form-label">USN</Label>
                    <Input
                        type="text"
                        id="usn"
                        name="usn"
                        value={details.usn}
                        onChange={handleInputChange}
                        placeholder="Enter your USN"
                        required
                        className="input-field"
                    />
                </FormGroup>

                <FormGroup className="form-group">
                    <Label for="fullName" className="form-label">Full Name</Label>
                    <Input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={details.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        className="input-field"
                    />
                </FormGroup>

                <FormGroup className="form-group">
                    <Label for="role" className="form-label">Role</Label>
                    <Select
                        id="role"
                        options={roleOptions}
                        defaultValue={roleOptions[0]}
                        onChange={handleRoleChange}
                        className="select-field"
                    />
                </FormGroup>

                {role === "organizer" && (
                    <FormGroup className="form-group">
                        <Label for="clubName" className="form-label">Club Name</Label>
                        <Input
                            type="text"
                            id="clubName"
                            name="clubName"
                            value={details.clubName}
                            onChange={handleInputChange}
                            placeholder="Enter your club name"
                            required
                            className="input-field"
                        />
                    </FormGroup>
                )}

                <Button color="primary" type="submit" className="submit-btn">
                    Create Profile
                </Button>
            </Form>
        </div>
    );
};

export default CreateProfile;
