import { useState, useEffect } from 'react';
import { Table, Input, Button, Card, Row, Col, Typography, Space, Select, Tag, Modal, Form, message, Statistic } from 'antd';
import { SearchOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import type { CloudHostInfo } from '../types';
import { getPublicPoolHosts, applyHostFromPool } from '../services/api';

const { Title } = Typography;
const { Option } = Select;

export default function PublicPoolPage() {
  const [dataSource, setDataSource] = useState<CloudHostInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [systemType, setSystemType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedHost, setSelectedHost] = useState<CloudHostInfo | null>(null);
  const [applyForm] = Form.useForm();

  // 系统类型选项
  const systemOptions = [
    { label: 'Windows', value: 'Windows' },
    { label: 'Linux', value: 'Linux' },
    { label: 'Ubuntu', value: 'Ubuntu' },
    { label: 'CentOS', value: 'CentOS' }
  ];

  // 加载公共池云主机数据
  const loadData = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await getPublicPoolHosts({
        page,
        pageSize: 10,
        searchText: searchText,
        // 移除未定义的参数
      });
      setDataSource(response.list);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('获取公共池云主机失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchText, systemType]);

  // 搜索
  const handleSearch = () => {
    loadData(1);
  };

  // 重置
  const handleReset = () => {
    setSearchText('');
    setSystemType('');
    loadData(1);
  };

  // 打开申请模态框
  const showApplyModal = (host: CloudHostInfo) => {
    setSelectedHost(host);
    applyForm.resetFields();
    setApplyModalVisible(true);
  };

  // 关闭申请模态框
  const handleCancel = () => {
    setApplyModalVisible(false);
    setSelectedHost(null);
  };

  // 提交申请
  const handleApply = async () => {
    try {
      const values = applyForm.getFieldsValue();
      if (!selectedHost) return;

      await applyHostFromPool(selectedHost.云主机IP, {
        负责人: values.applicant,
        使用部门: values.department,
        用途: values.purpose
      });

      message.success('申请成功');
      handleCancel();
      loadData(currentPage);
    } catch (error) {
      message.error('申请失败');
    }
  };

  const columns = [
    {
      title: '云主机IP',
      dataIndex: '云主机IP',
      key: '云主机IP'
    },
    {
      title: '系统',
      dataIndex: '系统',
      key: '系统',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '配置',
      key: '配置',
      render: (_: any, record: CloudHostInfo) => (
        <div>
          <div>{record.处理器}核 / {record.内存}GB / {record.磁盘}GB</div>
          <div>带宽: {record.带宽}Mbps</div>
        </div>
      )
    },
    {
      title: '运行时间',
      dataIndex: '运行时间',
      key: '运行时间',
      // 由于CloudHostInfo中没有运行时间属性，暂时移除排序功能
    },
    {
      title: '管理状态',
      key: '管理状态',
      render: () => (
        <Tag color="green">
          <CheckCircleOutlined /> 可申请
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CloudHostInfo) => (
        <Button 
          type="primary" 
          icon={<UserOutlined />}
          onClick={() => showApplyModal(record)}
        >
          申请
        </Button>
      )
    }
  ];

  // 统计信息
  const stats = {
    total: total,
    windows: dataSource.filter(item => item.系统.includes('Windows')).length,
    linux: dataSource.filter(item => item.系统.includes('Linux')).length,
    highConfig: dataSource.filter(item => item.处理器 >= 8 && item.内存 >= 16).length
  };

  return (
    <div>
      <Title level={4}>公共池云主机管理</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="可申请总数" 
              value={stats.total} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Windows系统" 
              value={stats.windows} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Linux系统" 
              value={stats.linux} 
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="高配主机(≥8核/16G)" 
              value={stats.highConfig} 
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索云主机IP"
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="选择系统类型"
              style={{ width: '100%' }}
              value={systemType}
              onChange={setSystemType}
              allowClear
            >
              {systemOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space style={{ width: '100%' }}>
              <Button onClick={handleReset} style={{ flex: 1 }}>重置</Button>
              <Button type="primary" onClick={handleSearch} style={{ flex: 1 }}>搜索</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="云主机IP"
        loading={loading}
        pagination={{
          total,
          pageSize: 10,
          current: currentPage,
          onChange: (page: number) => loadData(page)
        }}
      />

      {/* 申请模态框 */}
      <Modal
        title="申请云主机"
        open={applyModalVisible}
        onOk={handleApply}
        onCancel={handleCancel}
        okText="确认申请"
        cancelText="取消"
      >
        {selectedHost && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <p><strong>云主机IP:</strong> {selectedHost.云主机IP}</p>
              <p><strong>系统:</strong> {selectedHost.系统}</p>
              <p><strong>配置:</strong> {selectedHost.处理器}核 / {selectedHost.内存}GB / {selectedHost.磁盘}GB</p>
              <p><strong>带宽:</strong> {selectedHost.带宽}Mbps</p>
            </Card>
            <Form form={applyForm} layout="vertical">
              <Form.Item
                name="applicant"
                label="申请人"
                rules={[{ required: true, message: '请输入申请人' }]}
              >
                <Input placeholder="请输入申请人姓名" />
              </Form.Item>
              <Form.Item
                name="department"
                label="使用部门"
                rules={[{ required: true, message: '请输入使用部门' }]}
              >
                <Input placeholder="请输入使用部门" />
              </Form.Item>
              <Form.Item
                name="purpose"
                label="使用用途"
                rules={[{ required: true, message: '请输入使用用途' }]}
              >
                <Input.TextArea rows={4} placeholder="请描述使用用途" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};