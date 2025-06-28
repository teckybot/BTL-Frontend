import React, { useState, useEffect } from 'react';
import { Steps, Card, Button, Form, Input, Select, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const { Step } = Steps;

const QualifierStepper = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/team/details/${teamId}`);
        const teamData = res.data.team || res.data;
        setTeam(teamData);
        form.setFieldsValue({ members: teamData.members });
        console.log('Fetched team:', teamData);
      } catch (err) {
        message.error('Failed to load team details');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
    // eslint-disable-next-line
  }, [teamId]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await api.post('/qualifier/tempSave', { teamId, members: values.members });
      message.success('Members saved!');
      setCurrent(1);
    } catch (err) {
      message.error(err.response?.data?.message || 'Validation failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      const orderRes = await api.post('/qualifier/create-order', { teamId });
      const { orderId, amount } = orderRes.data;

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx',
        amount: amount * 100,
        currency: 'INR',
        name: 'Bharat Tech League',
        description: 'Qualifier Registration Fee',
        order_id: orderId,
        handler: async function (response) {
          try {
            await api.post('/qualifier/verify-payment', {
              teamId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            message.success('Payment successful!');
            navigate(`/qualifier/${teamId}/success`);
          } catch (err) {
            message.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          // Optionally prefill contact info
        },
        theme: {
          color: '#6b21a8',
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setPaying(false);
    }
  };

  const memberFields = team?.members?.map((member, idx) => (
    <div key={idx} style={{ marginBottom: 24, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
      <h4>Member {idx + 1}</h4>
      <Form.Item
        name={['members', idx, 'name']}
        label="Name"
        rules={[{ required: true, message: 'Name required' }]}
        initialValue={member.name}
      >
        <Input placeholder="Enter name" />
      </Form.Item>
      <Form.Item
        name={['members', idx, 'classGrade']}
        label="Class/Grade"
        rules={[{ required: true, message: 'Class required' }]}
        initialValue={member.classGrade}
      >
        <Input placeholder="Enter class/grade" />
      </Form.Item>
      <Form.Item
        name={['members', idx, 'gender']}
        label="Gender"
        rules={[{ required: true, message: 'Gender required' }]}
        initialValue={member.gender}
      >
        <Select placeholder="Select gender">
          <Select.Option value="Male">Male</Select.Option>
          <Select.Option value="Female">Female</Select.Option>
          <Select.Option value="Other">Other</Select.Option>
        </Select>
      </Form.Item>
    </div>
  ));

  const steps = [
    {
      title: 'Edit Members',
      content: loading ? <Spin /> : (
        <Form form={form} layout="vertical" initialValues={{ members: team?.members }}>
          {memberFields}
          <Button type="primary" onClick={handleSave} loading={saving} style={{ marginTop: 16 }}>
            Save & Continue
          </Button>
        </Form>
      ),
    },
    {
      title: 'Payment',
      content: loading ? <Spin /> : (
        <div>
          <h3>Team: {team?.teamName}</h3>
          <p>Team Size: {team?.members?.length}</p>
          <p>Fee: <b>₹{team?.members?.length ? team.members.length * 499 : 0}</b></p>
          <Button type="primary" onClick={handlePayment} loading={paying} disabled={!team} style={{ marginTop: 16 }}>
            Pay & Complete Registration
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card style={{ maxWidth: 700, margin: '2rem auto' }}>
      <Steps current={current} style={{ marginBottom: 32 }}>
        {steps.map((item, idx) => <Step key={item.title} title={item.title} />)}
      </Steps>
      <div style={{ minHeight: 200 }}>{steps[current].content}</div>
      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
        {current > 0 && (
          <Button onClick={() => setCurrent(c => c - 1)} style={{ minWidth: 100 }}>
            Previous
          </Button>
        )}
      </div>
    </Card>
  );
};

export default QualifierStepper; 