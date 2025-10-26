import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Typography, Row, Col, Card, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { CloudHostInfo } from '../types';
import { getCloudHostList, addCloudHost, updateCloudHost, deleteCloudHost } from '../services/api';

const { Title } = Typography;
const { Option } = Select;

export default function HostManagement() {
  const [dataSource, setDataSource] = useState<CloudHostInfo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingHost, setEditingHost] = useState<CloudHostInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const manufacturers = ['阿里云', '腾讯云', '华为云', 'AWS', 'Azure'];
  const regions = ['南京', '北京', '上海', '广州', '深圳'];
  const systems = ['Windows Server 2008', 'Windows Server 2012', 'Windows Server 2016', 'Windows Server 2019', 'Ubuntu 18.04', 'Ubuntu 20.04', 'CentOS 7', 'CentOS 8'];

  // 加载数据
  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getCloudHostList({
        page,
        pageSize: 10,
        searchText: searchText
      });
      setDataSource(response.list);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (error) {
      message.error('获取云主机列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchText]);

  // 搜索
  const handleSearch = () => {
    loadData(1);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    loadData(1);
  };

  // 打开添加/编辑弹窗
  const showModal = (host?: CloudHostInfo) => {
    if (host) {
      setEditingHost(host);
      form.setFieldsValue(host);
    } else {
      setEditingHost(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();
      
      if (editingHost) {
        // 更新
        await updateCloudHost(editingHost.云主机IP, values);
        message.success('更新成功');
      } else {
        // 添加
        await addCloudHost(values);
        message.success('添加成功');
      }
      
      setIsModalVisible(false);
      loadData(currentPage);
    } catch (error) {
      message.error(editingHost ? '更新失败' : '添加失败');
    }
  };

  // 删除云主机
  const handleDelete = async (ip: string) => {
    try {
      await deleteCloudHost(ip);
      message.success('删除成功');
      loadData(currentPage);
    } catch (error) {
      message.error('删除失败');
    }
  };

  // getStatusText函数已移除，因为未被使用

  // 获取状态标签
  const getStatusTag = (value: number) => {
    switch (value) {
      case 1: return <Tag color="green">正常</Tag>;
      case 2: return <Tag color="orange">注意</Tag>;
      case 3: return <Tag color="red">异常</Tag>;
      default: return <Tag>未知</Tag>;
    }
  };

  const columns = [
    {
      title: '云主机IP',
      dataIndex: '云主机IP',
      key: '云主机IP',
      sorter: (a: CloudHostInfo, b: CloudHostInfo) => a.云主机IP.localeCompare(b.云主机IP)
    },
    {
      title: '云主机厂商',
      dataIndex: '云主机厂商',
      key: '云主机厂商',
      filters: manufacturers.map(m => ({ text: m, value: m })),
      onFilter: (value: any, record: CloudHostInfo) => record.云主机厂商 === value
    },
    {
      title: '区域',
      dataIndex: '区域',
      key: '区域',
      filters: regions.map(r => ({ text: r, value: r })),
      onFilter: (value: any, record: CloudHostInfo) => record.区域 === value
    },
    {
      title: '配置',
      key: '配置',
      render: (record: CloudHostInfo) => `${record.处理器}核/${record.内存}GB/${record.磁盘}GB`
    },
    {
      title: '系统',
      dataIndex: '系统',
      key: '系统'
    },
    {
      title: '负责人',
      dataIndex: '负责人',
      key: '负责人'
    },
    {
      title: '使用部门',
      dataIndex: '使用部门',
      key: '使用部门'
    },
    {
      title: '管理状态',
      key: '管理状态',
      render: (record: CloudHostInfo) => getStatusTag(record.管理状态)
    },
    {
      title: '设备状态',
      key: '设备状态',
      render: (record: CloudHostInfo) => getStatusTag(record.设备状态)
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CloudHostInfo) => {
        return (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除该云主机吗？"
            onConfirm={() => handleDelete(record.云主机IP)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
        );
      }
    }
  ];

  return (
    <div>
      <Title level={4}>云主机管理</Title>
      
      {/* 搜索栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索IP/负责人/部门/系统"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={16} style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" onClick={handleSearch}>搜索</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>添加云主机</Button>
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
          onChange: (page) => loadData(page)
        }}
      />

      {/* 弹窗 */}
      <Modal
        title={editingHost ? '编辑云主机' : '添加云主机'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="云主机厂商" label="云主机厂商" rules={[{ required: true }]}>
                <Select placeholder="请选择云主机厂商">
                  {manufacturers.map(m => (
                    <Option key={m} value={m}>{m}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="区域" label="区域" rules={[{ required: true }]}>
                <Select placeholder="请选择区域">
                  {regions.map(r => (
                    <Option key={r} value={r}>{r}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="处理器" label="处理器(核)" rules={[{ required: true, type: 'number' }]}>
                <Input type="number" placeholder="请输入处理器核心数" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="内存" label="内存(GB)" rules={[{ required: true, type: 'number' }]}>
                <Input type="number" placeholder="请输入内存大小" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="磁盘" label="磁盘(GB)" rules={[{ required: true, type: 'number' }]}>
                <Input type="number" placeholder="请输入磁盘大小" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="带宽" label="带宽(Mbps)" rules={[{ required: true, type: 'number' }]}>
                <Input type="number" placeholder="请输入带宽" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="系统" label="系统" rules={[{ required: true }]}>
                <Select placeholder="请选择系统">
                  {systems.map(s => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="上线时间" label="上线时间" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="负责人" label="负责人" rules={[{ required: true }]}>
                <Input placeholder="请输入负责人姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="使用部门" label="使用部门" rules={[{ required: true }]}>
            <Input placeholder="请输入使用部门" />
          </Form.Item>

          <Form.Item name="共享部门" label="共享部门">
            <Input placeholder="请输入共享部门（可选）" />
          </Form.Item>

          <Form.Item name="启用状态" label="启用状态" rules={[{ required: true }]}>
            <Select placeholder="请选择启用状态">
              <Option value={1}>启用</Option>
              <Option value={2}>逻辑删除</Option>
            </Select>
          </Form.Item>

          <Form.Item name="管理状态" label="管理状态" rules={[{ required: true }]}>
            <Select placeholder="请选择管理状态">
              <Option value={1}>正常</Option>
              <Option value={2}>低利用率</Option>
              <Option value={3}>可申请（公共池）</Option>
            </Select>
          </Form.Item>

          <Form.Item name="设备状态" label="设备状态" rules={[{ required: true }]}>
            <Select placeholder="请选择设备状态">
              <Option value={1}>正常</Option>
              <Option value={2}>指标缺失</Option>
              <Option value={3}>负载异常</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit">确定</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 已在函数定义时导出