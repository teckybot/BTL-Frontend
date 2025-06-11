import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api.js';
import { debounce } from 'lodash';
import { Steps, Button, Form, Input, Select, message } from 'antd';
import { stateDistrictCodeMap } from '../data/stateDistrictMap.jsx';

const { Step } = Steps;
const { TextArea } = Input;

const validEmailDomains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@teckybot.com'];
const isAllCaps = (text) => text === text?.toUpperCase();
const isValidEmail = (email) => validEmailDomains.some((domain) => email.endsWith(domain));

const STORAGE_KEY = 'schoolRegistrationData';
const STEP_KEY = 'currentStep';

const StepperForm = () => {
    const [form] = Form.useForm();
    const debouncedValidate = useRef(debounce(async (field) => {
        try {
            await form.validateFields([field]);
        } catch (err) {
            // ignore
        }
    }, 500)).current;
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [emailDuplicate, setEmailDuplicate] = useState({ schoolEmail: false, coordinatorEmail: false });
    const [selectedState, setSelectedState] = useState(null);
    const [isFormValid, setIsFormValid] = useState(false);


    // Load saved data on component mount
    useEffect(() => {
        // try {
        //     const savedStep = sessionStorage.getItem(STEP_KEY);
        //     const savedData = sessionStorage.getItem(STORAGE_KEY);

        //     if (savedStep) {
        //         setCurrentStep(parseInt(savedStep, 10));
        //     }

        //     if (savedData) {
        //         const parsedData = JSON.parse(savedData);
        //         setFormData(parsedData);
        //         form.setFieldsValue(parsedData);
        //         if (parsedData.state) {
        //             setSelectedState(parsedData.state);
        //         }
        //     }
        // } 
        try {
            const savedStep = sessionStorage.getItem(STEP_KEY);
            const savedData = sessionStorage.getItem(STORAGE_KEY);

            if (savedStep) {
                setCurrentStep(parseInt(savedStep, 10));
            }

            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setFormData(parsedData);
                form.setFieldsValue(parsedData);
                if (parsedData.state) {
                    setSelectedState(parsedData.state);
                }

                // 🔐 Auto-enable Pay button if all data is valid and on last step
                if (parseInt(savedStep, 10) === steps.length - 1) {
                    // wait a tick to ensure form fields are set before checking validity
                    setTimeout(async () => {
                        try {
                            await form.validateFields();
                            setIsFormValid(true);
                        } catch {
                            setIsFormValid(false);
                        }
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
            message.error('Failed to load saved form data');
        }
    }, []);

    const saveFormData = (values) => {
        try {
            const newData = { ...formData, ...values };
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            sessionStorage.setItem(STEP_KEY, currentStep.toString());
            setFormData(newData);
        } catch (error) {
            console.error('Error saving form data:', error);
            message.error('Failed to save form data');
        }
    };


    // const checkDuplicateEmails = async () => {
    //     const schoolEmail = form.getFieldValue('schoolEmail');
    //     const coordinatorEmail = form.getFieldValue('coordinatorEmail');

    //     if (!schoolEmail && !coordinatorEmail) return true;

    //     try {
    //         const response = await api.post('/school/check-email', {
    //             schoolEmail: schoolEmail?.trim(),
    //             coordinatorEmail: coordinatorEmail?.trim(),
    //         });

    //         // if (response.data.isDuplicate) {
    //         //     setEmailDuplicate({ schoolEmail: true, coordinatorEmail: true });
    //         //     message.error('Email already exists');
    //         //     return false;
    //         // }

    //         const { schoolEmailDuplicate, coordinatorEmailDuplicate } = response.data;

    //         if (schoolEmailDuplicate || coordinatorEmailDuplicate) {
    //             setEmailDuplicate({ schoolEmail: schoolEmailDuplicate, coordinatorEmail: coordinatorEmailDuplicate });

    //             if (schoolEmailDuplicate && coordinatorEmailDuplicate) {
    //                 message.error('Both emails are already registered');
    //             } else if (schoolEmailDuplicate) {
    //                 message.error('School email already registered');
    //             } else {
    //                 message.error('Coordinator email already registered');
    //             }

    //             return false;
    //         }

    //         setEmailDuplicate({ schoolEmail: false, coordinatorEmail: false });
    //         return true;
    //     } catch (error) {
    //         console.error('Error checking emails:', error);
    //         message.error(error.response?.data?.message || 'Error checking emails. Please try again.');
    //         return false;
    //     }
    // };

    const checkDuplicateEmails = async () => {
        const schoolEmail = form.getFieldValue('schoolEmail')?.trim();
        const coordinatorEmail = form.getFieldValue('coordinatorEmail')?.trim();

        // Don't proceed if both emails are empty
        if (!schoolEmail && !coordinatorEmail) return true;

        try {
            const response = await api.post('/school/check-email', {
                schoolEmail,
                coordinatorEmail,
            });

            // Clear any existing duplicate state if successful
            setEmailDuplicate({ schoolEmail: false, coordinatorEmail: false });
            return true;
        } catch (error) {
            const {
                schoolEmailDuplicate,
                coordinatorEmailDuplicate,
                reasons,
                message: errorMsg,
            } = error.response?.data || {};

            // Set state flags for individual duplicates
            setEmailDuplicate({
                schoolEmail: schoolEmailDuplicate || false,
                coordinatorEmail: coordinatorEmailDuplicate || false,
            });

            // Show detailed reasons if present
            if (reasons && Array.isArray(reasons) && reasons.length > 0) {
                reasons.forEach((reason) => message.error(reason));
            } else {
                // Fallback error message
                message.error(errorMsg || 'Error checking emails. Please try again.');
            }

            return false;
        }
    };

    const checkSchoolEmailDuplicate = async () => {
        const schoolEmail = form.getFieldValue('schoolEmail')?.trim();
        if (!schoolEmail) return true;

        try {
            await api.post('/school/check-email', {
                schoolEmail,
                coordinatorEmail: null, // Only checking schoolEmail
            });

            form.setFields([{ name: 'schoolEmail', errors: [] }]);
            return true;

        } catch (error) {
            if (error.response?.data?.schoolEmailDuplicate) {
                form.setFields([
                    {
                        name: 'schoolEmail',
                        errors: [error.response.data.message || 'Duplicate school email'],
                    },
                ]);
            }
            return false;
        }
    };

    const checkCoordinatorEmailDuplicate = async () => {
        const coordinatorEmail = form.getFieldValue('coordinatorEmail')?.trim();
        const schoolEmail = form.getFieldValue('schoolEmail')?.trim(); // Needed to check against same email
        if (!coordinatorEmail) return true;

        try {
            await api.post('/school/check-email', {
                schoolEmail,
                coordinatorEmail,
            });

            form.setFields([{ name: 'coordinatorEmail', errors: [] }]);
            return true;

        } catch (error) {
            if (error.response?.data?.coordinatorEmailDuplicate) {
                form.setFields([
                    {
                        name: 'coordinatorEmail',
                        errors: [error.response.data.message || 'Duplicate coordinator email'],
                    },
                ]);
            }
            return false;
        }
    };




    const steps = [
        {
            title: 'School Details',
            content: (
                <>
                    <Form.Item
                        name="schoolName"
                        label="School Name"
                        rules={[
                            { required: true, message: 'Please input school name!' },
                            {
                                validator: (_, value) =>
                                    isAllCaps(value) ? Promise.resolve() : Promise.reject('please enter name in CAPITAL letters'),
                            },
                        ]}
                    >
                        <Input placeholder='Enter school name' />
                    </Form.Item>
                    <Form.Item
                        name="principalName"
                        label="Principal Name"
                        rules={[
                            { required: true, message: 'Please input principal name!' },
                            {
                                validator: (_, value) =>
                                    isAllCaps(value) ? Promise.resolve() : Promise.reject('please enter name in CAPITAL letters'),
                            },
                        ]}
                    >
                        <Input placeholder="enter principal's name" />
                    </Form.Item>
                    <Form.Item
                        name="schoolContact"
                        label="School Contact Number"
                        rules={[
                            {
                                required: true,
                                message: "Please enter phone number",
                            },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve(); // wait for user to start typing

                                    const cleaned = value.replace(/\D/g, "");

                                    if (cleaned.length < 10) {
                                        return Promise.reject(
                                            new Error("Phone number must be exactly 10 digits")
                                        );
                                    }

                                    const phoneRegex = /^[6-9]\d{9}$/;
                                    if (!phoneRegex.test(cleaned)) {
                                        return Promise.reject(
                                            new Error("Enter a valid 10-digit number starting with 6-9")
                                        );
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input
                            maxLength={10}
                            placeholder="Enter 10-digit phone number"
                            onChange={(e) => {
                                const cleaned = e.target.value.replace(/\D/g, "");
                                form.setFieldsValue({ phoneNumber: cleaned });
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="schoolEmail"
                        label="School Email"
                        rules={[
                            { required: true, message: 'Please input email!' },
                            { type: 'email', message: 'Please enter a valid email! (Only @gmail.com or @yahoo.com or @outlook.com are accepted)' },
                            {
                                validator: (_, value) => {
                                    if (!value || !value.includes('@')) {
                                        return Promise.resolve(); // Skip validation for partial input
                                    }

                                    const otherEmail = form.getFieldValue('coordinatorEmail'); // For schoolEmail, and vice versa
                                    if (value && otherEmail && value === otherEmail) {
                                        return Promise.reject(new Error('School email cannot be the same as Coordinator email'));
                                    }

                                    if (!isValidEmail(value)) {
                                        return Promise.reject(new Error('Invalid email domain'));
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input placeholder='Enter valid email Id'
                            onChange={(e) => {
                                form.validateFields(['coordinatorEmail']);
                                setEmailDuplicate((prev) => ({ ...prev, schoolEmail: false }));
                            }}
                        />
                    </Form.Item>
                </>
            ),
        },
        {
            title: 'Coordinator Details',
            content: (
                <>
                    <Form.Item
                        name="coordinatorName"
                        label="Coordinator Name"
                        rules={[
                            { required: true, message: 'Please input coordinator name!' },
                            {
                                validator: (_, value) =>
                                    isAllCaps(value) ? Promise.resolve() : Promise.reject('please enter name in CAPITAL letters'),
                            },
                        ]}
                    >
                        <Input placeholder='Enter coordinator name' />
                    </Form.Item>
                    <Form.Item
                        name="coordinatorNumber"
                        label="Coordinator Number"
                        rules={[
                            {
                                required: true,
                                message: "Please enter phone number",
                            },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve(); // wait for user to start typing

                                    const cleaned = value.replace(/\D/g, "");

                                    if (cleaned.length < 10) {
                                        return Promise.reject(
                                            new Error("Phone number must be exactly 10 digits")
                                        );
                                    }

                                    const phoneRegex = /^[6-9]\d{9}$/;
                                    if (!phoneRegex.test(cleaned)) {
                                        return Promise.reject(
                                            new Error("Enter a valid 10-digit number starting with 6-9")
                                        );
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input
                            maxLength={10}
                            placeholder="Enter 10-digit phone number"
                            onChange={(e) => {
                                const cleaned = e.target.value.replace(/\D/g, "");
                                form.setFieldsValue({ phoneNumber: cleaned });
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="coordinatorEmail"
                        label="Coordinator Email"
                        dependencies={['schoolEmail']}
                        rules={[
                            { required: true, message: 'Please input email!' },
                            { type: 'email', message: 'Please enter a valid email! (Only @gmail.com or @yahoo.com or @outlook.com are accepted)' },
                            {
                                validator: (_, value) => {
                                    if (!value || !value.includes('@')) {
                                        return Promise.resolve(); // Skip validation for partial input
                                    }

                                    const otherEmail = form.getFieldValue('schoolEmail'); // For schoolEmail, and vice versa
                                    if (value && otherEmail && value === otherEmail) {
                                        return Promise.reject(new Error('Coordinator email cannot be the same as school email'));
                                    }

                                    if (!isValidEmail(value)) {
                                        return Promise.reject(new Error('Invalid email domain'));
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input placeholder='Enter valid email Id'
                            onChange={() => setEmailDuplicate((prev) => ({ ...prev, coordinatorEmail: false }))}
                        />
                    </Form.Item>

                </>
            ),
        },
        {
            title: 'Address Details',
            content: (
                <>
                    <Form.Item
                        name="schoolAddress"
                        label="School Address"
                        rules={[
                            { required: true, message: 'Please input school address!' },
                            {
                                validator: (_, value) =>
                                    isAllCaps(value) ? Promise.resolve() : Promise.reject('please enter address in CAPITAL letters'),
                            },
                        ]}
                    >
                        <TextArea placeholder='Enter full school address' rows={4} />
                    </Form.Item>
                    <Form.Item
                        name="state"
                        label="State"
                        rules={[{ required: true, message: 'Please select state!' }]}
                    >
                        <Select placeholder='Select your state' onChange={(value) => setSelectedState(value)}>
                            {Object.keys(stateDistrictCodeMap).map((state) => (
                                <Select.Option key={state} value={state}>
                                    {state}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="district"
                        label="District"
                        rules={[{ required: true, message: 'Please select district!' }]}
                        dependencies={['state']}
                    >
                        <Select placeholder='Select your district' disabled={!selectedState}>
                            {selectedState &&
                                Object.keys(stateDistrictCodeMap[selectedState].districts).map((district) => (
                                    <Select.Option key={district} value={district}>
                                        {district}
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="schoolWebsite" label="School Website"

                    >
                        <Input placeholder='Enter website URL (optional)' />
                    </Form.Item>
                </>
            ),
        },
    ];

    // const next = async () => {
    //     try {
    //         await form.validateFields();

    //         const emailsValid = await checkDuplicateEmails();
    //         if (!emailsValid) return;

    //         const values = form.getFieldsValue();
    //         saveFormData(values);
    //         setCurrentStep(currentStep + 1);
    //     } catch (error) {
    //         console.error('Validation failed:', error);
    //     }
    // };


    const next = async () => {
        try {
            await form.validateFields();

            let valid = true;

            if (currentStep === 0) {
                valid = await checkSchoolEmailDuplicate();
            } else if (currentStep === 1) {
                valid = await checkCoordinatorEmailDuplicate();
            }

            if (!valid) return;

            const values = form.getFieldsValue();
            saveFormData(values);
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const prev = () => {
        const values = form.getFieldsValue();
        saveFormData(values);
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        try {
            const currentValues = await form.validateFields();
            const values = { ...formData, ...currentValues };
            console.log("Final data sent to /school/validate:", values);

            setLoading(true);


            // Validate all data with backend
            const validationResponse = await api.post('/school/validate', values);
            if (!validationResponse.data.valid) {
                message.error(validationResponse.data.message);
                return;
            }

            // Create Razorpay order
            const orderResponse = await api.post('/payments/create-order', {
                // amount: 99900, // Amount in paise (999 INR)
                // currency: 'INR',
                // receipt: `receipt_${Date.now()}`,
                notes: {
                    schoolName: values.schoolName,
                    principalName: values.principalName,
                    schoolContact: values.schoolContact,
                    schoolEmail: values.schoolEmail,
                    coordinatorName: values.coordinatorName,
                    coordinatorNumber: values.coordinatorNumber,
                    coordinatorEmail: values.coordinatorEmail,
                    schoolAddress: values.schoolAddress,
                    state: values.state,
                    district: values.district,
                    schoolWebsite: values.schoolWebsite || '',
                }

            });

            // Initialize Razorpay

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderResponse.data.order.amount, // ₹999 in paise
                currency: orderResponse.data.order.currency,
                name: 'BTL School Registration',
                description: 'School Registration Payment',
                image: '/logo.png', // optional
                prefill: {
                    name: values.principalName,
                    email: values.schoolEmail,
                    contact: values.schoolContact
                },
                method: {
                    netbanking: true,
                    card: true,
                    upi: true,
                    wallet: true,
                    paylater: false,
                },
                theme: {
                    color: '#1890ff'
                },
                modal: {
                    backdropclose: false,   // Prevent closing on outside click
                    escape: false,          // Disable ESC key closing
                    handleback: true,       // Android back button
                    confirm_close: true,    // Ask before closing
                    animation: true         // Smooth open/close animation
                },
                readonly: {
                    email: true,
                    contact: true
                },
                order_id: orderResponse.data.order.id,
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post('/payments/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            registrationData: values
                        });

                        if (!verifyRes || !verifyRes.data) {
                            console.error("❌ No response data received from verification API.");
                            message.error("Verification failed: No response from server.");
                            return;
                        }

                        console.log("✅ Verification Response:", verifyRes.data);

                        const { schoolRegId } = verifyRes.data;

                        if (!schoolRegId) {
                            message.error("Verification succeeded but school ID missing. Please contact support.");
                            return;
                        }

                        message.success('🎉 Registration successful! A confirmation email has been sent.');

                        // Save schoolRegId to sessionStorage for later use
                        sessionStorage.setItem('schoolRegId', schoolRegId);

                        // Clean up temp form data
                        sessionStorage.removeItem(STORAGE_KEY);
                        sessionStorage.removeItem(STEP_KEY);

                        // Redirect to success page
                        window.location.href = '/registration-success';

                        // Reset form state
                        form.resetFields();
                        setFormData({});
                        setCurrentStep(0);
                        setSelectedState(null);

                    } catch (error) {
                        console.error("❌ Payment verification error:", error);

                        if (error.response?.data?.message) {
                            message.error(error.response.data.message);
                        } else {
                            message.error("Payment verification failed. Please try again or contact support.");
                        }
                    }
                },


                notes: {
                    schoolName: values.schoolName,
                    coordinator: values.coordinatorName
                },

                timeout: 900  // 15-minute timeout (optional)
            };


            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Submit failed:', error);
            message.error(error.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Steps current={currentStep} className="mb-8">
                {steps.map((item) => (
                    <Step key={item.title} title={item.title} />
                ))}
            </Steps>

            <Form
                form={form}
                layout="vertical"
                className="bg-white p-6 rounded-lg shadow-md"
                // onValuesChange={(_, allValues) => saveFormData(allValues)}
                // onValuesChange={async (_, allValues) => {
                //     saveFormData(allValues);
                //     try {
                //         await form.validateFields();
                //         setIsFormValid(true);
                //     } catch {
                //         setIsFormValid(false);
                //     }
                // }}
                onValuesChange={(changedValues, allValues) => {
                    saveFormData(allValues);
                    const changedField = Object.keys(changedValues)[0];
                    debouncedValidate(changedField);
                }}

            >
                <div className="min-h-[400px]">{steps[currentStep].content}</div>
                <div className="flex justify-between mt-6">
                    {currentStep > 0 && <Button onClick={prev}>Previous</Button>}
                    {currentStep < steps.length - 1 && (
                        <Button type="primary" onClick={next} >
                            Next
                        </Button>
                    )}
                    {currentStep === steps.length - 1 && (
                        <Button type="primary" onClick={handleSubmit} loading={loading}>
                            Proceed to pay
                        </Button>
                    )}
                </div>
            </Form>
        </div>
    );
};

export default StepperForm;