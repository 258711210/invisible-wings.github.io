import{c,d as f,u as k,a as l,b as n,w as g,e,f as i,g as w,n as y,h as b,v as x,t as C,i as L,r as d,j as z,o as r,k as V,_ as S}from"./index-CeE3sFbZ.js";import{C as I}from"./circle-alert-CLJfIFTU.js";/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=c("ArrowLeftIcon",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=c("LockIcon",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=c("ShieldCheckIcon",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]),N={class:"login-view"},R={class:"login-card glass-panel blur-card"},D={class:"login-header"},T={class:"icon-orb"},j=["disabled"],E={key:0,class:"error-msg"},H=["disabled"],P={key:0},U={key:1,class:"loader"},q=f({__name:"LoginView",setup(F){const u=k(),p=V(),o=d(""),t=d(""),a=d(!1);async function m(){if(!o.value)return;a.value=!0,t.value="",await new Promise(s=>setTimeout(s,600)),await u.login(o.value)?p.push({name:"admin-dashboard"}):(t.value="密码不正确，请联系系统管理员。",o.value=""),a.value=!1}return(v,s)=>{const _=z("RouterLink");return r(),l("div",N,[n(_,{to:"/",class:"back-link"},{default:g(()=>[n(i(M),{size:16}),s[1]||(s[1]=e("span",null,"返回首页",-1))]),_:1}),e("div",R,[e("div",D,[e("div",T,[n(i(B),{size:40,class:"gold-text"})]),s[2]||(s[2]=e("h2",{class:"gold-text"},"管理后台登录",-1)),s[3]||(s[3]=e("p",null,"请输入超级管理员密码以继续",-1))]),e("form",{onSubmit:w(m,["prevent"]),class:"login-form"},[e("div",{class:y(["input-group",{"has-error":t.value}])},[n(i(A),{class:"input-icon",size:20}),b(e("input",{"onUpdate:modelValue":s[0]||(s[0]=h=>o.value=h),type:"password",placeholder:"管理员密码",autocomplete:"current-password",disabled:a.value},null,8,j),[[x,o.value]])],2),t.value?(r(),l("div",E,[n(i(I),{size:16}),e("span",null,C(t.value),1)])):L("",!0),e("button",{type:"submit",disabled:a.value,class:"login-btn"},[a.value?(r(),l("span",U)):(r(),l("span",P,"验证身份"))],8,H)],32),s[4]||(s[4]=e("div",{class:"login-footer"},[e("p",null,"© 2026 隐翅阁 - 数据维护系统")],-1))])])}}}),K=S(q,[["__scopeId","data-v-21438324"]]);export{K as default};
