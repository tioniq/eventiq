"use strict";var L=Object.defineProperty;var re=Object.getOwnPropertyDescriptor;var ae=Object.getOwnPropertyNames;var se=Object.prototype.hasOwnProperty;var oe=(r,t)=>{for(var e in t)L(r,e,{get:t[e],enumerable:!0})},ne=(r,t,e,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of ae(t))!se.call(r,a)&&a!==e&&L(r,a,{get:()=>t[a],enumerable:!(i=re(t,a))||i.enumerable});return r};var le=r=>ne(L({},"__esModule",{value:!0}),r);var De={};oe(De,{AndVariable:()=>T,CombinedVariable:()=>D,CompoundVariable:()=>n,ConstVar:()=>d,ConstVariable:()=>d,ConstantVariable:()=>d,DelegateVariable:()=>q,DirectVariable:()=>S,FuncVar:()=>x,FuncVariable:()=>x,ImmutableVar:()=>d,InvertVariable:()=>F,LazyVariable:()=>x,LinkedChain:()=>l,MapVariable:()=>u,MaxVariable:()=>A,MinVariable:()=>O,MutableVar:()=>w,MutableVariable:()=>w,OrVariable:()=>V,ReadonlyVar:()=>d,SealVariable:()=>I,SumVariable:()=>_,SwitchMapVariable:()=>N,ThrottledVariable:()=>g,Var:()=>s,Variable:()=>s,Vary:()=>w,and:()=>ye,createConst:()=>_e,createDelayDispatcher:()=>P,createDelegate:()=>fe,createDirect:()=>Te,createFuncVar:()=>ve,createVar:()=>de,defaultEqualityComparer:()=>c,functionEqualityComparer:()=>p,isVariable:()=>ge,isVariableOf:()=>Ee,max:()=>we,min:()=>xe,or:()=>Ve,simpleEqualityComparer:()=>ue,strictEqualityComparer:()=>Y,sum:()=>Ce});module.exports=le(De);var s=class{equalTo(t){return this.equalityComparer(this.value,t)}toString(){let t=this.value;return t==null?`${t}`:t.toString()}valueOf(){return this.value}};function Y(r,t){return r===t}function ue(r,t){return r==t}var c=Y;function p(r,t){return r===t}var y=require("@tioniq/disposiq");var l=class r{constructor(t){this._head=null;this._tail=null;this._invoking=!1;this._pendingHead=null;this._pendingTail=null;this._actionHead=null;this._equalityComparer=t!=null?t:c}get hasAny(){return this._head!==null||this._pendingHead!==null}get empty(){return this._head===null&&this._pendingHead===null}get count(){let t=0,e=this._head;if(e!==null)do++t,e=e.next;while(e!==null);if(e=this._pendingHead,e!==null)do t++,e=e.next;while(e!==null);return t}toArray(){let t=this.count;if(t===0)return[];let e=new Array(t),i=this._head,a=0;if(i!==null)do e[a++]=i.value,i=i.next;while(i!==null);if(i=this._pendingHead,i!==null)do e[a++]=i.value,i=i.next;while(i!==null);return e}addUnique(t){let e=this._findNode(t);return e!==null?[new y.DisposableAction(()=>this._unlinkNode(e)),!1]:[this.add(t),!0]}add(t){let e;return this._invoking?(this._pendingHead===null?(e=new h(t),this._pendingHead=e,this._pendingTail=e):(e=new h(t,this._pendingTail,null),this._pendingTail.next=e,this._pendingTail=e),new y.DisposableAction(()=>this._unlinkNode(e))):(this._head===null?(e=new h(t),this._head=e,this._tail=e):(e=new h(t,this._tail,null),this._tail.next=e,this._tail=e),new y.DisposableAction(()=>this._unlinkNode(e)))}addToBeginUnique(t){let e=this._findNode(t);return e!==null?[new y.DisposableAction(()=>this._unlinkNode(e)),!1]:[this.addToBegin(t),!0]}addToBegin(t){let e;return this._head===null?(e=new h(t),this._head=e,this._tail=e):(e=new h(t,null,this._head),this._head.previous=e,this._head=e),new y.DisposableAction(()=>this._unlinkNode(e))}addToBeginNode(t){let e=r._clearNode(t);if(e===null)return;if(this._head===null){for(this._head=e;e.next!==null;)e=e.next;this._tail=e;return}let i=e;for(;i.next!==null;)i=i.next;i.next=this._head,this._head.previous=i,this._head=e}remove(t){let e=this._head;for(;e!==null;){if(this._equalityComparer(e.value,t))return this._unlinkNode(e),!0;e=e.next}for(e=this._pendingHead;e!==null;){if(this._equalityComparer(e.value,t))return this._unlinkNode(e),!0;e=e.next}return!1}clear(){let t=this._head;if(t!==null){for(;t!==null;)t.disposed=!0,t=t.next;this._head=null,this._tail=null}if(t=this._pendingHead,t!==null){for(;t!==null;)t.disposed=!0,t=t.next;this._pendingHead=null,this._pendingTail=null}}removeAll(){let t=this._head;return this._head=null,this._tail=null,t}forEach(t){for(;t!==null;){if(this._head!==null){if(this._invoking){if(this._actionHead==null){this._actionHead=new h(t);return}let a=this._actionHead;for(;a.next!==null;)a=a.next;a.next=new h(t,a,null);return}this._invoking=!0;let i=this._head;for(;i!==null;)i.disposed||t(i.value),i=i.next;this._invoking=!1,this._pendingHead!=null&&(this._head==null?(this._head=this._pendingHead,this._tail=this._pendingTail):(this._pendingHead.previous=this._tail,this._tail.next=this._pendingHead,this._tail=this._pendingTail),this._pendingHead=null,this._pendingTail=null)}if(this._actionHead==null)return;let e=this._actionHead;e.disposed=!0,this._actionHead=e.next,this._actionHead!=null&&(this._actionHead.previous=null,e.next=null),t=e.value}}_findNode(t){let e=this._head;for(;e!==null;){if(this._equalityComparer(e.value,t))return e;e=e.next}if(this._invoking)for(e=this._pendingHead;e!==null;){if(this._equalityComparer(e.value,t))return e;e=e.next}return null}_unlinkNode(t){if(!t.disposed){if(t.disposed=!0,t===this._head){if(t.next===null){this._head=null,this._tail=null;return}this._head=t.next,this._head.previous=null;return}if(t===this._tail){this._tail=t.previous,this._tail.next=null;return}if(t===this._pendingHead){if(t.next==null){this._pendingHead=null,this._pendingTail=null;return}this._pendingHead=t.next,this._pendingHead.previous=null;return}if(t===this._pendingTail){this._pendingTail=t.previous,this._pendingTail.next=null;return}t.previous!==null&&(t.previous.next=t.next),t.next!==null&&(t.next.previous=t.previous)}}static _clearNode(t){let e=null,i=null,a=t;for(;a!==null;)if(t=a,a=t.next,!t.disposed){if(e===null){e=t,i=t,t.previous=null;continue}i.next=t,t.previous=i,i=t}return i!==null&&(i.next=null),e}},h=class{constructor(t,e,i){this.disposed=!1;this.value=t,this.previous=e!=null?e:null,this.next=i!=null?i:null}};var W=require("@tioniq/disposiq"),n=class extends s{constructor(e,i){super();this._chain=new l(p);this._value=e,this._equalityComparer=i!=null?i:c}get active(){return this._chain.hasAny}get value(){return this._chain.hasAny?this._value:this.getExactValue()}set value(e){this._equalityComparer(e,this._value)||(this._value=e,this._chain.forEach(i=>i(e)))}get equalityComparer(){return this._equalityComparer}subscribe(e){this._chain.empty&&this.activate();let[i,a]=this._chain.addUnique(e);return a&&e(this._value),new W.DisposableAction(()=>{i.dispose(),this._chain.empty&&this.deactivate()})}subscribeSilent(e){this._chain.empty&&this.activate();let i=this._chain.addUnique(e)[0];return new W.DisposableAction(()=>{i.dispose(),this._chain.empty&&this.deactivate()})}getExactValue(){return this._value}setValueSilent(e){this._value=e}setValueForce(e){this._value=e,this._chain.forEach(i=>i(e))}notify(){let e=this._value;this._chain.forEach(i=>i(e))}};var j=require("@tioniq/disposiq"),T=class extends n{constructor(e){super(!1);this._subscriptions=[];this._variables=e}activate(){this._listen(0)}deactivate(){(0,j.disposeAll)(this._subscriptions)}getExactValue(){let e=this._variables;for(let i=0;i<e.length;++i)if(!e[i].value)return!1;return!0}_listen(e){if(e>=this._variables.length){this.value=!0;return}if(this._subscriptions.length>e)return;let i=o=>{o?this._listen(e+1):(this._unsubscribeFrom(e+1),this.value=!1)},a=this._variables[e];this._subscriptions.push(a.subscribeSilent(i)),i(a.value)}_unsubscribeFrom(e){var i;for(;e<this._subscriptions.length;)(i=this._subscriptions.pop())==null||i.dispose()}};var G=require("@tioniq/disposiq"),D=class extends n{constructor(e){if(!(e!=null&&e.length))throw new Error("No variables provided");let i=e.map(a=>a.equalityComparer);super(ce(e.length),pe(i));this._subscriptions=new G.DisposableStore;this._vars=e.slice()}activate(){this._subscriptions.disposeCurrent();let e=this._vars.length,i=new Array(e);for(let a=0;a<e;++a){let o=this._vars[a];this._subscriptions.add(o.subscribeSilent(R=>{i[a]=R,this.setValueForce(i)})),i[a]=o.value}this.setValueForce(i)}deactivate(){this._subscriptions.disposeCurrent()}getExactValue(){let e=this._vars.length,i=new Array(e);for(let a=0;a<e;++a)i[a]=this._vars[a].value;return i}};function pe(r){return function(t,e){if(t.length!==e.length)return!1;for(let i=0;i<t.length;++i)if(!r[i](t[i],e[i]))return!1;return!0}}var be=Object.freeze([]);function ce(r){return be}var K=require("@tioniq/disposiq");var d=class extends s{constructor(t,e){super(),this._value=t,this._equalityComparer=e!=null?e:c}get value(){return this._value}get equalityComparer(){return this._equalityComparer}subscribe(t){return t(this._value),K.emptyDisposable}subscribeSilent(t){return K.emptyDisposable}};var C=require("@tioniq/disposiq"),q=class extends n{constructor(e){super(e instanceof s?null:e!=null?e:null);this._sourceSubscription=new C.DisposableContainer;e instanceof s?this._source=e:this._source=null}setSource(e){return e?(this._source=e,this._sourceSubscription.disposeCurrent(),this.active&&(this._sourceSubscription.set(e.subscribeSilent(i=>this.setValueForce(i))),this.value=e.value),new C.DisposableAction(()=>{this._source===e&&this.setSource(null)})):(this._source&&(this.value=this._source.value,this._source=null),this._sourceSubscription.disposeCurrent(),C.emptyDisposable)}activate(){this._source!==null&&(this._sourceSubscription.disposeCurrent(),this._sourceSubscription.set(this._source.subscribeSilent(e=>this.setValueForce(e))),this.value=this._source.value)}deactivate(){this._source!==null&&this._sourceSubscription.disposeCurrent()}getExactValue(){return this._source!==null?this._source.value:super.getExactValue()}};var S=class extends s{constructor(e,i){super();this._chain=new l(p);this._value=e,this._equalityComparer=i!=null?i:c}get value(){return this._value}set value(e){this._value=e,this._chain.forEach(i=>i(e))}get equalityComparer(){return this._equalityComparer}subscribe(e){let[i,a]=this._chain.addUnique(e);return a&&e(this._value),i}subscribeSilent(e){return this._chain.addUnique(e)[0]}setSilent(e){this._value=e}notify(){let e=this._value;this._chain.forEach(i=>i(e))}};var $=require("@tioniq/disposiq"),x=class extends n{constructor(t,e){super(null);let i=new $.DisposableContainer;this._activator=a=>{i.disposeCurrent(),i.set(t(a))},this._deactivator=()=>{i.disposeCurrent()},this._exactValue=e}get value(){return super.value}set value(t){super.value=t}setValueForce(t){super.setValueForce(t)}setValueSilent(t){super.setValueSilent(t)}notify(){super.notify()}activate(){this._activator(this)}deactivate(){this._deactivator(this)}getExactValue(){return this._exactValue()}};var k=require("@tioniq/disposiq");var F=class extends s{constructor(e){super();this._chain=new l(p);this._value=!1;this._subscription=new k.DisposableContainer;this._variable=e}get value(){return this._chain.hasAny?this._value:!this._variable.value}get equalityComparer(){return this._variable.equalityComparer}subscribe(e){this._chain.empty&&this._activate();let[i,a]=this._chain.addUnique(e);return a&&e(this._value),new k.DisposableAction(()=>{i.dispose(),this._chain.empty&&this._deactivate()})}subscribeSilent(e){return this._variable.subscribeSilent(i=>e(!i))}_activate(){this._subscription.disposeCurrent(),this._subscription.set(this._variable.subscribeSilent(e=>{let i=this._value=!e;this._chain.forEach(a=>a(i))})),this._value=!this._variable.value}_deactivate(){this._subscription.disposeCurrent()}};var J=require("@tioniq/disposiq"),u=class extends n{constructor(e,i,a){super(i(e.value),a);this._subscription=new J.DisposableContainer;this._listener=e=>{this.value=this._mapper(e)};this._variable=e,this._mapper=i}activate(){this._subscription.disposeCurrent(),this._subscription.set(this._variable.subscribeSilent(this._listener)),this._listener(this._variable.value)}deactivate(){this._subscription.disposeCurrent()}getExactValue(){return this._mapper(this._variable.value)}};var Q=require("@tioniq/disposiq"),A=class extends n{constructor(e){super(0);this._subscriptions=new Q.DisposableStore;this._vars=e.slice()}activate(){let e=this._vars,i=e.length,a=this._subscriptions;a.disposeCurrent();for(let o=0;o<i;++o)a.add(e[o].subscribeSilent(()=>{this.postValue()}));this.postValue()}deactivate(){this._subscriptions.dispose()}getExactValue(){let e=this._vars,i=e.length,a=Number.NEGATIVE_INFINITY;for(let o=0;o<i;++o)a=Math.max(a,e[o].value);return a}postValue(){let e=this._vars,i=e.length,a=Number.NEGATIVE_INFINITY;for(let o=0;o<i;++o)a=Math.max(a,e[o].value);this.value=a}};var X=require("@tioniq/disposiq"),O=class extends n{constructor(e){super(0);this._subscriptions=new X.DisposableStore;this._vars=e.slice()}activate(){let e=this._vars,i=e.length,a=this._subscriptions;a.disposeCurrent();for(let o=0;o<i;++o)a.add(e[o].subscribeSilent(()=>{this.postValue()}));this.postValue()}deactivate(){this._subscriptions.dispose()}getExactValue(){let e=this._vars,i=e.length,a=Number.POSITIVE_INFINITY;for(let o=0;o<i;++o)a=Math.min(a,e[o].value);return a}postValue(){let e=this._vars,i=e.length,a=Number.POSITIVE_INFINITY;for(let o=0;o<i;++o)a=Math.min(a,e[o].value);this.value=a}};var w=class extends s{constructor(e,i){super();this._chain=new l(p);this._value=e,this._equalityComparer=i!=null?i:c}get value(){return this._value}set value(e){this._equalityComparer(e,this._value)||(this._value=e,this._chain.forEach(i=>i(e)))}get equalityComparer(){return this._equalityComparer}subscribe(e){let[i,a]=this._chain.addUnique(e);return a&&e(this._value),i}subscribeSilent(e){return this._chain.addUnique(e)[0]}setSilent(e){this._value=e}notify(){let e=this._value;this._chain.forEach(i=>i(e))}};var Z=require("@tioniq/disposiq"),V=class extends n{constructor(e){super(!1);this._subscriptions=[];this._variables=e}activate(){this._listen(0)}deactivate(){(0,Z.disposeAll)(this._subscriptions)}getExactValue(){let e=this._variables;for(let i=0;i<e.length;++i)if(e[i].value)return!0;return!1}_listen(e){if(e>=this._variables.length){this.value=!1;return}if(this._subscriptions.length>e)return;let i=o=>{o?(this._unsubscribeFrom(e+1),this.value=!0):this._listen(e+1)},a=this._variables[e];this._subscriptions.push(a.subscribeSilent(i)),i(a.value)}_unsubscribeFrom(e){var i;for(;e<this._subscriptions.length;)(i=this._subscriptions.pop())==null||i.dispose()}};var v=require("@tioniq/disposiq");var I=class extends s{constructor(e,i){super();this._chain=new l(p);this._varSubscription=new v.DisposableContainer;this._value=null;this._sealed=!1;this._var=e,this._equalityComparer=typeof i=="function"?i:e.equalityComparer}get value(){return this._sealed?this._value:this._chain.empty?this._var.value:this._value}get equalityComparer(){return this._equalityComparer}subscribe(e){if(this._sealed)return e(this._value),v.emptyDisposable;this._chain.empty&&this._activate();let[i,a]=this._chain.addUnique(e);return a&&e(this._value),new v.DisposableAction(()=>{i.dispose(),!this._sealed&&this._chain.empty&&this._deactivate()})}subscribeSilent(e){if(this._sealed)return v.emptyDisposable;this._chain.empty&&this._activate();let i=this._chain.addUnique(e)[0];return new v.DisposableAction(()=>{i.dispose(),!this._sealed&&this._chain.empty&&this._deactivate()})}seal(e){if(this._sealed)return!1;if(this._sealed=!0,this._varSubscription.dispose(),arguments.length===0){let i=this._chain.empty?this._var.value:this._value;return this._varSubscription.dispose(),this._sealValue(i),!0}return this._varSubscription.dispose(),this._sealValue(e),!0}_activate(){this._varSubscription.disposeCurrent(),this._varSubscription.set(this._var.subscribeSilent(e=>{this._value=e,this._chain.forEach(i=>i(e))})),this._value=this._var.value}_deactivate(){this._varSubscription.disposeCurrent()}_sealValue(e){if(this._equalityComparer(e,this._value)){this._chain.clear();return}this._value=e,this._chain.forEach(i=>i(e)),this._chain.clear()}};var ee=require("@tioniq/disposiq"),_=class extends n{constructor(e){super(0);this._subscriptions=new ee.DisposableStore;this._vars=e.slice()}activate(){let e=this._vars,i=e.length,a=this._subscriptions;a.disposeCurrent();for(let o=0;o<i;++o){let R=e[o];a.add(R.subscribeSilent(()=>{this.postValue()}))}this.postValue()}deactivate(){this._subscriptions.dispose()}getExactValue(){let e=this._vars,i=e.length,a=0;for(let o=0;o<i;++o)a+=e[o].value;return a}postValue(){let e=this._vars,i=e.length,a=0;for(let o=0;o<i;++o)a+=e[o].value;this.value=a}};var z=require("@tioniq/disposiq"),N=class extends n{constructor(e,i){super(null);this._switchSubscription=new z.DisposableContainer;this._varSubscription=new z.DisposableContainer;this._var=e,this._mapper=i}activate(){this._switchSubscription.disposeCurrent(),this._switchSubscription.set(this._var.subscribeSilent(e=>this._handleSwitch(e))),this._handleSwitch(this._var.value)}deactivate(){this._switchSubscription.disposeCurrent(),this._varSubscription.disposeCurrent()}getExactValue(){return this._mapper(this._var.value).value}_handleSwitch(e){this._varSubscription.disposeCurrent();let i=this._mapper(e);this._varSubscription.set(i.subscribeSilent(a=>this.value=a)),this.value=i.value}};var B=require("@tioniq/disposiq"),H=Object.freeze({}),g=class extends n{constructor(e,i){super(null,e.equalityComparer);this._subscription=new B.DisposableContainer;this._updateSubscription=new B.DisposableContainer;this._scheduledValue=H;this._var=e,this._onUpdate=i}activate(){this._subscription.disposeCurrent(),this._subscription.set(this._var.subscribeSilent(e=>{this._scheduleUpdate(e)})),this.value=this._var.value}deactivate(){this._subscription.disposeCurrent(),this._updateSubscription.disposeCurrent()}getExactValue(){return this._var.value}_scheduleUpdate(e){if(this._scheduledValue!==H){this._scheduledValue=e;return}this._scheduledValue=e,this._updateSubscription.disposeCurrent(),this._updateSubscription.set(this._onUpdate.subscribeOnce(()=>{let i=this._scheduledValue;this._scheduledValue=H,this.value=i===H?this._var.value:i}))}};var m=require("@tioniq/disposiq");var te=Object.freeze(function(){});var ie=require("@tioniq/disposiq");var b=class{};var U=class extends b{constructor(){super(...arguments);this._nodes=new l(p)}subscribe(e){return this._nodes.add(e)}dispatch(e){this._nodes.forEach(i=>i(e))}get hasSubscriptions(){return this._nodes.hasAny}};var he=require("@tioniq/disposiq");var E=require("@tioniq/disposiq");var f=class extends b{constructor(e){super();this._nodes=new l(p);this._subscription=new E.DisposableContainer;this._activator=e}get hasSubscription(){return this._nodes.hasAny}subscribe(e){let i;return this._nodes.empty?(i=this._nodes.add(e),this._activate()):i=this._nodes.add(e),new E.DisposableAction(()=>{i.dispose(),!this._nodes.hasAny&&this._deactivate()})}dispatch(e){this._nodes.forEach(i=>i(e))}_activate(){this._subscription.disposeCurrent(),this._subscription.set((0,E.toDisposable)(this._activator(this)))}_deactivate(){this._subscription.disposeCurrent()}};var me=require("@tioniq/disposiq");var M=require("@tioniq/disposiq");b.prototype.subscribeOnce=function(r){let t=new M.DisposableContainer;return t.set(this.subscribe(e=>{t.dispose(),r(e)})),t};b.prototype.subscribeOnceWhere=function(r,t){let e=new M.DisposableContainer;return e.set(this.subscribe(i=>{t(i)&&(e.dispose(),r(i))})),e};b.prototype.subscribeWhere=function(r,t){return this.subscribe(e=>{t(e)&&r(e)})};b.prototype.subscribeOn=function(r,t){return t.subscribeDisposable(e=>e?this.subscribe(r):M.emptyDisposable)};b.prototype.map=function(r){return new f(t=>this.subscribe(e=>t.dispatch(r(e))))};b.prototype.where=function(r){return new f(t=>this.subscribe(e=>{r(e)&&t.dispatch(e)}))};U.prototype.dispatchSafe=function(r){try{this.dispatch(r)}catch(t){}};function de(r){return new w(r)}function ve(r,t){return new x(r,t)}function _e(r){return new d(r)}function fe(r){return new q(r)}function Te(r){return new S(r)}function Ve(...r){return new V(r)}function ye(...r){return new T(r)}function Ce(...r){return new _(r)}function xe(...r){return new O(r)}function we(...r){return new A(r)}function P(r){return new f(t=>{let e=setTimeout(()=>t.dispatch(),r);return new ie.DisposableAction(()=>clearTimeout(e))})}s.prototype.subscribeDisposable=function(r){let t=new m.DisposableContainer,e=this.subscribe(i=>{t.disposeCurrent(),t.set((0,m.toDisposable)(r(i)))});return new m.DisposableAction(()=>{e.dispose(),t.dispose()})};s.prototype.subscribeOnceWhere=function(r,t){let e=new m.DisposableContainer;e.set(this.subscribeSilent(a=>{t(a)&&(e.dispose(),r(a))}));let i=this.value;return t(i)?(e.dispose(),r(i),m.emptyDisposable):e};s.prototype.map=function(r){return new u(this,r)};s.prototype.or=function(r){return new V([this,r])};s.prototype.and=function(r){return new T([this,r])};s.prototype.invert=function(){return new F(this)};s.prototype.with=function(...r){return new D([this,...r])};s.prototype.switchMap=function(r){return new N(this,r)};s.prototype.throttle=function(r){return typeof r=="number"?new g(this,P(r)):new g(this,r)};s.prototype.streamTo=function(r){return this.subscribe(t=>r.value=t)};s.prototype.startPersistent=function(){return this.subscribeSilent(te)};s.prototype.plus=function(r){return r instanceof s?new _([this,r]):new u(this,t=>t+r)};s.prototype.minus=function(r){return r instanceof s?new _([this,new u(r,t=>-t)]):new u(this,t=>t-r)};s.prototype.multiply=function(r){return r instanceof s?this.with(r).map(([t,e])=>t*e):new u(this,t=>t*r)};s.prototype.divide=function(r){return r instanceof s?this.with(r).map(([t,e])=>t/e):new u(this,t=>t/r)};s.prototype.round=function(){return new u(this,Math.round)};s.prototype.moreThan=function(r){return r instanceof s?this.with(r).map(([t,e])=>t>e):new u(this,t=>t>r)};s.prototype.lessThan=function(r){return r instanceof s?this.with(r).map(([t,e])=>t<e):new u(this,t=>t<r)};s.prototype.moreOrEqual=function(r){return r instanceof s?this.with(r).map(([t,e])=>t>=e):new u(this,t=>t>=r)};s.prototype.lessOrEqual=function(r){return r instanceof s?this.with(r).map(([t,e])=>t<=e):new u(this,t=>t<=r)};s.prototype.equal=function(r){return r instanceof s?this.with(r).map(([t,e])=>this.equalityComparer(t,e)):new u(this,t=>this.equalityComparer(t,r))};s.prototype.sealed=function(){return new d(this.value)};s.prototype.sealWhen=function(r){let t=new I(this);return typeof r=="function"?(t.subscribeOnceWhere(e=>t.seal(e),r),t):(t.subscribeOnceWhere(e=>t.seal(e),e=>this.equalityComparer(e,r)),t)};function ge(r){return r instanceof s}function Ee(r,t){if(!(r instanceof s))return!1;let e;return typeof t=="function"?e=t:typeof t=="undefined"?e=()=>!0:e=i=>typeof i==typeof t,e(r.value)}0&&(module.exports={AndVariable,CombinedVariable,CompoundVariable,ConstVar,ConstVariable,ConstantVariable,DelegateVariable,DirectVariable,FuncVar,FuncVariable,ImmutableVar,InvertVariable,LazyVariable,LinkedChain,MapVariable,MaxVariable,MinVariable,MutableVar,MutableVariable,OrVariable,ReadonlyVar,SealVariable,SumVariable,SwitchMapVariable,ThrottledVariable,Var,Variable,Vary,and,createConst,createDelayDispatcher,createDelegate,createDirect,createFuncVar,createVar,defaultEqualityComparer,functionEqualityComparer,isVariable,isVariableOf,max,min,or,simpleEqualityComparer,strictEqualityComparer,sum});
//# sourceMappingURL=index.cjs.map