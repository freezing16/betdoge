<template>
  <div class="countTime">
    <span>{{ formattedTime }}</span>
  </div>
</template>
<script>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { ethers } from 'ethers';
 export default {
  props: {
    timestamp: {
      type: Number,
      required: true
    }
  },
  setup(props, { emit }) {
    let interval;
    const currentTime = ref(0);
    const formattedTime = computed(() => {
      const minutes = Math.floor(currentTime.value / 60).toString().padStart(2, '0');
      const seconds = (currentTime.value % 60).toString().padStart(2, '0');
      if (currentTime.value <= 0) {
        return '';
      }
      return `${minutes}:${seconds}`;
    });
     const startCountdown = () => {
      interval = setInterval(() => {
        currentTime.value--;
        if (currentTime.value <= 0) {
          clearInterval(interval);
          emit('countdown-ended');
        }
      }, 1000);
    };
     const getCurrentBlockTimestamp = async () => {
      const pro = new ethers.BrowserProvider(window.ethereum);
      const block = await pro.getBlock('latest');
      const timestamp = block.timestamp;
      return Number(timestamp);
    };
     const updateCountdown = async () => {
      const currentTimestamp = await getCurrentBlockTimestamp();
      currentTime.value = Math.floor(props.timestamp - currentTimestamp);
      startCountdown();
    };
     watch(() => props.timestamp, () => {
      updateCountdown();
    });
     onMounted(() => {
      updateCountdown();
    });
     onUnmounted(() => {
      clearInterval(interval);
    });
     return {
      formattedTime
    };
  }
};
</script>