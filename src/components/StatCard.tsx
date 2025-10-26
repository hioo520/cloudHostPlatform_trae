import React from 'react';
import { Card, Statistic, Row, Col, Progress } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  trendText?: string;
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon,
  color,
  trend,
  trendText,
  progress 
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <ArrowUpOutlined style={{ color: '#f5222d' }} />;
      case 'down':
        return <ArrowDownOutlined style={{ color: '#52c41a' }} />;
      default:
        return null;
    }
  };

  return (
    <Card size="small" className="stat-card" style={{ height: '100%' }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontWeight: 500, fontSize: 14, color: '#666' }}>{title}</span>
        {icon && <span style={{ marginLeft: 8 }}>{icon}</span>}
      </div>
      <Row align="middle">
        <Col flex="1">
          <Statistic 
            value={value} 
            valueStyle={{ fontSize: 20, fontWeight: 'bold', color: color || '#000' }}
            suffix={trendText && (
              <span style={{ fontSize: 12, marginLeft: 4, color: '#999' }}>
                {getTrendIcon()}
                {trendText}
              </span>
            )}
          />
        </Col>
      </Row>
      {progress !== undefined && (
        <div style={{ marginTop: 8 }}>
          <Progress 
            percent={progress} 
            size="small" 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
      )}
    </Card>
  );
};

export default StatCard;