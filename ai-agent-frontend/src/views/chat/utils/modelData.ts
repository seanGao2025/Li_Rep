import type { Algorithm, Business } from '../types/index'

// 算法数据（真实算法信息）
export const algorithmsData: Algorithm[] = [
  {
    id: 'power-flow-calculation',
    name: '潮流计算算法',
    description: '求解系统中各节点电压、电流与功率分布的基本算法。',
    tooltip: '求解系统中各节点电压、电流与功率分布的基本算法。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '基础计算'
  },
  {
    id: 'optimal-power-flow',
    name: '最优潮流算法',
    description: '在满足约束条件下最小化运行成本或损耗的潮流计算。',
    tooltip: '在满足约束条件下最小化运行成本或损耗的潮流计算。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '优化计算'
  },
  {
    id: 'economic-dispatch',
    name: '经济调度算法',
    description: '按发电成本优化发电机出力分配。',
    tooltip: '按发电成本优化发电机出力分配。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '经济调度'
  },
  {
    id: 'unit-commitment',
    name: '机组组合算法',
    description: '优化机组启停与出力计划以满足负荷需求。',
    tooltip: '优化机组启停与出力计划以满足负荷需求。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '机组优化'
  },
  {
    id: 'state-estimation',
    name: '状态估计算法',
    description: '根据实时量测数据估算系统当前状态。',
    tooltip: '根据实时量测数据估算系统当前状态。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '状态估计'
  },
  {
    id: 'load-forecasting',
    name: '负荷预测算法',
    description: '基于历史与环境数据预测未来负荷需求。',
    tooltip: '基于历史与环境数据预测未来负荷需求。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '预测'
  },
  {
    id: 'renewable-generation-forecasting',
    name: '可再生能源预测算法',
    description: '对风电、光伏出力进行短期或中长期预测。',
    tooltip: '对风电、光伏出力进行短期或中长期预测。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '预测'
  },
  {
    id: 'fault-diagnosis-algorithm',
    name: '故障诊断算法',
    description: '识别和定位电力系统中的故障元件。',
    tooltip: '识别和定位电力系统中的故障元件。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '故障诊断'
  },
  {
    id: 'contingency-analysis-algorithm',
    name: '事故仿真算法',
    description: '评估线路或设备停运后的系统安全性。',
    tooltip: '评估线路或设备停运后的系统安全性。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '安全分析'
  },
  {
    id: 'n1-security-check',
    name: 'N-1安全校核算法',
    description: '验证单一元件失效时系统是否仍满足运行条件。',
    tooltip: '验证单一元件失效时系统是否仍满足运行条件。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '安全分析'
  },
  {
    id: 'voltage-stability-analysis',
    name: '电压稳定性分析算法',
    description: '分析系统在不同运行点的电压稳定裕度。',
    tooltip: '分析系统在不同运行点的电压稳定裕度。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '稳定性分析'
  },
  {
    id: 'frequency-stability-analysis',
    name: '频率稳定性分析算法',
    description: '研究扰动下系统频率动态响应。',
    tooltip: '研究扰动下系统频率动态响应。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '稳定性分析'
  },
  {
    id: 'transient-stability-simulation',
    name: '暂态稳定仿真算法',
    description: '模拟扰动后系统电角度与功率振荡动态。',
    tooltip: '模拟扰动后系统电角度与功率振荡动态。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '暂态分析'
  },
  {
    id: 'small-signal-stability-analysis',
    name: '小扰动稳定分析算法',
    description: '用于分析系统在小扰动下的动态特性。',
    tooltip: '用于分析系统在小扰动下的动态特性。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '稳定性分析'
  },
  {
    id: 'power-system-restoration',
    name: '电网恢复算法',
    description: '指导停电后系统的逐步恢复与重构。',
    tooltip: '指导停电后系统的逐步恢复与重构。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '恢复控制'
  },
  {
    id: 'short-circuit-calculation',
    name: '短路计算算法',
    description: '计算短路电流与电压用于保护整定。',
    tooltip: '计算短路电流与电压用于保护整定。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '短路分析'
  },
  {
    id: 'optimal-reactive-power-dispatch',
    name: '无功优化算法',
    description: '调整电压、无功补偿设备以减少损耗。',
    tooltip: '调整电压、无功补偿设备以减少损耗。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '无功优化'
  },
  {
    id: 'network-reconfiguration',
    name: '网络重构算法',
    description: '优化配电网开关状态，提升供电可靠性与经济性。',
    tooltip: '优化配电网开关状态，提升供电可靠性与经济性。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '网络优化'
  },
  {
    id: 'load-shedding-optimization',
    name: '负荷切除优化算法',
    description: '在紧急情况下合理切负荷以保持系统稳定。',
    tooltip: '在紧急情况下合理切负荷以保持系统稳定。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '应急控制'
  },
  {
    id: 'automatic-generation-control',
    name: '自动发电控制算法',
    description: '维持系统频率与功率平衡。',
    tooltip: '维持系统频率与功率平衡。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '频率控制'
  },
  {
    id: 'distributed-energy-management',
    name: '分布式能源调度算法',
    description: '协调分布式发电与储能单元的运行。',
    tooltip: '协调分布式发电与储能单元的运行。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '分布式管理'
  },
  {
    id: 'virtual-power-plant-optimization',
    name: '虚拟电厂优化算法',
    description: '聚合多源多储系统实现统一调度与交易。',
    tooltip: '聚合多源多储系统实现统一调度与交易。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '虚拟电厂'
  },
  {
    id: 'energy-storage-scheduling',
    name: '储能调度算法',
    description: '优化储能充放电策略以平滑负荷或削峰填谷。',
    tooltip: '优化储能充放电策略以平滑负荷或削峰填谷。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '储能管理'
  },
  {
    id: 'demand-response-optimization',
    name: '需求响应优化算法',
    description: '激励用户在特定时段调整用电。',
    tooltip: '激励用户在特定时段调整用电。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '需求管理'
  },
  {
    id: 'microgrid-operation-optimization',
    name: '微电网运行优化算法',
    description: '实现孤岛与并网模式下的能量最优分配。',
    tooltip: '实现孤岛与并网模式下的能量最优分配。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '微电网'
  },
  {
    id: 'graph-search-network-path',
    name: '电网路径搜索算法',
    description: '用于拓扑识别与最短路径查找。',
    tooltip: '用于拓扑识别与最短路径查找。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '图算法'
  },
  {
    id: 'power-flow-sensitivity-analysis',
    name: '潮流灵敏度分析算法',
    description: '分析节点功率变化对系统状态的影响。',
    tooltip: '分析节点功率变化对系统状态的影响。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '灵敏度分析'
  },
  {
    id: 'constraint-satisfaction-solver',
    name: '约束求解算法',
    description: '解决多约束优化与调度问题。',
    tooltip: '解决多约束优化与调度问题。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '约束求解'
  },
  {
    id: 'multi-objective-optimization',
    name: '多目标优化算法',
    description: '同时平衡经济性、安全性、环保性等目标。',
    tooltip: '同时平衡经济性、安全性、环保性等目标。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '多目标优化'
  },
  {
    id: 'genetic-algorithm',
    name: '遗传算法',
    description: '用于机组组合、优化调度等复杂问题。',
    tooltip: '用于机组组合、优化调度等复杂问题。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '启发式优化'
  },
  {
    id: 'particle-swarm-optimization',
    name: '粒子群优化算法',
    description: '基于群体智能的启发式优化方法。',
    tooltip: '基于群体智能的启发式优化方法。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '启发式优化'
  },
  {
    id: 'differential-evolution',
    name: '差分进化算法',
    description: '一种高效的全局优化方法。',
    tooltip: '一种高效的全局优化方法。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '启发式优化'
  },
  {
    id: 'ant-colony-optimization',
    name: '蚁群算法',
    description: '用于网络路径优化、重构问题。',
    tooltip: '用于网络路径优化、重构问题。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '启发式优化'
  },
  {
    id: 'simulated-annealing',
    name: '模拟退火算法',
    description: '用于寻找全局最优的随机搜索方法。',
    tooltip: '用于寻找全局最优的随机搜索方法。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '启发式优化'
  },
  {
    id: 'reinforcement-learning',
    name: '强化学习算法',
    description: '通过交互学习最优调度或控制策略。',
    tooltip: '通过交互学习最优调度或控制策略。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '机器学习'
  },
  {
    id: 'deep-neural-network',
    name: '深度神经网络算法',
    description: '用于预测、分类与非线性拟合。',
    tooltip: '用于预测、分类与非线性拟合。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '深度学习'
  },
  {
    id: 'graph-neural-network',
    name: '图神经网络算法',
    description: '处理电网拓扑相关任务，如状态估计与潮流预测。',
    tooltip: '处理电网拓扑相关任务，如状态估计与潮流预测。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '图神经网络'
  },
  {
    id: 'lstm',
    name: '长短期记忆网络算法',
    description: '用于时间序列预测（如负荷、风光出力）。',
    tooltip: '用于时间序列预测（如负荷、风光出力）。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '深度学习'
  },
  {
    id: 'transformer',
    name: '变压器结构网络算法',
    description: '用于多步预测与序列学习。',
    tooltip: '用于多步预测与序列学习。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '深度学习'
  },
  {
    id: 'convolutional-neural-network',
    name: '卷积神经网络算法',
    description: '用于电网图像化数据或状态识别。',
    tooltip: '用于电网图像化数据或状态识别。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '深度学习'
  },
  {
    id: 'bayesian-optimization',
    name: '贝叶斯优化算法',
    description: '用于调参与复杂系统最优控制。',
    tooltip: '用于调参与复杂系统最优控制。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '贝叶斯优化'
  },
  {
    id: 'markov-decision-process',
    name: '马尔可夫决策算法',
    description: '模拟电网动态控制过程。',
    tooltip: '模拟电网动态控制过程。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '决策算法'
  },
  {
    id: 'model-predictive-control',
    name: '模型预测控制算法',
    description: '通过滚动优化实现动态最优控制。',
    tooltip: '通过滚动优化实现动态最优控制。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '预测控制'
  },
  {
    id: 'fuzzy-control',
    name: '模糊控制算法',
    description: '在非线性与不确定性场景中实现稳定控制。',
    tooltip: '在非线性与不确定性场景中实现稳定控制。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '模糊控制'
  },
  {
    id: 'hybrid-intelligent-optimization',
    name: '混合智能优化算法',
    description: '综合遗传、粒子群、模糊等多种算法优势。',
    tooltip: '综合遗传、粒子群、模糊等多种算法优势。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '混合算法'
  },
  {
    id: 'topology-identification',
    name: '拓扑识别算法',
    description: '自动识别系统连接关系与状态。',
    tooltip: '自动识别系统连接关系与状态。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '拓扑分析'
  },
  {
    id: 'event-driven-dispatch',
    name: '事件驱动调度算法',
    description: '根据实时事件触发自动控制与优化。',
    tooltip: '根据实时事件触发自动控制与优化。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '事件驱动'
  },
  {
    id: 'constraint-programming',
    name: '约束规划算法',
    description: '在复杂调度中实现快速可行解搜索。',
    tooltip: '在复杂调度中实现快速可行解搜索。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '约束规划'
  },
  {
    id: 'graph-based-fault-localization',
    name: '基于图的故障定位算法',
    description: '利用网络结构推断故障节点。',
    tooltip: '利用网络结构推断故障节点。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '故障定位'
  },
  {
    id: 'data-driven-anomaly-detection',
    name: '数据驱动异常检测算法',
    description: '检测传感器、通讯或运行异常行为。',
    tooltip: '检测传感器、通讯或运行异常行为。',
    status: 'available',
    imported: true,
    type: 'algorithm',
    category: '异常检测'
  }
]

// 业务逻辑数据（根据用户提供的分类重新组织）
export const businessLogicsData: Business[] = [
  // 电网调度类
  {
    id: 'power-flow-calculation',
    name: '潮流计算逻辑',
    description: '根据节点功率平衡方程计算系统电压与线路潮流，是系统状态分析的基础逻辑。',
    tooltip: '根据节点功率平衡方程计算系统电压与线路潮流，是系统状态分析的基础逻辑。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网调度类'
  },
  {
    id: 'short-circuit-analysis',
    name: '短路计算逻辑',
    description: '分析系统发生三相或单相短路时的故障电流分布，用于继电保护和设备定值。',
    tooltip: '分析系统发生三相或单相短路时的故障电流分布，用于继电保护和设备定值。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网调度类'
  },
  {
    id: 'contingency-analysis',
    name: 'N-1安全校核逻辑',
    description: '模拟设备退出运行情形，判断系统是否满足安全约束。',
    tooltip: '模拟设备退出运行情形，判断系统是否满足安全约束。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网调度类'
  },
  {
    id: 'unit-commitment',
    name: '机组组合逻辑',
    description: '确定发电机启停计划以满足负荷需求并最小化运行成本。',
    tooltip: '确定发电机启停计划以满足负荷需求并最小化运行成本。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网调度类'
  },
  {
    id: 'optimal-power-flow',
    name: '最优潮流逻辑',
    description: '在潮流方程约束下优化目标函数（如成本、损耗、排放）。',
    tooltip: '在潮流方程约束下优化目标函数（如成本、损耗、排放）。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网调度类'
  },
  {
    id: 'vq-optimization',
    name: '无功优化与电压控制逻辑',
    description: '调节无功源、分接头等维持电压合格并降低网损。',
    tooltip: '调节无功源、分接头等维持电压合格并降低网损。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网调度类'
  },

  // 电网运行监控类
  {
    id: 'state-estimation',
    name: '状态估计逻辑',
    description: '通过加权最小二乘或卡尔曼滤波，从监测量中推算系统真实状态。',
    tooltip: '通过加权最小二乘或卡尔曼滤波，从监测量中推算系统真实状态。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网运行监控类'
  },
  {
    id: 'alarm-classification',
    name: '告警识别与分级逻辑',
    description: '对监控告警进行识别、分级、过滤与聚类。',
    tooltip: '对监控告警进行识别、分级、过滤与聚类。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网运行监控类'
  },
  {
    id: 'constraint-violation-check',
    name: '潮流越限检测逻辑',
    description: '实时检测运行指标越限并触发保护动作。',
    tooltip: '实时检测运行指标越限并触发保护动作。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网运行监控类'
  },
  {
    id: 'dispatch-validation',
    name: '调度指令执行校核逻辑',
    description: '对调度指令进行一致性、可行性、安全性校核。',
    tooltip: '对调度指令进行一致性、可行性、安全性校核。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网运行监控类'
  },
  {
    id: 'trend-forecasting',
    name: '运行趋势预测逻辑',
    description: '预测电压、潮流、频率趋势，用于预防性控制。',
    tooltip: '预测电压、潮流、频率趋势，用于预防性控制。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网运行监控类'
  },

  // 源网荷储协调控制类
  {
    id: 'storage-scheduling',
    name: '储能调度逻辑',
    description: '优化储能充放电时序，实现削峰填谷或经济运行。',
    tooltip: '优化储能充放电时序，实现削峰填谷或经济运行。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '源网荷储协调控制类'
  },
  {
    id: 'vpp-coordination',
    name: '虚拟电厂协调逻辑',
    description: '汇聚分布式电源、负荷与储能统一调度。',
    tooltip: '汇聚分布式电源、负荷与储能统一调度。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '源网荷储协调控制类'
  },
  {
    id: 'demand-response-control',
    name: '负荷响应逻辑',
    description: '根据电价或调度信号调整用电行为。',
    tooltip: '根据电价或调度信号调整用电行为。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '源网荷储协调控制类'
  },
  {
    id: 'res-forecast',
    name: '新能源出力预测与控制逻辑',
    description: '预测风光出力并动态调整限发策略。',
    tooltip: '预测风光出力并动态调整限发策略。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '源网荷储协调控制类'
  },
  {
    id: 'integrated-energy-optimization',
    name: '多能协同优化逻辑',
    description: '协调电、热、冷、气多能系统的供需关系。',
    tooltip: '协调电、热、冷、气多能系统的供需关系。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '源网荷储协调控制类'
  },

  // 电网规划与评估类
  {
    id: 'grid-topology-planning',
    name: '网架规划逻辑',
    description: '依据负荷增长与可靠性优化网架结构。',
    tooltip: '依据负荷增长与可靠性优化网架结构。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网规划与评估类'
  },
  {
    id: 'equipment-sizing',
    name: '设备容量配置逻辑',
    description: '确定变压器、储能等容量配置以满足运行需求。',
    tooltip: '确定变压器、储能等容量配置以满足运行需求。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网规划与评估类'
  },
  {
    id: 'load-forecast-scenario',
    name: '负荷预测与情景分析逻辑',
    description: '构建多情景负荷预测用于规划与决策。',
    tooltip: '构建多情景负荷预测用于规划与决策。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网规划与评估类'
  },
  {
    id: 'voltage-stability-assessment',
    name: '电压稳定性分析逻辑',
    description: '计算PV/QV曲线评估电压稳定裕度。',
    tooltip: '计算PV/QV曲线评估电压稳定裕度。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网规划与评估类'
  },
  {
    id: 'reliability-evaluation',
    name: '供电可靠性评估逻辑',
    description: '计算SAIDI/SAIFI指标评估供电可靠度。',
    tooltip: '计算SAIDI/SAIFI指标评估供电可靠度。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电网规划与评估类'
  },

  // 电力市场与经济运行类
  {
    id: 'market-clearing',
    name: '市场出清逻辑',
    description: '确定市场成交电量与边际电价。',
    tooltip: '确定市场成交电量与边际电价。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电力市场与经济运行类'
  },
  {
    id: 'price-forecasting',
    name: '电价预测逻辑',
    description: '预测日前/实时电价变化趋势。',
    tooltip: '预测日前/实时电价变化趋势。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电力市场与经济运行类'
  },
  {
    id: 'bidding-strategy-optimization',
    name: '竞价策略优化逻辑',
    description: '模拟发电商竞价行为以最大化收益。',
    tooltip: '模拟发电商竞价行为以最大化收益。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电力市场与经济运行类'
  },
  {
    id: 'carbon-market-settlement',
    name: '碳市场与排放结算逻辑',
    description: '计算碳排放、碳配额与交易结算。',
    tooltip: '计算碳排放、碳配额与交易结算。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '电力市场与经济运行类'
  },

  // 智能诊断与专家推理类
  {
    id: 'fault-diagnosis',
    name: '设备故障诊断逻辑',
    description: '判断故障类型与位置，辅助抢修。',
    tooltip: '判断故障类型与位置，辅助抢修。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '智能诊断与专家推理类'
  },
  {
    id: 'expert-system-reasoning',
    name: '专家规则推理逻辑',
    description: '基于专家知识库进行条件推理。',
    tooltip: '基于专家知识库进行条件推理。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '智能诊断与专家推理类'
  },
  {
    id: 'self-healing-control',
    name: '自愈控制逻辑',
    description: '自动识别异常并重构网络实现自愈运行。',
    tooltip: '自动识别异常并重构网络实现自愈运行。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '智能诊断与专家推理类'
  },
  {
    id: 'risk-assessment',
    name: '风险评估逻辑',
    description: '量化运行或设备风险等级。',
    tooltip: '量化运行或设备风险等级。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '智能诊断与专家推理类'
  },

  // 数据与模型管理类
  {
    id: 'model-consistency-check',
    name: '模型一致性校核逻辑',
    description: '校验SCADA、CIM、EMS模型一致性。',
    tooltip: '校验SCADA、CIM、EMS模型一致性。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '数据与模型管理类'
  },
  {
    id: 'master-data-sync',
    name: '主数据同步逻辑',
    description: '维护设备、线路主数据同步与版本控制。',
    tooltip: '维护设备、线路主数据同步与版本控制。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '数据与模型管理类'
  },
  {
    id: 'data-quality-monitoring',
    name: '数据质量监测逻辑',
    description: '监测数据缺失、异常、越界问题。',
    tooltip: '监测数据缺失、异常、越界问题。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '数据与模型管理类'
  },
  {
    id: 'power-kg-updating',
    name: '知识图谱更新逻辑',
    description: '自动更新知识图谱中的设备与关系信息。',
    tooltip: '自动更新知识图谱中的设备与关系信息。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '数据与模型管理类'
  },

  // 安全与应急类
  {
    id: 'emergency-dispatch',
    name: '应急调度逻辑',
    description: '事故时快速重构运行方案保障系统稳定。',
    tooltip: '事故时快速重构运行方案保障系统稳定。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '安全与应急类'
  },
  {
    id: 'load-shedding-islanding',
    name: '负荷切除与分区逻辑',
    description: '根据异常执行负荷切除或孤岛划分。',
    tooltip: '根据异常执行负荷切除或孤岛划分。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '安全与应急类'
  },
  {
    id: 'cyber-security-control',
    name: '网络安全防护逻辑',
    description: '监测网络攻击与数据篡改，保障安全。',
    tooltip: '监测网络攻击与数据篡改，保障安全。',
    status: 'available',
    imported: true,
    type: 'business',
    category: '安全与应急类'
  }
]

// 业务逻辑分类列表
export const businessLogicCategoriesList = [
  '电网调度类',
  '电网运行监控类',
  '源网荷储协调控制类',
  '电网规划与评估类',
  '电力市场与经济运行类',
  '智能诊断与专家推理类',
  '数据与模型管理类',
  '安全与应急类'
]

// 根据业务逻辑数据计算分类
export function getBusinessLogicCategories(businessLogics: Business[]) {
  return businessLogicCategoriesList.map(categoryName => ({
    name: categoryName,
    items: businessLogics.filter(b => b.category === categoryName)
  }))
}

