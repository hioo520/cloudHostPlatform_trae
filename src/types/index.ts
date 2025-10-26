// 云主机信息表接口
export interface CloudHostInfo {
  云主机厂商: string;
  区域: string;
  云主机IP: string;
  处理器: number;
  内存: number;
  磁盘: number;
  带宽: number;
  系统: string;
  上线时间: string;
  负责人: string;
  使用部门: string;
  共享部门: string;
  启用状态: number; // 1：启用，2：逻辑删除
  管理状态: number; // 1：正常，2：低利用率，3：可申请（公共池）
  设备状态: number; // 1：正常，2：指标缺失，3：负载异常
}

// 低效云主机表接口
export interface InefficientHost {
  云主机IP: string;
  采样时间: string;
  CPU使用率周: string;
  内存使用率周: string;
  磁盘使用率周: string;
  网络读入速率周: number;
  网络写入速率周: number;
  CPU使用率月: string;
  内存使用率月: string;
  磁盘使用率月: string;
  网络读入速率月: number;
  网络写入速率月: number;
}

// 云主机维度指标表接口
export interface HostMetric {
  云主机IP: string;
  采样时间: string;
  CPU使用率: string;
  内存使用率: string;
  磁盘使用率: string;
  网络读入速率: number;
  网络写入速率: number;
  进程数: number;
  任务数: number;
  运行进程: string;
}

// 通道维度指标汇总表接口
export interface ChannelSummaryMetric {
  ID: string;
  通道名: string;
  任务类型: string; // LIST,DATA,DETAIL
  采样时间: string;
  任务数: number;
  成功任务数: number;
  失败任务数: number;
  空任务数: number;
  消重任务数: number;
}

// 通道维度指标详细表接口
export interface ChannelDetailMetric {
  parentId: string;
  业务名: string;
  云主机IP: string;
  采样时间: string;
  任务数: number;
  成功任务数: number;
  失败任务数: number;
  空任务数: number;
  消重任务数: number;
}

// 云主机变更记录表接口
export interface HostChangeRecord {
  采样时间: string;
  云主机IP: string;
  操作类型: number; // 1：管理状态，2：设备状态
  操作人: string;
  原始值: string;
  新值: string;
  备注: string;
}

// 首页统计数据接口
export interface DashboardStats {
  totalHosts: number;
  publicPoolCount: number;
  windowsCount: number;
  linuxCount: number;
  onlineCount: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  abnormalCount: {
    highCpu: number;
    highMemory: number;
    highDisk: number;
    offline: number;
  };
}