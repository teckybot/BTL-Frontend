import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Tag, Input } from 'antd';
import api from '../utils/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const { Search } = Input;

const AIWorkshopDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [searchText, setSearchText] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai-workshop/all');
      setData(res.data);
      setFilteredData(res.data); // initialize filtered list
    } catch (err) {
      message.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'ai_workshop_registrations.xlsx');
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (registrationId) => {
    setActionLoading((prev) => ({ ...prev, [registrationId]: true }));
    try {
      await api.delete(`/ai-workshop/${registrationId}`);
      message.success('Registration deleted');
      const updated = data.filter((r) => r.registrationId !== registrationId);
      setData(updated);
      setFilteredData(updated);
    } catch (err) {
      message.error('Failed to delete registration');
    } finally {
      setActionLoading((prev) => ({ ...prev, [registrationId]: false }));
    }
  };

  const handleMarkPaid = async (registrationId) => {
    setActionLoading((prev) => ({ ...prev, [registrationId]: true }));
    try {
      await api.patch(`/ai-workshop/${registrationId}/mark-paid`);
      message.success('Marked as paid');
      const updated = data.map((r) =>
        r.registrationId === registrationId ? { ...r, paid: true } : r
      );
      setData(updated);
      setFilteredData(updated);
    } catch (err) {
      message.error('Failed to update status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [registrationId]: false }));
    }
  };

  const handleDownloadPDF = async (registrationId) => {
    try {
      const response = await api.get(`/ai-workshop/download-pdf/${registrationId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${registrationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to download PDF');
    }
  };

  // Handle search across Name, Email, and School
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = data.filter((item) =>
      [item.name, item.email, item.school].some((field) =>
        field.toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      title: 'Registration ID',
      dataIndex: 'registrationId',
      key: 'registrationId',
      render: (text) => <span className="font-mono font-semibold">{text}</span>,
      sorter: (a, b) => a.registrationId.localeCompare(b.registrationId),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      responsive: ['md'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
      responsive: ['md'],
    },
    {
      title: 'School',
      dataIndex: 'school',
      key: 'school',
      responsive: ['md'],
    },
    {
      title: 'Paid',
      dataIndex: 'paid',
      key: 'paid',
      render: (paid) => paid ? <Tag color="green">Paid</Tag> : <Tag color="red">Unpaid</Tag>,
      filters: [
        { text: 'Paid', value: true },
        { text: 'Unpaid', value: false },
      ],
      onFilter: (value, record) => record.paid === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Popconfirm
            title="Are you sure to delete this registration?"
            onConfirm={() => handleDelete(record.registrationId)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small" loading={actionLoading[record.registrationId]}>Delete</Button>
          </Popconfirm>
          {!record.paid && (
            <Popconfirm
              title="Mark this registration as paid?"
              onConfirm={() => handleMarkPaid(record.registrationId)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                size="small"
                loading={actionLoading[record.registrationId]}
              >
                Mark as Paid
              </Button>
            </Popconfirm>
          )}
          {record.paid && (
            <Button
              size="small"
              onClick={() => handleDownloadPDF(record.registrationId)}
            >
              Download PDF
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-4 pt-2">
      <div className="max-w-full mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-blue-900">
          AI Workshop Registrations Dashboard
        </h1>

        {/* Total Count & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="text-lg font-semibold text-gray-700">
            Total Registrations: <span className="text-blue-700">{filteredData.length}</span>
          </div>
          <Search
            placeholder="Search by name, email, or school"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            enterButton
            allowClear
            className="max-w-md"
          />
          <Button type="primary" onClick={handleDownloadExcel}>
          Download Excel
        </Button>
        </div>
        


        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="registrationId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
};

export default AIWorkshopDashboard;
