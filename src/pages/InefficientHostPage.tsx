import { useState, useEffect } from 'react';
import { Table, DatePicker, Input, Button, Card, Row, Col, Typography, Space, Statistic, Progress, Tooltip } from 'antd';
import { SearchOutlined, AlertOutlined } from '@ant-design/icons';
import type { InefficientHost, CloudHostInfo } from '../types';
import { getInefficientHosts, getCloudHostList } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function InefficientHostPage() {
  const [dataSource, setDataSource] = useState<(InefficientHost & { hostInfo?: CloudHostInfo })[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hostMap, setHostMap] = useState<Map<string, CloudHostInfo>>(new Map());

  // 加载主机信息用于展示
  useEffect(() => {
    const fetchHostList = async () => {
      try {
        const response = await getCloudHostList({ page: 1, pageSize: 200 });
        const map = new Map<string, CloudHostInfo>();
        response.list.forEach(host => map.set(host.云主机IP, host));
        setHostMap(map);
      } catch (error) {
        console.error('获取主机列表失败:', error);
      }
    };
    fetchHostList();
  }, []);

  // 加载低效云主机数据
  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getInefficientHosts({
        page,
        pageSize: 10,
        startTime: dateRange[0]?.format('YYYY-MM-DD'),
        endTime: dateRange[1]?.format('YYYY-MM-DD'),
        searchText: searchText
      });

      // 关联主机信息
      const dataWithHostInfo = response.list.map(inefficientHost => ({
        ...inefficientHost,
        hostInfo: hostMap.get(inefficientHost.云主机IP)
      }));

      setDataSource(dataWithHostInfo);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('获取低效云主机列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange, searchText, hostMap]);

  // 搜索
  const handleSearch = () => {
    loadData(1);
  };

  // 重置
  const handleReset = () => {
    setSearchText('');
    setDateRange([null, null]);
    loadData(1);
  };

  // 获取使用率进度条颜色
  const getProgressColor = (percentage: string) => {
    const value = parseInt(percentage);
    if (value > 80) return '#f5222d';
    if (value > 60) return '#faad14';
    return '#52c41a';
  };

  // 渲染使用率组件
  const renderUsage = (value: string, title: string) => {
    const percentage = parseInt(value);
    return (
      <Tooltip title={title}>
        <Progress 
          percent={percentage} 
          size="small" 
          strokeColor={getProgressColor(value)}
          format={() => value}
        />
      </Tooltip>
    );
  };

  const columns = [
    {
      title: '云主机IP',
      dataIndex: '云主机IP',
      key: '云主机IP'
    },
    {
      title: '云主机信息',
      key: 'hostInfo',
      render: (_: any, record: any) => (
        <div>
          <div>{record.hostInfo?.系统 || '-'}</div>
          <div>{record.hostInfo?.负责人 || '-'} | {record.hostInfo?.使用部门 || '-'}</div>
          <div>{record.hostInfo?.处理器 || 0}核/{record.hostInfo?.内存 || 0}GB</div>
        </div>
      )
    },
    {
      title: '采样时间',
      dataIndex: '采样时间',
      key: '采样时间',
      sorter: (a: any, b: any) => new Date(a.采样时间).getTime() - new Date(b.采样时间).getTime()
    },
    {
      title: 'CPU使用率（周）',
      dataIndex: 'CPU使用率周',
      key: 'CPU使用率周',
      render: (value: string) => renderUsage(value, `CPU周使用率: ${value}`)
    },
    {
      title: '内存使用率（周）',
      dataIndex: '内存使用率周',
      key: '内存使用率周',
      render: (value: string) => renderUsage(value, `内存周使用率: ${value}`)
    },
    {
      title: '磁盘使用率（周）',
      dataIndex: '磁盘使用率周',
      key: '磁盘使用率周',
      render: (value: string) => renderUsage(value, `磁盘周使用率: ${value}`)
    },
    {
      title: 'CPU使用率（月）',
      dataIndex: 'CPU使用率月',
      key: 'CPU使用率月',
      render: (value: string) => renderUsage(value, `CPU月使用率: ${value}`)
    },
    {
      title: '内存使用率（月）',
      dataIndex: '内存使用率月',
      key: '内存使用率月',
      render: (value: string) => renderUsage(value, `内存月使用率: ${value}`)
    },
    {
      title: '磁盘使用率（月）',
      dataIndex: '磁盘使用率月',
      key: '磁盘使用率月',
      render: (value: string) => renderUsage(value, `磁盘月使用率: ${value}`)
    },
    {
      title: '网络读入速率（MB/s）',
      key: 'networkIn',
      render: (_: any, record: any) => (
        <div>
          <div>周: {record.网络读入速率周} MB/s</div>
          <div>月: {record.网络读入速率月} MB/s</div>
        </div>
      )
    },
    {
      title: '网络写入速率（MB/s）',
      key: 'networkOut',
      render: (_: any, record: any) => (
        <div>
          <div>周: {record.网络写入速率周} MB/s</div>
          <div>月: {record.网络写入速率月} MB/s</div>
        </div>
      )
    }
  ];

  // 统计信息
  const stats = {
    total: total,
    highCpu: dataSource.filter(item => parseInt(item.CPU使用率周) > 80).length,
    highMemory: dataSource.filter(item => parseInt(item.内存使用率周) > 80).length,
    highDisk: dataSource.filter(item => parseInt(item.磁盘使用率周) > 80).length
  };

  return (
    <div>
      <Title level={4}>低效云主机管理</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="低效主机总数" 
              value={stats.total} 
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="CPU高负载" 
              value={stats.highCpu} 
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="内存高负载" 
              value={stats.highMemory} 
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="磁盘高负载" 
              value={stats.highDisk} 
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col xs={24} md={12}>
            <Input
              placeholder="搜索云主机IP"
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
        rowKey={(record) => `${record.云主机IP}-${record.采样时间}`}
        loading={loading}
        pagination={{
          total,
          pageSize: 10,
          current: currentPage,
          onChange: (page) => loadData(page)
        }}
        scroll={{ x: 1500 }}
      />
    </div>
  );
};