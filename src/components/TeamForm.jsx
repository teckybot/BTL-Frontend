import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import EventDropdown from "./EventDropdown";
import { useNavigate } from "react-router-dom";
import { Steps, Button, Form, Input, Select, message } from 'antd';


const { Step } = Steps;

const STORAGE_KEY = 'teamRegistrationData';
const STEP_KEY = 'currentStep';

const TeamForm = ({ schoolRegId }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Load saved data on component mount
  useEffect(() => {
    try {
      const savedStep = sessionStorage.getItem(STEP_KEY);
      const savedData = sessionStorage.getItem(STORAGE_KEY);

      if (savedStep) {
        const step = parseInt(savedStep, 10);
        setCurrentStep(step);
      }

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        setSelectedEvent(parsedData.event);

        // Ensure members array is properly initialized
        if (parsedData.teamSize && (!parsedData.members || parsedData.members.length !== parseInt(parsedData.teamSize))) {
          parsedData.members = Array.from(
            { length: parseInt(parsedData.teamSize) },
            () => ({ name: "", classGrade: "", gender: "" })
          );
        }

        form.setFieldsValue(parsedData);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      message.error('Failed to load saved form data');
    }
  }, []);

  const handleEventChange = (value) => {
    console.log("Event selected:", value); // Debug log
    setSelectedEvent(value);
    form.setFieldsValue({ event: value });
    saveFormData({ ...form.getFieldsValue(), event: value });
  };



  const saveFormData = (values) => {
    try {
      // Ensure we're not losing member data when saving
      const currentFormValues = form.getFieldsValue();
      const newData = {
        ...formData,
        ...currentFormValues,
        ...values,
        members: values.members || currentFormValues.members || formData.members,
        event: values.event || selectedEvent
      };

      console.log("Saving form data:", newData); // Debug log

      // Update both session storage and state
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      sessionStorage.setItem(STEP_KEY, currentStep.toString());
      setFormData(newData);

      // Force a re-render by updating the form values
      form.setFieldsValue(newData);
    } catch (error) {
      console.error('Error saving form data:', error);
      message.error('Failed to save form data');
    }
  };

  const validateForm = async () => {
    try {
      await form.validateFields();
      return true;
    } catch (error) {
      return false;
    }
  };

  const next = async () => {
    const isValid = await validateForm();
    if (isValid) {
      const values = form.getFieldsValue();
      saveFormData(values);
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true);
    try {
      // Get all form values including nested fields
      const values = form.getFieldsValue(true);
      console.log("✅ Raw form values:", values);
      console.log("Selected event:", selectedEvent);

      // Ensure event is properly set
      if (!values.event && !selectedEvent) {
        message.error('Please select an event');
        setLoading(false);
        return;
      }

      const eventValue = values.event || selectedEvent;
      
      // Create payload exactly matching backend requirements
      const payload = {
        schoolRegId,
        teamName: values.teamName,
        teamSize: parseInt(values.teamSize),
        members: values.members,
        event: eventValue,
      };

      console.log("📦 Final payload to submit:", payload);

      const response = await api.post("/team/register", payload);

      if (response.data.success) {
        // Save team ID to session storage
        sessionStorage.setItem("teamId", response.data.teamId);
        
        // Clear form data
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STEP_KEY);
        
        message.success('Team registration successful!');
        navigate("/teamRegistration-success");
      }
    } catch (err) {
      console.error("Error registering team:", err.response?.data || err);
      message.error(err.response?.data?.message || "Error submitting team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Team Details',
      content: (
        <>
          <Form.Item
            name="teamName"
            label="Team Name"
            rules={[{ required: true, message: 'Please input team name!' }]}
          >
            <Input placeholder='Enter team name' />
          </Form.Item>


          <Form.Item
            name="event"
            label="Event Category"
            rules={[{ required: true, message: 'Please select an event!' }]}
          >
            <EventDropdown 
              schoolRegId={schoolRegId} 
              onChange={handleEventChange}
              value={selectedEvent}
            />
          </Form.Item>

          <Form.Item
            name="teamSize"
            label="Team Size"
            rules={[{ required: true, message: 'Please select team size!' }]}
          >
            <Select
              placeholder="Select team size"
              onChange={(value) => {
                const size = parseInt(value);
                const newMembers = Array.from({ length: size }, () => ({
                  name: "",
                  classGrade: "",
                  gender: ""
                }));

                const currentValues = form.getFieldsValue(true);
                form.setFieldsValue({ 
                  ...currentValues,
                  teamSize: value, 
                  members: newMembers 
                });
                saveFormData({ 
                  ...currentValues,
                  teamSize: value, 
                  members: newMembers 
                });
                form.validateFields(['members']);
              }}
            >
              <Select.Option value="2">2 Members</Select.Option>
              <Select.Option value="3">3 Members</Select.Option>
              <Select.Option value="4">4 Members</Select.Option>
            </Select>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Member Details',
      content: (
        <Form.List
          name="members"
          rules={[{
            validator: async (_, members) => {
              if (!members || members.length < 2) {
                return Promise.reject(new Error('At least 2 team members are required'));
              }
            },
          }]}
        >
          {(fields, { add, remove }) => (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.key} className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-3">Member {index + 1}</h4>

                  <Form.Item
                    key={`name-${field.key}`}
                    label="Name"
                    name={[field.name, 'name']}
                    fieldKey={[field.fieldKey, 'name']}
                    rules={[{ required: true, message: 'Please input member name!' }]}
                  >
                    <Input placeholder="Enter member name" />
                  </Form.Item>

                  <Form.Item
                    key={`grade-${field.key}`}
                    label="Grade/Class"
                    name={[field.name, 'classGrade']}
                    fieldKey={[field.fieldKey, 'classGrade']}
                    rules={[{ required: true, message: 'Please input grade/class!' }]}
                  >
                    <Input placeholder="Enter grade/class" />
                  </Form.Item>

                  <Form.Item
                    key={`gender-${field.key}`}
                    label="Gender"
                    name={[field.name, 'gender']}
                    fieldKey={[field.fieldKey, 'gender']}
                    rules={[{ required: true, message: 'Please select gender!' }]}
                  >
                    <Select placeholder="Select gender">
                      <Select.Option value="Male">Male</Select.Option>
                      <Select.Option value="Female">Female</Select.Option>
                      <Select.Option value="Other">Other</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              ))}
            </div>
          )}
        </Form.List>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <Steps current={currentStep} className="mb-8">
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={formData}
      >
        <div className="mb-8">
          {steps[currentStep].content}
        </div>

        <div className="flex justify-between">
          {currentStep > 0 && (
            <Button onClick={prev}>
              Previous
            </Button>
          )}

          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={next}>
              Next
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
            >
              Submit
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default TeamForm;
