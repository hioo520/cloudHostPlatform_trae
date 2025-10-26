import { initMockData } from '../mock/dataGenerator';
import type { CloudHostInfo, InefficientHost, HostMetric, ChannelSummaryMetric, ChannelDetailMetric, HostChangeRecord, DashboardStats } from '../types';

// 初始化mock数据
const mockData = initMockData();

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 首页统计数据
export const getDashboardStats = async (): Promise<DashboardStats> => {
  await delay(300);
  return mockData.dashboardStats;
};

// 获取云主机列表
export const getCloudHostList = async (params?: {
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
  searchText?: string;
}): Promise<{ list: CloudHostInfo[]; total: number }> => {
  await delay(500);
  
  let filteredList = [...mockData.hosts];
  
  // 搜索过滤
  if (params?.searchText) {
    const searchLower = params.searchText.toLowerCase();
    filteredList = filteredList.filter(host => 
      host.云主机IP.toLowerCase().includes(searchLower) ||
      host.负责人.toLowerCase().includes(searchLower) ||
      host.使用部门.toLowerCase().includes(searchLower) ||
      host.系统.toLowerCase().includes(searchLower)
    );
  }
  
  // 条件过滤
  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filteredList = filteredList.filter(host => host[key as keyof CloudHostInfo] === value);
      }
    });
  }
  
  // 分页
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedList = filteredList.slice(startIndex, endIndex);
  
  return {
    list: paginatedList,
    total: filteredList.length
  };
};

// 添加云主机
export const addCloudHost = async (host: Omit<CloudHostInfo, '云主机IP'>): Promise<CloudHostInfo> => {
  await delay(500);
  const newHost: CloudHostInfo = {
    ...host,
    云主机IP: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  };
  mockData.hosts.unshift(newHost);
  return newHost;
};

// 更新云主机
export const updateCloudHost = async (ip: string, updates: Partial<CloudHostInfo>): Promise<CloudHostInfo> => {
  await delay(500);
  const index = mockData.hosts.findIndex(h => h.云主机IP === ip);
  if (index !== -1) {
    mockData.hosts[index] = { ...mockData.hosts[index], ...updates };
    return mockData.hosts[index];
  }
  throw new Error('云主机不存在');
};

// 删除云主机
export const deleteCloudHost = async (ip: string): Promise<boolean> => {
  await delay(300);
  const index = mockData.hosts.findIndex(h => h.云主机IP === ip);
  if (index !== -1) {
    mockData.hosts[index].启用状态 = 2; // 逻辑删除
    return true;
  }
  throw new Error('云主机不存在');
};

// 获取云主机变更记录
export const getHostChangeRecords = async (params?: {
  page?: number;
  pageSize?: number;
  hostIp?: string;
  startTime?: string;
  endTime?: string;
  searchText?: string;
}): Promise<{ list: HostChangeRecord[]; total: number }> => {
  await delay(500);
  
  let filteredList = [...mockData.hostChangeRecords];
  
  // 过滤
  if (params?.hostIp) {
    filteredList = filteredList.filter(record => record.云主机IP === params.hostIp);
  }
  
  if (params?.startTime) {
    filteredList = filteredList.filter(record => new Date(record.采样时间) >= new Date(params.startTime!));
  }
  
  if (params?.endTime) {
    filteredList = filteredList.filter(record => new Date(record.采样时间) <= new Date(params.endTime!));
  }
  
  if (params?.searchText) {
    const searchLower = params.searchText.toLowerCase();
    filteredList = filteredList.filter(record => 
      record.操作人.toLowerCase().includes(searchLower) ||
      record.备注.toLowerCase().includes(searchLower)
    );
  }
  
  // 分页
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    list: filteredList.slice(startIndex, endIndex),
    total: filteredList.length
  };
};

// 获取低效云主机列表
export const getInefficientHosts = async (params?: {
  page?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
  searchText?: string;
}): Promise<{ list: InefficientHost[]; total: number }> => {
  await delay(500);
  
  let filteredList = [...mockData.inefficientHosts];
  
  // 时间过滤
  if (params?.startTime) {
    filteredList = filteredList.filter(host => new Date(host.采样时间) >= new Date(params.startTime!));
  }
  
  if (params?.endTime) {
    filteredList = filteredList.filter(host => new Date(host.采样时间) <= new Date(params.endTime!));
  }
  
  if (params?.searchText) {
    filteredList = filteredList.filter(host => host.云主机IP.includes(params.searchText!));
  }
  
  // 分页
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    list: filteredList.slice(startIndex, endIndex),
    total: filteredList.length
  };
};

// 获取公共池云主机
export const getPublicPoolHosts = async (params?: {
  page?: number;
  pageSize?: number;
  searchText?: string;
}): Promise<{ list: CloudHostInfo[]; total: number }> => {
  await delay(500);
  
  let filteredList = mockData.hosts.filter(h => h.管理状态 === 3);
  
  if (params?.searchText) {
    const searchLower = params.searchText.toLowerCase();
    filteredList = filteredList.filter(host => 
      host.云主机IP.toLowerCase().includes(searchLower) ||
      host.系统.toLowerCase().includes(searchLower) ||
      host.区域.toLowerCase().includes(searchLower)
    );
  }
  
  // 分页
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    list: filteredList.slice(startIndex, endIndex),
    total: filteredList.length
  };
};

// 获取云主机维度指标
export const getHostMetrics = async (params: { page: number; pageSize: number; hostIp?: string; startTime?: string; endTime?: string; searchText?: string }): Promise<{ list: HostMetric[]; total: number }> => {
  await delay(500);
  
  let filteredList = mockData.hostMetrics;
  
  // 根据IP过滤
  if (params.hostIp) {
    filteredList = filteredList.filter(metric => metric.云主机IP === params.hostIp);
  }
  
  // 根据searchText过滤
  if (params.searchText) {
    filteredList = filteredList.filter(metric => metric.云主机IP.includes(params.searchText as string));
  }
  
  // 时间过滤
  if (params?.startTime) {
    filteredList = filteredList.filter(metric => new Date(metric.采样时间) >= new Date(params.startTime!));
  }
  
  if (params?.endTime) {
    filteredList = filteredList.filter(metric => new Date(metric.采样时间) <= new Date(params.endTime!));
  }
  
  // 分页
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    list: filteredList.slice(startIndex, endIndex),
    total: filteredList.length
  };
};

// 多维指标查询
export const getMultiDimensionMetrics = async (params: {
  page: number;
  pageSize: number;
  hostIp?: string;
  startTime?: string;
  endTime?: string;
  searchText?: string;
}): Promise<{ list: HostMetric[]; total: number }> => {
  await delay(300);
  let metrics = mockData.hostMetrics;
  
  // 筛选
  if (params.hostIp) {
    metrics = metrics.filter(m => m.云主机IP === params.hostIp);
  }
  if (params.searchText) {
      metrics = metrics.filter(m => m.云主机IP.includes(params.searchText!));
    }
  
  // 分页
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  
  return {
    list: metrics.slice(start, end),
    total: metrics.length
  };
};

// 从公共池申请主机
export const applyHostFromPool = async (hostIp: string, applyInfo: {
  负责人: string;
  使用部门: string;
  用途: string;
}): Promise<void> => {
  await delay(300);
  const host = mockData.hosts.find(h => h.云主机IP === hostIp && h.管理状态 === 3);
  if (host) {
    host.管理状态 = 1;
    host.负责人 = applyInfo.负责人;
    host.使用部门 = applyInfo.使用部门;
    // 云主机信息中没有用途字段，这里注释掉
  } else {
    throw new Error('主机不存在或不在公共池中');
  }
};

// 获取通道维度指标汇总
export const getChannelSummaryMetrics = async (params?: {
  page?: number;
  pageSize?: number;
  channelName?: string;
  taskType?: string;
  startTime?: string;
  endTime?: string;
}): Promise<{ list: ChannelSummaryMetric[]; total: number }> => {
  await delay(500);
  
  let filteredList = [...mockData.channelSummaryMetrics];
  
  if (params?.channelName) {
    filteredList = filteredList.filter(metric => metric.通道名.includes(params.channelName!));
  }
  
  if (params?.taskType) {
    filteredList = filteredList.filter(metric => metric.任务类型 === params.taskType);
  }
  
  if (params?.startTime) {
    filteredList = filteredList.filter(metric => new Date(metric.采样时间) >= new Date(params.startTime!));
  }
  
  if (params?.endTime) {
    filteredList = filteredList.filter(metric => new Date(metric.采样时间) <= new Date(params.endTime!));
  }
  
  // 分页
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    list: filteredList.slice(startIndex, endIndex),
    total: filteredList.length
  };
};

// 获取通道维度指标详情
export const getChannelDetailMetrics = async (parentId: string): Promise<ChannelDetailMetric[]> => {
  await delay(300);
  return mockData.channelDetailMetrics.filter(metric => metric.parentId === parentId);
};

// 恢复主机状态
export const restoreHostStatus = async (hostIp: string): Promise<void> => {
  await delay(300);
  const host = mockData.hosts.find(h => h.云主机IP === hostIp);
  if (host) {
    host.管理状态 = 1;
    host.设备状态 = 1;
  }
};