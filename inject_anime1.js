// ==========================================
// 終極疫苗腳本 inject.js (僅針對 Anime1 注入)
// ==========================================

Object.defineProperty(window, 'open', {
    value: function () {
        console.log('[Ad Killer] 成功攔截彈出式廣告！');
        return null;
    },
    writable: false,
    configurable: false
});

window.history.pushState = function () { };
window.history.replaceState = function () { };

['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'click'].forEach(eventType => {
    window.addEventListener(eventType, function (e) {
        const target = e.target;
        const a = target.closest('a');

        if (a && a.href && !a.href.startsWith('javascript')) {
            if (eventType === 'click') {
                e.stopImmediatePropagation();
                e.preventDefault();
                window.location.href = a.href;
            } else {
                e.stopImmediatePropagation();
            }
            return;
        }

        const isNormalElement = target.closest('button, input, select, textarea, .vframe, .play-select');
        if (isNormalElement) {
            e.stopImmediatePropagation();
            return;
        }

        e.stopImmediatePropagation();
        if (eventType === 'click') e.preventDefault();

    }, true);
});