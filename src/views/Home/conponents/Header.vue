<script setup>
import { ref, onMounted } from 'vue';
const wallAddr = ref(null)
const connect = async () => {
    let res = await window.ethereum.enable();
    wallAddr.value = res[0].substring(0,6)+'...'+res[0].substring(res[0].length-4);
}


onMounted(async () => {
    if (window.ethereum.selectedAddress) {
        let res = await window.ethereum.request({ method: 'eth_requestAccounts' });
        wallAddr.value = res[0].substring(0,6)+'...'+res[0].substring(res[0].length-4);
    }
})

</script>

<template>
    <div class="header">
        <div class="logo">
            <img src="@/assets/images/logo.png" alt="" srcset="">
        </div>
        <div class="account">
            <el-button v-if="!userAddr" @click="connect" type="primary" round>Connect Wallet</el-button>
            <div class="address" v-if="userAddr">{{ userAddr }}</div>
        </div>
    </div>
    <div class="banner">

    </div>
</template>

<style lang="less">
.header {
    // max-width: 750px;
    height: 80px;
    background: rgba(255, 255, 255, 0);
    color: #fff;
    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap;

    .logo {
        width: 100px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
            width: 50px;
            height: 50px;
        }

    }

    .account {
        padding-right: 20px;
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: flex-end;
        .address{
            border:2px solid #1ee5d1;
            border-radius: 10px;
            padding: 8px 10px;

        }
    }
}

.banner {
    margin-top: -80px;
    padding-top: 80px;
    background: url("@/assets/images/background.jpg") center top / 100% no-repeat;
    width: 100%;
    height: 367px;
    background-size: contain;
}
</style>