<template>
  <el-dialog v-model="visible" title="修改" width="40%" destroy-on-close center :close-on-click-modal="false" :close-on-press-escape="false">
    <template v-if="props?.type === 'broadcast'">
      <p class="des-wrap">生成数量:</p>
      <el-input v-model="state.value" min="1" max="100" type="number" placeholder="请输入生成数量" />
    </template>

    <template v-else-if="['table_number'].includes(props?.type || '')">
      <el-input v-model="state.value" min="0" type="number" placeholder="请输入内容" />
    </template>

    <el-input v-else v-model="state.value" type="textarea" resize="none" :rows="4" placeholder="请输入内容" clearable />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click.stop="close()">关闭</el-button>
        <el-button type="primary" @click.stop="confirm()">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import UseModal from '@/utils/UseModal.js';

// props
const props = defineProps({
  show: Boolean,
  content: [String, Number], //显示内容
  type: String, //类型
});

// emit
const emit = defineEmits(['update:show', 'change']);
const visible = UseModal(props, 'show', emit);

watch(
  () => props.show,
  async (v) => {
    await nextTick();
    if (!v) return;
    state.value = String(props?.content) || '';
  },
  { deep: true, immediate: false }
);

// state
const state = reactive({
  value: '',
});

/**
 * @description: 点击关闭
 */
const close = () => {
  visible.value = false;
};

/**
 * @description: 点击确认
 */
const confirm = () => {
  const { value } = state;
  const { type } = props;
  if (value === '') {
    ElMessage({
      message: '请输入内容',
      type: 'warning',
      center: true,
    });
    return;
  }

  const numReg = /^(0|[1-9]\d*)$/;
  if (type === 'table_number' && !numReg.test(value)) {
    ElMessage({
      message: '请输入大于等于0的数字',
      type: 'warning',
      center: true,
    });
    return;
  }

  const reg = /^([1-9]|[1-9][0-9]|100)$/;
  if (type === 'broadcast' && !reg.test(value)) {
    ElMessage({
      message: '请输入1-100范围内的数字',
      type: 'warning',
      center: true,
    });
    return;
  }

  const data = {
    type: props?.type || '',
    value: value,
  };
  emit('change', data);
  close();
};
</script>

<style lang="scss" scoped>
.des-wrap {
  margin-bottom: 10px;
  font-size: 20px;
  color: #333;
}
</style>
