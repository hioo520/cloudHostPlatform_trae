import { useState, useEffect } from 'react';
import { Table, DatePicker, Input, Button, Card, Row, Col, Typography, Space, Select, Tag, message } from 'antd';
import { SearchOutlined, RollbackOutlined } from '@ant-design/icons';
import type { HostChangeRecord, CloudHostInfo } from '../types';
import { getHostChangeRecords, getCloudHostList, restoreHostStatus } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function ChangeManagement() {
  const [dataSource, setDataSource] = useState<Array<HostChangeRecord & { hostInfo?: CloudHostInfo }>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [hostIp, setHostIp] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hostList, setHostList] = useState<CloudHostInfo[]>([]);

  // 加载主机列表（用于下拉选择）
  useEffect(() => {
    const fetchHostList = async () => {
      try {
        const response = await getCloudHostList({ page: 1, pageSize: 100 });
        setHostList(response.list);
      } catch (error) {
        console.error('获取主机列表失败:', error);
      }
    };
    fetchHostList();
  }, []);

  // 加载变更记录
  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getHostChangeRecords({
        page,
        pageSize: 10,
        hostIp: hostIp || undefined,
        startTime: dateRange[0]?.format('YYYY-MM-DD'),
        endTime: dateRange[1]?.format('YYYY-MM-DD'),
        searchText: searchText
      });

      // 关联主机信息
      const recordsWithHostInfo = response.list.map(record => {
        const host = hostList.find(h => h.云主机IP === record.云主机IP);
        return { ...record, hostInfo: host };
      });

      setDataSource(recordsWithHostInfo);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('获取变更记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hostIp, dateRange, searchText]);

  // 搜索
  const handleSearch = () => {
    loadData(1);
  };

  // 重置
  const handleReset = () => {
    setSearchText('');
    setHostIp('');
    setDateRange([null, null]);
    loadData(1);
  };

  // 恢复云主机状态
  const handleRestore = async (ip: string) => {
    try {
      await restoreHostStatus(ip);
      message.success('恢复成功');
      loadData(currentPage);
    } catch (error) {
      message.error('恢复失败');
    }
  };

  // 获取操作类型文本
  const getOperationTypeText = (type: number) => {
    return type === 1 ? '管理状态' : '设备状态';
  };

  // 获取状态值文本
  const getStatusValueText = (type: number, value: string) => {
    const intValue = parseInt(value);
    if (type === 1) {
      // 管理状态
      switch (intValue) {
        case 1: return '正常';
        case 2: return '低利用率';
        case 3: return '可申请（公共池）';
        default: return value;
      }
    } else {
      // 设备状态
      switch (intValue) {
        case 1: return '正常';
        case 2: return '指标缺失';
        case 3: return '负载异常';
        default: return value;
      }
    }
  };

  const columns = [
    {
      title: '采样时间',
      dataIndex: '采样时间',
      key: '采样时间',
      sorter: (a: HostChangeRecord, b: HostChangeRecord) => new Date(a.采样时间).getTime() - new Date(b.采样时间).getTime()
    },
    {
      title: '云主机IP',
      dataIndex: '云主机IP',
      key: '云主机IP'
    },
    {
      title: '云主机信息',
      key: 'hostInfo',
      render: (_: any, record: HostChangeRecord) => (
        <div>{record.云主机IP}</div>
      )
    },
    {
      title: '操作类型',
      key: '操作类型',
      render: (record: HostChangeRecord) => getOperationTypeText(record.操作类型)
    },
    {
      title: '操作人',
      dataIndex: '操作人',
      key: '操作人'
    },
    {
      title: '变更内容',
      key: 'change',
      render: (record: HostChangeRecord) => (
        <div>
          <Text>从 </Text>
          <Tag color="orange">{getStatusValueText(record.操作类型, record.原始值)}</Tag>
          <Text> 变更为 </Text>
          <Tag color="green">{getStatusValueText(record.操作类型, record.新值)}</Tag>
        </div>
      )
    },
    {
      title: '备注',
      dataIndex: '备注',
      key: '备注'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: HostChangeRecord) => (
        <Button 
          type="primary" 
          icon={<RollbackOutlined />} 
          size="small"
          onClick={() => handleRestore(record.云主机IP)}
        >
          恢复状态
        </Button>
      )
    }
  ];

  return (
    <div>
      <Title level={4}>云主机变更管理</Title>
      
      {/* 搜索栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="选择云主机IP"
              style={{ width: '100%' }}
              value={hostIp}
              onChange={setHostIp}
              allowClear
            >
              {hostList.map(host => (
                <Option key={host.云主机IP} value={host.云主机IP}>
                  {host.云主机IP} ({host.负责人})
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索操作人/备注"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" onClick={handleSearch}>搜索</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={(record, index) => `${record.云主机IP}-${record.采样时间}-${index}`}
        loading={loading}
        pagination={{
          total,
          pageSize: 10,
          current: currentPage,
          onChange: (page) => loadData(page)
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

// 已在函数定义时导出