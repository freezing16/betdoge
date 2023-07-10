export const utils = {
    //金额转换
    formatNumber: (number) => {
        const stringValue = number.toString();
        if (stringValue.length > 6) {
            return Number(stringValue.slice(0, -6)).toLocaleString('en-US');
        } else {
            return stringValue;
        }
    },
    // 地址转大写
    addressToUpperCase:(value)=>{
        return String(value).toUpperCase();
    }
}


