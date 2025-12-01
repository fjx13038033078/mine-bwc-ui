<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="文件名称" prop="fileName">
              <el-input v-model="queryParams.fileName" placeholder="请输入文件名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="文件分类" prop="category">
              <el-select v-model="queryParams.category" placeholder="请选择文件分类" clearable>
                <el-option label="管理制度" value="管理制度" />
                <el-option label="操作规程" value="操作规程" />
                <el-option label="处罚条例" value="处罚条例" />
                <el-option label="应急预案" value="应急预案" />
                <el-option label="铜矿安全作业规范库" value="铜矿安全作业规范库" />
                <el-option label="铜矿不安全作业行为处理知识库" value="铜矿不安全作业行为处理知识库" />
                <el-option label="其他文件" value="其他文件" />
              </el-select>
            </el-form-item>
            <el-form-item label="文件类型" prop="fileType">
              <el-select v-model="queryParams.fileType" placeholder="请选择文件类型" clearable>
                <el-option label="PDF文档" value="pdf" />
                <el-option label="Word文档" value="docx" />
                <el-option label="图片" value="image" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <!-- 统计概览 -->
    <el-row :gutter="15" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="28"><i-ep-folder /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ Object.keys(groupedDocuments).length }}</div>
              <div class="stat-label">知识库数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon :size="28"><i-ep-document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ filteredDocuments.length }}</div>
              <div class="stat-label">文档总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon :size="28"><i-ep-user /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalUploaders }}</div>
              <div class="stat-label">上传人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon :size="28"><i-ep-download /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalDownloads }}</div>
              <div class="stat-label">总下载量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主内容区域 -->
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="20" color="#409EFF"><i-ep-folder-opened /></el-icon>
            <span style="font-weight: bold; font-size: 16px; margin-left: 8px">知识库管理</span>
          </div>
          <div class="header-right">
            <el-button type="primary" plain icon="Upload" @click="handleUpload">上传文档</el-button>
            <el-button type="success" plain icon="FolderAdd" @click="handleAddCategory" style="margin-left: 10px">新增知识库</el-button>
            <right-toolbar v-model:show-search="showSearch" @query-table="getList" style="margin-left: 10px"></right-toolbar>
          </div>
        </div>
      </template>

      <!-- 知识库折叠面板 -->
      <el-collapse v-model="activeCategories" class="category-collapse">
        <el-collapse-item v-for="(docs, category) in pagedGroupedDocuments" :key="category" :name="category">
          <template #title>
            <div class="collapse-title" @click.stop>
              <div class="title-left">
                <el-icon :size="20" :color="getCategoryIconColor(category)"><i-ep-collection /></el-icon>
                <el-tag :type="getCategoryColor(category)" size="large" style="margin: 0 12px">{{ category }}</el-tag>
                <el-tag type="info" size="small" effect="plain">{{ docs.length }} 份文档</el-tag>
                <div class="file-type-stats" style="margin-left: 12px">
                  <el-tag v-if="getCategoryStats(docs).pdfCount > 0" size="small" effect="plain"> PDF: {{ getCategoryStats(docs).pdfCount }} </el-tag>
                  <el-tag v-if="getCategoryStats(docs).docxCount > 0" size="small" effect="plain" style="margin-left: 6px">
                    Word: {{ getCategoryStats(docs).docxCount }}
                  </el-tag>
                  <el-tag v-if="getCategoryStats(docs).imageCount > 0" size="small" effect="plain" style="margin-left: 6px">
                    图片: {{ getCategoryStats(docs).imageCount }}
                  </el-tag>
                </div>
              </div>
              <div class="title-right" @click.stop>
                <el-button type="warning" size="small" icon="Edit" @click="handleEditCategory(category)" style="margin-right: 8px">
                  编辑知识库
                </el-button>
                <el-button type="danger" size="small" icon="Delete" @click="handleDeleteCategory(category)">删除知识库</el-button>
              </div>
            </div>
          </template>

          <!-- 文档表格 -->
          <el-table :data="docs" border :style="{ width: '100%' }">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column label="文件ID" align="center" prop="documentId" width="120" />
            <el-table-column label="文件名称" align="left" prop="fileName" min-width="200" show-overflow-tooltip>
              <template #default="scope">
                <div class="file-name-cell">
                  <el-icon :size="18" :color="getFileIcon(scope.row.fileType).color">
                    <component :is="getFileIcon(scope.row.fileType).icon" />
                  </el-icon>
                  <span class="file-name">{{ scope.row.fileName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="文件类型" align="center" prop="fileType" width="100">
              <template #default="scope">
                <el-tag size="small" effect="plain">{{ scope.row.fileType.toUpperCase() }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="文件大小" align="center" prop="fileSize" width="110" />
            <el-table-column label="上传人" align="center" prop="uploader" width="100" />
            <el-table-column label="下载次数" align="center" prop="downloadCount" width="100">
              <template #default="scope">
                <el-tag type="success" size="small" effect="plain">{{ scope.row.downloadCount }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="上传时间" align="center" prop="uploadTime" width="160" />
            <el-table-column label="操作" fixed="right" width="200">
              <template #default="scope">
                <el-button link type="primary" icon="View" @click="handlePreview(scope.row)">预览</el-button>
                <el-button link type="success" icon="Download" @click="handleDownload(scope.row)">下载</el-button>
                <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>

      <!-- 空状态 -->
      <el-empty v-if="Object.keys(pagedGroupedDocuments).length === 0" description="暂无文档数据" :image-size="200" />

      <!-- 分页 -->
      <pagination
        v-show="categoryTotal > 0"
        v-model:page="categoryPageNum"
        v-model:limit="categoryPageSize"
        :total="categoryTotal"
        @pagination="handleCategoryPageChange"
      />
    </el-card>

    <!-- 新增/编辑知识库对话框 -->
    <el-dialog v-model="categoryDialog.visible" :title="categoryDialog.title" width="500px" append-to-body>
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="120px">
        <el-form-item label="知识库名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入知识库名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="知识库描述">
          <el-input v-model="categoryForm.description" type="textarea" :rows="3" placeholder="请输入知识库描述" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitCategory">确 定</el-button>
          <el-button @click="categoryDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 上传文件对话框 -->
    <el-dialog v-model="uploadDialog.visible" title="上传安全文件" width="600px" append-to-body @close="closeUploadDialog">
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="100px">
        <el-form-item label="文件名称" prop="fileName">
          <el-input v-model="uploadForm.fileName" placeholder="请输入文件名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="文件分类" prop="category">
          <el-autocomplete
            v-model="uploadForm.category"
            :fetch-suggestions="queryCategorySuggestions"
            placeholder="请输入文件分类（可手动输入或选择建议）"
            style="width: 100%"
            clearable
          >
            <template #default="{ item }">
              <div class="suggestion-item">
                <el-icon><i-ep-folder /></el-icon>
                <span style="margin-left: 8px">{{ item.value }}</span>
              </div>
            </template>
          </el-autocomplete>
          <div style="color: #909399; font-size: 12px; margin-top: 4px">💡 可自定义分类名称，或从常用分类中选择</div>
        </el-form-item>
        <el-form-item label="文件上传" prop="file">
          <el-upload class="upload-demo" drag :limit="1" :auto-upload="false" :on-change="handleFileChange" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
            <el-icon class="el-icon--upload"><i-ep-upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持上传 PDF、Word、JPG、PNG 格式文件，大小不超过 50MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="文件描述">
          <el-input v-model="uploadForm.description" type="textarea" :rows="3" placeholder="请输入文件描述信息" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitUpload">确认上传</el-button>
          <el-button @click="closeUploadDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 文件预览对话框 -->
    <el-dialog v-model="previewDialog.visible" :title="`预览：${previewData.fileName}`" width="80%" append-to-body>
      <div class="preview-container">
        <el-descriptions :column="2" border style="margin-bottom: 20px">
          <el-descriptions-item label="文件ID">{{ previewData.documentId }}</el-descriptions-item>
          <el-descriptions-item label="文件名称">{{ previewData.fileName }}</el-descriptions-item>
          <el-descriptions-item label="文件分类">
            <el-tag :type="getCategoryColor(previewData.category)" size="small">{{ previewData.category }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="文件类型">
            <el-tag size="small" plain>{{ getFileTypeName(previewData.fileType) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ previewData.fileSize }}</el-descriptions-item>
          <el-descriptions-item label="上传人">{{ previewData.uploader }}</el-descriptions-item>
          <el-descriptions-item label="下载次数">{{ previewData.downloadCount }} 次</el-descriptions-item>
          <el-descriptions-item label="上传时间">{{ previewData.uploadTime }}</el-descriptions-item>
          <el-descriptions-item label="文件描述" :span="2" v-if="previewData.description">
            {{ previewData.description }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">文件预览</el-divider>
        <div class="preview-content">
          <el-empty description="文件预览功能仅演示，实际项目中需要集成文档预览组件" :image-size="150" />
          <div class="preview-tip">
            <el-alert title="提示" type="info" :closable="false">
              <p>实际项目中可以集成以下预览方案：</p>
              <ul>
                <li>PDF 文件：使用 pdf.js 或 vue-pdf 组件</li>
                <li>Word 文件：使用 office-viewer 或转换为 PDF 后预览</li>
                <li>图片文件：直接使用 img 标签或 el-image 组件</li>
              </ul>
            </el-alert>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" icon="Download" @click="handleDownload(previewData)">下载文件</el-button>
          <el-button @click="previewDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DocumentLibrary" lang="ts">
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 文档数据接口
interface DocumentVO {
  documentId: string;
  fileName: string;
  category: string;
  fileType: string;
  fileSize: string;
  uploader: string;
  downloadCount: number;
  uploadTime: string;
  description?: string;
}

interface UploadForm {
  fileName: string;
  category: string;
  fileType: string;
  file: any;
  description?: string;
}

interface DocumentQuery {
  pageNum: number;
  pageSize: number;
  fileName?: string;
  category?: string;
  fileType?: string;
}

// 静态数据 - 模拟文档数据
const staticDocumentData: DocumentVO[] = [
  {
    documentId: 'DOC001',
    fileName: '铜矿安全生产管理制度.pdf',
    category: '管理制度',
    fileType: 'pdf',
    fileSize: '2.5 MB',
    uploader: '张三',
    downloadCount: 45,
    uploadTime: '2024-01-10 09:00:00',
    description: '铜矿安全生产管理总则，规定了各项安全管理要求和责任制度'
  },
  {
    documentId: 'DOC002',
    fileName: '焊割作业安全操作规程.pdf',
    category: '操作规程',
    fileType: 'pdf',
    fileSize: '1.8 MB',
    uploader: '李四',
    downloadCount: 38,
    uploadTime: '2024-01-10 10:30:00',
    description: '详细规定了焊割作业的安全操作流程和注意事项'
  },
  {
    documentId: 'DOC003',
    fileName: '安全生产违规处罚条例.docx',
    category: '处罚条例',
    fileType: 'docx',
    fileSize: '856 KB',
    uploader: '王五',
    downloadCount: 52,
    uploadTime: '2024-01-11 08:45:00',
    description: '明确了各类违规行为的处罚标准和执行程序'
  },
  {
    documentId: 'DOC004',
    fileName: '矿井火灾应急预案.pdf',
    category: '应急预案',
    fileType: 'pdf',
    fileSize: '3.2 MB',
    uploader: '赵六',
    downloadCount: 67,
    uploadTime: '2024-01-11 14:20:00',
    description: '矿井火灾事故应急处置预案，包含疏散路线和应急措施'
  },
  {
    documentId: 'DOC005',
    fileName: '铜矿吊装作业安全规范汇编.pdf',
    category: '铜矿安全作业规范库',
    fileType: 'pdf',
    fileSize: '4.5 MB',
    uploader: '孙七',
    downloadCount: 28,
    uploadTime: '2024-01-12 09:15:00',
    description: '铜矿吊装作业安全规范要求汇编，包含标准操作流程和安全注意事项'
  },
  {
    documentId: 'DOC006',
    fileName: '铜矿高处作业违规行为处理指南.pdf',
    category: '铜矿不安全作业行为处理知识库',
    fileType: 'pdf',
    fileSize: '5.8 MB',
    uploader: '周八',
    downloadCount: 34,
    uploadTime: '2024-01-12 15:30:00',
    description: '收集整理了高处作业违规行为的识别要点和处理建议'
  },
  {
    documentId: 'DOC007',
    fileName: '个人防护用品使用规范.docx',
    category: '操作规程',
    fileType: 'docx',
    fileSize: '1.2 MB',
    uploader: '吴九',
    downloadCount: 41,
    uploadTime: '2024-01-13 10:00:00',
    description: '规定了各类个人防护用品的正确使用方法和维护要求'
  },
  {
    documentId: 'DOC008',
    fileName: '铜矿焊割作业安全规范手册.pdf',
    category: '铜矿安全作业规范库',
    fileType: 'pdf',
    fileSize: '8.3 MB',
    uploader: '郑十',
    downloadCount: 29,
    uploadTime: '2024-01-13 16:45:00',
    description: '铜矿焊割作业的详细安全规范，包含气瓶使用、动火管理等内容'
  },
  {
    documentId: 'DOC009',
    fileName: '受限空间作业管理制度.pdf',
    category: '管理制度',
    fileType: 'pdf',
    fileSize: '1.9 MB',
    uploader: '冯十一',
    downloadCount: 36,
    uploadTime: '2024-01-14 11:20:00',
    description: '受限空间作业审批、监护和应急救援管理制度'
  },
  {
    documentId: 'DOC010',
    fileName: '矿井通风系统示意图.image',
    category: '其他文件',
    fileType: 'image',
    fileSize: '3.6 MB',
    uploader: '陈十二',
    downloadCount: 22,
    uploadTime: '2024-01-14 14:50:00',
    description: '矿井通风系统布局示意图，标注了各通风设施位置'
  }
];

const documentList = ref<DocumentVO[]>([]);
const allDocumentList = ref<DocumentVO[]>([...staticDocumentData]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const activeCategories = ref<string[]>([]); // 默认折叠，空数组
const categoryPageNum = ref(1); // 知识库分页页码
const categoryPageSize = ref(10); // 每页显示10个知识库
const categoryTotal = ref(0); // 知识库总数

const queryFormRef = ref<ElFormInstance>();
const uploadFormRef = ref<ElFormInstance>();
const categoryFormRef = ref<ElFormInstance>();

const uploadDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const previewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const categoryDialog = reactive({
  visible: false,
  title: '新增知识库',
  isEdit: false,
  oldCategoryName: ''
});

interface CategoryForm {
  name: string;
  description?: string;
}

const categoryForm = ref<CategoryForm>({
  name: '',
  description: ''
});

const categoryRules = {
  name: [{ required: true, message: '知识库名称不能为空', trigger: 'blur' }]
};

const initUploadForm: UploadForm = {
  fileName: '',
  category: '',
  fileType: '',
  file: null,
  description: ''
};

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fileName: '',
    category: '',
    fileType: ''
  } as DocumentQuery,
  uploadForm: { ...initUploadForm },
  uploadRules: {
    fileName: [{ required: true, message: '文件名称不能为空', trigger: 'blur' }],
    category: [{ required: true, message: '文件分类不能为空', trigger: 'change' }]
  },
  previewData: {} as DocumentVO
});

const { queryParams, uploadForm, uploadRules, previewData } = toRefs(data);

// 过滤后的文档（应用搜索条件）
const filteredDocuments = computed(() => {
  return allDocumentList.value.filter((doc) => {
    if (queryParams.value.fileName && !doc.fileName.toLowerCase().includes(queryParams.value.fileName.toLowerCase())) {
      return false;
    }
    if (queryParams.value.category && doc.category !== queryParams.value.category) {
      return false;
    }
    if (queryParams.value.fileType && doc.fileType !== queryParams.value.fileType) {
      return false;
    }
    return true;
  });
});

// 按分类分组的文档
const groupedDocuments = computed(() => {
  const grouped: Record<string, DocumentVO[]> = {};
  filteredDocuments.value.forEach((doc) => {
    if (!grouped[doc.category]) {
      grouped[doc.category] = [];
    }
    grouped[doc.category].push(doc);
  });
  return grouped;
});

// 知识库名称列表（用于分页）
const categoryNames = computed(() => {
  return Object.keys(groupedDocuments.value);
});

// 分页后的知识库名称
const pagedCategoryNames = computed(() => {
  const start = (categoryPageNum.value - 1) * categoryPageSize.value;
  const end = start + categoryPageSize.value;
  return categoryNames.value.slice(start, end);
});

// 分页后的分组文档数据
const pagedGroupedDocuments = computed(() => {
  const paged: Record<string, DocumentVO[]> = {};
  pagedCategoryNames.value.forEach((name) => {
    paged[name] = groupedDocuments.value[name];
  });
  return paged;
});

// 更新知识库总数
watch(
  categoryNames,
  (newVal) => {
    categoryTotal.value = newVal.length;
  },
  { immediate: true }
);

// 统计数据
const totalUploaders = computed(() => {
  return new Set(allDocumentList.value.map((doc) => doc.uploader)).size;
});

const totalDownloads = computed(() => {
  return allDocumentList.value.reduce((sum, doc) => sum + doc.downloadCount, 0);
});

/** 获取文件类型显示名称 */
const getFileTypeDisplay = (fileType: string): string => {
  const displayMap: Record<string, string> = {
    'pdf': 'PDF文档',
    'docx': 'Word文档',
    'image': '图片文件',
    'other': '其他文件'
  };
  return displayMap[fileType] || '未知类型';
};

/** 文件类型显示名称（计算属性） */
const fileTypeDisplay = computed(() => {
  if (!uploadForm.value.fileType) {
    return '';
  }
  return getFileTypeDisplay(uploadForm.value.fileType);
});

/** 获取文件图标 */
const getFileIcon = (fileType: string) => {
  const iconMap: Record<string, { icon: string; color: string }> = {
    pdf: { icon: 'Document', color: '#F56C6C' },
    docx: { icon: 'Document', color: '#409EFF' },
    image: { icon: 'Picture', color: '#67C23A' }
  };
  return iconMap[fileType] || { icon: 'Document', color: '#909399' };
};

/** 获取文件类型名称 */
const getFileTypeName = (fileType: string) => {
  const nameMap: Record<string, string> = {
    pdf: 'PDF',
    docx: 'Word',
    image: '图片'
  };
  return nameMap[fileType] || fileType;
};

/** 获取分类颜色 */
const getCategoryColor = (category: string): 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const colorMap: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    管理制度: 'primary',
    操作规程: 'success',
    处罚条例: 'danger',
    应急预案: 'warning',
    铜矿安全作业规范库: 'success',
    铜矿不安全作业行为处理知识库: 'warning',
    其他文件: 'info'
  };
  return colorMap[category] || 'info';
};

/** 获取分类图标颜色 */
const getCategoryIconColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    管理制度: '#409EFF',
    操作规程: '#67C23A',
    处罚条例: '#F56C6C',
    应急预案: '#E6A23C',
    铜矿安全作业规范库: '#67C23A',
    铜矿不安全作业行为处理知识库: '#E6A23C',
    其他文件: '#909399'
  };
  return colorMap[category] || '#909399';
};

/** 获取分类统计 */
const getCategoryStats = (docs: DocumentVO[]) => {
  return {
    pdfCount: docs.filter((d) => d.fileType === 'pdf').length,
    docxCount: docs.filter((d) => d.fileType === 'docx').length,
    imageCount: docs.filter((d) => d.fileType === 'image').length
  };
};

/** 查询文档列表 */
const getList = () => {
  loading.value = true;

  setTimeout(() => {
    const filteredData = allDocumentList.value.filter((doc) => {
      let match = true;
      if (queryParams.value.fileName && !doc.fileName.toLowerCase().includes(queryParams.value.fileName.toLowerCase())) {
        match = false;
      }
      if (queryParams.value.category && doc.category !== queryParams.value.category) {
        match = false;
      }
      if (queryParams.value.fileType && doc.fileType !== queryParams.value.fileType) {
        match = false;
      }
      return match;
    });

    total.value = filteredData.length;

    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
    const end = start + queryParams.value.pageSize;
    documentList.value = filteredData.slice(start, end);

    loading.value = false;
  }, 300);
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 文件分类建议 */
const categorySuggestions = [
  { value: '管理制度' },
  { value: '操作规程' },
  { value: '处罚条例' },
  { value: '应急预案' },
  { value: '铜矿安全作业规范库' },
  { value: '铜矿不安全作业行为处理知识库' },
  { value: '培训教材' },
  { value: '事故案例' },
  { value: '安全检查表' },
  { value: '风险评估报告' },
  { value: '其他文件' }
];

/** 查询分类建议 */
const queryCategorySuggestions = (queryString: string, cb: any) => {
  const results = queryString
    ? categorySuggestions.filter((item) => item.value.toLowerCase().includes(queryString.toLowerCase()))
    : categorySuggestions;
  cb(results);
};

/** 上传文件 */
const handleUpload = () => {
  uploadForm.value = { ...initUploadForm };
  uploadDialog.visible = true;
};

/** 根据文件扩展名获取文件类型 */
const getFileType = (fileName: string): string => {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  const typeMap: Record<string, string> = {
    '.pdf': 'pdf',
    '.doc': 'docx',
    '.docx': 'docx',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.bmp': 'image',
    '.webp': 'image'
  };
  return typeMap[ext] || 'other';
};

/** 文件选择变化 */
const handleFileChange = (file: any) => {
  uploadForm.value.file = file;

  // 自动识别文件类型
  if (file && file.name) {
    const fileType = getFileType(file.name);
    uploadForm.value.fileType = fileType;

    // 自动填充文件名（去掉扩展名）
    if (!uploadForm.value.fileName) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
      uploadForm.value.fileName = nameWithoutExt;
    }
  }
};

/** 提交上传 */
const submitUpload = () => {
  uploadFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const currentTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      // 模拟生成文件大小
      const sizes = ['856 KB', '1.2 MB', '1.8 MB', '2.5 MB', '3.2 MB', '4.5 MB'];
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

      const newDocument: DocumentVO = {
        documentId: 'DOC' + String(allDocumentList.value.length + 1).padStart(3, '0'),
        fileName: uploadForm.value.fileName,
        category: uploadForm.value.category,
        fileType: uploadForm.value.fileType,
        fileSize: randomSize,
        uploader: '当前用户',
        downloadCount: 0,
        uploadTime: currentTime,
        description: uploadForm.value.description
      };

      allDocumentList.value.unshift(newDocument);
      proxy?.$modal.msgSuccess('文件上传成功');
      uploadDialog.visible = false;
      await getList();
    }
  });
};

/** 预览文件 */
const handlePreview = (row: DocumentVO) => {
  previewDialog.visible = true;
  previewData.value = { ...row };
};

/** 下载文件 */
const handleDownload = (row: DocumentVO) => {
  // 更新下载次数
  const index = allDocumentList.value.findIndex((item) => item.documentId === row.documentId);
  if (index !== -1) {
    allDocumentList.value[index].downloadCount++;
  }
  proxy?.$modal.msgSuccess(`正在下载 ${row.fileName}...`);
  getList();
};

/** 删除文件 */
const handleDelete = (row: DocumentVO) => {
  proxy?.$modal
    .confirm(`是否确认删除文件 ${row.fileName}？`)
    .then(() => {
      allDocumentList.value = allDocumentList.value.filter((item) => item.documentId !== row.documentId);
      proxy?.$modal.msgSuccess('删除成功');
      getList();
    })
    .catch(() => {});
};

/** 关闭上传对话框 */
const closeUploadDialog = () => {
  uploadDialog.visible = false;
  uploadForm.value = { ...initUploadForm };
  uploadFormRef.value?.resetFields();
};

/** 新增知识库 */
const handleAddCategory = () => {
  categoryDialog.visible = true;
  categoryDialog.title = '新增知识库';
  categoryDialog.isEdit = false;
  categoryForm.value = {
    name: '',
    description: ''
  };
};

/** 编辑知识库 */
const handleEditCategory = (category: string) => {
  categoryDialog.visible = true;
  categoryDialog.title = '编辑知识库';
  categoryDialog.isEdit = true;
  categoryDialog.oldCategoryName = category;
  categoryForm.value = {
    name: category,
    description: ''
  };
};

/** 提交分类 */
const submitCategory = () => {
  categoryFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (categoryDialog.isEdit) {
        // 编辑分类：批量更新该分类下所有文档的分类名称
        const oldName = categoryDialog.oldCategoryName;
        const newName = categoryForm.value.name;

        if (oldName !== newName) {
          allDocumentList.value.forEach((doc) => {
            if (doc.category === oldName) {
              doc.category = newName;
            }
          });
          proxy?.$modal.msgSuccess(`知识库"${oldName}"已重命名为"${newName}"`);
        } else {
          proxy?.$modal.msgSuccess('知识库信息已更新');
        }
      } else {
        // 新增知识库：仅添加到建议列表
        const exists = categorySuggestions.some((item) => item.value === categoryForm.value.name);
        if (!exists) {
          categorySuggestions.push({ value: categoryForm.value.name });
          proxy?.$modal.msgSuccess(`知识库"${categoryForm.value.name}"已创建，可在上传文件时使用`);
        } else {
          proxy?.$modal.msgWarning('该知识库已存在');
        }
      }

      categoryDialog.visible = false;
      getList();
    }
  });
};

/** 删除知识库 */
const handleDeleteCategory = (category: string) => {
  const docsInCategory = allDocumentList.value.filter((doc) => doc.category === category);

  if (docsInCategory.length > 0) {
    proxy?.$modal
      .confirm(`知识库"${category}"下有 ${docsInCategory.length} 份文档，删除知识库后这些文档将被移动到"其他文件"知识库。是否继续？`)
      .then(() => {
        // 将该知识库下的文档移动到"其他文件"
        allDocumentList.value.forEach((doc) => {
          if (doc.category === category) {
            doc.category = '其他文件';
          }
        });
        proxy?.$modal.msgSuccess(`知识库"${category}"已删除，${docsInCategory.length} 份文档已移动到"其他文件"`);
        getList();
      })
      .catch(() => {});
  } else {
    proxy?.$modal.msgWarning('该知识库下没有文档，无需删除');
  }
};

/** 知识库分页变化处理 */
const handleCategoryPageChange = () => {
  // 分页变化时不需要额外操作，computed会自动更新
  console.log('知识库分页变化', categoryPageNum.value, categoryPageSize.value);
};

onMounted(() => {
  getList();
  // 默认折叠，不需要展开
});
</script>

<style scoped lang="scss">
.stat-card {
  height: 100%;
  border-radius: 10px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1.2;
        margin-bottom: 6px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-right {
    display: flex;
    align-items: center;
  }
}

.category-collapse {
  :deep(.el-collapse-item) {
    margin-bottom: 16px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.el-collapse-item__header) {
    background: #fafafa;
    padding: 16px 20px;
    border: none;
    font-size: 15px;
    height: auto;
    line-height: 1.5;

    &:hover {
      background: #f5f7fa;
    }

    &.is-active {
      border-bottom: 1px solid #ebeef5;
    }
  }

  :deep(.el-collapse-item__wrap) {
    border: none;
  }

  :deep(.el-collapse-item__content) {
    padding: 16px;
    background: #fff;
  }

  .collapse-title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 20px;

    .title-left {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .title-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .file-type-stats {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .file-name {
    flex: 1;
  }
}

.preview-container {
  .preview-content {
    margin-top: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
    min-height: 300px;

    .preview-tip {
      margin-top: 20px;

      ul {
        margin-top: 10px;
        padding-left: 20px;

        li {
          margin: 5px 0;
          line-height: 1.6;
        }
      }
    }
  }
}

:deep(.upload-demo) {
  width: 100%;

  .el-upload {
    width: 100%;
  }

  .el-upload-dragger {
    width: 100%;
  }
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 4px 0;

  .el-icon {
    color: #409eff;
    font-size: 16px;
  }

  span {
    color: #606266;
    font-size: 14px;
  }
}
</style>
