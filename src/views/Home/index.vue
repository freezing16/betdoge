<script setup>
import countTime from '@/components/countTime.vue'
import { ethers } from 'ethers';
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { utils } from '@/utils/utils.js'
import userabi from '@/assets/userabi.json'
import aidogeabi from '@/assets/aidogeabi.json'
const infomation = ref({
    currentIssue: 0,
    myaidoge: 0,
    mybetdoge: 0,
    prevNum: 0,
    prevMyNum: 0,
    mycurrentNum: ""
});
const wallAddr = ref(null)
const waiting = ref("");
const format = (percentage) => (percentage === 100 ? 'Full' : `${percentage}%`)
const Openstatus = ref(false);




let userlen = ref(null);
let endTime = ref(null);
let isApprove = ref(null);
let isApproveLoading = ref(false)
let isbettingLoading = ref(false)
let isExAidogeLoading = ref(false)
let isExBetdogeLoading = ref(false)

let bettingAmount;
let userAddr = '0xa73a55674284A0050C1510cBa3d28A6D4EE6e4a8';
let userABI = userabi
let aidogeAddr = '0x09E18590E8f76b6Cf471b3cd75fE1A1a9D2B2c2b';
let aidogeABI = aidogeabi;
let provider, myaddress, userContract1, userContract2, aidogeContract, aidogeContract1, aidogeContract2, signer;


const getInfo = async () => {
    //获取当前参与人数
    userlen.value = await userContract1.Userslen()
    userlen.value = Number(userlen.value)
    // 获取开奖期数
    let _currentIssue = await userContract1.LotteryNumber()
    infomation.value.currentIssue = _currentIssue
    //获取用户aidoge数量
    let _myaidoge = await userContract1.lotteryUsers(myaddress, 'aidoge')
    infomation.value.myaidoge = utils.formatNumber(_myaidoge)
    //获取用户betdoge数量
    let _mybetdoge = await userContract1.lotteryUsers(myaddress, 'betdoge')
    infomation.value.mybetdoge = utils.formatNumber(_mybetdoge)
    // 获取结束时间
    let Time = await userContract1.timeEnd()
    endTime = Number(Time)
    // 上期数字
    let _prevNum = await userContract1.getLotteryList(_currentIssue.toString() - 1)
    infomation.value.prevNum = _prevNum.toString();
    //上期用户数字
    let _prevMyNum = await userContract1.getUserRecordList(myaddress, _currentIssue.toString() - 1)
    infomation.value.prevMyNum = _prevMyNum.toString();
    //当前用户数字
    let _mycurrentNum = await userContract1.getUserRecordList(myaddress, _currentIssue.toString())
    infomation.value.mycurrentNum = _mycurrentNum.toString();
    //投注金额
    let _bettingAmount = await userContract1.bettingAmount()
    bettingAmount = _bettingAmount
    //获取授权额度
    let approveAmount = await aidogeContract1.allowance(myaddress, userAddr)
    if (approveAmount < bettingAmount) {
        isApprove.value = true
    } else {
        isApprove.value = false
    }
}


//授权
const approve = async () => {
    isApproveLoading.value = true
    try {
        let eventListenerCount = await aidogeContract1.listenerCount('Approval');
        console.log(eventListenerCount)
        if (eventListenerCount == 0) {
            aidogeContract1.once('Approval', async (_user, _spender, _value) => {
                if (utils.addressToUpperCase(_user) == utils.addressToUpperCase(myaddress)
                    && utils.addressToUpperCase(_spender) == utils.addressToUpperCase(userAddr)) {
                    getInfo()
                    ElMessage({
                        message: 'Transaction sent successfully.',
                        type: 'success',
                        duration: 3000
                    })
                    isApproveLoading.value = false
                }
            })
        }

        let res = await aidogeContract2.approve(userAddr, 100000000000000000000000n)

    } catch (error) {
        console.error(error)
        ElMessage.error(error.toString())
        isApproveLoading.value = false
    }

}



//投入
const Betting = async () => {
    isbettingLoading.value = true
    try {

        let eventListenerCount = await userContract1.listenerCount('betsuccess');
        console.log(eventListenerCount)
        if (eventListenerCount == 0) {
            userContract1.once('betsuccess', (_user) => {
                if (utils.addressToUpperCase(_user) == utils.addressToUpperCase(myaddress)) {
                    getInfo()
                    ElMessage({
                        message: 'Transaction sent successfully.',
                        type: 'success',
                        duration: 3000
                    })
                    isbettingLoading.value = false
                }
            })
        }



        let res = await userContract2.Betting(bettingAmount)


    } catch (error) {
        console.log(error)
        ElMessage.error(error.toString())
        isbettingLoading.value = false
    }
}

// 提取aidoge
const ExtractAIDOGE = async () => {
    isExAidogeLoading.value = true;
    let amount = await userContract1.lotteryUsers(myaddress, 'aidoge')
    console.log(amount);
    if (amount > 0) {
        try {

            let eventListenerCount = await userContract1.listenerCount('extractToken');
            console.log(eventListenerCount)
            if (eventListenerCount == 0) {
                userContract1.once('extractToken', (_user) => {
                    if (utils.addressToUpperCase(_user) == utils.addressToUpperCase(myaddress)) {
                        getInfo()
                        ElMessage({
                            message: 'Transaction sent successfully.',
                            type: 'success',
                            duration: 3000
                        })
                        isExAidogeLoading.value = false

                    }
                })
            }


            let res = await userContract2.extractAidoge(amount)


        } catch (error) {
            ElMessage.error(error.toString())
            isExAidogeLoading.value = false;
        }
    } else {
        ElMessage({
            message: 'Insufficient withdrawable balance.',
            type: 'warning',
            duration: 3000
        })
        isExAidogeLoading.value = false;

    }
}

// 提取betdoge
const ExtractBETDOGE = async () => {
    isExBetdogeLoading.value = true;
    let amount = await userContract1.lotteryUsers(myaddress, 'betdoge')
    console.log(amount)
    if (amount > 0) {
        try {

            let eventListenerCount = await userContract1.listenerCount('extractToken');
            console.log(eventListenerCount)
            if (eventListenerCount == 0) {
                userContract1.once('extractToken', (_user) => {
                    if (utils.addressToUpperCase(_user) == utils.addressToUpperCase(myaddress)) {
                        getInfo()
                        ElMessage({
                            message: 'Transaction sent successfully.',
                            type: 'success',
                            duration: 3000
                        })
                        isExBetdogeLoading.value = false
                    }
                })
            }



            let res = await userContract2.extractBetdoge(amount)


        } catch (error) {
            ElMessage.error(error.toString())
            isExBetdogeLoading.value = false;
        }

    } else {
        ElMessage({
            message: 'Insufficient withdrawable balance.',
            type: 'warning',
            duration: 3000
        })
        isExBetdogeLoading.value = false

    }
}


// connect钱包
const connect = async () => {
    try {
        //没有打开metamask先打开
        let res = await ethereum.request({ method: 'eth_requestAccounts' })
        //如果链不对切换链
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{
                chainId: `0x${Number(42161).toString(16)}`, //切换到指定链
            }
            ]
        })
        wallAddr.value = res[0].substring(0, 6) + '...' + res[0].substring(res[0].length - 4);
        Setprovider()
    } catch (error) {
        ElMessage.error(JSON.stringify(error))
    }
}

//设置provider
const Setprovider = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{
                chainId: `0x${Number(42161).toString(16)}`, //切换到指定链
            }
            ]
        })
    } catch (error) {
        ElMessage.error(JSON.stringify(error))
    }
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    myaddress = await window.ethereum.request({ method: 'eth_requestAccounts' });
    myaddress = myaddress[0]
    userContract1 = new ethers.Contract(userAddr, userABI, provider)
    userContract2 = new ethers.Contract(userAddr, userABI, signer)
    aidogeContract1 = new ethers.Contract(aidogeAddr, aidogeABI, provider)
    aidogeContract2 = new ethers.Contract(aidogeAddr, aidogeABI, signer)
    let eventListenerCount = await userContract1.listenerCount('Openstatus');
    console.log(eventListenerCount)
    if (eventListenerCount) {
        userContract1.off("Openstatus", () => {
            console.log("event off")
        })
    }
    // 注册监听器
    userContract1.on('Openstatus', (_state) => {
        if (_state) {
            console.log('start')
            Openstatus.value = true
        } else {
            console.log('close')
            Openstatus.value = false
            getInfo()
        }
    })

    getInfo()
}

//切换钱包
window.ethereum.on('accountsChanged', async (accounrs) => {
    location.reload();
})

//加载完成
onMounted(async () => {
    if (window.ethereum.selectedAddress) {
        let res = await window.ethereum.request({ method: 'eth_requestAccounts' });
        wallAddr.value = res[0].substring(0, 6) + '...' + res[0].substring(res[0].length - 4);
        Setprovider()
    }
})



//倒计时结束
const handleCountdownEnded = () => {
    // if(endTime){
    //     waiting.value = "waiting"
    // }else{
    //     waiting.value=null
    // }

};
</script>


<template>
    <div class="header">
        <div class="logo">
            <img src="@/assets/images/logo.png" alt="" srcset="">
        </div>
        <div class="account">
            <el-button v-if="!wallAddr" @click="connect" type="primary" round>Connect Wallet</el-button>
            <div class="address" v-if="wallAddr">{{ wallAddr }}</div>
        </div>
    </div>
    <div class="banner">

    </div>

    <div class="lottery_box" v-loading="Openstatus" element-loading-text="Lottery in progress..."
        element-loading-background="rgba(167, 81, 255,.4)">
        <div class="LuckNumbers">
            <h1>AIDOGE Lottery</h1>
            <h2>By participating in the AIDOGE lottery, 
                9 numbers will be drawn, and the winners of each number will receive 10XAIDOGE.
                The remaining 10% of AIDOGE will be distributed,
                with 7% being burned to 0x000000000000000000000000000000000000dEaD and 3% used for Chainlink expenses and
                development
            </h2>

            <h2>
                10B Aidoge one opportunity.Open once every 30+ minutes when the number of participants reaches
                100.
                If 30+ minutes have passed and the number of participants is below 100,
                it will wait until there are 100 participants to start.
                We will randomly select 9 numbers from 0 to 99. Each person can only purchase one ticket at a time, but
                multiple purchases are allowed.
            </h2>
           
            <!-- <h1>Rules</h1>
            <h2>
                10B Aidoge one opportunity.Open once every 30+ minutes when the number of participants reaches
                100.
                If 30+ minutes have passed and the number of participants is below 100,
                it will wait until there are 100 participants to start.
                We will randomly select 9 numbers from 0 to 99. Each person can only purchase one ticket at a time, but
                multiple purchases are allowed.
            </h2> -->
            <div class="progress">
                <div class="timeState">
                    <countTime :timestamp="endTime" @countdown-ended="handleCountdownEnded" />
                    <!-- <span class="waiting">{{ waiting }}</span> -->
                </div>
                <el-progress :percentage="userlen" :format="format" stroke-width=12 />
            </div>

            <div class="Info">
                <h1>Information</h1>
                <div class="InfoBox">
                    <ul>
                        <li>
                            <span>Current Issue:</span>
                            <span>{{ infomation.currentIssue }}</span>
                        </li>
                        <li>
                            <span>MyAIDOGE:</span>
                            <span>{{ infomation.myaidoge }}</span>
                        </li>
                        <li>
                            <span>MyBETDOGE:</span>
                            <span>{{ infomation.mybetdoge }}</span>
                        </li>
                        <li>
                            <span>PreviousPeriod:{{ infomation.prevNum }}</span>
                        </li>
                        <li>
                            <span>MyPreviousPeriod:{{ infomation.prevMyNum }}</span>
                        </li>
                        <li>
                            <span>MyCurrentNumber:[{{ infomation.mycurrentNum }}]</span>
                        </li>

                    </ul>
                </div>
            </div>

            <div class="StartSend">
                <el-button size="large" :loading="isExAidogeLoading" @click="ExtractAIDOGE" color="#626aef"
                    type="primary">ClaimAIDOGE</el-button>
                <el-button size="large" v-if="!isApprove" :disabled="userlen >= 100" :loading="isbettingLoading"
                    @click="Betting" type="success">Burning</el-button>
                <el-button size="large" v-if="isApprove" :loading="isApproveLoading" @click="approve"
                    type="warning">approve</el-button>
                <el-button size="large" :loading="isExBetdogeLoading" @click="ExtractBETDOGE"
                    type="primary">ClaimBETDOGE</el-button>
            </div>

        </div>
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

        .address {
            border: 2px solid #1ee5d1;
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


.lottery_box {
    margin: 20px;
    margin-top:-60px;
    border: 2px solid rgb(156, 81, 255);
    border-radius: 15px;
    padding: 10px 35px;

    .LuckNumbers {
        padding: 30px;

        h1 {
            text-align: center;
            padding: 0;
            margin: 0;
            font-size: 30px;
        }

        h2 {
            color: rgb(103, 115, 149);
            font-size: 16px;
            margin-top: 30px;
            line-height: 26px;
            font-family: Helvetica;
            margin-bottom: 20px;
        }

        ul {}

    }

    .progress {
        color: #fff !important;

        .timeState {
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;

            .waiting {
                margin-right: 60px;
            }
        }
    }

    .Info {
        margin: 10px 0;

        .InfoBox {
            margin-top: 10px;
            border: 1px solid #9c51ff;
            border-radius: 20px;
            padding: 15px 20px;
            color: #b7c0d7;
            font-size: 16px;
        }

        ul {

            li {
                line-height: 36px;
            }
        }
    }

    .StartSend {
        margin-top: 20px;
        display: flex;
        justify-content: space-between;

        button {
            width: 160px;
            height: 40px;
            font-size: 14px;
        }
    }
}
</style>