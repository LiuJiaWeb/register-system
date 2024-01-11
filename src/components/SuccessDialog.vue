<template>
  <el-dialog v-model="visible" title="报名成功" width="40%" destroy-on-close center :close-on-click-modal="false" :close-on-press-escape="false">
    <div class="top-wrap">
      <i class="iconfont icon-chenggong success-icon"></i>
      <p class="time">提交时间：{{ dayjs().format('YYYY年MM月DD日 HH:mm:ss') }}</p>
    </div>

    <el-form :model="props.content" label-position="left" label-width="auto">
      <el-form-item label="姓名：">
        <el-input :value="props?.content?.user || ''" readonly />
      </el-form-item>
      <el-form-item label="手机号：">
        <el-input :value="props?.content?.phone || ''" readonly />
      </el-form-item>
      <el-form-item label="身份证号：">
        <el-input :value="props?.content?.card || ''" readonly />
      </el-form-item>
      <el-form-item label="收货地址：">
        <el-input :value="props?.content?.address || ''" readonly />
      </el-form-item>

      <el-form-item v-if="props?.content?.is_vip">
        <template #label>
          <span style="color: #e6b422; font-weight: bold">VIP权限：</span>
        </template>
        <el-input value="已开通" readonly />
      </el-form-item>

      <el-form-item v-if="props?.content?.is_force_insert">
        <template #label>
          <span style="color: #e6b422; font-weight: bold">强制插队：</span>
        </template>
        <el-input value="插队成功" readonly />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click.stop="close()">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import dayjs from 'dayjs';
import UseModal from '@/utils/UseModal.js';

// props
const props = defineProps({
  show: Boolean,
  content: [Object], //显示内容
});

// emit
const emit = defineEmits(['update:show', 'change']);
const visible = UseModal(props, 'show', emit);

//表单数据
// const formData = reactive({
//   name: 'test',
// });

// state
const state = reactive({});

/**
 * @description: 点击关闭
 */
const close = () => {
  visible.value = false;
};
</script>

<style lang="scss" scoped>
.top-wrap {
  width: 100%;
  text-align: center;
  margin: 0 auto;

  .success-icon {
    font-size: 80px;
    color: #1aad19;
  }

  .time {
    margin-bottom: 20px;
    font-weight: bold;
  }
}
</style>
