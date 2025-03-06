import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from 'react-router-dom';
import { Input, Button, Form, FormGroup, Label } from "reactstrap";
import '../styles/CreateProfile.css';
import { useAuth } from "../context/AuthContext";

const CreateProfile = () => {
  const [role, setRole] = useState("student");
  const [details, setDetails] = useState({
    usn: "",
    fullName: "",
    clubName: "",
    email: ""
  });

  const navigate = useNavigate();
  const { markProfileAsCreated } = useAuth();

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setDetails(prevDetails => ({ ...prevDetails, email: storedEmail }));
    }
  }, []);

  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "organizer", label: "Organizer" },
    { value: "supervisor", label: "Supervisor" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDetails(prevDetails => ({ ...prevDetails, [name]: value }));
  };

  const handleRoleChange = (selectedOption) => {
    setRole(selectedOption.value);
    setDetails(prevDetails => ({
      ...prevDetails,
      clubName: selectedOption.value === "supervisor" ? "college" : ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestBody = {
        usn: details.usn,
        username: details.fullName,
        role: role,
        clubName: role === "organizer" ? details.clubName : (role === "supervisor" ? "college" : ""),
        email: details.email
      };

      console.log(requestBody);

      const response = await fetch("http://localhost:8000/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to create profile: ${await response.text()}`);
      }

      console.log("Profile Created Successfully");
      markProfileAsCreated();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
    }
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
            value={roleOptions.find(opt => opt.value === role)}
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
