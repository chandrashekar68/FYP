import React, { useState } from "react";
import Select from "react-select";
import { useNavigate } from 'react-router-dom';
import { Input, Button, Form, FormGroup, Label } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";

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

        if (selectedOption.value === "supervisor"){
            setDetails({ ...details, clubName: "college", eventName: "", eventDescription: "" });
        } else {
            setDetails({ ...details, clubName: "", eventName: "", eventDescription: "" });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Profile Details: ", details);

        navigate("/dashboard");
        // Add logic to handle profile submission (e.g., API call)
    };

    return (
        <div className="container mt-5">
            <h2>Create Profile</h2>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="usn">USN</Label>
                    <Input
                        type="text"
                        id="usn"
                        name="usn"
                        value={details.usn}
                        onChange={handleInputChange}
                        placeholder="Enter your USN"
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label for="fullName">Full Name</Label>
                    <Input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={details.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label for="role">Role</Label>
                    <Select
                        id="role"
                        options={roleOptions}
                        defaultValue={roleOptions[0]}
                        onChange={handleRoleChange}
                    />
                </FormGroup>

                {role === "organizer" && (
                    <FormGroup>
                        <Label for="clubName">Club Name</Label>
                        <Input
                            type="text"
                            id="clubName"
                            name="clubName"
                            value={details.clubName}
                            onChange={handleInputChange}
                            placeholder="Enter your club name"
                            required
                        />
                    </FormGroup>
                )}

                <Button color="primary" type="submit">
                    Create Profile
                </Button>
            </Form>
        </div>
    );
};

export default CreateProfile;
