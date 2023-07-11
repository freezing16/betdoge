import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'normalize.css'
import './styles/home.css'

import Vconsole from 'vconsole'
let vConsole = new Vconsole()


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vConsole)
app.mount('#app')
