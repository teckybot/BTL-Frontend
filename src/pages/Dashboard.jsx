import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Input,
  Select,
  Card,
  Statistic,
  Row,
  Col,
  Button,
  Space,
  Switch,
  Typography,
  Tag,
  Tooltip,
  Badge,
  message,
  Popconfirm
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ReadOutlined,
  TrophyOutlined,
  CheckCircleTwoTone
} from '@ant-design/icons';
import { stateDistrictCodeMap } from '../data/stateDistrictMap';
import { eventCodeMap } from '../data/mockData';
import {
  fetchSchools,
  fetchSchoolStats,
  fetchTeams,
  fetchTeamStats,
  qualifyTeam
} from '../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('schools');
  const [searchText, setSearchText] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, qualified: 0, filtered: 0 });

  // Fetch data and stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        state: selectedState,
        district: selectedDistrict,
        event: activeTab === 'teams' ? selectedEvent : undefined,
        status: activeTab === 'teams' ? selectedStatus : undefined,
        search: searchText
      };
      if (activeTab === 'schools') {
        const [listRes, statsRes] = await Promise.all([
          fetchSchools(params),
          fetchSchoolStats(params)
        ]);
        setData(listRes.data);
        setStats(statsRes.data);
      } else {
        const [listRes, statsRes] = await Promise.all([
          fetchTeams(params),
          fetchTeamStats(params)
        ]);
        setData(listRes.data);
        setStats(statsRes.data);
      }
    } catch (err) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [activeTab, searchText, selectedState, selectedDistrict, selectedEvent, selectedStatus]);

  // Get available districts based on selected state
  const availableDistricts = useMemo(() => {
    if (!selectedState || !stateDistrictCodeMap[selectedState]) {
      return [];
    }
    return Object.keys(stateDistrictCodeMap[selectedState].districts);
  }, [selectedState]);

  const handleStateChange = (value) => {
    setSelectedState(value);
    setSelectedDistrict('');
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedEvent('');
    setSelectedStatus('');
  };

  // School table columns
  const schoolColumns = [
    {
      title: 'Registration ID',
      dataIndex: 'schoolRegId',
      key: 'schoolRegId',
      width: 120,
      render: (id) => <Tag color="blue">{id}</Tag>
    },
    {
      title: 'School Name',
      dataIndex: 'schoolName',
      key: 'schoolName',
      width: 200,
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'School Email',
      dataIndex: 'schoolEmail',
      key: 'schoolEmail',
      width: 180,
      render: (email) => (
        <Tooltip>
          <Text copyable={{ text: email }}>{email}</Text>
        </Tooltip>
      )
    },
    {
      title: 'School Contact',
      dataIndex: 'schoolContact',
      key: 'schoolContact',
      width: 140,
      render: (contact) => (
        <Tooltip>
          <Text copyable={{ text: contact }}>{contact}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Coordinator Name',
      dataIndex: 'coordinatorName',
      key: 'coordinatorName',
      width: 180
    },
    {
      title: 'Coordinator Contact',
      dataIndex: 'coordinatorNumber',
      key: 'coordinatorNumber',
      width: 150,
      render: (contact) => (
        <Tooltip>
          <Text copyable={{ text: contact }}>{contact}</Text>
        </Tooltip>
      )
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      render: (state) => <Tag color="green">{state}</Tag>
    },
    {
      title: 'District',
      dataIndex: 'district',
      key: 'district',
      width: 140,
      render: (district) => <Tag color="orange">{district}</Tag>
    },
    {
      title: 'Registration Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date) => date ? new Date(date).toLocaleDateString() : ''
    }
  ];

  // Team table columns
  const teamColumns = [
    {
      title: 'Registration ID',
      dataIndex: 'teamRegId',
      key: 'teamRegId',
      width: 120,
      render: (id) => <Tag color="purple">{id}</Tag>
    },
    {
      title: 'School ID',
      dataIndex: 'schoolRegId',
      key: 'schoolRegId',
      width: 120
    },
    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
      width: 140,
      render: (event) => <Tag color="cyan">{eventCodeMap[event] || event}</Tag>
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
      width: 80,
      render: (members) => <Tag color="blue">{members?.length || 0}</Tag>
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      render: (state) => <Tag color="green">{state}</Tag>
    },
    {
      title: 'District',
      dataIndex: 'district',
      key: 'district',
      width: 140,
      render: (district) => <Tag color="orange">{district}</Tag>
    },
    {
      title: 'Registration Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date) => date ? new Date(date).toLocaleDateString() : ''
    },
    {
      title: 'Status',
      key: 'status',
      width: 225,
      render: (_, record) => (
        <Space wrap>
          {record.isQualified && <Tag color="green">Qualified</Tag>}
          {record.submitted && <Tag color="blue">Submitted</Tag>}
          {record.qualifierPaid && <Tag color="purple">Paid</Tag>}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {!record.isQualified && (
            <Popconfirm
              title="Qualify this team?"
              onConfirm={async () => {
                try {
                  await qualifyTeam(record.teamRegId);
                  message.success('Team qualified!');
                  fetchData();
                } catch {
                  message.error('Failed to qualify team');
                }
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" size="small">Qualify</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="mb-2">
            Registration Dashboard
          </Title>
          <Text type="secondary">
            Monitor and manage school and team registrations
          </Text>
        </div>

        {/* Toggle Switch */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Text strong>View Mode:</Text>
              <Switch
                checked={activeTab === 'teams'}
                onChange={(checked) => setActiveTab(checked ? 'teams' : 'schools')}
                checkedChildren={<><TeamOutlined /> Teams</>}
                unCheckedChildren={<><ReadOutlined /> Schools</>}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Text type="secondary">Currently viewing:</Text>
              <Tag color={activeTab === 'schools' ? 'blue' : 'purple'}>
                {activeTab === 'schools' ? 'Schools' : 'Teams'}
              </Tag>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title={`Filtered ${activeTab === 'schools' ? 'Schools' : 'Teams'}`}
                value={stats.filtered}
                valueStyle={{ color: activeTab === 'schools' ? '#1890ff' : '#722ed1' }}
                prefix={activeTab === 'schools' ? <ReadOutlined /> : <TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Schools"
                value={activeTab === 'schools' ? stats.total : '-'}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ReadOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Teams"
                value={activeTab === 'teams' ? stats.total : '-'}
                valueStyle={{ color: '#722ed1' }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          {activeTab === 'teams' && (
            <Col span={6}>
              <Card>
                <Statistic
                  title="Qualified Teams"
                  value={stats.qualified}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
          )}
        </Row>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <SearchOutlined />
              <Input
                placeholder={`Search ${activeTab === 'schools' ? 'schools' : 'teams'}...`}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
            </div>
            <div className="flex items-center space-x-2">
              <FilterOutlined />
              <Select
                placeholder="Select State"
                value={selectedState}
                onChange={handleStateChange}
                style={{ width: 180 }}
                allowClear
              >
                {Object.keys(stateDistrictCodeMap).map(state => (
                  <Option key={state} value={state}>{state}</Option>
                ))}
              </Select>
            </div>
            <Select
              placeholder="Select District"
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              style={{ width: 180 }}
              allowClear
              disabled={!selectedState}
            >
              {availableDistricts.map(district => (
                <Option key={district} value={district}>{district}</Option>
              ))}
            </Select>
            {activeTab === 'teams' && (
              <Select
                placeholder="Select Event"
                value={selectedEvent}
                onChange={setSelectedEvent}
                style={{ width: 180 }}
                allowClear
              >
                {Object.entries(eventCodeMap).map(([code, name]) => (
                  <Option key={code} value={code}>{name}</Option>
                ))}
              </Select>
            )}
            {activeTab === 'teams' && (
              <Select
                placeholder="Select Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: 150 }}
                allowClear
              >
                <Option value="qualified">Qualified</Option>
                <Option value="submitted">Submitted</Option>
                <Option value="paid">Paid</Option>
              </Select>
            )}
            <Button onClick={clearFilters} type="default">
              Clear Filters
            </Button>
          </div>
        </Card>
        {/* Table */}
        <Card>
          <Table
            columns={activeTab === 'schools' ? schoolColumns : teamColumns}
            dataSource={data}
            rowKey={record => record.teamRegId || record.schoolRegId || record._id}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} ${activeTab === 'schools' ? 'schools' : 'teams'}`
            }}
            scroll={{ x: 1400 }}
            size="middle"
            bordered
          />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 