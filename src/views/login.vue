<template>
  <div class="login">
    <!-- 动态光效背景层 -->
    <div class="tech-effects">
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
      <div class="glow-orb orb-3"></div>
      <div class="scan-line"></div>
    </div>

    <!-- 双栏登录卡片 -->
    <div class="login-card">
      <div class="card-glow"></div>

      <!-- 左侧磨砂玻璃装饰区 -->
      <div class="glass-panel">
        <div class="glass-content">
          <!-- 装饰性圆环 -->
          <div class="tech-rings">
            <div class="ring ring-1"></div>
            <div class="ring ring-2"></div>
            <div class="ring ring-3"></div>
          </div>
          <!-- 欢迎文字 -->
          <div class="welcome-text">
            <h2 class="welcome-title">{{ proxy.$t('为安全保驾护航') || '欢迎回来' }}</h2>
            <p class="welcome-desc">{{ proxy.$t('太行实验室研发团队') || '智能管理系统' }}</p>
          </div>
          <!-- 装饰性粒子 -->
          <div class="particles">
            <span v-for="n in 6" :key="n" class="particle" :class="`particle-${n}`"></span>
          </div>
          <!-- 装饰线条 -->
          <div class="tech-lines">
            <div class="line line-1"></div>
            <div class="line line-2"></div>
            <div class="line line-3"></div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单区 -->
      <div class="form-panel">
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <div class="title-box">
            <h3 class="title">{{ title }}</h3>
            <lang-select />
          </div>
          <el-form-item v-if="tenantEnabled" prop="tenantId">
            <el-select v-model="loginForm.tenantId" filterable :placeholder="proxy.$t('login.selectPlaceholder')" style="width: 100%">
              <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
              <template #prefix><svg-icon icon-class="company" class="el-input__icon input-icon" /></template>
            </el-select>
          </el-form-item>
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" :placeholder="proxy.$t('login.username')">
              <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              :placeholder="proxy.$t('login.password')"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item v-if="captchaEnabled" prop="code">
            <el-input
              v-model="loginForm.code"
              size="large"
              auto-complete="off"
              :placeholder="proxy.$t('login.code')"
              style="width: 63%"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
            </el-input>
            <div class="login-code">
              <img :src="codeUrl" class="login-code-img" @click="getCode" />
            </div>
          </el-form-item>
          <el-checkbox v-model="loginForm.rememberMe" style="margin: 0 0 25px 0">{{ proxy.$t('login.rememberPassword') }}</el-checkbox>
          <el-form-item style="width: 100%">
            <el-button :loading="loading" size="large" type="primary" class="login-btn" @click.prevent="handleLogin">
              <span v-if="!loading">{{ proxy.$t('login.login') }}</span>
              <span v-else>{{ proxy.$t('login.logging') }}</span>
            </el-button>
            <div v-if="register" style="float: right">
              <router-link class="link-type" :to="'/register'">{{ proxy.$t('login.switchRegisterPage') }}</router-link>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2024-2026 太行实验室 All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, getTenantList } from '@/api/login';
import { authBinding } from '@/api/system/social/auth';
import { useUserStore } from '@/store/modules/user';
import { LoginData, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { HttpStatus } from '@/enums/RespEnum';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const title = import.meta.env.VITE_APP_TITLE;
const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules: ElFormRules = {
  tenantId: [{ required: true, trigger: 'blur', message: t('login.rule.tenantId.required') }],
  username: [{ required: true, trigger: 'blur', message: t('login.rule.username.required') }],
  password: [{ required: true, trigger: 'blur', message: t('login.rule.password.required') }],
  code: [{ required: true, trigger: 'change', message: t('login.rule.code.required') }]
};

const codeUrl = ref('');
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 租户开关
const tenantEnabled = ref(true);

// 注册开关
const register = ref(false);
const redirect = ref('/');
const loginRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    redirect.value = newRoute.query && newRoute.query.redirect && decodeURIComponent(newRoute.query.redirect);
  },
  { immediate: true }
);

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 localStorage 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        localStorage.setItem('tenantId', String(loginForm.value.tenantId));
        localStorage.setItem('username', String(loginForm.value.username));
        localStorage.setItem('password', String(loginForm.value.password));
        localStorage.setItem('rememberMe', String(loginForm.value.rememberMe));
      } else {
        // 否则移除
        localStorage.removeItem('tenantId');
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
      // 调用action的登录方法
      const [err] = await to(userStore.login(loginForm.value));
      if (!err) {
        const redirectUrl = redirect.value || '/';
        await router.push(redirectUrl);
        loading.value = false;
      } else {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          await getCode();
        }
      }
    } else {
      console.log('error submit!', fields);
    }
  });
};

/**
 * 获取验证码
 */
const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    loginForm.value.uuid = data.uuid;
  }
};

const getLoginData = () => {
  const tenantId = localStorage.getItem('tenantId');
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const rememberMe = localStorage.getItem('rememberMe');
  loginForm.value = {
    tenantId: tenantId === null ? String(loginForm.value.tenantId) : tenantId,
    username: username === null ? String(loginForm.value.username) : username,
    password: password === null ? String(loginForm.value.password) : String(password),
    rememberMe: rememberMe === null ? false : Boolean(rememberMe)
  } as LoginData;
};

/**
 * 获取租户列表
 */
const initTenantList = async () => {
  const { data } = await getTenantList(false);
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      loginForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
};

/**
 * 第三方登录
 * @param type
 */
const doSocialLogin = (type: string) => {
  authBinding(type, loginForm.value.tenantId).then((res: any) => {
    if (res.code === HttpStatus.SUCCESS) {
      // 获取授权地址跳转
      window.location.href = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

onMounted(() => {
  getCode();
  initTenantList();
  getLoginData();
});
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url('../assets/camera/login-background.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;

  // 背景叠加层，增加深度感
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, rgba(0, 20, 50, 0.3) 0%, rgba(0, 10, 30, 0.7) 100%);
    z-index: 0;
  }
}

// 科技光效容器
.tech-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

// 浮动光球效果
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  animation: float 8s ease-in-out infinite;

  &.orb-1 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(0, 150, 255, 0.6) 0%, transparent 70%);
    top: -100px;
    left: -100px;
    animation-delay: 0s;
  }

  &.orb-2 {
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(0, 200, 255, 0.5) 0%, transparent 70%);
    bottom: -80px;
    right: -80px;
    animation-delay: -3s;
    animation-duration: 10s;
  }

  &.orb-3 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(100, 180, 255, 0.4) 0%, transparent 70%);
    top: 50%;
    right: 20%;
    animation-delay: -5s;
    animation-duration: 12s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(20px, 10px) scale(1.05);
  }
}

// 扫描线效果
.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 200, 255, 0.8) 50%, transparent 100%);
  top: -10%;
  left: 0;
  animation: scan 4s linear infinite;
  opacity: 0.6;
}

@keyframes scan {
  0% {
    top: -10%;
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    top: 110%;
    opacity: 0;
  }
}

// 双栏登录卡片容器
.login-card {
  position: relative;
  z-index: 10;
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(0, 150, 255, 0.15);
  animation: cardAppear 0.8s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

// 卡片边缘光晕
.card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(ellipse, rgba(0, 150, 255, 0.12) 0%, transparent 60%);
  z-index: -2;
  animation: pulse 3s ease-in-out infinite;
}

// 左侧磨砂玻璃装饰面板
.glass-panel {
  width: 320px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  position: relative;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  // 顶部高光
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }

  // 渐变遮罩
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 150, 255, 0.1) 0%, transparent 50%, rgba(0, 100, 200, 0.05) 100%);
    pointer-events: none;
  }
}

.glass-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 30px;
  z-index: 1;
}

// 科技感圆环
.tech-rings {
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 40px;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;

  &.ring-1 {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border-color: rgba(0, 200, 255, 0.4);
    border-top-color: transparent;
    border-right-color: transparent;
    animation: rotate 8s linear infinite;
  }

  &.ring-2 {
    width: 75%;
    height: 75%;
    top: 12.5%;
    left: 12.5%;
    border-color: rgba(0, 180, 255, 0.3);
    border-bottom-color: transparent;
    border-left-color: transparent;
    animation: rotate 6s linear infinite reverse;
  }

  &.ring-3 {
    width: 50%;
    height: 50%;
    top: 25%;
    left: 25%;
    border-color: rgba(0, 220, 255, 0.5);
    border-top-color: transparent;
    animation: rotate 4s linear infinite;
    box-shadow: 0 0 20px rgba(0, 200, 255, 0.3);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 欢迎文字
.welcome-text {
  text-align: center;
  z-index: 2;
}

.welcome-title {
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 20px rgba(0, 150, 255, 0.5);
  letter-spacing: 3px;
}

.welcome-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
  letter-spacing: 2px;
}

// 装饰性粒子
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(0, 200, 255, 0.6);
  border-radius: 50%;
  animation: particleFloat 6s ease-in-out infinite;

  // 粒子位置（使用固定值替代 random()，避免 Sass 弃用警告）
  &.particle-1 {
    left: 15%;
    top: 25%;
    animation-delay: -0.8s;
    animation-duration: 5s;
  }
  &.particle-2 {
    left: 75%;
    top: 18%;
    animation-delay: -1.6s;
    animation-duration: 6s;
  }
  &.particle-3 {
    left: 45%;
    top: 70%;
    animation-delay: -2.4s;
    animation-duration: 7s;
  }
  &.particle-4 {
    left: 85%;
    top: 55%;
    animation-delay: -3.2s;
    animation-duration: 5.5s;
  }
  &.particle-5 {
    left: 25%;
    top: 80%;
    animation-delay: -4s;
    animation-duration: 6.5s;
  }
  &.particle-6 {
    left: 60%;
    top: 35%;
    animation-delay: -4.8s;
    animation-duration: 7.5s;
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
}

// 装饰线条
.tech-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.3), transparent);
  height: 1px;

  &.line-1 {
    width: 60%;
    top: 20%;
    left: 20%;
    animation: linePulse 3s ease-in-out infinite;
  }

  &.line-2 {
    width: 40%;
    bottom: 30%;
    right: 15%;
    animation: linePulse 3s ease-in-out infinite 1s;
  }

  &.line-3 {
    width: 50%;
    bottom: 15%;
    left: 25%;
    animation: linePulse 3s ease-in-out infinite 2s;
  }
}

@keyframes linePulse {
  0%, 100% {
    opacity: 0.3;
    transform: scaleX(0.8);
  }
  50% {
    opacity: 0.8;
    transform: scaleX(1);
  }
}

// 右侧表单面板
.form-panel {
  width: 420px;
  background: rgba(10, 20, 40, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 50px 40px 40px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.title-box {
  display: flex;

  .title {
    margin: 0px auto 30px auto;
    text-align: center;
    color: #ffffff;
    font-weight: 600;
    font-size: 22px;
    text-shadow: 0 2px 10px rgba(0, 150, 255, 0.4);
    letter-spacing: 2px;
  }

  :deep(.lang-select--style) {
    line-height: 0;
    color: rgba(255, 255, 255, 0.7);

    &:hover {
      color: #00c8ff;
    }
  }
}

.login-form {
  width: 100%;
  position: relative;
  z-index: 1;

  // 输入框样式
  :deep(.el-input) {
    height: 46px;

    .el-input__wrapper {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      box-shadow: none;
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(0, 200, 255, 0.4);
        background: rgba(255, 255, 255, 0.1);
      }

      &.is-focus {
        border-color: rgba(0, 200, 255, 0.7);
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 20px rgba(0, 200, 255, 0.2);
      }
    }

    .el-input__inner {
      color: #ffffff;
      height: 46px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }

  // 下拉选择框样式
  :deep(.el-select) {
    .el-select__wrapper {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      box-shadow: none;
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(0, 200, 255, 0.4);
      }

      &.is-focus {
        border-color: rgba(0, 200, 255, 0.7);
        box-shadow: 0 0 20px rgba(0, 200, 255, 0.2);
      }
    }

    .el-select__placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .el-select__selected-item {
      color: #ffffff;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
    color: rgba(255, 255, 255, 0.6);
  }

  // 复选框样式
  :deep(.el-checkbox) {
    color: rgba(255, 255, 255, 0.7);

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: rgba(0, 200, 255, 0.8);
      border-color: rgba(0, 200, 255, 0.8);
    }

    .el-checkbox__inner {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .el-checkbox__label {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

// 登录按钮
.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 160, 255, 0.9) 0%, rgba(0, 100, 200, 1) 100%);
  box-shadow:
    0 4px 20px rgba(0, 150, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 25px rgba(0, 150, 255, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.login-code {
  width: 33%;
  height: 46px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(0, 200, 255, 0.5);
      box-shadow: 0 0 15px rgba(0, 200, 255, 0.3);
    }
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-family: Arial, serif;
  font-size: 12px;
  letter-spacing: 1px;
  z-index: 10;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.login-code-img {
  height: 46px;
  padding-left: 12px;
}

// 链接样式
.link-type {
  color: rgba(0, 200, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    color: #00e5ff;
    text-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
  }
}

// 表单项间距调整
:deep(.el-form-item) {
  margin-bottom: 22px;
}

// 响应式适配
@media screen and (max-width: 800px) {
  .login-card {
    flex-direction: column;
    max-width: 90%;
  }

  .glass-panel {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tech-rings {
    width: 100px;
    height: 100px;
    margin-bottom: 20px;
  }

  .welcome-title {
    font-size: 22px;
  }

  .form-panel {
    width: 100%;
    padding: 30px 25px;
  }
}
</style>
