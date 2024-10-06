// ==UserScript==
// @name         渲染html代码块
// @namespace    http://tampermonkey.net/
// @version      2024-10-05
// @description  自动渲染HTML代码块
// @author       chabai
// @match        https://chatgpt.com/c/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(debounce(xuanranHTML, 500));

    // 观察目标节点的变化
    observer.observe(document.body, { childList: true, subtree: true });

    // 首次调用渲染
    window.addEventListener('load', () => {
        setTimeout(xuanranHTML, 1000);
    });

})();

function xuanranHTML() {
    // 获取所有的 code 元素
    const codes = document.querySelectorAll('.overflow-y-auto.p-4 code');

    // 遍历所有的 code 元素
    codes.forEach(codeElement => {
        // 检查是否已经处理过，避免重复插入
        if (codeElement.classList.contains('processed')) {
            return;
        }

        // 标记该元素已经处理过
        codeElement.classList.add('processed');

        // 判断 codeElement.textContent 是否是 HTML 内容
        if (codeElement.parentNode.parentNode.children[0].innerText!="html"){
            console.log("不渲染: "+codeElement.parentNode.parentNode.children[0].innerText);
            return;
        }

        // 创建嵌入渲染容器
        const renderContainer = document.createElement('div');
        renderContainer.classList.add('render-container');
        renderContainer.style.marginTop = '20px';
        renderContainer.style.border = '1px solid #ccc';
        renderContainer.style.padding = '10px';
        renderContainer.style.borderRadius = '10px';
        renderContainer.style.backgroundColor = '#f9f9f9';
        renderContainer.style.position = 'relative';

        // 创建 iframe 元素
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.marginBottom = '10px';

        // 创建刷新按钮
        const refreshButton = document.createElement('button');
        refreshButton.textContent = '刷新渲染';
        refreshButton.style.padding = '5px 10px';
        refreshButton.style.backgroundColor = '#007bff';
        refreshButton.style.color = '#fff';
        refreshButton.style.border = 'none';
        refreshButton.style.borderRadius = '5px';
        refreshButton.style.cursor = 'pointer';
        refreshButton.style.marginRight = '10px';

        // 创建展开按钮
        const expandButton = document.createElement('button');
        expandButton.textContent = '展开';
        expandButton.style.padding = '5px 10px';
        expandButton.style.backgroundColor = '#28a745';
        expandButton.style.color = '#fff';
        expandButton.style.border = 'none';
        expandButton.style.borderRadius = '5px';
        expandButton.style.cursor = 'pointer';
        expandButton.style.marginRight = '10px';

        let isExpanded = false;

        // 展开按钮点击事件，切换 iframe 全屏状态
        expandButton.addEventListener('click', function() {
            if (!isExpanded) {
                iframe.style.position = 'fixed';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.zIndex = '1000';
                expandButton.textContent = '缩小';
                expandButton.style.position = 'fixed';
                expandButton.style.top = '10px';
                expandButton.style.right = '10px';
                expandButton.style.zIndex = '1001';
                isExpanded = true;
            } else {
                iframe.style.position = '';
                iframe.style.top = '';
                iframe.style.left = '';
                iframe.style.width = '100%';
                iframe.style.height = '600px';
                iframe.style.zIndex = '';
                expandButton.textContent = '展开';
                expandButton.style.position = '';
                expandButton.style.top = '';
                expandButton.style.right = '';
                expandButton.style.zIndex = '';
                isExpanded = false;
            }
        });

        // 刷新按钮点击事件，重新渲染对应的 iframe
        refreshButton.addEventListener('click', function() {
            renderIframeContent(iframe, codeElement.textContent);
            console.log('渲染已刷新');
        });

        // 将 iframe、刷新按钮、展开按钮插入到嵌入容器中
        renderContainer.appendChild(iframe);
        renderContainer.appendChild(refreshButton);
        renderContainer.appendChild(expandButton);

        // 将嵌入容器插入到 code 元素的父元素之后
        codeElement.parentNode.parentNode.insertBefore(renderContainer, codeElement.parentNode.nextSibling);

        // 首次渲染 iframe 内容
        renderIframeContent(iframe, codeElement.textContent);
    });
}

function renderIframeContent(iframe, content) {
    // 获取 iframe 内部的 document 对象
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // 将 code 元素的内容设置为 iframe 的内容
    iframeDoc.open();
    if (true){ // 刷新特效,true为有感刷新,!true为无痕刷新
        iframeDoc.write(`loading`);
        setTimeout(() => iframeDoc.write(content), 100);
    }else{
        iframeDoc.write(content);
    }
    iframeDoc.close();
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}