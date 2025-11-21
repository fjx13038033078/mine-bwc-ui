/**
 * 铜矿AI安全监控系统 - 全局数据管理Store
 * 实现各模块数据共享和业务关联
 */

import { defineStore } from 'pinia';
import { AI_SKILLS } from '@/utils/copper-mine-constants';
import { formatDateTime } from '@/utils/copper-mine-utils';

// ==================== 数据接口定义 ====================

// 设备信息
export interface DeviceVO {
  deviceId: string;
  userNumber: string;
  unitNumber: string;
  serialNumber: string;
  model: string;
  department: string;
  principal: string;
  status: 'online' | 'offline' | 'maintenance' | 'fault';
  videoCount: number;
  violationCount: number;
  configuredSkills: string[]; // 已配置的技能ID列表
  remark: string;
  createTime: string;
  updateTime: string;
}

// AI技能信息
export interface AISkillVO {
  skillId: string;
  skillName: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  status: 'enabled' | 'disabled';
  workTypes: string[];
  deviceUsageCount: number;
  detectionCount: number;
  violationCount: number;
  hasPromptConfig: boolean; // 是否已配置提示词
  createTime: string;
  updateTime: string;
}

// 提示词配置
export interface PromptConfigVO {
  promptId: string;
  skillId: string;
  systemPrompt: string;
  userPrompt: string;
  currentVersion: string;
  versionCount: number;
  description?: string;
  updateTime: string;
}

// 视频信息
export interface VideoVO {
  videoId: string;
  deviceId: string;
  userNumber: string;
  principal: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  captureTime: string;
  uploadTime: string;
  aiStatus: 'pending' | 'processing' | 'completed' | 'failed';
  detectedSkills: string[]; // 检测使用的技能ID列表
  violationCount: number;
  violations: ViolationResult[];
}

// 违规识别结果
export interface ViolationResult {
  resultId: string;
  videoId: string;
  skillId: string;
  skillName: string;
  violationType: string;
  timestamp: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  regulationId?: string; // 关联的规范ID
  knowledgeId?: string; // 关联的处理知识ID
  handled: boolean; // 是否已处理
  handleTime?: string;
  handler?: string;
}

// 安全规范
export interface RegulationVO {
  regulationId: string;
  workType: string;
  standards: string;
  violations: string;
  relatedSkills: string[]; // 关联的技能ID
  referenceCount: number; // 被引用次数
  remark?: string;
  createTime: string;
  updateTime: string;
}

// 违规处理知识
export interface HandlingKnowledgeVO {
  knowledgeId: string;
  violationName: string;
  severity: string;
  immediateAction: string;
  penalty: string;
  rectification: string;
  prevention: string;
  relatedSkills: string[]; // 关联的技能ID
  usageCount: number; // 使用次数
  effectRating: number; // 效果评分(1-5)
  createTime: string;
  updateTime: string;
}

// ==================== Store定义 ====================

export const useCopperMineStore = defineStore('copperMine', {
  state: () => ({
    // 设备数据
    devices: [] as DeviceVO[],
    
    // AI技能数据
    aiSkills: [] as AISkillVO[],
    
    // 提示词配置数据
    promptConfigs: [] as PromptConfigVO[],
    
    // 视频数据
    videos: [] as VideoVO[],
    
    // 违规结果数据
    violations: [] as ViolationResult[],
    
    // 安全规范数据
    regulations: [] as RegulationVO[],
    
    // 违规处理知识数据
    handlingKnowledge: [] as HandlingKnowledgeVO[]
  }),

  getters: {
    // ==================== 设备相关 ====================
    
    // 获取在线设备列表
    onlineDevices: (state) => {
      return state.devices.filter(d => d.status === 'online');
    },
    
    // 获取设备总数
    deviceCount: (state) => state.devices.length,
    
    // 根据ID获取设备
    getDeviceById: (state) => (deviceId: string) => {
      return state.devices.find(d => d.deviceId === deviceId);
    },
    
    // 获取设备配置的技能列表
    getDeviceSkills: (state) => (deviceId: string) => {
      const device = state.devices.find(d => d.deviceId === deviceId);
      if (!device) return [];
      return state.aiSkills.filter(s => device.configuredSkills.includes(s.skillId));
    },
    
    // ==================== AI技能相关 ====================
    
    // 获取已启用的技能列表
    enabledSkills: (state) => {
      return state.aiSkills.filter(s => s.status === 'enabled');
    },
    
    // 根据ID获取技能
    getSkillById: (state) => (skillId: string) => {
      return state.aiSkills.find(s => s.skillId === skillId);
    },
    
    // 获取技能使用的设备列表
    getSkillDevices: (state) => (skillId: string) => {
      return state.devices.filter(d => d.configuredSkills.includes(skillId));
    },
    
    // ==================== 提示词相关 ====================
    
    // 根据技能ID获取提示词配置
    getPromptBySkillId: (state) => (skillId: string) => {
      return state.promptConfigs.find(p => p.skillId === skillId);
    },
    
    // ==================== 视频相关 ====================
    
    // 获取设备的视频列表
    getDeviceVideos: (state) => (deviceId: string) => {
      return state.videos.filter(v => v.deviceId === deviceId);
    },
    
    // 获取视频的违规结果
    getVideoViolations: (state) => (videoId: string) => {
      return state.violations.filter(v => v.videoId === videoId);
    },
    
    // 获取待处理的违规
    pendingViolations: (state) => {
      return state.violations.filter(v => !v.handled);
    },
    
    // ==================== 规范相关 ====================
    
    // 根据作业类型获取规范
    getRegulationsByWorkType: (state) => (workType: string) => {
      return state.regulations.filter(r => r.workType === workType);
    },
    
    // 根据技能ID获取关联规范
    getRegulationsBySkill: (state) => (skillId: string) => {
      return state.regulations.filter(r => r.relatedSkills.includes(skillId));
    },
    
    // ==================== 知识库相关 ====================
    
    // 根据违规类型获取处理知识
    getKnowledgeByViolationType: (state) => (violationType: string) => {
      return state.handlingKnowledge.find(k => k.violationName === violationType);
    },
    
    // 根据技能ID获取关联知识
    getKnowledgeBySkill: (state) => (skillId: string) => {
      return state.handlingKnowledge.filter(k => k.relatedSkills.includes(skillId));
    },
    
    // ==================== 统计分析 ====================
    
    // 总体统计
    overallStats: (state) => {
      return {
        deviceCount: state.devices.length,
        onlineDeviceCount: state.devices.filter(d => d.status === 'online').length,
        enabledSkillCount: state.aiSkills.filter(s => s.status === 'enabled').length,
        totalVideoCount: state.videos.length,
        totalViolationCount: state.violations.length,
        pendingViolationCount: state.violations.filter(v => !v.handled).length,
        regulationCount: state.regulations.length,
        knowledgeCount: state.handlingKnowledge.length
      };
    },
    
    // 按部门统计违规
    violationsByDepartment: (state) => {
      const stats: Record<string, number> = {};
      state.violations.forEach(v => {
        const video = state.videos.find(vid => vid.videoId === v.videoId);
        if (video) {
          const device = state.devices.find(d => d.deviceId === video.deviceId);
          if (device) {
            stats[device.department] = (stats[device.department] || 0) + 1;
          }
        }
      });
      return stats;
    },
    
    // 按技能统计识别效果
    detectionStatsBySkill: (state) => {
      const stats: Record<string, { detectionCount: number; violationCount: number; accuracy: number }> = {};
      state.aiSkills.forEach(skill => {
        const violations = state.violations.filter(v => v.skillId === skill.skillId);
        stats[skill.skillId] = {
          detectionCount: skill.detectionCount,
          violationCount: violations.length,
          accuracy: violations.length > 0 ? violations.filter(v => v.confidence >= 0.8).length / violations.length : 0
        };
      });
      return stats;
    }
  },

  actions: {
    // ==================== 初始化数据 ====================
    
    initializeData() {
      // 初始化AI技能数据
      this.aiSkills = AI_SKILLS.map((skill, index) => ({
        skillId: skill.id,
        skillName: skill.name,
        description: skill.description,
        category: skill.category,
        icon: skill.icon,
        color: skill.color,
        status: index < 6 ? 'enabled' : 'disabled',
        workTypes: skill.workTypes,
        deviceUsageCount: 0,
        detectionCount: 0,
        violationCount: 0,
        hasPromptConfig: index < 4,
        createTime: '2024-01-10 09:00:00',
        updateTime: formatDateTime()
      }));
      
      // 初始化设备数据（20台设备）
      this.initDevices();
      
      // 初始化视频数据
      this.initVideos();
      
      // 初始化违规数据
      this.initViolations();
      
      // 初始化规范数据
      this.initRegulations();
      
      // 初始化知识库数据
      this.initHandlingKnowledge();
      
      // 更新关联统计
      this.updateStatistics();
    },
    
    // 初始化设备
    initDevices() {
      const departments = ['采矿部', '安全部', '技术部', '设备部', '机电部'];
      const principals = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'];
      
      for (let i = 1; i <= 20; i++) {
        const enabledSkills = this.aiSkills.filter(s => s.status === 'enabled').slice(0, Math.floor(Math.random() * 4) + 2);
        this.devices.push({
          deviceId: `DEV${String(i).padStart(3, '0')}`,
          userNumber: `USER${String(i).padStart(3, '0')}`,
          unitNumber: `UNIT${String((i % 5) + 1).padStart(3, '0')}`,
          serialNumber: `SN2024${String(i).padStart(3, '0')}`,
          model: `AI-CAM-V${(i % 3) + 1}`,
          department: departments[i % departments.length],
          principal: principals[i % principals.length],
          status: i === 6 || i === 10 ? 'offline' : i === 4 || i === 15 ? 'maintenance' : 'online',
          videoCount: 0,
          violationCount: 0,
          configuredSkills: enabledSkills.map(s => s.skillId),
          remark: `${departments[i % departments.length]}监控设备`,
          createTime: '2024-01-15 08:30:00',
          updateTime: formatDateTime()
        });
      }
    },
    
    // 初始化视频
    initVideos() {
      // 为每个在线设备生成5-10个视频
      this.devices.filter(d => d.status === 'online').forEach(device => {
        const videoCount = Math.floor(Math.random() * 6) + 5;
        for (let i = 0; i < videoCount; i++) {
          const videoId = `VID_${device.deviceId}_${String(i + 1).padStart(3, '0')}`;
          const hasViolation = Math.random() > 0.4; // 60%概率有违规
          
          this.videos.push({
            videoId,
            deviceId: device.deviceId,
            userNumber: device.userNumber,
            principal: device.principal,
            videoUrl: '/assets/video/202111230846.mov',
            thumbnail: '/assets/images/video-thumb.jpg',
            duration: `00:0${Math.floor(Math.random() * 5) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            captureTime: this.generateRandomTime(),
            uploadTime: this.generateRandomTime(),
            aiStatus: 'completed',
            detectedSkills: device.configuredSkills,
            violationCount: hasViolation ? Math.floor(Math.random() * 3) + 1 : 0,
            violations: []
          });
        }
      });
    },
    
    // 初始化违规数据
    initViolations() {
      const violationTypes = [
        '未佩戴安全帽', '未系安全带', '未穿防护服', '违章操作设备',
        '气瓶混放', '乙炔瓶平放', '吊装手扶', '高处抛物',
        '无监护人', '通风不良', '未配灭火器', '未验电'
      ];
      
      this.videos.forEach(video => {
        if (video.violationCount > 0) {
          for (let i = 0; i < video.violationCount; i++) {
            const skill = this.aiSkills.find(s => video.detectedSkills.includes(s.skillId));
            if (skill) {
              const violationType = violationTypes[Math.floor(Math.random() * violationTypes.length)];
              const violation: ViolationResult = {
                resultId: `VR_${video.videoId}_${i + 1}`,
                videoId: video.videoId,
                skillId: skill.skillId,
                skillName: skill.skillName,
                violationType,
                timestamp: `00:0${Math.floor(Math.random() * 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                confidence: 0.75 + Math.random() * 0.25,
                severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
                description: `检测到${violationType}，位于画面${['左侧', '右侧', '中央'][Math.floor(Math.random() * 3)]}`,
                regulationId: `REG${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
                knowledgeId: `KNW${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
                handled: Math.random() > 0.3,
                handleTime: Math.random() > 0.3 ? this.generateRandomTime() : undefined,
                handler: Math.random() > 0.3 ? ['张三', '李四', '王五'][Math.floor(Math.random() * 3)] : undefined
              };
              this.violations.push(violation);
              video.violations.push(violation);
            }
          }
        }
      });
    },
    
    // 初始化规范
    initRegulations() {
      const workTypes = ['焊割作业', '吊装作业', '高处作业', '受限空间作业', '动火作业', '电气作业', '通用作业'];
      
      workTypes.forEach((workType, index) => {
        const relatedSkills = this.aiSkills.filter(s => s.workTypes.includes(workType)).map(s => s.skillId);
        this.regulations.push({
          regulationId: `REG${String(index + 1).padStart(3, '0')}`,
          workType,
          standards: '作业人员必须佩戴安全帽、安全带；作业前必须进行安全检查；作业区域必须设置警示标志',
          violations: '未佩戴安全帽；未系安全带；无安全检查记录；无警示标志',
          relatedSkills,
          referenceCount: 0,
          createTime: '2024-01-10 09:00:00',
          updateTime: formatDateTime()
        });
      });
    },
    
    // 初始化处理知识
    initHandlingKnowledge() {
      const violations = [
        { name: '未佩戴安全帽', severity: '较重', skills: ['violation_detection', 'ppe_detection'] },
        { name: '未系安全带', severity: '严重', skills: ['high_altitude', 'ppe_detection'] },
        { name: '气瓶混放', severity: '严重', skills: ['welding_standard', 'fire_hazard'] },
        { name: '违章操作设备', severity: '较重', skills: ['violation_detection'] },
        { name: '无监护人', severity: '严重', skills: ['confined_space', 'fire_hazard'] }
      ];
      
      violations.forEach((v, index) => {
        this.handlingKnowledge.push({
          knowledgeId: `KNW${String(index + 1).padStart(3, '0')}`,
          violationName: v.name,
          severity: v.severity,
          immediateAction: `1. 立即停止作业\n2. 要求作业人员整改\n3. 拍照记录违规现场`,
          penalty: `1. 对作业人员罚款100-200元\n2. 对班组长罚款50元\n3. 通报批评`,
          rectification: `1. 参加安全培训教育\n2. 书面检讨\n3. 一周内不得参与井下作业`,
          prevention: `1. 加强班前安全教育\n2. 设置检查点\n3. 建立互相监督机制`,
          relatedSkills: v.skills,
          usageCount: 0,
          effectRating: 4,
          createTime: '2024-01-10 09:00:00',
          updateTime: formatDateTime()
        });
      });
    },
    
    // 生成随机时间
    generateRandomTime(): string {
      const now = new Date();
      const days = Math.floor(Math.random() * 30);
      const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return formatDateTime(date);
    },
    
    // ==================== 更新统计数据 ====================
    
    updateStatistics() {
      // 更新设备统计
      this.devices.forEach(device => {
        device.videoCount = this.videos.filter(v => v.deviceId === device.deviceId).length;
        device.violationCount = this.violations.filter(v => {
          const video = this.videos.find(vid => vid.videoId === v.videoId);
          return video && video.deviceId === device.deviceId;
        }).length;
      });
      
      // 更新技能统计
      this.aiSkills.forEach(skill => {
        skill.deviceUsageCount = this.devices.filter(d => d.configuredSkills.includes(skill.skillId)).length;
        skill.detectionCount = this.videos.filter(v => v.detectedSkills.includes(skill.skillId)).length;
        skill.violationCount = this.violations.filter(v => v.skillId === skill.skillId).length;
      });
      
      // 更新规范引用次数
      this.regulations.forEach(reg => {
        reg.referenceCount = this.violations.filter(v => v.regulationId === reg.regulationId).length;
      });
      
      // 更新知识库使用次数
      this.handlingKnowledge.forEach(k => {
        k.usageCount = this.violations.filter(v => v.knowledgeId === k.knowledgeId).length;
      });
    },
    
    // ==================== 业务操作方法 ====================
    
    // 为设备配置技能
    configureDeviceSkills(deviceId: string, skillIds: string[]) {
      const device = this.devices.find(d => d.deviceId === deviceId);
      if (device) {
        device.configuredSkills = skillIds;
        device.updateTime = formatDateTime();
        this.updateStatistics();
      }
    },
    
    // 启用/停用技能
    toggleSkillStatus(skillId: string) {
      const skill = this.aiSkills.find(s => s.skillId === skillId);
      if (skill) {
        skill.status = skill.status === 'enabled' ? 'disabled' : 'enabled';
        skill.updateTime = formatDateTime();
        
        // 如果停用，清空统计
        if (skill.status === 'disabled') {
          skill.deviceUsageCount = 0;
          skill.detectionCount = 0;
          skill.violationCount = 0;
        }
      }
    },
    
    // 处理违规
    handleViolation(resultId: string, handler: string) {
      const violation = this.violations.find(v => v.resultId === resultId);
      if (violation) {
        violation.handled = true;
        violation.handleTime = formatDateTime();
        violation.handler = handler;
        
        // 更新知识库使用次数
        if (violation.knowledgeId) {
          const knowledge = this.handlingKnowledge.find(k => k.knowledgeId === violation.knowledgeId);
          if (knowledge) {
            knowledge.usageCount++;
          }
        }
      }
    },
    
    // 添加新视频
    addVideo(video: VideoVO) {
      this.videos.push(video);
      this.updateStatistics();
    },
    
    // 添加违规结果
    addViolationResult(violation: ViolationResult) {
      this.violations.push(violation);
      
      // 更新视频的违规数
      const video = this.videos.find(v => v.videoId === violation.videoId);
      if (video) {
        video.violationCount++;
        video.violations.push(violation);
      }
      
      this.updateStatistics();
    }
  }
});

