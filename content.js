// content.js - 固定最大建议数10，支持点击和回车搜索
(function() {
  'use strict';

  class SearchSuggest {
    constructor() {
      this.container = null;
      this.visible = false;
      this.highlightedIndex = -1;
      this.items = [];
      this.input = null;
      this.config = {
        maxResults: 10,
        hotThreshold: 100,
        enableHistory: true,
        autoSearch: true
      };
    }

    // 不再读取外部配置，直接使用固定值
    loadConfig() {}
    reloadConfig() { return Promise.resolve(); }

    mount(container) { this.container = container; }
    setInput(input) { this.input = input; }

    createPanel() {
      const panel = document.createElement('div');
      panel.className = 'moekoe-search-suggest-panel';
      panel.style.cssText = `
        position: absolute;
        z-index: 99999;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        max-height: 400px;
        overflow-y: auto;
        display: none;
        font-size: 14px;
      `;
      return panel;
    }

    // ★ 触发搜索（模拟回车键）
    triggerSearch() {
      if (!this.input) return;
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      this.input.dispatchEvent(enterEvent);
    }

    update(suggestions) {
      this.items = suggestions;
      this.highlightedIndex = -1;
      if (!this.container) return;
      if (!suggestions || suggestions.length === 0) {
        this.container.innerHTML = '<div style="padding:16px;text-align:center;color:#999;">暂无建议</div>';
        return;
      }

      const html = suggestions.map((item, i) => {
        const hotText = item.hot ? '🔥 ' + this.formatHot(item.hot) : '';
        return `<div class="moekoe-suggest-item" data-index="${i}" style="padding:10px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f5f5f5;">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${item.name || ''}</span>
          ${hotText ? `<span style="font-size:12px;color:#1db954;margin-left:12px;">${hotText}</span>` : ''}
        </div>`;
      }).join('');

      this.container.innerHTML = html;
      const self = this;
      this.container.querySelectorAll('.moekoe-suggest-item').forEach(el => {
        el.addEventListener('click', function() {
          const idx = parseInt(this.dataset.index);
          if (self.input && self.items[idx]) {
            // 设置搜索框值
            self.input.value = self.items[idx].name;
            // 触发 input 事件（如有必要）
            self.input.dispatchEvent(new Event('input', { bubbles: true }));
            // ★ 触发回车搜索
            self.triggerSearch();
            self.hide();
          }
        });
      });
    }

    formatHot(hot) {
      if (!hot) return '';
      if (hot >= 100000) return (hot/100000).toFixed(1) + 'M';
      if (hot >= 1000) return (hot/1000).toFixed(1) + 'K';
      return String(hot);
    }

    show() {
      this.visible = true;
      if (this.container) this.container.style.display = 'block';
    }
    hide() {
      this.visible = false;
      if (this.container) this.container.style.display = 'none';
    }
    highlightNext() {
      this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.items.length - 1);
      this.updateHighlight();
    }
    highlightPrev() {
      this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
      this.updateHighlight();
    }
    updateHighlight() {
      const items = this.container?.querySelectorAll('.moekoe-suggest-item');
      if (!items) return;
      items.forEach((el, i) => {
        el.style.background = i === this.highlightedIndex ? '#f0f9f4' : '';
      });
    }
    // ★ 键盘回车选中时触发搜索
    selectHighlighted() {
      if (this.highlightedIndex >= 0 && this.input && this.items[this.highlightedIndex]) {
        this.input.value = this.items[this.highlightedIndex].name;
        this.input.dispatchEvent(new Event('input', { bubbles: true }));
        this.triggerSearch();
        this.hide();
      }
    }
  }

  // ========== 初始化 ==========
  const suggest = new SearchSuggest();
  let debounceTimer = null;

  function findSearchInput() {
    return document.querySelector('input[type="text"]') ||
           document.querySelector('.search-bar input') ||
           document.querySelector('.side-search input') ||
           document.querySelector('input[type="search"]');
  }

  function getAuthHeader() {
    try {
      const raw = localStorage.getItem('MoeData');
      if (!raw) return 'token=;userid=0;dfid=';
      const data = JSON.parse(raw);
      const token = data?.UserInfo?.token || '';
      const userid = data?.UserInfo?.userid || 0;
      const dfid = data?.Device?.dfid || '';
      return `token=${token};userid=${userid};dfid=${dfid}`;
    } catch (e) {
      return 'token=;userid=0;dfid=';
    }
  }

  async function fetchSuggestions(keyword) {
    try {
      const response = await fetch(
        `http://127.0.0.1:6521/search/suggest?keywords=${encodeURIComponent(keyword)}`,
        {
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      if (data?.data && Array.isArray(data.data)) {
        return data.data.flatMap(group =>
          (group.RecordDatas || []).map(item => ({
            name: item.HintInfo || '',
            hot: parseInt(item.Hot) || 0
          }))
        ).sort((a, b) => b.hot - a.hot);
      }
      return [];
    } catch (e) {
      console.warn('[搜索建议] fetch 失败:', e.message);
      return [];
    }
  }

  function attachSearchListener() {
    const input = findSearchInput();
    if (!input || input.hasAttribute('data-suggest-bound')) return;
    input.setAttribute('data-suggest-bound', 'true');

    suggest.setInput(input);
    const panel = suggest.createPanel();
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(panel);
    suggest.mount(panel);

    input.addEventListener('input', function(e) {
      const keyword = e.target.value.trim();
      clearTimeout(debounceTimer);
      if (keyword.length < 1) {
        suggest.hide();
        return;
      }
      debounceTimer = setTimeout(async () => {
        const raw = await fetchSuggestions(keyword);
        const filtered = raw
          .filter(item => (item.hot || 0) >= suggest.config.hotThreshold)
          .slice(0, suggest.config.maxResults);

        console.log('[搜索建议] 显示最大条数:', suggest.config.maxResults);
        suggest.update(filtered);
        if (filtered.length) suggest.show();
        else suggest.hide();
      }, 300);
    });

    input.addEventListener('keydown', function(e) {
      switch(e.key) {
        case 'ArrowDown': e.preventDefault(); suggest.highlightNext(); break;
        case 'ArrowUp': e.preventDefault(); suggest.highlightPrev(); break;
        case 'Enter':
          if (suggest.visible && suggest.highlightedIndex >= 0) {
            e.preventDefault();
            suggest.selectHighlighted(); // 会触发搜索
          }
          break;
        case 'Escape': suggest.hide(); break;
      }
    });

    document.addEventListener('click', function(e) {
      if (suggest.visible && suggest.container &&
          !suggest.container.contains(e.target) && e.target !== input) {
        suggest.hide();
      }
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    .moekoe-search-suggest-panel { margin-top:4px; animation:slideDown 0.2s ease; }
    @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
    .moekoe-suggest-item:hover { background:#f0f9f4 !important; }
  `;
  document.head.appendChild(style);

  function init() {
    attachSearchListener();
    const observer = new MutationObserver(() => {
      const input = findSearchInput();
      if (input && !input.hasAttribute('data-suggest-bound')) attachSearchListener();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
