import type { CloudHostInfo, InefficientHost, HostMetric, ChannelSummaryMetric, ChannelDetailMetric, HostChangeRecord, DashboardStats } from '../types';

// 生成随机日期
const getRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toLocaleDateString('zh-CN').replace(/\//g, '/');
};

// 生成随机IP
const getRandomIP = (): string => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

// 生成随机百分比
const getRandomPercentage = (): string => {
  return `${Math.floor(Math.random() * 100)}%`;
};

// 生成云主机信息模拟数据
export const generateCloudHostInfo = (count: number): CloudHostInfo[] => {
  const manufacturers = ['阿里云', '腾讯云', '华为云', 'AWS', 'Azure'];
  const regions = ['南京', '北京', '上海', '广州', '深圳'];
  const systems = ['Windows Server 2008', 'Windows Server 2012', 'Windows Server 2016', 'Windows Server 2019', 'Ubuntu 18.04', 'Ubuntu 20.04', 'CentOS 7', 'CentOS 8'];
  const departments = ['DSC - 南京技术 - PEVC', 'WDS - 南京技术 - 股票', '研发部', '测试部', '运维部'];
  
  return Array.from({ length: count }, (_, index) => ({
    云主机厂商: manufacturers[Math.floor(Math.random() * manufacturers.length)],
    区域: regions[Math.floor(Math.random() * regions.length)],
    云主机IP: getRandomIP(),
    处理器: Math.floor(Math.random() * 8) + 2,
    内存: Math.floor(Math.random() * 16) + 4,
    磁盘: Math.floor(Math.random() * 500) + 100,
    带宽: Math.floor(Math.random() * 100) + 5,
    系统: systems[Math.floor(Math.random() * systems.length)],
    上线时间: getRandomDate(new Date('2023-01-01'), new Date()),
    负责人: `负责人${index + 1}`,
    使用部门: departments[Math.floor(Math.random() * departments.length)],
    共享部门: Math.random() > 0.5 ? departments[Math.floor(Math.random() * departments.length)] : '',
    启用状态: Math.random() > 0.1 ? 1 : 2,
    管理状态: Math.floor(Math.random() * 3) + 1,
    设备状态: Math.floor(Math.random() * 3) + 1
  }));
};

// 生成低效云主机模拟数据
export const generateInefficientHosts = (hostIPs: string[]): InefficientHost[] => {
  return hostIPs.map(ip => ({
    云主机IP: ip,
    采样时间: getRandomDate(new Date('2024-01-01'), new Date()),
    CPU使用率周: getRandomPercentage(),
    内存使用率周: getRandomPercentage(),
    磁盘使用率周: getRandomPercentage(),
    网络读入速率周: Math.random() * 10,
    网络写入速率周: Math.random() * 50,
    CPU使用率月: getRandomPercentage(),
    内存使用率月: getRandomPercentage(),
    磁盘使用率月: getRandomPercentage(),
    网络读入速率月: Math.random() * 10,
    网络写入速率月: Math.random() * 50
  }));
};

// 生成云主机维度指标模拟数据
export const generateHostMetrics = (hostIPs: string[]): HostMetric[] => {
  return hostIPs.map(ip => ({
    云主机IP: ip,
    采样时间: getRandomDate(new Date('2024-01-01'), new Date()),
    CPU使用率: getRandomPercentage(),
    内存使用率: getRandomPercentage(),
    磁盘使用率: getRandomPercentage(),
    网络读入速率: Math.random() * 10,
    网络写入速率: Math.random() * 50,
    进程数: Math.floor(Math.random() * 500) + 100,
    任务数: Math.floor(Math.random() * 5000) + 1000,
    运行进程: `wcb_a,wcb_b,process_${Math.floor(Math.random() * 100)}`
  }));
};

// 生成通道维度指标汇总模拟数据
export const generateChannelSummaryMetrics = (count: number): ChannelSummaryMetric[] => {
  const channelNames = ['FHBSD', 'XYK', 'ZCK', 'HK', 'TX'];
  const taskTypes = ['LIST', 'DATA', 'DETAIL'];
  
  return Array.from({ length: count }, (_, index) => {
    const taskCount = Math.floor(Math.random() * 1000) + 500;
    const successCount = Math.floor(taskCount * (Math.random() * 0.5 + 0.5));
    const failCount = Math.floor((taskCount - successCount) * Math.random());
    const emptyCount = Math.floor((taskCount - successCount - failCount) * Math.random());
    const duplicateCount = taskCount - successCount - failCount - emptyCount;
    
    return {
      ID: `channel_${index + 1}`,
      通道名: channelNames[Math.floor(Math.random() * channelNames.length)],
      任务类型: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      采样时间: getRandomDate(new Date('2024-01-01'), new Date()),
      任务数: taskCount,
      成功任务数: successCount,
      失败任务数: failCount,
      空任务数: emptyCount,
      消重任务数: duplicateCount
    };
  });
};

// 生成通道维度指标详细模拟数据
export const generateChannelDetailMetrics = (summaryMetrics: ChannelSummaryMetric[], hostIPs: string[]): ChannelDetailMetric[] => {
  const businessNames = ['FHBSD', 'XYK', 'ZCK', 'HK', 'TX'];
  const details: ChannelDetailMetric[] = [];
  
  summaryMetrics.forEach(metric => {
    const detailCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < detailCount; i++) {
      const taskCount = Math.floor(Math.random() * 500) + 100;
      const successCount = Math.floor(taskCount * (Math.random() * 0.5 + 0.5));
      const failCount = Math.floor((taskCount - successCount) * Math.random());
      const emptyCount = Math.floor((taskCount - successCount - failCount) * Math.random());
      const duplicateCount = taskCount - successCount - failCount - emptyCount;
      
      details.push({
        parentId: metric.ID,
        业务名: businessNames[Math.floor(Math.random() * businessNames.length)],
        云主机IP: hostIPs[Math.floor(Math.random() * hostIPs.length)],
        采样时间: metric.采样时间,
        任务数: taskCount,
        成功任务数: successCount,
        失败任务数: failCount,
        空任务数: emptyCount,
        消重任务数: duplicateCount
      });
    }
  });
  
  return details;
};

// 生成云主机变更记录模拟数据
export const generateHostChangeRecords = (hostIPs: string[]): HostChangeRecord[] => {
  const operators = ['系统', '管理员', '用户1', '用户2', '用户3'];
  const records: HostChangeRecord[] = [];
  
  hostIPs.forEach(ip => {
    const recordCount = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < recordCount; i++) {
      const operationType = Math.floor(Math.random() * 2) + 1;
      records.push({
        采样时间: getRandomDate(new Date('2024-01-01'), new Date()),
        云主机IP: ip,
        操作类型: operationType,
        操作人: operators[Math.floor(Math.random() * operators.length)],
        原始值: operationType === 1 ? `${Math.floor(Math.random() * 3) + 1}` : `${Math.floor(Math.random() * 3) + 1}`,
        新值: operationType === 1 ? `${Math.floor(Math.random() * 3) + 1}` : `${Math.floor(Math.random() * 3) + 1}`,
        备注: operationType === 1 ? '管理状态变更' : '设备状态变更'
      });
    }
  });
  
  return records.sort((a, b) => new Date(b.采样时间).getTime() - new Date(a.采样时间).getTime());
};

// 生成首页统计数据
export const generateDashboardStats = (hosts: CloudHostInfo[]): DashboardStats => {
  const totalHosts = hosts.length;
  const publicPoolCount = hosts.filter(h => h.管理状态 === 3).length;
  const windowsCount = hosts.filter(h => h.系统.toLowerCase().includes('windows')).length;
  const linuxCount = totalHosts - windowsCount;
  const onlineCount = hosts.filter(h => h.设备状态 === 1).length;
  
  return {
    totalHosts,
    publicPoolCount,
    windowsCount,
    linuxCount,
    onlineCount,
    cpuUsage: Math.floor(Math.random() * 70) + 20,
    memoryUsage: Math.floor(Math.random() * 80) + 10,
    diskUsage: Math.floor(Math.random() * 90) + 5,
    abnormalCount: {
      highCpu: Math.floor(totalHosts * 0.1),
      highMemory: Math.floor(totalHosts * 0.15),
      highDisk: Math.floor(totalHosts * 0.12),
      offline: totalHosts - onlineCount
    }
  };
};

// 初始化模拟数据
export const initMockData = () => {
  const hosts = generateCloudHostInfo(100);
  const hostIPs = hosts.map(h => h.云主机IP);
  const inefficientHosts = generateInefficientHosts(hostIPs.slice(0, 30));
  const hostMetrics = generateHostMetrics(hostIPs);
  const channelSummaryMetrics = generateChannelSummaryMetrics(50);
  const channelDetailMetrics = generateChannelDetailMetrics(channelSummaryMetrics, hostIPs);
  const hostChangeRecords = generateHostChangeRecords(hostIPs);
  const dashboardStats = generateDashboardStats(hosts);
  
  return {
    hosts,
    inefficientHosts,
    hostMetrics,
    channelSummaryMetrics,
    channelDetailMetrics,
    hostChangeRecords,
    dashboardStats
  };
};