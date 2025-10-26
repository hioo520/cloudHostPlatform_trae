import { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, Table, Tag, Typography, Divider } from 'antd';
import { AlertOutlined, DatabaseOutlined, UpOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import * as echarts from 'echarts';
import type { DashboardStats, CloudHostInfo } from '../types';
import { getDashboardStats, getCloudHostList } from '../services/api';
import StatCard from '../components/StatCard';

const { Title, Text } = Typography;

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentHosts, setRecentHosts] = useState<CloudHostInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, hostsData] = await Promise.all([
         getDashboardStats(),
          getCloudHostList({ page: 1, pageSize: 5 })
        ]);
        setStats(statsData);
        setRecentHosts(hostsData.list);
      } catch (error) {
        console.error('获取首页数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // 初始化图表
    if (stats) {
      // 系统分布饼图
      const systemChart = echarts.init(document.getElementById('systemChart')!);
      systemChart.setOption({
        title: { text: '系统分布', left: 'center' },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '50%',
          data: [
            { value: stats.windowsCount, name: 'Windows' },
            { value: stats.linuxCount, name: 'Linux' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      });

      // 异常分布柱状图
      const abnormalChart = echarts.init(document.getElementById('abnormalChart')!);
      abnormalChart.setOption({
        title: { text: '异常分布', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['CPU高负载', '内存高负载', '磁盘高负载', '不在线']
        },
        yAxis: { type: 'value' },
        series: [{
          data: [
            stats.abnormalCount.highCpu,
            stats.abnormalCount.highMemory,
            stats.abnormalCount.highDisk,
            stats.abnormalCount.offline
          ],
          type: 'bar',
          itemStyle: {
            color: function(params: any) {
              const colorList = ['#f5222d', '#faad14', '#1890ff', '#722ed1'];
              return colorList[params.dataIndex];
            }
          }
        }]
      });

      // 响应式处理
      const handleResize = () => {
        systemChart.resize();
        abnormalChart.resize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        systemChart.dispose();
        abnormalChart.dispose();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [stats]);

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1: return <Tag color="green">正常</Tag>;
      case 2: return <Tag color="orange">异常</Tag>;
      case 3: return <Tag color="red">严重</Tag>;
      default: return <Tag>未知</Tag>;
    }
  };

  const columns = [
    {
      title: '云主机IP',
      dataIndex: '云主机IP',
      key: '云主机IP',
      render: (ip: string) => <Link to={`/hosts/detail/${ip}`}>{ip}</Link>
    },
    {
      title: '系统',
      dataIndex: '系统',
      key: '系统'
    },
    {
      title: '处理器/内存',
      key: '配置',
      render: (record: CloudHostInfo) => `${record.处理器}核/${record.内存}GB`
    },
    {
      title: '负责人',
      dataIndex: '负责人',
      key: '负责人'
    },
    {
      title: '设备状态',
      key: '设备状态',
      render: (record: CloudHostInfo) => getStatusTag(record.设备状态)
    }
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>;
  }

  return (
    <div>
      <Title level={4}>云主机资源总览</Title>
      <Divider />
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="云主机总数" 
            value={stats?.totalHosts || 0} 
            icon={<DatabaseOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="公共池数量" 
            value={stats?.publicPoolCount || 0} 
            icon={<DatabaseOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="在线数量" 
            value={stats?.onlineCount || 0} 
            icon={<UpOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="异常数量" 
            value={(stats?.abnormalCount.highCpu || 0) + (stats?.abnormalCount.offline || 0)} 
            icon={<AlertOutlined />}
            color="#f5222d"
          />
        </Col>
      </Row>

      {/* 资源使用率 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card title="CPU使用率">
            <Progress 
              percent={stats?.cpuUsage || 0} 
              format={(percent) => `${percent}%`}
              strokeColor={{'0%': '#108ee9', '100%': '#87d068'}}
            />
            <Text style={{ marginTop: 10, display: 'block' }}>
              当前平均CPU使用率: {stats?.cpuUsage || 0}%
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="内存使用率">
            <Progress 
              percent={stats?.memoryUsage || 0} 
              format={(percent) => `${percent}%`}
              strokeColor={{'0%': '#108ee9', '100%': '#87d068'}}
            />
            <Text style={{ marginTop: 10, display: 'block' }}>
              当前平均内存使用率: {stats?.memoryUsage || 0}%
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="磁盘使用率">
            <Progress 
              percent={stats?.diskUsage || 0} 
              format={(percent) => `${percent}%`}
              strokeColor={{'0%': '#108ee9', '100%': '#87d068'}}
            />
            <Text style={{ marginTop: 10, display: 'block' }}>
              当前平均磁盘使用率: {stats?.diskUsage || 0}%
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 图表展示 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="系统分布">
            <div id="systemChart" style={{ height: 300 }}></div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="异常分布">
            <div id="abnormalChart" style={{ height: 300 }}></div>
          </Card>
        </Col>
      </Row>

      {/* 最近云主机 */}
      <Card title="最近云主机" style={{ marginTop: 16 }}>
        <Table 
          columns={columns} 
          dataSource={recentHosts} 
          rowKey="云主机IP" 
          pagination={false}
        />
      </Card>
    </div>
  );
};

// 已在函数定义时导出