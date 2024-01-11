export default function (props, key, emit) {
  const innerControl = ref(false);
  watch(
    () => props[key],
    (v) => {
      innerControl.value = v;
    },
    { deep: true, immediate: true }
  );
  watch(
    () => innerControl.value,
    (v) => {
      emit(`update:${key}`, v);
    },
    { deep: true, immediate: true }
  );
  return innerControl;
}
