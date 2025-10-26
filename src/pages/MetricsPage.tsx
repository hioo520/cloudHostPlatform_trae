import { useState, useEffect } from 'react';
import { Table, Input, Button, Card, Row, Col, Typography, Space, Select, DatePicker, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { HostMetric, CloudHostInfo } from '../types';
import { getHostMetrics, getCloudHostList } from '../services/api';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { useRef } from 'react';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

export default function MetricsPage() {
  const [dataSource, setDataSource] = useState<(HostMetric & { hostInfo?: CloudHostInfo })[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [hostIp, setHostIp] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hostList, setHostList] = useState<CloudHostInfo[]>([]);
  const [selectedHost, setSelectedHost] = useState<(HostMetric & { hostInfo?: CloudHostInfo }) | null>(null);
  
  // 图表引用
  const cpuChartRef = useRef<HTMLDivElement>(null);
  const memoryChartRef = useRef<HTMLDivElement>(null);
  const diskChartRef = useRef<HTMLDivElement>(null);
  const networkChartRef = useRef<HTMLDivElement>(null);
  
  // 图表实例
  const cpuChart = useRef<echarts.ECharts | null>(null);
  const memoryChart = useRef<echarts.ECharts | null>(null);
  const diskChart = useRef<echarts.ECharts | null>(null);
  const networkChart = useRef<echarts.ECharts | null>(null);

  // 加载主机列表
  useEffect(() => {
    const fetchHostList = async () => {
      try {
        const response = await getCloudHostList({ page: 1, pageSize: 200 });
        setHostList(response.list);
      } catch (error) {
        console.error('获取主机列表失败:', error);
      }
    };
    fetchHostList();
  }, []);

  // 加载指标数据
  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getHostMetrics({
        page,
        pageSize: 10,
        hostIp: hostIp || undefined,
        startTime: dateRange[0]?.format('YYYY-MM-DD'),
        endTime: dateRange[1]?.format('YYYY-MM-DD'),
        searchText: searchText
      });

      // 关联主机信息
      const dataWithHostInfo = response.list.map((metric: HostMetric) => {
        const host = hostList.find(h => h.云主机IP === metric.云主机IP);
        return { ...metric, hostInfo: host };
      });

      setDataSource(dataWithHostInfo);
      setTotal(response.total);
      setCurrentPage(page);

      // 默认选中第一个主机
      if (dataWithHostInfo.length > 0) {
        setSelectedHost(dataWithHostInfo[0]);
      }
    } catch (error) {
      console.error('获取主机指标失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hostIp, dateRange, searchText, hostList]);

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

  // 选择主机
  const handleSelectHost = (host: HostMetric & { hostInfo?: CloudHostInfo }) => {
    setSelectedHost(host);
  };

  // 初始化图表
  useEffect(() => {
    if (selectedHost) {
      initCharts();
    }
  }, [selectedHost]);

  // 初始化所有图表
  const initCharts = () => {
    if (!selectedHost) return;

    // CPU使用率图表
    if (cpuChartRef.current && !cpuChart.current) {
      cpuChart.current = echarts.init(cpuChartRef.current);
    }
    updateCpuChart();

    // 内存使用率图表
    if (memoryChartRef.current && !memoryChart.current) {
      memoryChart.current = echarts.init(memoryChartRef.current);
    }
    updateMemoryChart();

    // 磁盘使用率图表
    if (diskChartRef.current && !diskChart.current) {
      diskChart.current = echarts.init(diskChartRef.current);
    }
    updateDiskChart();

    // 网络使用率图表
    if (networkChartRef.current && !networkChart.current) {
      networkChart.current = echarts.init(networkChartRef.current);
    }
    updateNetworkChart();
  };

  // 更新CPU图表
  const updateCpuChart = () => {
    if (!cpuChart.current || !selectedHost) return;
    
    const option = {
      title: { text: 'CPU使用率趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'] },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: [{
        data: generateMockData(8, Number(selectedHost.CPU使用率)),
          type: 'line',
        smooth: true,
        lineStyle: { color: '#f5222d' },
        areaStyle: { opacity: 0.3 }
      }]
    };
    
    cpuChart.current.setOption(option);
  };

  // 更新内存图表
  const updateMemoryChart = () => {
    if (!memoryChart.current || !selectedHost) return;
    
    const option = {
      title: { text: '内存使用率趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'] },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: [{
        data: generateMockData(8, Number(selectedHost.内存使用率)),
          type: 'line',
        smooth: true,
        lineStyle: { color: '#1890ff' },
        areaStyle: { opacity: 0.3 }
      }]
    };
    
    memoryChart.current.setOption(option);
  };

  // 更新磁盘图表
  const updateDiskChart = () => {
    if (!diskChart.current || !selectedHost) return;
    
    const option = {
      title: { text: '磁盘使用率趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'] },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: [{
        data: generateMockData(8, Number(selectedHost.磁盘使用率)),
          type: 'line',
        smooth: true,
        lineStyle: { color: '#52c41a' },
        areaStyle: { opacity: 0.3 }
      }]
    };
    
    diskChart.current.setOption(option);
  };

  // 更新网络图表
  const updateNetworkChart = () => {
    if (!networkChart.current || !selectedHost) return;
    
    const option = {
      title: { text: '网络流量趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['入流量', '出流量'], top: 30 },
      xAxis: { type: 'category', data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'] },
      yAxis: { type: 'value', axisLabel: { formatter: '{value} MB/s' } },
      series: [
        {
          name: '入流量',
          data: generateMockData(8, selectedHost.网络读入速率, 0, 100),
          type: 'line',
          smooth: true,
          lineStyle: { color: '#722ed1' }
        },
        {
          name: '出流量',
          data: generateMockData(8, selectedHost.网络写入速率, 0, 100),
          type: 'line',
          smooth: true,
          lineStyle: { color: '#fa8c16' }
        }
      ]
    };
    
    networkChart.current.setOption(option);
  };

  // 生成模拟数据
  const generateMockData = (count: number, baseValue: number, minOffset = 0, maxOffset = 10) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const offset = Math.random() * (maxOffset - minOffset) + minOffset;
      const value = Math.max(0, Math.min(baseValue + (Math.random() > 0.5 ? offset : -offset), 100));
      data.push(Number(value.toFixed(2)));
    }
    return data;
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
      title: 'CPU使用率',
      dataIndex: 'CPU使用率',
      key: 'CPU使用率',
      render: (value: number) => `${value}%`,
      sorter: (a: any, b: any) => (a.CPU使用率 || 0) - (b.CPU使用率 || 0)
    },
    {
      title: '内存使用率',
      dataIndex: '内存使用率',
      key: '内存使用率',
      render: (value: number) => `${value}%`,
      sorter: (a: any, b: any) => (a.内存使用率 || 0) - (b.内存使用率 || 0)
    },
    {
      title: '磁盘使用率',
      dataIndex: '磁盘使用率',
      key: '磁盘使用率',
      render: (value: number) => `${value}%`,
      sorter: (a: any, b: any) => (a.磁盘使用率 || 0) - (b.磁盘使用率 || 0)
    },
    {
      title: '网络读入(MB/s)',
      dataIndex: '网络读入速率',
      key: '网络读入速率',
      sorter: (a: any, b: any) => (a.网络读入速率 || 0) - (b.网络读入速率 || 0)
    },
    {
      title: '网络写入(MB/s)',
      dataIndex: '网络写入速率',
      key: '网络写入速率',
      sorter: (a: any, b: any) => (a.网络写入速率 || 0) - (b.网络写入速率 || 0)
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button onClick={() => handleSelectHost(record)}>
          查看详情
        </Button>
      )
    }
  ];

  return (
    <div>
      <Title level={4}>多维指标管理</Title>
      
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
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] || [null, null])}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索云主机IP"
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
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

      <Row gutter={16}>
        {/* 左侧列表 */}
        <Col xs={24} lg={8}>
          <Card>
            <Table
              columns={columns}
              dataSource={dataSource}
              rowKey={(record: HostMetric) => `${record.云主机IP}-${record.采样时间}`}
              loading={loading}
              pagination={{
                total,
                pageSize: 10,
                current: currentPage,
                onChange: (page: number) => loadData(page)
              }}
              size="small"
              scroll={{ y: 600 }}
            />
          </Card>
        </Col>

        {/* 右侧详情 */}
        <Col xs={24} lg={16}>
          <Card title={selectedHost ? `${selectedHost.云主机IP} - 指标详情` : '选择主机查看详情'}>
            {selectedHost ? (
              <Tabs defaultActiveKey="1" type="card">
                <TabPane tab="实时监控" key="1">
                  <Row gutter={16}>
                    <Col span={12}>
                      <div ref={cpuChartRef} style={{ height: 300, width: '100%' }} />
                    </Col>
                    <Col span={12}>
                      <div ref={memoryChartRef} style={{ height: 300, width: '100%' }} />
                    </Col>
                    <Col span={12}>
                      <div ref={diskChartRef} style={{ height: 300, width: '100%' }} />
                    </Col>
                    <Col span={12}>
                      <div ref={networkChartRef} style={{ height: 300, width: '100%' }} />
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="主机信息" key="2">
                  <div style={{ fontSize: 16 }}>
                    <p><strong>云主机IP:</strong> {selectedHost.云主机IP}</p>
                    <p><strong>系统:</strong> {selectedHost.hostInfo?.系统 || '-'}</p>
                    <p><strong>处理器:</strong> {selectedHost.hostInfo?.处理器 || 0}核</p>
                    <p><strong>内存:</strong> {selectedHost.hostInfo?.内存 || 0}GB</p>
                    <p><strong>磁盘:</strong> {selectedHost.hostInfo?.磁盘 || 0}GB</p>
                    <p><strong>带宽:</strong> {selectedHost.hostInfo?.带宽 || 0}Mbps</p>
                    <p><strong>负责人:</strong> {selectedHost.hostInfo?.负责人 || '-'}</p>
                    <p><strong>使用部门:</strong> {selectedHost.hostInfo?.使用部门 || '-'}</p>
                    <p><strong>管理状态:</strong> {selectedHost.hostInfo?.管理状态 || '-'}</p>
                    <p><strong>设备状态:</strong> {selectedHost.hostInfo?.设备状态 || '-'}</p>
                  </div>
                </TabPane>
              </Tabs>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text>请从左侧列表选择一台云主机查看详细指标</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Export handled by function declaration