import { useState, useEffect, useRef, useContext } from "react";
import api from "../utils/api";
import EventDropdown from "./EventDropdown";
import { useNavigate, useParams } from "react-router-dom";
import { Steps, Button, Form, Input, Select, message } from 'antd';
import { TeamDraftContext } from "../context/TeamDraftContext";

const { Step } = Steps;

const TeamForm = () => {
  const navigate = useNavigate();
  const { teamNumber } = useParams();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { draft, updateTeam } = useContext(TeamDraftContext);

  // Load draft data for this team on mount
  useEffect(() => {
    if (draft.teams && draft.teams[teamNumber]) {
      setFormData(draft.teams[teamNumber]);
      setSelectedEvent(draft.teams[teamNumber].event);
      form.setFieldsValue(draft.teams[teamNumber]);
    }
  }, [draft.teams, teamNumber, form]);

  const handleEventChange = (value) => {
    setSelectedEvent(value);
    form.setFieldsValue({ event: value });
    saveFormData({ ...form.getFieldsValue(), event: value });
  };

  const saveFormData = (values) => {
    try {
      const currentFormValues = form.getFieldsValue();
      const newData = {
        ...formData,
        ...currentFormValues,
        ...values,
        members: values.members || currentFormValues.members || formData.members,
        event: values.event || selectedEvent
      };
      setFormData(newData);
      form.setFieldsValue(newData);
    } catch (error) {
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

  // Save to draft (context/localStorage)
  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) return;
    setLoading(true);
    try {
      const values = form.getFieldsValue(true);
      updateTeam(teamNumber, { ...values, event: values.event || selectedEvent });
      message.success('Team draft saved!');
    } catch (err) {
      message.error('Failed to save draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToModules = () => {
    navigate('/modules', { state: { schoolRegId: draft.schoolRegId } });
  };

  const steps = [
    {
      title: 'Team Details',
      content: (
        <>
          <Form.Item
            name="event"
            label="Event Category"
            rules={[{ required: true, message: 'Please select an event!' }]}
          >
            <EventDropdown 
              schoolRegId={draft.schoolRegId} 
              onChange={handleEventChange}
              value={selectedEvent}
              draftTeams={draft.teams}
              currentTeamNumber={teamNumber}
              currentDraftEvent={formData.event}
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
                    <Select placeholder="Select grade/class">
                      <Select.Option value="6">6</Select.Option>
                      <Select.Option value="7">7</Select.Option>
                      <Select.Option value="8">8</Select.Option>
                      <Select.Option value="9">9</Select.Option>
                    </Select>
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
        initialValues={formData}
      >
        <div className="mb-8">
          {currentStep === 0 && (
            <>
              <Form.Item
                name="event"
                label="Event Category"
                rules={[{ required: true, message: 'Please select an event!' }]}
              >
                <EventDropdown
                  schoolRegId={draft.schoolRegId}
                  value={selectedEvent}
                  onChange={handleEventChange}
                  draftTeams={draft.teams}
                  currentTeamNumber={teamNumber}
                  currentDraftEvent={formData.event}
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
          )}
          {currentStep === 1 && (
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
                        <Select placeholder="Select grade/class">
                          <Select.Option value="6">6</Select.Option>
                          <Select.Option value="7">7</Select.Option>
                          <Select.Option value="8">8</Select.Option>
                          <Select.Option value="9">9</Select.Option>
                        </Select>
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
          )}
        </div>

        <div className="flex justify-between flex-wrap gap-2">
          <Button onClick={handleBackToModules} type="default">
            Back to Modules
          </Button>
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
              onClick={handleSave}
              loading={loading}
            >
              Save
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default TeamForm;
