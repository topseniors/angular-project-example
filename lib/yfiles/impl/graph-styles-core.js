/****************************************************************************
 **
 ** This file is part of yFiles for HTML 2.0.1.3.
 ** 
 ** yWorks proprietary/confidential. Use is subject to license terms.
 **
 ** Copyright (c) 2017 by yWorks GmbH, Vor dem Kreuzberg 28, 
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ***************************************************************************/
!function(a){!function(b){"function"==typeof define&&define.amd?define(["./lang","./core-lib","./graph-core"],b):"object"==typeof exports&&"undefined"!=typeof module&&"object"==typeof module.exports?module.exports=b(require("./lang"),require("./core-lib"),require("./graph-core")):b(a.yfiles.lang,a.yfiles)}(function(b,c){return function(a,b,c,d){"use strict";function e(b,c){var d=c.$kK;a.XN.$m13(a.NJ.$f61,b,d)&&a.XN.$m12(a.NJ.$f61,b,d)}function f(b,c){var d=!0,e=c.$kK;if(null!==e){var f,g=a.C.LDB.isInstance(f=e.$cV(a.C.LDB.$class))?f:null;if(null!==g){var h=a.AQ.$m4(a.C.IDB.$class,g);null!==h&&h.$SQ.$kV(b.$f)&&(d=h.$CW(b.$f))}}return d}function g(a){var b=a.$f1.$f1;return null!==b?b.$XK.$uc(a.$f,b):null}function h(b,c){var d=new a.C.XXA.$A;d.$TIB(c.$f,c.$f1,0);var e=new a.C.KWA(16);e.$BEA(.25,.45),e.$AEA(.25,.55),e.$AEA(.45,.55),e.$AEA(.45,.75),e.$AEA(.55,.75),e.$AEA(.55,.55),e.$AEA(.75,.55),e.$AEA(.75,.45),e.$AEA(.55,.45),e.$AEA(.55,.25),e.$AEA(.45,.25),e.$AEA(.45,.45),e.$kgA(),b.$f3=new a.SO.$c(e,d);var f=new a.C.KWA(16);f.$BEA(.25,.45),f.$AEA(.25,.55),f.$AEA(.75,.55),f.$AEA(.75,.45),f.$kgA(),b.$f4=new a.SO.$c(f,d)}function i(b,c){b.$f5.childNodes.length>=2&&a.PN.$m29(b.$f5,1),null!==c&&a.PN.$m25(b.$f5,c)}function j(a,b,c,d){return d?a.$jeB(b,c):a.$keB(b,c)}function k(b,c,d,e,f,g,h){if(g!==a.IL.$f){var i=j(b,f,g,h);if(null!==i){var k,l=(k=g.$Rf(e,h,i.$f,i.$f1).$UW(c))instanceof a.C.BIB?k:null;if(null!==l){d.appendChild(l.$f5);d[h?T[19]:T[20]]=l}}}}function l(b,c,d,e,f,g,h){var i=h?T[19]:T[20],k=j(b,f,g,h);if(g===a.IL.$f||null===k)return void m(d,i);var l,n=d[i],o=g.$Rf(e,h,k.$f,k.$f1),p=(l=n?o.$Kc(c,n):o.$UW(c))instanceof a.C.BIB?l:null;p!==n&&(n&&n.$f5&&n.$f5.parentNode===d&&d.removeChild(n.$f5),null!==p?(d.appendChild(p.$f5),d[i]=p):delete d[i])}function m(a,b){var c=a[b];c&&c.$f5&&c.$f5.parentNode===a&&a.removeChild(c.$f5),delete a[b]}function n(b,c){c.$YQ=b.$f1.$f3;var d,e=a.C.JJB.isInstance(d=b.$f.$cV(a.C.JJB.$class))?d:null;c.$f9=null!==e?e.$oP:null,c.$xP=b.$f.$xP}function o(b){var c,d=b.$f1.$f2.$XK.$tb(b.$f3,b.$f1.$f2),e=a.C.IGB.isInstance(c=d.$cV(a.C.IGB.$class))?c:null,f=b.$m5();if(null!==e){var g=e.$vV(b.$f3);g=g.$NqA(f),b.$f4.$MQ=b.$f2.$MQ-g.$eNA,b.$f4.$vQ=b.$f2.$vQ-g.$lIA,b.$f4.$RR=g.$f1,b.$f4.$SR=b.$f2.$vQ-g.$f3}else b.$f4.$MQ=b.$f2.$MQ-f.$eNA,b.$f4.$vQ=b.$f2.$vQ-f.$lIA,b.$f4.$RR=f.$f1,b.$f4.$SR=b.$f2.$vQ-f.$f3}function p(a,b){return b.$XK.$tc(a,b)}function q(b,c,d){return 0!==d?d:a.T.KPB.$f8.$vJ(c)?a.T.KPB.$f8.$tJ(c):(d=r(b,c),a.T.KPB.$f8.$xJ(c,d),d)}function r(b,c){for(var d=a.T.KPB.$f6,e=0;e<10;e++)d+="\ng";w(b,d,c);for(var f=(new Date).getTime(),g=w(b,d,c),e=0;e<6;e++)w(b,d,c);var h=(new Date).getTime(),i=h-f;v(b,d,c,!1),f=(new Date).getTime();for(var j=v(b,d,c,!1),e=0;e<6;e++)v(b,d,c,!1);h=(new Date).getTime();var k=h-f,l=1/E(a.T.KPB.$f4,c),m=Math.abs(1-l),n=g.$f1/j.$f1,o=Math.abs(1-n);return m>.05||o>.05||k<=i?1:2}function s(a,b,c,d){return 2===q(a,c,d)?w(a,b,c):v(a,b,c,!1)}function t(a,b,c,d,e){return 2===e?w(a,b,c):u(a,b,c,d)}function u(b,c,d,e){if(document.body.contains(e)){var f=e.getBBox();return new a.C.IXA(f.width,f.height)}return v(b,c,d,!1)}function v(b,d,e,f){var g=c.document,h=g.createElementNS(T[7],"text");a.PN.setFont(h,e);var i=1;if(f)h.textContent=d,h.setAttribute("dy","1em");else{var j=I(b,h,d,e,a.T.IXA.INFINITE,0,1);i=a.KF.$m2(j,"\r?\n").size+1}h.setAttributeNS(null,"x",0),h.setAttributeNS(null,"y",100);var k,l,m=g.body,n=g.createElementNS(T[7],"svg");try{n.style.setProperty(T[21],T[22],""),m.appendChild(n),n.appendChild(h);var o=h.getBBox();k=o.width,f?l=o.height:(F(a.T.KPB.$f4,e)||x(b,e),l=B(e,i))}finally{m.removeChild(n)}return new a.C.IXA(k,l)}function w(b,c,d){x(b,d);var e,f=y(b,d),g=E(a.T.KPB.$f4,d),h=a.KF.$m1(c,"\r?\n"),i=A(d,h.length),j=0;for(e=0;e<h.length;e++){var k=h[e],l=f.measureText(k).width;j=Math.max(l,j)}return j*=g,new a.C.IXA(j,i)}function x(b,c){if(!z(c)){var d=y(b,c),e=v(b,a.T.KPB.$f6,c,!0),f=d.measureText(a.T.KPB.$f6),g=e.$f/f.width,h=e.$f1;H(a.T.KPB.$f4,c,h,g)}}function y(b,c){var d=C(),e=d.getContext("2d");return a.UG.setFont(e,c),e}function z(b){return F(a.T.KPB.$f4,b)}function A(b,c){return(F(a.T.KPB.$f4,b)?D(a.T.KPB.$f4,b):b.$f6)+(c-1)*(b.$f6+b.$f6*b.$f10)}function B(a,b){return A(a,b)}function C(){return null===a.T.KPB.$f3&&(a.T.KPB.$f3=c.document.createElement(T[23])),a.T.KPB.$f3}function D(a,b){return a.$f.$tJ(b).$f}function E(a,b){return a.$f.$tJ(b).$f1}function F(a,b){return a.$f.$vJ(b)}function G(b,c){var d={};return a.C.CRA.$m1(b.$f,c,d)||(d.value=new a.T.KPB.T.T,b.$f.$xJ(c,d.value)),d.value}function H(a,b,c,d){var e=G(a,b);e.$f=c,e.$f1=d}function I(b,c,d,e,f,g,h){return x(b,e),h=q(b,e,h),null!==f?J(b,c,d,e,f,g,h):J(b,c,d,e,a.T.IXA.INFINITE,g,h)}function J(a,b,c,d,e,f,g){return 0===f?K(a,b,c,d,e):L(a,b,c,d,e,f,g)}function K(b,c,d,e,f){var g=c.ownerDocument,h=a.KF.$m1(d,"\r?\n"),i=h.length,j=1+e.$f10,k=1;if(i>1){c.hasAttribute("dy")&&c.removeAttribute("dy");var l=null;a.PN.$m11(c);for(var m=0;m<i;m++){var n=M(h[m]);if(a.UF.$m4(n))k+=j,null===l?l="\n":l+="\n";else{var o=g.createElementNS(T[7],T[27]);null===l?l=n:l+="\n"+n;var p=n.indexOf("  ")>=0;if(p&&o.setAttributeNS(T[24],T[25],T[26]),o.textContent=n,o.setAttributeNS(null,"x",0),o.setAttribute("dy",k+"em"),k=j,c.appendChild(o),z(e)){if(N(b,e,B(e,m+1),f.$f1))break}}}return l}for(;c.hasChildNodes();)c.removeChild(c.firstChild);c.textContent=M(d),c.setAttribute("dy",k+"em");var p=d.indexOf("  ")>=0;return p&&c.setAttributeNS(T[24],T[25],T[26]),d}function L(b,c,d,e,f,g,h){var i="",j=c.ownerDocument;a.PN.$m11(c);var k=a.AO.$m1(c,c.ownerDocument),l=j.body,m=j.createElementNS(T[7],"svg");l.appendChild(m),m.appendChild(k);for(var n=1+e.$f10,o=1,p=a.KF.$m1(d,"\r?\n"),q=1,r=0;r<p.length;r++){var s=M(p[r]);if(a.UF.$m4(s))o+=n;else{var t=0,u=s.indexOf("  ")>=0;u&&k.setAttributeNS(T[24],T[25],T[26]);for(var v=s.length-t;v>0;){var w=s.substr(t),x=O(b,k,e,w,f.$f,g,!1,h);if(!(x.length>0))break;t+=x.length,t+=P(s.substr(t)),v=s.length-t;var y=j.createElementNS(T[7],T[27]);if(y.textContent=x,u&&y.setAttributeNS(T[24],T[25],T[26]),y.setAttribute("dy",o+"em"),o=n,y.setAttributeNS(null,"x",0),c.appendChild(y),z(e)){if(N(b,e,B(e,q),f.$f1))return x=O(b,k,e,w,f.$f,g,!0,h),y.textContent=x,l.removeChild(m),a.UF.$m19("",i)?x:i+"\r\n"+x}i=a.UF.$m19("",i)?x:i+"\r\n"+x,q++}}}return l.removeChild(m),i}function M(a){return b.workaroundIE964525?a.replace(new RegExp("\\s","g")," "):a}function N(a,b,c,d){return c+.9*(b.$f6+b.$f10*b.$f6)>d}function O(a,b,c,d,e,f,g,h){return 1===f||2===f?Q(a,b,c,d,e,g&&2===f,h):R(a,b,c,d,e,g&&4===f,h)}function P(b){var c=b.search(a.T.KPB.$f7);return c>=0?c:b.length}function Q(b,c,d,e,f,g,h){var i,j=g?a.T.KPB.$f5:"",k=f,l=S(b,c,d,e,h);if(l<=k)i=e;else{if((k-=a.UF.$m4(j)?0:S(b,c,d,j,h))<=0)i=j;else{for(var m=0,n=e.length,o=l;m<n-1;){var p=0+(n-m)/(o-0)*(k-0)|0;p<=m?p=m+1:p>=n&&(p=n-1),l=S(b,c,d,e.substr(0,p),h),l>k?n=p:m=p}i=e.substr(0,m)+j}}return c.textContent=i,i}function R(b,c,d,e,f,g,h){var i=g?a.T.KPB.$f5:"",j=S(b,c,d,e,h);if(j<=f)return e;if(f<=0)return"";var k=0,l=e,m=e.substr(1);k>0&&(l=e.substr(k),m=e.substr(k+1));var n=m.search(a.T.KPB.$f2),o=l.search(a.T.KPB.$f1);if(n>=0&&o>=0)k=k+Math.min(o,n)+1;else if(n>=0)k=k+n+1;else{if(!(o>=0))return Q(b,c,d,e,f,g,h);k=k+o+1}if(k>=e.length)return Q(b,c,d,e,f,g,h);var p=k,q=e.length,r=0===p?0:S(b,c,d,e.substr(0,p)+i,h);if(r>f)return Q(b,c,d,e,f,g,h);for(var s=j;p<q-1;){var t=r+(q-p)/(s-r)*(f-r)|0;t<=p?t=p+1:t>=q&&(t=q-1),j=S(b,c,d,e.substr(0,t)+i,h),j>f?(q=t,s=j):(p=t,r=j)}if(k>0&&p>k)for(;p>0&&(p<1||e[p-1].search(a.T.KPB.$f1)<0)&&e[p].search(a.T.KPB.$f2)<0;)p--;return e.substr(0,p)+i}function S(a,b,c,d,e){return b.textContent=d,t(a,d,c,b,e).$f}b.lang.addMappings("yFiles-for-HTML-Complete-2.0.1.3-Evaluation (Build c5516864459e-11/02/2017)",{get _$_pea(){return["$A",b.lang.decorators.OptionOverload("CollapsibleNodeStyleDecorator",0,b.lang.decorators.SetterArg("buttonPlacement"),b.lang.decorators.SetterArg("insets"))]},get _$_qea(){return["$B",b.lang.decorators.OptionOverload("CollapsibleNodeStyleDecorator",0,b.lang.decorators.Arg("yfiles._R.C.MGB","wrapped"),b.lang.decorators.Arg("yfiles._R.C.DPB","renderer",null),b.lang.decorators.SetterArg("buttonPlacement"),b.lang.decorators.SetterArg("insets"))]},_$_rea:["addToggleExpansionStateCommand","$B"],_$_sea:["createLayoutTransform","$A"],get _$_tea(){return["measureText","$A",b.lang.decorators.Args("text","font",b.lang.decorators.Arg("yfiles._R.C.LPB","measurePolicy",0))]},get _$_uea(){return["addText","$B",b.lang.decorators.OptionArgs("targetElement","text","font",b.lang.decorators.Arg("yfiles._R.C.IXA","maximumSize"),b.lang.decorators.Arg("yfiles._R.C.FIB","wrapping",0),b.lang.decorators.Arg("yfiles._R.C.LPB","measurePolicy",0))]},_$_lvc:["layout","$Up"],_$_gci:["node","$SKB"],_$_vci:["style","$hKB"],_$_lhi:["configure","$xMB"],_$_yji:["getButtonSize","$KOB"],_$_ali:["getWrappedStyle","$mOB"],_$_zoi:["createSelectionInstaller","$lQB"],_$_opi:["getButtonLocationParameter","$ARB"],_$_wsi:["getPath","$iSB"],_$_tui:["getOutline","$fTB"],_$_taj:["getSegmentCount","$fWB"],_$_dcj:["getPreferredSize","$PXB"],_$_ukj:["lookup","$kbB"],_$_vkj:["lookup","$lbB"],_$_wkj:["lookup","$mbB"],_$_xkj:["lookup","$nbB"],_$_elj:["isInside","$ubB"],_$_ilj:["getBounds","$ybB"],_$_jlj:["getBounds","$zbB"],_$_klj:["getBounds","$AcB"],_$_llj:["getBounds","$BcB"],get _$_ulj(){return["$KcB",b.lang.decorators.Overload("getTangent",0,b.lang.decorators.Arg("yfiles._R.C.BDB"),b.lang.decorators.Arg(Number))]},_$_umj:["createVisual","$kcB"],_$_vmj:["createVisual","$lcB"],_$_wmj:["createVisual","$mcB"],_$_xmj:["createVisual","$ncB"],_$_tqj:["getSourceArrowAnchor","$jeB"],_$_uqj:["getTargetArrowAnchor","$keB"],_$_mvj:["isHit","$ChB"],_$_nvj:["isHit","$DhB"],_$_ovj:["isHit","$EhB"],_$_pvj:["isHit","$FhB"],_$_svj:["isInBox","$IhB"],_$_tvj:["isInBox","$JhB"],_$_uvj:["isInBox","$KhB"],_$_vvj:["isInBox","$LhB"],_$_bwj:["isVisible","$QhB"],_$_cwj:["isVisible","$RhB"],_$_dwj:["isVisible","$ShB"],_$_ewj:["isVisible","$ThB"],get _$_lwj(){return["$ahB",b.lang.decorators.Overload("getTangent",0,b.lang.decorators.Arg("yfiles._R.C.BDB"),b.lang.decorators.Arg(Number),b.lang.decorators.Arg(Number))]},_$_rwj:["createButton","$ghB"],_$_swj:["updateVisual","$hhB"],_$_twj:["updateVisual","$ihB"],_$_uwj:["updateVisual","$jhB"],_$_vwj:["updateVisual","$khB"],_$_nxj:["getIntersection","$CiB"],_$_uzj:["cropPath","$JjB"],_$_bak:["updateButton","$QjB"],_$_uck:["addArrows","$jkB"],_$_xck:["updateArrows","$mkB"],_$_bal:["CollapsibleNodeStyleDecoratorRenderer","DPB"],_$_cal:["EdgeStyleBase","EPB"],_$_dal:["LabelStyleBase","FPB"],_$_eal:["NodeStyleBase","GPB"],_$_fal:["PortStyleBase","JPB"],_$_gal:["TextRenderSupport","KPB"],_$_hal:["TextMeasurePolicy","LPB"],get _$$_dp(){return["$A",b.lang.decorators.OptionOverload("NodeStyleLabelStyleAdapter",0,b.lang.decorators.SetterArg("autoFlip"),b.lang.decorators.SetterArg("labelStyle"),b.lang.decorators.SetterArg("labelStyleInsets"),b.lang.decorators.SetterArg("nodeStyle"))]},get _$$_ep(){return["$B",b.lang.decorators.OptionOverload("NodeStyleLabelStyleAdapter",0,b.lang.decorators.Arg("yfiles._R.C.MGB","nodeStyle"),b.lang.decorators.Arg("yfiles._R.C.GGB","labelStyle"),b.lang.decorators.SetterArg("autoFlip"),b.lang.decorators.SetterArg("labelStyleInsets"))]},get _$$_fp(){return["$A",b.lang.decorators.OptionOverload("NodeStylePortStyleAdapter",0,b.lang.decorators.SetterArg("nodeStyle"),b.lang.decorators.SetterArg("renderSize"))]},get _$$_gp(){return["$B",b.lang.decorators.OptionOverload("NodeStylePortStyleAdapter",0,b.lang.decorators.Arg("yfiles._R.C.MGB","nodeStyle"),b.lang.decorators.SetterArg("renderSize"))]},_$$_zv:["insets","$Tp"],_$$_bx:["wrapped","$Cs"],_$$_xx:["autoFlip","$Wu"],_$$_qy:["nodeStyle","$Ex"],_$$_ry:["nodeStyle","$Fx"],_$$_hz:["labelStyle","$Gz"],_$$_iz:["renderSize","$Hz"],_$$_tba:["buttonPlacement","$SLA"],_$$_dca:["labelStyleInsets","$sNA"],_$$_wka:["CollapsibleNodeStyleDecorator","CPB"],_$$_xka:["yfiles.styles","yfiles._R.T","yfiles._R.C"],_$$_yka:["NodeStyleLabelStyleAdapter","HPB"],_$$_zka:["NodeStylePortStyleAdapter","IPB"]});var T=["wrapped","yWorks.yFiles.UI.LabelModels.InteriorLabelModel.NorthWest","5, 16, 5, 5","value","click","touchend","touchstart","http://www.w3.org/2000/svg","width","height","class","yfiles-collapsebutton yfiles-collapsebutton-unchecked","yfiles-collapsebutton yfiles-collapsebutton-checked","labelStyle","nodeStyle","|qWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWabcdefghijklmnopqrstuvwxyzABCEDFGHIJKLMNOPQRSTUVXYZ1234567890%%","[,.:;'´`°~!§%@|\\)\\}\\]\\>\\+\\?\\/\\*\\^\\_\\-\\&]","[\\s\\(\\{\\[\\<]","[^\\s]","data-y-source-arrow","data-y-target-arrow","visibility","hidden","canvas","http://www.w3.org/XML/1998/namespace","xml:space","preserve","tspan"];b.lang.module("_$$_xka",function(c){c._$$_wka=new b.lang.ClassDefinition(function(){return{$meta:[a.C.ATA().init({contentProperty:T[0]})],$with:[a.C.MGB],constructor:{_$_pea:function(){a.C.CPB.$B.call(this,a.XL.$f1.$f85(null,null),null)},_$_qea:function(b,c){if(this.$$init$$(),null===b)throw a.WE.$m21(T[0]);this.$Cs=b,this.$f2=null!==c?c:new a.C.DPB}},$f2:null,$f3:null,$f:null,$f1:null,"_$$_tba!":{$meta:function(){return[a.FE.$c1(a.JK.$class,T[1]),b.lang.TypeAttribute(a.C.AEB.$class)]},get:function(){return this.$f3},set:function(b){if(null===b)throw a.WE.$m5();this.$f3=b}},"_$$_zv!":{$meta:function(){return[a.FE.$c1(a.C.KXA.$class,T[2]),b.lang.TypeAttribute(a.C.KXA.$class)]},get:function(){return this.$f},set:function(a){this.$f=a}},"clone!":function(){return this.memberwiseClone()},"$XK!":{$meta:function(){return[b.lang.TypeAttribute(a.C.NGB.$class)]},get:function(){return this.$f2}},"_$$_bx!":{$meta:function(){return[b.lang.TypeAttribute(a.C.MGB.$class)]},get:function(){return this.$f1},set:function(b){if(null===b)throw a.WE.$m21(T[3]);this.$f1=b}},$$init$$:function(){this.$f3=a.T.CFB.NORTH_WEST,this.$f=new a.C.KXA.$B(5,16,5,5)}}})}),b.lang.module("_$$_xka",function(c){c._$_gal=new b.lang.ClassDefinition(function(){return{constructor:function(){},$static:{$f6:T[15],$f8:null,$f3:null,$f4:null,$f:null,"_$_tea!":function(b,c,d){return s(a.T.KPB.$f,b,c,d)},"_$_uea!":function(b,c,d,e,f,g){return I(a.T.KPB.$f,b,c,d,e,f,g)},"$m1!":function(b){if(document.body.contains(b)){var c=b.getBBox();return new a.C.IXA(c.width,c.height)}return null},T:new b.lang.ClassDefinition(function(){return{$final:!0,constructor:function(){this.$$init$$()},$f:null,$$init$$:function(){this.$f=new a.C.CRA.$c1(new a.T.KPB.T1)},$static:{T:new b.lang.ClassDefinition(function(){return{$final:!0,$f:0,$f1:0}})}}}),T1:new b.lang.ClassDefinition(function(){return{$final:!0,$with:[a.XE],"$m1!":function(a,b){return a.$f7===b.$f7&&a.$f6===b.$f6&&a.$f8===b.$f8&&a.$f9===b.$f9&&a.$f10===b.$f10&&a.$f11===b.$f11},"$m!":function(a){var c=17;return c=23*c+b.lang.Object.hashCode(a.$f7),c=23*c+b.lang.Object.hashCode(a.$f6),c=23*c+b.lang.Object.hashCode(a.$f8),c=23*c+b.lang.Object.hashCode(a.$f9),c=23*c+b.lang.Object.hashCode(a.$f10),c=23*c+b.lang.Object.hashCode(a.$f11)}}}),$f1:null,$f2:null,$f7:null,$f5:null,$clinit:function(){a.T.KPB.$f8=new a.C.CRA.$c1(new a.T.KPB.T1),a.T.KPB.$f4=new a.T.KPB.T,a.T.KPB.$f=new a.C.KPB,a.T.KPB.$f1=new RegExp(T[16],""),a.T.KPB.$f2=new RegExp(T[17],""),a.T.KPB.$f7=new RegExp(T[18],""),a.T.KPB.$f5=String.fromCharCode(8230)}}}})}),b.lang.module("_$$_xka",function(c){c._$_fal=new b.lang.ClassDefinition(function(){return{$abstract:!0,$with:[a.C.RGB],constructor:function(){this.$$init$$()},$f:null,"$hR!":{get:function(){return this.$f}},_$_xmj:b.lang.Abstract,_$_vwj:function(a,b,c){return this.$ncB(a,c)},_$_llj:b.lang.Abstract,_$_ewj:function(a,b,c){return this.$BcB(a,c).$FpA(b)},_$_pvj:function(a,b,c){return this.$BcB(a,c).$PqA(a.$lS).$m1(b)},_$_vvj:function(a,b,c){return this.$BcB(a,c).$FpA(b)},_$_xkj:function(a,b){return b.isInstance(this.$f)?this.$f:null},clone:function(){return a.C.JPB.$super.memberwiseClone.call(this)},$$init$$:function(){this.$f=new a.T.JPB.T},$static:{T:new b.lang.ClassDefinition(function(){return{$final:!0,$with:[a.C.SGB,a.C.UWA,a.C.OWA,a.C.PWA,a.C.QWA,a.C.RWA,a.C.FJB],$f:null,$f1:null,"$vc!":function(a,b){return this.$f=a,this.$f1=b,this},"$Jd!":function(a,b){return this.$f=a,this.$f1=b,this},"$fd!":function(a,b){return this.$f=a,this.$f1=b,this},"$dc!":function(a,b){return this.$f=a,this.$f1=b,this},"$Td!":function(a,b){return this.$f=a,this.$f1=b,this},"$vb!":function(a,b){return this.$f=a,this.$f1=b,this},"$UW!":function(a){return this.$f1.$ncB(a,this.$f)},"$Kc!":function(a,b){return this.$f1.$khB(a,b,this.$f)},"$sV!":function(a){return this.$f1.$BcB(a,this.$f)},"$Zb!":function(a,b){return this.$f1.$ThB(a,b,this.$f)},"$ya!":function(a,b){return this.$f1.$FhB(a,b,this.$f)},"$Gb!":function(a,b){return this.$f1.$LhB(a,b,this.$f)},"$cV!":function(a){return this.$f1.$nbB(this.$f,a)}}})}}})}),b.lang.module("_$$_xka",function(c){c._$$_zka=new b.lang.ClassDefinition(function(){return{$meta:[a.C.ATA().init({contentProperty:T[14]})],$with:[a.C.RGB],constructor:{_$$_fp:function(){a.C.IPB.$B.call(this,a.XL.$f1.$f85(null,a.TN.$p16))},_$$_gp:function(b){if(this.$$init$$(),null===b)throw a.WE.$m21(T[14]);this.$f1=b,this.$f=new a.FV}},$f:null,$f1:null,"$hR!":{$meta:function(){return[b.lang.TypeAttribute(a.C.SGB.$class)]},get:function(){return this.$f}},"_$$_ry!":{$meta:function(){return[b.lang.TypeAttribute(a.C.MGB.$class)]},get:function(){return this.$f1},set:function(b){if(null===b)throw a.WE.$m5();this.$f1=b}},$f2:null,"_$$_iz!":{$meta:function(){return[a.FE.$c1(a.C.IXA.$class,"5,5"),b.lang.TypeAttribute(a.C.IXA.$class)]},get:function(){return this.$f2},set:function(b){a.C.IXA.$o4(this.$f2,b)&&(this.$f2=b)}},"clone!":function(){return a.C.IPB.$super.memberwiseClone.call(this)},$$init$$:function(){this.$f2=new a.C.IXA(5,5)}}})}),b.lang.module("_$$_xka",function(c){c._$$_yka=new b.lang.ClassDefinition(function(){return{$with:[a.C.GGB],constructor:{_$$_dp:function(){a.C.HPB.$B.call(this,a.XL.$f1.$f85(null,null),a.XL.$f1.$f81())},_$$_ep:function(b,c){if(this.$$init$$(),null===c)throw a.WE.$m21(T[13]);if(null===b)throw a.WE.$m21(T[14]);this.$f2=b,this.$f3=c,this.$f1=new a.EV}},$f1:null,$f2:null,$f3:null,$f:!0,"$gR!":{$meta:function(){return[b.lang.TypeAttribute(a.C.HGB.$class)]},get:function(){return this.$f1}},"_$$_qy!":{$meta:function(){return[b.lang.TypeAttribute(a.C.MGB.$class)]},get:function(){return this.$f2},set:function(b){if(null===b)throw a.WE.$m5();this.$f2=b}},"_$$_hz!":{$meta:function(){return[b.lang.TypeAttribute(a.C.GGB.$class)]},get:function(){return this.$f3},set:function(b){if(null===b)throw a.WE.$m5();this.$f3=b}},"_$$_xx!":{$meta:function(){return[a.FE.$c(!0),b.lang.TypeAttribute(b.lang.Boolean.$class)]},get:function(){return this.$f},set:function(a){this.$f=a}},$f5:null,"_$$_dca!":{$meta:function(){return[a.FE.$c1(a.C.KXA.$class,"0"),b.lang.TypeAttribute(a.C.KXA.$class)]},get:function(){return this.$f5},set:function(a){this.$f5=a}},"clone!":function(){return a.C.HPB.$super.memberwiseClone.call(this)},$$init$$:function(){this.$f5=a.C.KXA.createDefault()}}})}),b.lang.module("_$$_xka",function(d){d._$_bal=new b.lang.ClassDefinition(function(){return{$with:[a.C.NGB,a.C.TGB,a.C.OWA,a.C.PWA,a.C.RWA,a.C.QWA,a.C.FJB,a.C.UWA],constructor:function(){var b=a.T.EGB.INSTANCE,c=new a.DN,d=new a.C.UAB;d.$f6=new a.C.ZXA.$A,d.$yQ=c;var e=d;this.$f2=new a.C.TAB(e,"",a.T.CFB.CENTER),c.$m(this.$f2),this.$f2.$YQ=b},$f1:null,$f:null,"_$_vci!":{get:function(){return this.$f1},set:function(a){this.$f1=a}},"_$_gci!":{get:function(){return this.$f},set:function(a){this.$f=a}},_$_lhi:function(){},$uc:function(b,c){var d=c instanceof a.C.CPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$xMB(),this):a.T.VWA.INSTANCE},$Id:function(b,c){var d=c instanceof a.C.CPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$xMB(),this):a.KI.$f},$cc:function(b,c){var d=c instanceof a.C.CPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$xMB(),this):a.MI.$f},$Sd:function(b,c){var d=c instanceof a.C.CPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$xMB(),this):a.RI.$f},$ed:function(b,c){var d=c instanceof a.C.CPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this):a.LI.$f},$tb:function(b,c){var d=c instanceof a.C.CPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this):a.LQ.$f},$tc:function(b,c){var d=c instanceof a.C.CPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$xMB(),this):a.T.JGB.INSTANCE},"_$_lvc!":{get:function(){return this.$f.$AR}},$f2:null,$UW:function(c){this.$f2.$HT=this.$ARB(),this.$f2.$f8=this.$KOB(),a.DQ.$m11(this.$f2.$f7.$f6,this.$Up);var d=a.KM.$m5(this.$f2),e=new a.C.EWA;e.$WlA(this.$ghB(c,f(this,c),a.EQ.$m(d))),e.$xw=a.BQ.$m3(d);var h,i=g(this),j=new a.C.EWA;return j.$f6.$rO(null!==i&&(h=i.$UW(c))instanceof a.C.BIB?h:null),j.$f6.$rO(e),a.UI.$m2(c,j,b.lang.delegate(j.$m4,j)),j},_$_rwj:function(b,c,d){var e=new a.T.DPB.T1(d,b);e.$p1=!c;var f=e;return a.T.DPB.$B(f,this.$f,b),f},_$_bak:function(b,c,d,e){var f=e instanceof a.T.DPB.T1?e:null;return null===f?this.$ghB(b,c,d):(f.$p=d,f.$p1=!c,f)},_$_opi:function(){return this.$f1.$f3},_$_yji:function(){return new a.C.IXA(15,15)},$cV:function(b){if(b===a.C.IGB.$class){var c,d=this.$mOB(),e=a.C.IGB.isInstance(c=d.$XK.$tb(this.$f,d).$cV(b))?c:null;return new a.T.DPB.T(this.$f1,e)}if(b===a.C.ZVA.$class){var f=this.$lQB();if(null!==f)return f}if(b===a.C.DGB.$class||b===a.C.NYA.$class||b===a.C.TGB.$class){var g=this.$mOB();return g.$XK.$tb(this.$f,g).$cV(b)}return b.isInstance(this)?(this.$xMB(),this):null},$Kc:function(c,d){var e=d instanceof a.C.EWA?d:null;if(null===e||2!==e.$f6.$qJ)return this.$UW(c);var h=e.$f6.$uJ(1)instanceof a.C.EWA?e.$f6.$uJ(1):new a.C.EWA,i=h.$f6.$qJ>0?h.$f6.$uJ(0):null;this.$f2.$HT=this.$ARB(),this.$f2.$f8=this.$KOB(),a.DQ.$m11(this.$f2.$f7.$f6,this.$Up);var j=a.KM.$m5(this.$f2),k=this.$QjB(c,f(this,c),a.EQ.$m(j),i);k!==i&&(h.$f6.$qJ>0?(a.UI.$m(c,i),null!==k?h.$f6.$yJ(0,k):h.$SmA(i)):h.$WlA(k)),h.$xw=a.BQ.$m3(j);var l=e.$f6.$uJ(0),m=g(this);if(null!==m){var n,o=(n=m.$Kc(c,l))instanceof a.C.BIB?n:null;o!==l&&(a.UI.$m(c,l),e.$f6.$yJ(0,o))}else null!==l&&a.UI.$m(c,l),e.$f6.$yJ(0,null);return a.UI.$m2(c,e,b.lang.delegate(e.$m4,e)),e},_$_zoi:function(){return new a.C.FXA.$B(this.$f.$AR,a.T.FXA.SELECTION_TEMPLATE_KEY)},$ya:function(a,b){var c=this.$mOB(),d=c.$XK.$cc(this.$f,c);return!(null===d||!d.$ya(a,b))},$Gb:function(a,b){var c=this.$mOB();return c.$XK.$Sd(this.$f,c).$Gb(a,b)},$oV:function(a){var b=this.$mOB();return b.$XK.$tc(this.$f,b).$oV(a)},$pU:function(){var a=this.$mOB();return a.$XK.$tc(this.$f,a).$pU()},$sV:function(b){var c=this.$mOB(),d=c.$XK.$Id(this.$f,c),e=d.$sV(b);this.$f2.$HT=this.$ARB(),this.$f2.$f8=this.$KOB(),a.DQ.$m11(this.$f2.$f7.$f6,this.$Up);var f=a.BQ.$m1(a.KM.$m5(this.$f2));return a.C.LXA.$o2(f,e)},$Zb:function(a,b){var c=this.$mOB();return c.$XK.$ed(this.$f,c).$Zb(a,b)||b.$FpA(this.$sV(a))},$oc:function(a,b){var c=this.$mOB();return c.$XK.$tc(this.$f,c).$oc(a,b)},_$_ali:function(){return this.$f1.$f1},$static:{"_$_rea!":function(a,b,c){a.$f5.addEventListener(T[4],function(a){e(b,c)},!1);var d=!1,f=null;f=function(g){g.preventDefault(),a.$f5.removeEventListener(T[5],f,!1),d=!1,e(b,c)},a.$f5.addEventListener(T[6],function(b){d||(d=!0,a.$f5.addEventListener(T[5],f,!1))},!1)},T:new b.lang.ClassDefinition(function(){return{$final:!0,$with:[a.C.IGB],constructor:function(a,b){this.$f1=a,this.$f=b},$f1:null,$f:null,"$vV!":function(b){var c=this.$f1.$f;if(null!==this.$f){var d=this.$f.$vV(b);return new a.C.KXA.$B(Math.max(d.$f1,c.$f1),Math.max(d.$f,c.$f),Math.max(d.$f2,c.$f2),Math.max(d.$f3,c.$f3))}return new a.C.KXA.$B(c.$f1,c.$f,c.$f2,c.$f3)}}}),T1:new b.lang.ClassDefinition(function(){return{$extends:a.C.BIB,$final:!0,constructor:function(b,d){a.C.BIB.call(this,c.document.createElementNS(T[7],"g")),this.$$init$$(),this.$f=b,this.$f2=c.document.createElementNS(T[7],"rect"),this.$f2.setAttributeNS(null,T[8],b.$f+"px"),this.$f2.setAttributeNS(null,T[9],b.$f1+"px"),this.$f2.setAttributeNS(null,"rx","3px"),this.$f2.setAttributeNS(null,"ry","3px");var e=this.$f5;e.appendChild(this.$f2),e.setAttribute(T[10],T[11]),h(this,b),a.PN.$m34(this.$f2,new a.C.AIB.$A(a.T.ZGB.$pJ(20,0,0,0)),d),a.PN.$m33(this.$f2,a.NQ.$p16,d),this.$f3.$m(a.NQ.$p16,d),this.$f3.$m3(a.TN.$p16,d),this.$f4.$m(a.NQ.$p16,d),this.$f4.$m3(a.TN.$p16,d),i(this,this.$f4)},$f2:null,$f3:null,$f4:null,$f1:!1,$f:null,"$p!":{get:function(){return this.$f},set:function(b){a.C.IXA.$o4(this.$f,b)&&(this.$f=b,this.$f2.setAttributeNS(null,T[8],b.$f+"px"),this.$f2.setAttributeNS(null,T[9],b.$f1+"px"),h(this,b),i(this,this.$f1?this.$f3:this.$f4))}},"$p1!":{get:function(){return this.$f1},set:function(a){a&&!this.$f1?(this.$f5.setAttribute(T[10],T[12]),i(this,this.$f3)):!a&&this.$f1&&(this.$f5.setAttribute(T[10],T[11]),i(this,this.$f4)),this.$f1=a}},$$init$$:function(){this.$f=a.C.IXA.createDefault()}}})}}})}),b.lang.module("_$$_xka",function(c){c._$_cal=new b.lang.ClassDefinition(function(){return{$abstract:!0,$with:[a.C.GDB],constructor:function(){this.$$init$$()},$f:null,"$fR!":{get:function(){return this.$f}},_$_umj:b.lang.Abstract,_$_swj:function(a,b,c){return this.$kcB(a,c)},_$_ilj:function(b,c){var d=a.T.LXA.EMPTY;d=a.C.LXA.$o1(d,a.KM.$m7(c.$yR)),d=a.C.LXA.$o1(d,a.KM.$m7(c.$zR));var e;for(e=c.$OQ.$rJ();e.$qO();){var f=e.$mO;d=a.C.LXA.$o1(d,a.CQ.$m(f.$cR))}return d.$PqA(5)},_$_bwj:function(a,b,c){return this.$ybB(a,c).$FpA(b)},_$_mvj:function(b,c,d){return c.$jFA(new a.KN(d.$OQ,a.KM.$m7(d.$yR),a.KM.$m7(d.$zR)),b.$lS)},_$_svj:function(b,c,d){return c.$qxA(new a.KN(d.$OQ,a.KM.$m7(d.$yR),a.KM.$m7(d.$zR)))},_$_ukj:function(a,b){return b.isInstance(this.$f)?this.$f:null},clone:function(){return a.C.EPB.$super.memberwiseClone.call(this)},_$_ulj:function(a,b){var c=this.$iSB(a);return null!==c?c.$EpA(b):null},_$_lwj:function(a,b,c){var d=this.$iSB(a);return null!==d?d.$EFA(b,c):null},_$_wsi:function(b){var c=new a.C.KWA(b.$OQ.$qJ+2);c.$m2(a.KM.$m7(b.$yR));var d;for(d=b.$OQ.$rJ();d.$qO();){var e=d.$mO;c.$TmA(e.$cR)}return c.$m1(a.KM.$m7(b.$zR)),c},_$_taj:function(a){var b=this.$iSB(a);return null===b?0:b.$PkA()},_$_uqj:function(b,c){var d={},e={};return a.GN.$m1(b,c,d,e)?new a.C.MXA(d.value,e.value):null},_$_tqj:function(b,c){var d={},e={};return a.GN.$m(b,c,d,e)?new a.C.MXA(d.value,e.value):null},_$_uzj:function(b,c,d,e){var f;e=(null!==(f=b.$yR.$cV(a.C.CGB.$class))?f:a.T.RAB.INSTANCE).$Of(b,!0,c,e);var g;return e=(null!==(g=b.$zR.$cV(a.C.CGB.$class))?g:a.T.RAB.INSTANCE).$Of(b,!1,d,e)},_$_uck:function(a,b,c,d,e,f){k(this,a,b,c,d,e,!0),k(this,a,b,c,d,f,!1)},_$_xck:function(a,b,c,d,e,f){l(this,a,b,c,d,e,!0),l(this,a,b,c,d,f,!1)},$$init$$:function(){this.$f=new a.T.EPB.T},$static:{T:new b.lang.ClassDefinition(function(){return{$final:!0,$with:[a.C.HDB,a.C.UWA,a.C.OWA,a.C.PWA,a.C.QWA,a.C.RWA,a.C.FJB,a.C.OGB],$f:null,$f1:null,"$qc!":function(a,b){return this.$f=a,this.$f1=b,this},"$Gd!":function(a,b){return this.$f=a,this.$f1=b,this},"$cd!":function(a,b){return this.$f=a,this.$f1=b,this},"$ac!":function(a,b){return this.$f=a,this.$f1=b,this},"$Qd!":function(a,b){return this.$f=a,this.$f1=b,this},"$rb!":function(a,b){return this.$f=a,this.$f1=b,this},"$nc!":function(a,b){return this.$f=a,this.$f1=b,this},"$UW!":function(a){return this.$f1.$kcB(a,this.$f)},"$Kc!":function(a,b){return this.$f1.$hhB(a,b,this.$f)},"$sV!":function(a){return this.$f1.$ybB(a,this.$f)},"$Zb!":function(a,b){return this.$f1.$QhB(a,b,this.$f)},"$ya!":function(a,b){return this.$f1.$ChB(a,b,this.$f)},"$Gb!":function(a,b){return this.$f1.$IhB(a,b,this.$f)},"$cV!":function(a){return this.$f1.$kbB(this.$f,a)},"$DW!":function(a){return this.$f1.$KcB(this.$f,a)},"$ub!":function(a,b){return this.$f1.$ahB(this.$f,a,b)},"$AV!":function(){return this.$f1.$fWB(this.$f)},"$eU!":function(){return this.$f1.$iSB(this.$f)}}})}}})}),b.lang.module("_$$_xka",function(c){c._$_dal=new b.lang.ClassDefinition(function(){return{$abstract:!0,$with:[a.C.GGB],constructor:function(){this.$$init$$()},$f:null,"$gR!":{get:function(){return this.$f}},_$_vmj:b.lang.Abstract,_$_twj:function(a,b,c){return this.$lcB(a,c)},_$_jlj:function(b,c){return a.BQ.$m1(a.KM.$m5(c))},_$_cwj:function(a,b,c){return this.$zbB(a,c).$FpA(b)},_$_nvj:function(b,c,d){return a.BQ.$m7(a.KM.$m5(d),c,b.$lS)},_$_tvj:function(b,c,d){return c.$GFA(a.KM.$m5(d),b.$lS)},_$_vkj:function(a,b){return b.isInstance(this.$f)?this.$f:null},clone:function(){return a.C.FPB.$super.memberwiseClone.call(this)},_$_dcj:b.lang.Abstract,$$init$$:function(){this.$f=new a.T.FPB.T},$static:{T:new b.lang.ClassDefinition(function(){return{$final:!0,$with:[a.C.HGB,a.C.UWA,a.C.OWA,a.C.PWA,a.C.QWA,a.C.RWA,a.C.FJB],$f:null,$f1:null,"$sc!":function(a,b){return this.$f=a,this.$f1=b,this},"$Hd!":function(a,b){return this.$f=a,this.$f1=b,this},"$dd!":function(a,b){return this.$f=a,this.$f1=b,this},"$bc!":function(a,b){return this.$f=a,this.$f1=b,this},"$Rd!":function(a,b){return this.$f=a,this.$f1=b,this},"$sb!":function(a,b){return this.$f=a,this.$f1=b,this},"$rc!":function(a,b){return b.$PXB(a)},"$UW!":function(a){return this.$f1.$lcB(a,this.$f)},"$Kc!":function(a,b){return this.$f1.$ihB(a,b,this.$f)},"$sV!":function(a){return this.$f1.$zbB(a,this.$f)},"$Zb!":function(a,b){return this.$f1.$RhB(a,b,this.$f)},"$ya!":function(a,b){return this.$f1.$DhB(a,b,this.$f)},"$Gb!":function(a,b){return this.$f1.$JhB(a,b,this.$f)},"$cV!":function(a){return this.$f1.$lbB(this.$f,a)}}}),"_$_sea!":function(b,c){return a.QN.$m(b,c)}}}})}),b.lang.module("_$$_xka",function(c){c._$_eal=new b.lang.ClassDefinition(function(){return{$abstract:!0,$with:[a.C.MGB],constructor:function(){this.$$init$$()},$f:null,"$XK!":{get:function(){return this.$f}},_$_wmj:b.lang.Abstract,_$_uwj:function(a,b,c){return this.$mcB(a,c)},_$_klj:function(b,c){return a.DQ.$m3(c.$AR)},_$_dwj:function(a,b,c){return this.$AcB(a,c).$FpA(b)},_$_ovj:function(b,c,d){var e=this.$fTB(d);if(null===e){var f=d.$AR;return a.DQ.$m25(f.$cP,f.$dP,f.$MQ,f.$vQ,c.$f,c.$f1,b.$lS)}return e.$m3(c)||e.$m8(c,b.$lS)},_$_uvj:function(a,b,c){return this.$AcB(a,c).$FpA(b)},_$_wkj:function(a,b){return b.isInstance(this.$f)?this.$f:null},_$_nxj:function(b,c,d){var e=this.$fTB(b);if(null===e)return a.DQ.$m3(b.$AR).$jHA(c,d);var f=e.$JJB(d,c,.5);return f<Number.POSITIVE_INFINITY?a.C.JXA.$o2(d,a.C.JXA.$o5(f,a.C.JXA.$o9(c,d))):null},_$_elj:function(b,c){var d=this.$fTB(b);return null===d?a.DQ.$m13(b.$AR,c):d.$m3(c)},_$_tui:function(a){return null},clone:function(){return a.C.GPB.$super.memberwiseClone.call(this)},$$init$$:function(){this.$f=new a.T.GPB.T},$static:{T:new b.lang.ClassDefinition(function(){return{$final:!0,$with:[a.C.NGB,a.C.UWA,a.C.OWA,a.C.PWA,a.C.QWA,a.C.RWA,a.C.FJB,a.C.TGB],$f:null,$f1:null,"$uc!":function(a,b){return this.$f=a,this.$f1=b,this},"$Id!":function(a,b){return this.$f=a,this.$f1=b,this},"$ed!":function(a,b){return this.$f=a,this.$f1=b,this},"$cc!":function(a,b){return this.$f=a,this.$f1=b,this},"$Sd!":function(a,b){return this.$f=a,this.$f1=b,this},"$tb!":function(a,b){return this.$f=a,this.$f1=b,this},"$tc!":function(a,b){return this.$f=a,this.$f1=b,this},"$UW!":function(a){return this.$f1.$mcB(a,this.$f)},"$Kc!":function(a,b){return this.$f1.$jhB(a,b,this.$f)},"$sV!":function(a){return this.$f1.$AcB(a,this.$f)},"$Zb!":function(a,b){return this.$f1.$ShB(a,b,this.$f)},"$ya!":function(a,b){return this.$f1.$EhB(a,b,this.$f)},"$Gb!":function(a,b){return this.$f1.$KhB(a,b,this.$f)},"$cV!":function(a){return this.$f1.$mbB(this.$f,a)},"$oc!":function(a,b){return this.$f1.$CiB(this.$f,a,b)},"$oV!":function(a){return this.$f1.$ubB(this.$f,a)},"$pU!":function(){return this.$f1.$fTB(this.$f)}}})}}})}),b.lang.module("_$$_xka",function(a){a._$_hal=new b.lang.EnumDefinition(function(){return{AUTOMATIC:0,SVG:1,CANVAS:2}})}),b.lang.module("yfiles._R",function(c){c.FV=new b.lang.ClassDefinition(function(){return{$final:!0,$with:[a.C.SGB,a.C.TGB,a.C.OWA,a.C.PWA,a.C.RWA,a.C.QWA,a.C.FJB,a.C.UWA],constructor:function(){this.$$init$$();var b=new a.C.UAB;b.$f6=new a.C.ZXA.$A,this.$f4=b},$f4:null,$f2:null,$f3:null,$f1:null,$f:null,"$p1!":{get:function(){return this.$f1},
set:function(a){this.$f1=a}},"$p!":{get:function(){return this.$f},set:function(a){this.$f=a}},"$vc!":function(b,c){var d=c instanceof a.C.IPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$m(),this):a.T.VWA.INSTANCE},"$Jd!":function(b,c){var d=c instanceof a.C.IPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$m(),this):a.KI.$f},"$dc!":function(b,c){var d=c instanceof a.C.IPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$m(),this):a.MI.$f},"$Td!":function(b,c){var d=c instanceof a.C.IPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$m(),this):a.RI.$f},"$fd!":function(b,c){var d=c instanceof a.C.IPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this):a.LI.$f},"$vb!":function(b,c){var d=c instanceof a.C.IPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this):a.LQ.$f},"$cV!":function(a){return a.isInstance(this)?(this.$m(),this):null},"$Zb!":function(a,b){return this.$m(),b.$FpA(this.$sV(a))},"$ya!":function(a,b){if(this.$f3.$jN(b,a.$lS)){var c=this.$pU();return null===c||(c.$m7(b,a.$lS)||c.$m8(b,a.$lS))}return!1},"$oc!":function(a,b){return p(this.$f4,this.$f1.$f1).$oc(a,b)},"$oV!":function(a){return p(this.$f4,this.$f1.$f1).$oV(a)},"$pU!":function(){return p(this.$f4,this.$f1.$f1).$pU()},"$Gb!":function(a,b){return this.$f3.$FpA(b)},"$sV!":function(a){return this.$f3},"$m!":function(){this.$f2=a.KM.$m7(this.$f);var b=this.$m1();this.$f3=new a.C.LXA.$D(this.$f2.$f-.5*b.$f,this.$f2.$f1-.5*b.$f1,b.$f,b.$f1),this.$f4.$f7=this.$f1.$f1,a.DQ.$m17(this.$f4.$f6,this.$f3.$f,this.$f3.$f1,this.$f3.$f2,this.$f3.$f3)},"$m1!":function(){return this.$f1.$f2},"$UW!":function(c){var d=this.$f3.$f3;if(this.$f3.$f2<0||d<0)return null;var e=this.$f1.$f1,f=new a.C.EWA,g=new a.C.UAB;g.$f6=new a.C.ZXA.$A,g.$f7=this.$f1.$f1;var h=g;a.DQ.$m19(h.$f6,this.$f3);var i,j=e.$XK.$uc(h,e),k=(i=j.$UW(c))instanceof a.C.BIB?i:null;return null!==k?f.$WlA(k):f.$WlA(new a.AJ),f.$m2(new a.C.LXA.$D(0,0,this.$f3.$f2,this.$f3.$f3)),a.UI.$m2(c,f,b.lang.delegate(f.$m4,f)),f},"$Kc!":function(c,d){var e=this.$f3.$f3;if(this.$f3.$f2<0||e<0)return null!==d&&a.UI.$m(c,d),null;var f=d instanceof a.C.EWA?d:null;if(null!==f&&1===f.$f6.$qJ){var g=this.$f1.$f1,h=g.$XK.$uc(this.$f4,g),i=f.$f6.$uJ(0);if(i instanceof a.AJ){var j;i=(j=h.$UW(c))instanceof a.C.BIB?j:null}else{var j;i=(j=h.$Kc(c,i))instanceof a.C.BIB?j:null}return null===i&&(i=new a.AJ),i!==f.$f6.$uJ(0)&&(a.UI.$m(c,f.$f6.$uJ(0)),null!==i?f.$f6.$yJ(0,i):f.$f6.$oO()),f.$m2(new a.C.LXA.$D(0,0,this.$f3.$f2,this.$f3.$f3)),a.UI.$m2(c,f,b.lang.delegate(f.$m4,f)),f}return a.UI.$m(c,d),this.$UW(c)},$$init$$:function(){this.$f2=a.C.JXA.createDefault(),this.$f3=a.C.LXA.createDefault()}}})}),b.lang.module("yfiles._R",function(d){d.EV=new b.lang.ClassDefinition(function(){return{$final:!0,$with:[a.C.HGB,a.C.OWA,a.C.PWA,a.C.RWA,a.C.QWA,a.C.FJB,a.C.UWA],constructor:function(){var b=new a.C.UAB;b.$f6=new a.C.ZXA.$A,this.$f3=b,this.$f4=new a.C.BYA.$A;var c=new a.C.PBB;this.$f5=new a.C.TAB(null,"",c.$IsA(this.$f4))},$f3:null,$f5:null,$f4:null,$f2:null,$f1:null,$f:null,"$p1!":{get:function(){return this.$f1},set:function(a){this.$f1=a}},"$p!":{get:function(){return this.$f},set:function(a){this.$f=a}},"$sc!":function(b,c){var d=c instanceof a.C.HPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$m2(),this):a.T.VWA.INSTANCE},"$Hd!":function(b,c){var d=c instanceof a.C.HPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$m2(),this):a.KI.$f},"$bc!":function(b,c){var d=c instanceof a.C.HPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$m2(),this):a.MI.$f},"$Rd!":function(b,c){var d=c instanceof a.C.HPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this.$m2(),this):a.RI.$f},"$dd!":function(b,c){var d=c instanceof a.C.HPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this):a.LI.$f},"$sb!":function(b,c){var d=c instanceof a.C.HPB?c:null;return null!==d?(this.$f1=d,this.$f=b,this):a.LQ.$f},"$cV!":function(a){return a.isInstance(this)?(this.$m2(),this):null},"$ya!":function(b,c){return a.BQ.$m8(this.$f2,c,b.$lS)},"$Gb!":function(a,b){return b.$GFA(this.$f2,a.$lS)},"$sV!":function(b){return a.BQ.$m1(this.$f2)},"$Zb!":function(b,c){return c.$GFA(a.KM.$m5(this.$f),2)},"$rc!":function(a,b){return this.$f=a,this.$f1=b,this.$m2(),this.$m4()},"$m4!":function(){var b,c=this.$f1.$f3.$gR.$rc(this.$f,this.$f1.$f3),d=this.$f1.$f2.$XK.$tb(this.$f3,this.$f1.$f2),e=a.C.IGB.isInstance(b=d.$cV(a.C.IGB.$class))?b:null;if(null!==e){var f=e.$vV(this.$f3);return f=f.$NqA(this.$m5()),new a.C.IXA(c.$f+f.$eNA,c.$f1+f.$lIA)}var f=this.$m5();return new a.C.IXA(c.$f+f.$eNA,c.$f1+f.$lIA)},"$m2!":function(){this.$f2=a.KM.$m5(this.$f),this.$f3.$f7=this.$f1.$f2,a.DQ.$m17(this.$f3.$f6,0,0,this.$f2.$MQ,this.$f2.$vQ),n(this,this.$f5),o(this)},"$m5!":function(){return this.$f1.$f5},"$UW!":function(c){var d=this.$f2.$vQ;if(this.$f2.$MQ<0||d<0)return null;var e=this.$f1.$f2,f=this.$f1.$f3,g=new a.C.EWA,h=new a.C.UAB;h.$f6=new a.C.ZXA.$A,h.$f7=this.$f1.$f2;var i=h;a.DQ.$m17(i.$f6,0,0,this.$f2.$MQ,this.$f2.$vQ);var j,k=e.$XK.$uc(i,e),l=(j=k.$UW(c))instanceof a.C.BIB?j:null;null!==l?g.$WlA(l):g.$WlA(a.EV.T.$f);var m=new a.C.BYA.$A;m.$RR=this.$f4.$RR,m.$SR=this.$f4.$SR,m.$MQ=this.$f4.$MQ,m.$vQ=this.$f4.$vQ;var o=new a.C.TAB(null,"",this.$f5.$f2.$jQ.$IsA(m));n(this,o);var p,q=f.$gR.$sc(o,f),r=(p=q.$UW(c))instanceof a.C.BIB?p:null;null!==r?g.$WlA(r):g.$WlA(a.EV.T.$f),g.$xw=a.QN.$m(this.$f2,this.$m3());var s=new a.EV.T1;return s.$f1=i,s.$f3=o,s.$f=m,a.PN.$m31(g,s),a.UI.$m2(c,g,b.lang.delegate(g.$m4,g)),g},"$Kc!":function(c,d){var e=this.$f2.$vQ,f=this.$f2.$MQ;if(f<0||e<0)return null!==d&&a.UI.$m(c,d),null;var g,h=d instanceof a.C.EWA?d:null;if(null!==h&&2===h.$f6.$qJ&&null!==(g=a.PN.$m18(a.EV.T1.$class,h))){var i=g.$f1;i.$f7=this.$f1.$f2,a.DQ.$m17(i.$f6,0,0,f,e);var j=this.$f1.$f2,k=this.$f1.$f3,l=j.$XK.$uc(i,j),m=h.$f6.$uJ(0);if(m instanceof a.EV.T){var o;m=(o=l.$UW(c))instanceof a.C.BIB?o:null}else{var o;m=(o=l.$Kc(c,m))instanceof a.C.BIB?o:null}if(null===m&&(m=a.EV.T.$f),m!==h.$f6.$uJ(0)){var p=h.$f6.$uJ(0);h.$f6.$yJ(0,m),a.UI.$m(c,p)}var q=g.$f3,r=g.$f;r.$RR=this.$f4.$RR,r.$SR=this.$f4.$SR,r.$MQ=this.$f4.$MQ,r.$vQ=this.$f4.$vQ,n(this,q);var s=k.$gR.$sc(q,k),t=h.$f6.$uJ(1);if(m instanceof a.EV.T){var o;t=(o=s.$UW(c))instanceof a.C.BIB?o:null}else t=s.$Kc(c,t);if(null===t&&(t=a.EV.T.$f),t!==h.$f6.$uJ(1)){var p=h.$f6.$uJ(1);h.$f6.$yJ(1,t),a.UI.$m(c,p)}return h.$xw=a.QN.$m(this.$f2,this.$m3()),a.UI.$m2(c,h,b.lang.delegate(h.$m4,h)),h}return a.UI.$m(c,d),this.$UW(c)},"$m3!":function(){return this.$f1.$f},$static:{T:new b.lang.ClassDefinition(function(){return{$extends:a.C.BIB,$final:!0,constructor:function(){a.C.BIB.call(this,c.document.createElementNS(T[7],"use"))},$static:{$f:null,$clinit:function(){a.EV.T.$f=new a.EV.T}}}}),T1:new b.lang.ClassDefinition(function(){return{$final:!0,$f1:null,$f3:null,$f:null,$f2:null,$f4:null}})}}})})}(c.lang.module("yfiles._R"),c,a),c})}("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this);