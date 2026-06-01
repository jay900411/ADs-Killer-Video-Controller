// ==========================================
// 模組 1：通用影片控制器核心 (Universal Video Controller)
// 負責處理所有「影片相關」的底層邏輯，所有網站共用
// ==========================================
class VideoController {
    constructor() {
        this.osdElement = null;
        this.osdTimeout = null;
        this.validSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4];
    }

    showOSD(text, container) {
        if (!this.osdElement) {
            this.osdElement = document.createElement('div');
            this.osdElement.style.position = 'absolute';
            this.osdElement.style.top = '50%';
            this.osdElement.style.left = '50%';
            this.osdElement.style.transform = 'translate(-50%, -50%)';
            this.osdElement.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            this.osdElement.style.color = 'white';
            this.osdElement.style.padding = '15px 25px';
            this.osdElement.style.fontSize = '24px';
            this.osdElement.style.borderRadius = '8px';
            this.osdElement.style.zIndex = '999999';
            this.osdElement.style.pointerEvents = 'none';
            this.osdElement.style.transition = 'opacity 0.2s';
            this.osdElement.style.opacity = '0';

            container.appendChild(this.osdElement);
        }

        this.osdElement.innerText = text;
        this.osdElement.style.opacity = '1';

        if (this.osdTimeout) clearTimeout(this.osdTimeout);
        this.osdTimeout = setTimeout(() => { this.osdElement.style.opacity = '0'; }, 500);
    }

    executeCommand(code, shiftKey, altKey) {
        const video = document.querySelector('video');
        if (!video) return;

        const container = video.closest('.plyr') || video.parentElement || document.body;

        switch (code) {
            case 'Space':
                if (video.paused) {
                    video.play();
                    this.showOSD("▶\uFE0E 播放", container);
                } else {
                    video.pause();
                    this.showOSD("⏸\uFE0E 暫停", container);
                }
                break;

            case 'ArrowRight':
                if (altKey) {
                    video.currentTime += 60;
                    this.showOSD("前進 60 秒", container);
                } else if (shiftKey) {
                    video.currentTime += 30;
                    this.showOSD("前進 30 秒", container);
                } else {
                    video.currentTime += 5;
                    this.showOSD("前進 5 秒", container);
                }
                break;

            case 'ArrowLeft':
                if (altKey) {
                    video.currentTime -= 60;
                    this.showOSD("後退 60 秒", container);
                } else if (shiftKey) {
                    video.currentTime -= 30;
                    this.showOSD("後退 30 秒", container);
                } else {
                    video.currentTime -= 5;
                    this.showOSD("後退 5 秒", container);
                }
                break;

            case 'ArrowUp':
                video.volume = Math.min(video.volume + 0.1, 1.0);
                this.showOSD(`音量: ${Math.round(video.volume * 100)}%`, container);
                break;

            case 'ArrowDown':
                video.volume = Math.max(video.volume - 0.1, 0.0);
                this.showOSD(`音量: ${Math.round(video.volume * 100)}%`, container);
                break;

            case 'KeyF':
                if (!document.fullscreenElement) {
                    if (container.requestFullscreen) container.requestFullscreen();
                } else {
                    if (document.exitFullscreen) document.exitFullscreen();
                }
                break;

            case 'Period':
                if (shiftKey) {
                    const nextSpeed = this.validSpeeds.find(speed => speed > video.playbackRate + 0.01);
                    if (nextSpeed) {
                        video.playbackRate = nextSpeed;
                        this.showOSD(`速度: ${nextSpeed}x`, container);
                    } else {
                        this.showOSD(`速度: ${video.playbackRate}x (MAX)`, container);
                    }
                }
                break;

            case 'Comma':
                if (shiftKey) {
                    const prevSpeed = [...this.validSpeeds].reverse().find(speed => speed < video.playbackRate - 0.01);
                    if (prevSpeed) {
                        video.playbackRate = prevSpeed;
                        this.showOSD(`速度: ${prevSpeed}x`, container);
                    } else {
                        this.showOSD(`速度: ${video.playbackRate}x (MIN)`, container);
                    }
                }
                break;
        }
    }
}

// ==========================================
// 模組 2：網站策略定義 (Site Strategies)
// ==========================================

// 2-A: Anime1 專屬邏輯
class Anime1Strategy {
    constructor() {
        this.isTopWindow = window === window.top;
        this.isIframe = window !== window.top;
        this.videoController = new VideoController();
    }

    init() {
        if (this.isTopWindow) {
            this.injectAdKiller();
            this.startDomObserver();
            this.setupTopWindowKeyboard();
        }
        if (this.isIframe) {
            this.setupIframeReceiver();
            this.setupLocalKeyboard();
        }
    }

    injectAdKiller() {
        const injectScript = document.createElement('script');
        injectScript.src = chrome.runtime.getURL('inject_anime1.js');
        injectScript.onload = function () { this.remove(); };
        document.documentElement.appendChild(injectScript);
    }

    aggressivePurge() {
        // 1. 處理帶有特定 class 的可見廣告
        document.querySelectorAll('[class*="__close"], [class*="__closelink"]').forEach(btn => {
            const adContainer = btn.closest('div[style*="z-index"]') || btn.parentElement;
            if (adContainer && !adContainer.dataset.killed) {
                adContainer.style.setProperty('display', 'none', 'important');
                adContainer.dataset.killed = "true";
            }
        });

        // 2. 處理隱形蓋版廣告 (防止滑鼠閃爍的核心)
        document.querySelectorAll('div, a, iframe').forEach(el => {
            // 跳過已知正常結構，以及已經被我們「結紮」過的元素
            if (el.dataset.killed || el.id === 'page' || el.id === 'content' || el.id === 'primary' || el.id === 'main' || el.className === 'vframe') return;

            const style = window.getComputedStyle(el);
            if ((style.position === 'absolute' || style.position === 'fixed') && parseInt(style.zIndex) > 90) {
                // 讓它失去靈魂：關閉物理碰撞與透明化
                el.style.setProperty('pointer-events', 'none', 'important');
                el.style.setProperty('opacity', '0', 'important');
                el.dataset.killed = "true";
            }
        });
    }

    startDomObserver() {
        let purgeTimer = null;
        const observer = new MutationObserver(() => {
            if (document.fullscreenElement) return;
            if (purgeTimer) clearTimeout(purgeTimer);
            purgeTimer = setTimeout(() => { this.aggressivePurge(); }, 200);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        this.aggressivePurge();
    }

    setupTopWindowKeyboard() {
        document.addEventListener('keydown', (event) => {
            if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;

            const targetKeys = ['Space', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'KeyF', 'Period', 'Comma'];
            if (targetKeys.includes(event.code)) {
                event.preventDefault();
                const iframe = document.querySelector('iframe.vframe');
                if (iframe) {
                    iframe.contentWindow.postMessage({
                        type: 'VIDEO_CMD',
                        code: event.code,
                        shiftKey: event.shiftKey,
                        altKey: event.altKey
                    }, '*');
                }
            } else if (event.code === 'Escape') {
                event.preventDefault();
                this.aggressivePurge();
            }
        }, true);
    }

    setupIframeReceiver() {
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'VIDEO_CMD') {
                this.videoController.executeCommand(event.data.code, event.data.shiftKey, event.data.altKey);
            }
        });
    }

    setupLocalKeyboard() {
        document.addEventListener('keydown', (event) => {
            if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
            const targetKeys = ['Space', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'KeyF', 'Period', 'Comma'];
            if (targetKeys.includes(event.code)) {
                event.preventDefault();
                event.stopPropagation();
                if (document.activeElement) document.activeElement.blur();
                this.videoController.executeCommand(event.code, event.shiftKey, event.altKey);
            }
        }, true);
    }
}


// ==========================================
// 模組 3：網域路由器 (Domain Router)
// ==========================================
const currentDomain = window.location.hostname;

// 根據目前的網域，派發給對應的處理策略
if (currentDomain.includes('anime1.in')) {
    console.log("[Router] 啟動 Anime1 專用策略");
    new Anime1Strategy().init();
}