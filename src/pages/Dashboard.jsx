import React, { useState, useMemo } from 'react';
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
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TeamOutlined,
  ReadOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { stateDistrictCodeMap } from '../data/stateDistrictMap';
import { 
  mockSchools, 
  mockTeams, 
  availableEvents, 
  teamStatusOptions, 
  schoolStatusOptions 
} from '../data/mockData';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('schools'); // 'schools' or 'teams'
  const [searchText, setSearchText] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Get available districts based on selected state
  const availableDistricts = useMemo(() => {
    if (!selectedState || !stateDistrictCodeMap[selectedState]) {
      return [];
    }
    return Object.keys(stateDistrictCodeMap[selectedState].districts);
  }, [selectedState]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let data = activeTab === 'schools' ? mockSchools : mockTeams;
    
    // Apply search filter
    if (searchText) {
      data = data.filter(item => {
        if (activeTab === 'schools') {
          return (
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.email.toLowerCase().includes(searchText.toLowerCase()) ||
            item.coordinatorName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.id.toLowerCase().includes(searchText.toLowerCase())
          );
        } else {
          return (
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.schoolName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.coachName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.teamLeader.toLowerCase().includes(searchText.toLowerCase()) ||
            item.id.toLowerCase().includes(searchText.toLowerCase())
          );
        }
      });
    }

    // Apply state filter
    if (selectedState) {
      data = data.filter(item => item.state === selectedState);
    }

    // Apply district filter
    if (selectedDistrict) {
      data = data.filter(item => item.district === selectedDistrict);
    }

    // Apply event filter (only for teams)
    if (selectedEvent && activeTab === 'teams') {
      data = data.filter(item => item.event === selectedEvent);
    }

    // Apply status filter
    if (selectedStatus) {
      data = data.filter(item => item.status === selectedStatus);
    }

    return data;
  }, [activeTab, searchText, selectedState, selectedDistrict, selectedEvent, selectedStatus]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalSchools = mockSchools.length;
    const totalTeams = mockTeams.length;
    const activeSchools = mockSchools.filter(school => school.status === 'Active').length;
    const activeTeams = mockTeams.filter(team => team.status === 'Active').length;
    
    return {
      totalSchools,
      totalTeams,
      activeSchools,
      activeTeams,
      filteredCount: filteredData.length
    };
  }, [filteredData]);

  // School table columns
  const schoolColumns = [
    {
      title: 'Registration ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => <Tag color="blue">{id}</Tag>
    },
    {
      title: 'School Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'School Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (email) => (
        <Tooltip title={email}>
          <Text copyable={{ text: email }}>{email}</Text>
        </Tooltip>
      )
    },
    {
      title: 'School Contact',
      dataIndex: 'contact',
      key: 'contact',
      width: 140,
      render: (contact) => (
        <Tooltip title={contact}>
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
      dataIndex: 'coordinatorContact',
      key: 'coordinatorContact',
      width: 150,
      render: (contact) => (
        <Tooltip title={contact}>
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
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      width: 140
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Badge 
          status={status === 'Active' ? 'success' : status === 'Pending' ? 'processing' : 'default'} 
          text={status} 
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" icon={<DeleteOutlined />} size="small" danger />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Team table columns
  const teamColumns = [
    {
      title: 'Registration ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => <Tag color="purple">{id}</Tag>
    },
    {
      title: 'Team Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'School Name',
      dataIndex: 'schoolName',
      key: 'schoolName',
      width: 180
    },
    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
      width: 140,
      render: (event) => <Tag color="cyan">{event}</Tag>
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
      width: 80,
      render: (members) => <Tag color="blue">{members}</Tag>
    },
    {
      title: 'Team Leader',
      dataIndex: 'teamLeader',
      key: 'teamLeader',
      width: 140
    },
    {
      title: 'Team Leader Contact',
      dataIndex: 'teamLeaderContact',
      key: 'teamLeaderContact',
      width: 150,
      render: (contact) => (
        <Tooltip title={contact}>
          <Text copyable={{ text: contact }}>{contact}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Coach Name',
      dataIndex: 'coachName',
      key: 'coachName',
      width: 150
    },
    {
      title: 'Coach Contact',
      dataIndex: 'coachContact',
      key: 'coachContact',
      width: 140,
      render: (contact) => (
        <Tooltip title={contact}>
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
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      width: 140
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Badge 
          status={status === 'Active' ? 'success' : status === 'Pending' ? 'processing' : 'default'} 
          text={status} 
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" icon={<DeleteOutlined />} size="small" danger />
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleStateChange = (value) => {
    setSelectedState(value);
    setSelectedDistrict(''); // Reset district when state changes
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedEvent('');
    setSelectedStatus('');
  };

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
                value={statistics.filteredCount}
                valueStyle={{ color: activeTab === 'schools' ? '#1890ff' : '#722ed1' }}
                prefix={activeTab === 'schools' ? <ReadOutlined /> : <TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Schools"
                value={statistics.totalSchools}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ReadOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Teams"
                value={statistics.totalTeams}
                valueStyle={{ color: '#722ed1' }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Registrations"
                value={activeTab === 'schools' ? statistics.activeSchools : statistics.activeTeams}
                valueStyle={{ color: '#52c41a' }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
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
                {availableEvents.map(event => (
                  <Option key={event} value={event}>{event}</Option>
                ))}
              </Select>
            )}

            <Select
              placeholder="Select Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: 150 }}
              allowClear
            >
              {(activeTab === 'schools' ? schoolStatusOptions : teamStatusOptions).map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>

            <Button onClick={clearFilters} type="default">
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={activeTab === 'schools' ? schoolColumns : teamColumns}
            dataSource={filteredData}
            rowKey="id"
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