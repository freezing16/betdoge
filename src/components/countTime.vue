<template>
    <div class="countTime">
        <span>{{ formattedTime }}</span>
    </div>
  </template>
  <script>
  import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
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
        const date = new Date(currentTime.value * 1000); 
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        currentTime.value = Math.floor((props.timestamp - Date.now()) / 1000);
        if (currentTime.value <= 0){
            return '00:00'
        }
        return  `${minutes}:${seconds}` ;
      });
       const startCountdown = () => {
        interval = setInterval(() => {
          currentTime.value = Math.floor((props.timestamp - Date.now()) / 1000);
           if (currentTime.value <= 0) {
            clearInterval(interval);
            emit('countdown-ended');
            
          }
        }, 1000);
      };
       watch(() => props.timestamp, () => {
        startCountdown();
      });
       onMounted(() => {
        startCountdown();
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

  <style lang="less">
  .countTime{
   span{
      font-size: 18px;
      color: #fcd3d3;
   }

  }

  </style>