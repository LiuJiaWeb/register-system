<template>
  <div class="page-index">
    <div class="time-wrap">填表时间：{{ state?.now_time || '' }}</div>

    <div class="end-box">
      <div
        class="end-wrap"
        @click.stop="
          state.editContent = state?.end_time || '';
          state.editType = 'end_time';
          state.showEditDialog = true;
        "
      >
        {{ state?.end_time || '' }}
      </div>
    </div>

    <div
      class="tips-wrap"
      @click.stop="
        state.editContent = state?.end_tips || '';
        state.editType = 'end_tips';
        state.showEditDialog = true;
      "
    >
      {{ state?.end_tips || '' }}
    </div>

    <div class="title-wrap" style="margin-top: 20px">
      <i class="iconfont icon-chaxun title-icon"></i>
      <span>剩余名额查询</span>
    </div>
    <div
      class="max-tips"
      @click.stop="
        state.editContent = state?.max_tips || '';
        state.editType = 'max_tips';
        state.showEditDialog = true;
      "
      v-if="+tableData?.[0]?.residual === 0"
    >
      {{ state?.max_tips || '' }}
    </div>

    <el-table
      :cell-class-name="cellClassName"
      @cell-click="tableItemClick"
      :data="tableData"
      stripe
      border
      style="width: 100%; margin-top: 20px"
      :header-cell-style="{ backgroundColor: '#f5faff', color: '#333' }"
    >
      <el-table-column v-for="(item, index) in tableList" :key="index" align="center" :prop="item.key" :label="item.title" />
    </el-table>

    <div
      class="title-wrap"
      style="margin-top: 60px"
      @click.stop="
        state.editContent = +state?.broadcastList?.length || 0;
        state.editType = 'broadcast';
        state.showEditDialog = true;
      "
    >
      <i class="iconfont icon-tongzhi title-icon"></i>
      <span>报名播报</span>
    </div>

    <div class="broadcast-wrap" v-if="+state?.broadcastList?.length > 0">
      <div class="broadcast-item" v-for="(item, index) in state.broadcastList" :key="index" :style="`border-color:${item.color}`">
        <div class="dot" :style="`background-color:${item.color}`"></div>
        <span>{{ item?.msg || '' }} {{ item?.time || '' }}</span>
      </div>
    </div>

    <div class="title-wrap" style="margin-top: 60px">
      <i class="iconfont icon-bianji title-icon"></i>
      <span>填写申请表</span>
    </div>
    <el-form ref="userForm" :rules="formRules" :inline="true" style="display: flex; flex-wrap: wrap; margin-top: 20px" :model="formData" class="demo-form-inline">
      <el-form-item label="姓名" prop="user">
        <el-input v-model="formData.user" maxlength="20" placeholder="请输入姓名" clearable />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" type="tel" maxlength="11" placeholder="请输入手机号" clearable />
      </el-form-item>

      <el-form-item label="身份证号" prop="card">
        <el-input v-model="formData.card" maxlength="18" placeholder="请输入身份证号" clearable style="width: 250px" />
      </el-form-item>

      <el-form-item label="收货地址" prop="address">
        <el-input v-model="formData.address" type="textarea" resize="none" :rows="4" maxlength="100" placeholder="请输入收货地址" clearable style="width: 400px" />
      </el-form-item>
    </el-form>

    <div>
      <el-checkbox v-model="formData.is_vip" label="开通vip" size="large" />
      <el-checkbox v-if="+tableData?.[0]?.residual === 0" v-model="formData.is_force_insert" label="强制插队" size="large" />
    </div>

    <el-button class="submit-btn" type="primary" size="large" style="width: 200px" @click.stop="submitForm(userForm)">提交</el-button>

    <EditDialog v-model:show="state.showEditDialog" :content="state.editContent" :type="state.editType" @change="dataChange"></EditDialog>
    <SuccessDialog v-model:show="state.showSuccessDialog" :content="formData"></SuccessDialog>
  </div>
</template>

<script setup>
import CloneDeep from 'lodash.clonedeep';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import EditDialog from '@/components/EditDialog.vue';
import SuccessDialog from '@/components/SuccessDialog.vue';
import ChineseNameMap from '@/utils/ChineseNameMap.js';
import Big from 'big.js';

dayjs.extend(isBetween);

const tableList = reactive([
  { key: 'class', title: '级别' },
  { key: 'activity', title: '活动' },
  { key: 'discount', title: '优惠折扣' },
  { key: 'total', title: '总名额' },
  { key: 'registered', title: '已报名' },
  { key: 'residual', title: '剩余名额' },
]);

const tableData = reactive([
  {
    class: '全程上岸班',
    activity: '折上折特惠',
    discount: '折上折',
    total: 100, //总名额
    registered: 60, //已报名
    residual: 40, //剩余名额
  },
]);

const userForm = ref(null);
const formData = reactive({
  user: '', //姓名
  phone: '', //手机号
  card: '', //身份证号码
  address: '', //收货地址
  is_vip: false, //是否为vip
  is_force_insert: false, //是否强制插队
});

const state = reactive({
  showEditDialog: false, //是否显示编辑弹窗
  showSuccessDialog: false, //是否显示提交成功弹窗
  editContent: '', //编辑弹窗显示的内容
  editType: '', //编辑弹窗类型
  tableHandle: {}, //当前表格操作项
  now_time: '', //当前时间
  end_time: '', //截止时间
  end_tips: '提醒：本期报名为内部限时优惠活动，名额有限，请及时提交申请表!', //提示
  max_tips: '提示：剩余名额为0，必须使用强制插队方可提交（强制插队可用次数：1）',
  broadcastList: [], //报名播报列表
});

onMounted(() => {
  updateClock();
  init();
});

/**
 * @description: 初始化
 */
const init = () => {
  state.end_time = `截止时间：${dayjs().format('YYYY年MM月DD日')} 23:59:59`;
  createBroadcast();
};

/**
 * @description: 生成指定数量的报名播报信息
 * @param {Number} n 生成数量
 */
const createBroadcast = (n = 8) => {
  //生成随机时间
  const generateTime = () => {
    const now = dayjs();
    let startTime = '';
    let endTime = '';

    if (now.isBetween(dayjs().startOf('day').add(9, 'hour'), dayjs().startOf('day').add(23, 'hour').add(59, 'minute').add(59, 'second'))) {
      startTime = dayjs().startOf('day').add(9, 'hour');
      endTime = now;
    } else {
      startTime = dayjs().subtract(1, 'day').startOf('day').add(9, 'hour');
      endTime = dayjs().subtract(1, 'day').startOf('day').add(23, 'hour');
    }

    const randomTime = dayjs(startTime + Math.random() * (endTime - startTime)).format('YYYY.MM.DD HH:mm:ss');
    return randomTime;
  };

  //生成随机颜色
  const generateColor = () => {
    const colorList = ['#9567e1', '#dba450', '#52aab1'];
    const randomIndex = Math.floor(Math.random() * colorList.length);
    return colorList[randomIndex];
  };

  let randomSurnames = [];
  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * ChineseNameMap.length);
    const target = {
      msg: `恭喜${ChineseNameMap[randomIndex]}同学，报名成功~`,
      time: generateTime(),
      color: generateColor(),
    };
    randomSurnames.push(target);
  }
  state.broadcastList = randomSurnames || [];
};

/**
 * @description: 更新当前时间
 */
const updateClock = () => {
  const now_time = dayjs().format('YYYY年MM月DD日 HH时mm分ss秒');
  state.now_time = now_time;
  requestAnimationFrame(updateClock);
};

/**
 * @description: 表单规则
 */
const formRules = reactive({
  user: [{ required: true, message: '请输入姓名', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'change' },
    { pattern: /^1[23456789]\d{9}$/, message: '手机号格式不正确', trigger: 'change' },
  ],

  card: [
    { required: true, message: '请输入身份证号', trigger: 'change' },
    { pattern: /^(.{15}|.{18})$/, message: '身份证号格式不正确', trigger: 'change' },
  ],
  address: [{ required: false, message: '请输入收货地址', trigger: 'change' }],
});

/**
 * @description: Table单元格样式
 */
const cellClassName = ({ row, column, rowIndex, columnIndex }) => {
  row.index = rowIndex;
  column.index = columnIndex;
};

/**
 * @description: 表格项点击
 */
const tableItemClick = (row, column, cell, event) => {
  const { index: rowIndex } = row;
  const { property: key, index: colIndex } = column;

  if (['total', 'registered', 'residual'].includes(key)) {
    state.editType = 'table_number';
  } else {
    state.editType = 'table_text';
  }

  state.editContent = tableData?.[rowIndex]?.[key] || 0;
  state.tableHandle = { rowIndex, colIndex, key };
  state.showEditDialog = true;
};

/**
 * @description: 数据变化
 */
const dataChange = (data) => {
  const { type, value } = data;
  const { rowIndex, colIndex, key } = state?.tableHandle || {};

  if (['end_time', 'end_tips', 'max_tips'].includes(type)) {
    state[type] = value;
  }

  if (type === 'broadcast') {
    createBroadcast(value || 1);
  }

  if (type === 'table_text') {
    tableData[rowIndex][key] = value;
  }

  if (type === 'table_number') {
    let total = +tableData[rowIndex]?.total || 0;
    let registered = +tableData[rowIndex]?.registered || 0;
    let residual = +tableData[rowIndex]?.residual || 0;
    if (key === 'total') {
      total = +value;
      registered = +registered <= +total ? +registered : +total;
      residual = +Big(+total).minus(+registered);
    }

    if (key === 'registered') {
      registered = +value;
      registered = +registered <= +total ? +registered : +total;
      residual = +Big(+total).minus(+registered);
    }

    if (key === 'residual') {
      residual = +value;
      residual = +residual <= +total ? +residual : +total;
      registered = +Big(+total).minus(+residual);
    }

    tableData[rowIndex]['total'] = +total;
    tableData[rowIndex]['registered'] = +registered;
    tableData[rowIndex]['residual'] = +residual;
  }
};

/**
 * @description: 表单提交
 */
const submitForm = async (el) => {
  try {
    if (!el) return;
    await el.validate();
    formData.is_force_insert = +tableData?.[0]?.residual === 0 && formData.is_force_insert;
    state.showSuccessDialog = true;
  } catch (err) {
    console.log(err);
  }
};
</script>

<style lang="scss" scoped>
$mainColor: #4b8ce9;
$mainColor-2: #c62a29;

.page-index {
  width: 100%;
  min-height: 100vh;
  padding: 40px;
  background-color: #fff;
}

.title-wrap {
  display: inline-block;
  background-color: #ecf3fe;
  color: $mainColor;
  padding: 10px 30px;
  font-size: 24px;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;

  .title-icon {
    color: #333;
    font-size: inherit;
    margin-right: 20px;
  }
}

.time-wrap {
  font-size: 24px;
  color: #333;
}

.end-box {
  width: 100%;
  text-align: center;
  margin: 30px auto 0 auto;

  .end-wrap {
    display: inline-block;
    padding: 10px 100px;
    background-color: #fde8e9;
    border-radius: 30px;
    color: $mainColor-2;
    font-size: 26px;
    font-weight: bold;
    cursor: pointer;
  }
}

.max-tips {
  margin-top: 10px;
  width: 100%;
  font-size: 22px;
  color: $mainColor-2;
  font-weight: bold;
  cursor: pointer;
}

.tips-wrap {
  width: 100%;
  margin-top: 20px;
  text-align: center;
  font-size: 24px;
  color: #333;
  cursor: pointer;
}

.broadcast-wrap {
  width: 100%;
  flex-wrap: wrap;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  .broadcast-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    min-width: 420px;
    padding: 10px 0;
    color: #333;
    border: 1px solid;
    border-radius: 8px;
    text-align: center;
    font-size: 18px;
    margin: 0 20px 20px 0;
    font-weight: bold;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin: 0 10px 0 0;
    }
  }
}

.submit-btn {
  display: block;
  margin: 60px auto 0 auto;
}
</style>
