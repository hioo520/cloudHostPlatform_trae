import { useState, useEffect } from 'react';
import { Table, Input, Button, Card, Row, Col, Typography, Space, Select, DatePicker, Tabs, Collapse, TreeSelect } from 'antd';
import { SearchOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import type { HostMetric, CloudHostInfo } from '../types';
import { getHostMetrics, getCloudHostList } from '../services/api';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { useRef } from 'react';
import type { TreeSelectProps } from 'antd';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;

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
  
  // 多维度筛选相关状态
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const [filterExpanded, setFilterExpanded] = useState<boolean>(true);
  const [filterDateRange, setFilterDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  
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

  // 定义指标树数据
  const metricsTreeData: TreeSelectProps['treeData'] = [
    {
      title: '云主机维度',
      value: 'host',
      key: 'host',
      children: [
        { title: 'CPU使用率', value: 'CPU使用率', key: 'CPU使用率' },
        { title: '内存使用率', value: '内存使用率', key: '内存使用率' },
        { title: '磁盘使用率', value: '磁盘使用率', key: '磁盘使用率' },
        { title: '网络读入速率', value: '网络读入速率', key: '网络读入速率' },
        { title: '网络写入速率', value: '网络写入速率', key: '网络写入速率' },
        { title: '进程数', value: '进程数', key: '进程数' },
        { title: '任务数', value: '任务数', key: '任务数' },
        { title: '运行进程', value: '运行进程', key: '运行进程' },
      ],
    },
    {
      title: '通道维度',
      value: 'channel',
      key: 'channel',
      children: [
        { title: '任务数', value: '任务数', key: 'channel_任务数' },
        { title: '成功任务数', value: '成功任务数', key: 'channel_成功任务数' },
        { title: '失败任务数', value: '失败任务数', key: 'channel_失败任务数' },
        { title: '空任务数', value: '空任务数', key: 'channel_空任务数' },
        { title: '消重任务数', value: '消重任务数', key: 'channel_消重任务数' },
      ],
    },
    {
      title: '业务维度',
      value: 'business',
      key: 'business',
      children: [
        { title: '业务任务数', value: '业务任务数', key: 'business_任务数' },
        { title: '业务成功率', value: '业务成功率', key: 'business_成功率' },
        { title: '业务响应时间', value: '业务响应时间', key: 'business_响应时间' },
      ],
    },
  ];

  // 生成云主机树数据
  const generateHostTreeData = (): TreeSelectProps['treeData'] => {
    const vendorMap = new Map<string, CloudHostInfo[]>();
    
    // 按厂商分组
    hostList.forEach(host => {
      if (!vendorMap.has(host.云主机厂商)) {
        vendorMap.set(host.云主机厂商, []);
      }
      vendorMap.get(host.云主机厂商)?.push(host);
    });
    
    const treeData: TreeSelectProps['treeData'] = [];
    
    vendorMap.forEach((hosts, vendor) => {
      const regionMap = new Map<string, CloudHostInfo[]>();
      
      // 按区域分组
      hosts.forEach(host => {
        if (!regionMap.has(host.区域)) {
          regionMap.set(host.区域, []);
        }
        regionMap.get(host.区域)?.push(host);
      });
      
      const vendorNode = {
        title: vendor,
        value: `vendor_${vendor}`,
        key: `vendor_${vendor}`,
        children: [] as any[],
      };
      
      regionMap.forEach((regionHosts, region) => {
        const regionNode = {
          title: region,
          value: `region_${region}`,
          key: `region_${region}`,
          children: regionHosts.map(host => ({
            title: host.云主机IP,
            value: host.云主机IP,
            key: host.云主机IP,
          })),
        };
        vendorNode.children.push(regionNode);
      });
      
      treeData.push(vendorNode);
    });
    
    return treeData;
  };

  // 处理多维度筛选查询
  const handleFilterSearch = () => {
    setFilterLoading(true);
    
    // 模拟数据生成
    setTimeout(() => {
      const mockData = selectedHosts.map(hostIp => {
        const baseRecord: any = { '云主机IP': hostIp, '采样时间': new Date().toISOString() };
        
        selectedMetrics.forEach(metric => {
          switch (metric) {
            case 'CPU使用率':
              baseRecord[metric] = `${(Math.random() * 100).toFixed(2)}%`;
              break;
            case '内存使用率':
              baseRecord[metric] = `${(Math.random() * 100).toFixed(2)}%`;
              break;
            case '磁盘使用率':
              baseRecord[metric] = `${(Math.random() * 100).toFixed(2)}%`;
              break;
            case '网络读入速率':
              baseRecord[metric] = (Math.random() * 100).toFixed(2);
              break;
            case '网络写入速率':
              baseRecord[metric] = (Math.random() * 100).toFixed(2);
              break;
            case '进程数':
              baseRecord[metric] = Math.floor(Math.random() * 500);
              break;
            case '任务数':
              baseRecord[metric] = Math.floor(Math.random() * 1000);
              break;
            case '运行进程':
              baseRecord[metric] = 'nginx, mysql, redis';
              break;
            case 'channel_任务数':
              baseRecord['通道任务数'] = Math.floor(Math.random() * 1000);
              break;
            case 'channel_成功任务数':
              baseRecord['通道成功任务数'] = Math.floor(Math.random() * 1000);
              break;
            case 'channel_失败任务数':
              baseRecord['通道失败任务数'] = Math.floor(Math.random() * 100);
              break;
            case 'channel_空任务数':
              baseRecord['通道空任务数'] = Math.floor(Math.random() * 200);
              break;
            case 'channel_消重任务数':
              baseRecord['通道消重任务数'] = Math.floor(Math.random() * 300);
              break;
            case 'business_任务数':
              baseRecord['业务任务数'] = Math.floor(Math.random() * 1000);
              break;
            case 'business_成功率':
              baseRecord['业务成功率'] = `${(Math.random() * 100).toFixed(2)}%`;
              break;
            case 'business_响应时间':
              baseRecord['业务响应时间'] = `${(Math.random() * 10).toFixed(2)}ms`;
              break;
          }
        });
        
        return baseRecord;
      });
      
      setFilteredData(mockData);
      setFilterLoading(false);
    }, 500);
  };

  // 生成动态列
  const generateFilterColumns = () => {
    const defaultColumns = [
      { title: '云主机IP', dataIndex: '云主机IP', key: '云主机IP' },
      { title: '采样时间', dataIndex: '采样时间', key: '采样时间' },
    ];
    
    const dynamicColumns = selectedMetrics.map(metric => {
      const displayName = metric.includes('_') ? metric.split('_')[1] : metric;
      const dataIndex = metric.includes('channel_') ? `通道${displayName}` : 
                       metric.includes('business_') ? `业务${displayName}` : displayName;
      
      return {
        title: displayName,
        dataIndex,
        key: metric,
        render: (value: any) => value || '-',
      };
    });
    
    return [...defaultColumns, ...dynamicColumns];
  };

  return (
    <div>
      <Title level={4}>多维指标管理</Title>
      
      <Tabs defaultActiveKey="1" type="card" style={{ marginBottom: 20 }}>
        <TabPane tab="指标查询" key="1">
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
        </TabPane>
        
        {/* 多维度筛选标签页 */}
        <TabPane tab="多维度筛选" key="2">
          {/* 功能区 */}
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={12} md={16}>
                <RangePicker
                  style={{ width: '100%' }}
                  value={filterDateRange}
                  onChange={(dates) => setFilterDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] || [null, null])}
                  placeholder={['开始日期', '结束日期']}
                />
              </Col>
              <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
                <Space>
                  <Button type="primary" onClick={handleFilterSearch}>
                    查询
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Row gutter={16}>
            {/* 左侧筛选区 */}
            <Col xs={24} lg={filterExpanded ? 8 : 0}>
              {filterExpanded && (
                <Card style={{ height: '100%' }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>筛选条件</Text>
                    <Button type="text" icon={<MinusOutlined />} onClick={() => setFilterExpanded(false)} />
                  </div>
                  
                  <Collapse defaultActiveKey={['1', '2']}>
                    {/* 指标筛选区 */}
                    <Panel header="指标筛选" key="1">
                      <div style={{ maxHeight: 300, overflowY: 'auto', padding: '8px 0' }}>
                        <TreeSelect
                          treeData={metricsTreeData}
                          value={selectedMetrics}
                          onChange={setSelectedMetrics}
                          treeDefaultExpandAll
                          style={{ width: '100%' }}
                          placeholder="请选择要展示的指标"
                          treeCheckable
                        />
                      </div>
                    </Panel>
                    
                    {/* 云主机筛选区 */}
                    <Panel header="云主机筛选" key="2">
                      <div style={{ maxHeight: 300, overflowY: 'auto', padding: '8px 0' }}>
                        <TreeSelect
                          treeData={generateHostTreeData()}
                          value={selectedHosts}
                          onChange={setSelectedHosts}
                          treeDefaultExpandAll
                          style={{ width: '100%' }}
                          placeholder="请选择云主机"
                          treeCheckable
                        />
                      </div>
                    </Panel>
                  </Collapse>
                </Card>
              )}
            </Col>
            
            {/* 右侧展示区 */}
            <Col xs={24} lg={filterExpanded ? 16 : 24}>
              <Card style={{ height: '100%' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>指标展示</Text>
                  {!filterExpanded && (
                    <Button type="text" icon={<PlusOutlined />} onClick={() => setFilterExpanded(true)} />
                  )}
                </div>
                
                <Table
                  columns={generateFilterColumns()}
                  dataSource={filteredData}
                  rowKey={(record: any) => `${record['云主机IP']}-${record['采样时间']}`}
                  loading={filterLoading}
                  pagination={{
                    pageSize: 10,
                  }}
                  size="middle"
                  scroll={{ y: 600 }}
                  locale={{
                    emptyText: selectedMetrics.length > 0 && selectedHosts.length > 0 
                      ? '暂无数据，请点击查询按钮获取数据' 
                      : '请选择要展示的指标和云主机'
                  }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

// Export handled by function declaration